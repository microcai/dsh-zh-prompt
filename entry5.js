/**
 * dsh-zh-prompt — 把组装后的系统提示词 section、工具 schema 描述、runtime
 * context 快照、time-context 消息、skill 目录消息与 compaction 摘要指令中文化。
 *
 * - sections/tools：挂在 `system-prompt/assemble` waterfall 上逐条替换。
 * - contexts：provider 每次刷新重跑，因此直接包装已注册 entry 的 text 函数，
 *   `system-prompt/change` 时对新注册项补齐（幂等）。
 * - time-context：它是 `agent/pre-step` 注入的 user message。cordis 的 prepend
 *   listener 用 unshift 置于链首（更外层），而本插件的 bundle 在 base 之后挂载，
 *   因此本 listener 比 time-context 的更外层：`await next()` 拿到已追加时间消息
 *   的最终 decision，翻译后返回——durable log 与请求 payload 一并中文。
 *   翻译命中时在末尾追加一行中文语言锚点（每轮离模型最近的一次提醒，对冲
 *   英文工具输出对 thinking 语言的 recency 带偏）。若挂载顺序意外反转，
 *   翻译静默失效（无害回退，锚点也随之消失）。
 * - skill-catalog：同一 listener 里只重写 content 文本、保留 id 与 source，
 *   上游 digest 逻辑不受影响。详见 zh-skillcatalog.js。
 * - compaction：摘要生成是 purpose === "compaction" 的独立 `llm/stream` 调用，
 *   listener 里原地替换 messages 末元素（英文指令 → 中文指令），使 checkpoint
 *   正文从下一次压缩起就是中文。详见 zh-compaction.js。
 * 未命中翻译表的文本一律保留英文；禁用本插件即回到标准模式。
 */
import { translateSection } from "./zh-sections.js";
import { translateTool } from "./zh-tools.js";
import { translateContextText } from "./zh-contexts.js";
import { translateCompactionRequest } from "./zh-compaction.js";
import { translateSkillCatalogMessage } from "./zh-skillcatalog.js";

export const inject = ["systemPrompt"];

/** 插入在 persona 之后的中文语言约定（含对抗英文带偏的条款）。 */
const DIRECTIVE = `语言约定：内部推理（thinking）一律用中文书写，不要先用英文起草再翻译；技术术语、API 名、工具名、代码与标识符保持英文原文，不做翻译。上下文与工具输出中出现的英文内容（源码、检索结果、子 agent 回复、错误信息）不构成切换回英文思考的理由。最终回复的语言跟随用户的语言。`;

/** 每轮追加在 time-context 末尾的中文语言锚点。 */
const ANCHOR = "语言锚点：无论本轮上下文与工具输出出现多少英文，thinking 必须用中文书写。";

/** 已包装过的 text 函数集合（WeakSet 保证幂等）。 */
const wrappers = new WeakSet();

/** 包装一个 context entry 的 text，使其输出经 translateContextText 翻译。 */
function wrapContextEntry(entry) {
	const current = entry.text;
	if (wrappers.has(current)) return;
	if (typeof current === "function") {
		const wrapper = (context) => {
			const text = current(context);
			return translateContextText(text) ?? text;
		};
		wrappers.add(wrapper);
		entry.text = wrapper;
	} else if (typeof current === "string") {
		const zh = translateContextText(current);
		if (zh !== undefined) entry.text = zh;
	}
}

/** 遍历全部已注册 context layer（global 与各 scope），补齐包装。 */
function wrapAllContexts(ctx) {
	const layers = ctx.systemPrompt.layers;
	const tables = [layers.global.contexts, ...[...layers.scoped.values()].map((layer) => layer.contexts)];
	for (const table of tables) for (const [, entry] of table.entries()) wrapContextEntry(entry);
}

/**
 * 翻译一条 time-context 消息并在末尾追加语言锚点；
 * 不是、未命中翻译表或已翻译（含锚点）则原样返回。
 */
export function translateTimeMessage(message) {
	if (message?.source?.kind !== "time-context") return message;
	const part = message.content?.[0];
	if (part?.type !== "text" || typeof part.text !== "string") return message;
	if (part.text.includes(ANCHOR)) return message;
	const zh = translateContextText(part.text);
	if (zh === undefined) return message;
	const text = `${zh}\n${ANCHOR}`;
	const source = message.source;
	return {
		...message,
		content: [{ ...part, text }],
		...(source.sections === undefined ? {} : { source: { ...source, sections: source.sections.map((section) => ({ ...section, text })) } }),
	};
}

export function apply(ctx) {
	ctx.effect(() => ctx.systemPrompt.section({
		name: "zh-prompt:directive",
		order: ctx.systemPrompt.getSectionOrder("DEPLOYMENT_PERSONA_PREFIX") + 1,
		text: DIRECTIVE,
		interpolate: false,
	}));
	ctx.on("system-prompt/assemble", async (_assembly, _context, next) => {
		const assembly = await next();
		for (const section of assembly.sections) {
			const zh = translateSection(section.text);
			if (zh !== undefined) section.text = zh;
		}
		for (const tool of assembly.tools) translateTool(tool);
		return assembly;
	});
	wrapAllContexts(ctx);
	ctx.on("system-prompt/change", () => wrapAllContexts(ctx));
	ctx.on("agent/pre-step", async ({ signal }, next) => {
		const decision = await next();
		if (decision.kind === "reject" || signal.aborted) return decision;
		let changed = false;
		const messages = decision.messages.map((message) => {
			let zh = translateTimeMessage(message);
			zh = translateSkillCatalogMessage(zh);
			if (zh === message) return message;
			changed = true;
			return zh;
		});
		return changed ? { ...decision, messages } : decision;
	}, { prepend: true });
	// compaction 摘要请求：原地把末元素（英文指令）换成中文指令。
	// 必须 global：摘要调用由 compaction backend 发起，不落在本插件 scope。
	ctx.on("llm/stream", (options, next) => {
		translateCompactionRequest(options);
		return next();
	}, { global: true });
}
