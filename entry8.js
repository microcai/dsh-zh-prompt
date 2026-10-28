/**
 * dsh-zh-prompt — 把组装后的系统提示词 section、工具 schema 描述、runtime
 * context 快照、time-context 消息、skill 目录消息与 compaction 摘要指令中文化。
 *
 * - sections/tools：挂在 `system-prompt/assemble` waterfall 上逐条替换。
 * - contexts：provider 每次刷新重跑，因此直接包装已注册 entry 的 text 函数，
 *   `system-prompt/change` 时对新注册项补齐（幂等）。
 * - snapshot 框架行：`joinContextSections` 拼在 body 外的英文框架行无法在 append
 *   处改写（durable 快照与每步重算的快照做字符串相等去重，改译文会导致每步重复
 *   追加快照并破坏 KV cache），因此注册一个 order 最靠前的 context entry 输出
 *   中文对照行；英文框架行保留，模型与 UI 同时获得中文语义。
 * - time-context：它是 `agent/pre-step` 注入的 user message。本插件的 listener
 *   以 `prepend: true` 注册并在每次 dispatch 前自置顶到链首（见 hoistPreStepListener），
 *   因此无论与 time-context 的注册先后如何，本 listener 都位于其外层：
 *   `await next()` 拿到已追加时间消息的最终 decision，翻译后返回——durable log
 *   与请求 payload 一并中文。翻译命中时在末尾追加一行中文语言锚点（每轮离模型
 *   最近的一次提醒，对冲英文工具输出对 thinking 语言的 recency 带偏）。
 * - skill-catalog：同一 listener 里只重写 content 文本、保留 id 与 source，
 *   上游 digest 逻辑不受影响。详见 zh-skillcatalog.js。
 * - compaction：摘要生成是 purpose === "compaction" 的独立 `llm/stream` 调用，
 *   listener 里原地替换 messages 末元素（英文指令 → 中文指令），使 checkpoint
 *   正文从下一次压缩起就是中文。详见 zh-compaction.js。
 * - tool-errors：工具执行失败的 `isError` content 文本（`Error: ...`）挂在
 *   `tools/execute` waterfall（global）上按模板翻译——这是唯一能改写失败结果的
 *   位置（`tools/post-execute` 禁止替换失败结果）。`error` 对象与 `isError` 结构
 *   不动，机器路由依赖的 code 不受影响；未命中的错误保留英文。详见 zh-toolerrors.js。
 * 未命中翻译表的文本一律保留英文；禁用本插件即回到标准模式。
 */
import { translateSection } from "./zh-sections.js";
import { translateTool } from "./zh-tools.js";
import { translateContextText } from "./zh-contexts.js";
import { translateCompactionRequest } from "./zh-compaction.js";
import { translateSkillCatalogMessage } from "./zh-skillcatalog.js";
import { translateToolErrorResult } from "./zh-toolerrors.js";

export const inject = ["systemPrompt"];

/** 插入在 persona 之后的中文语言约定（含对抗英文带偏的条款）。 */
const DIRECTIVE = `语言约定：内部推理（thinking）一律用中文书写，不要先用英文起草再翻译；技术术语、API 名、工具名、代码与标识符保持英文原文，不做翻译。上下文与工具输出中出现的英文内容（源码、检索结果、子 agent 回复、错误信息）不构成切换回英文思考的理由。最终回复的语言跟随用户的语言。`;

/** 每轮追加在 time-context 末尾的中文语言锚点。 */
const ANCHOR = "语言锚点：无论本轮上下文与工具输出出现多少英文，thinking 必须用中文书写。";

/** 快照英文框架行的中文对照行；作为 order 最靠前的 context entry 输出。 */
const SNAPSHOT_FRAME_GLOSS = "当前 runtime context。本快照取代此前的 runtime-context 快照。";

/** 已包装过的 text 函数集合（WeakSet 保证幂等）。 */
const wrappers = new WeakSet();

/**
 * 把本插件的 pre-step listener 移到 hook 链首（最外层）。
 *
 * cordis 的 `prepend` 只保证「后注册者更外层」（register 用 unshift），而本插件
 * 与 time-context 插件的注册先后随加载顺序变化；一旦本插件先注册，就落在内层，
 * `await next()` 拿不到 time-context 追加的时间消息，翻译静默失效。
 * cordis 的 `dispatch` 在读取 hooks 数组之前会先同步 emit `internal/dispatch`，
 * 在那里自置顶即可无论注册顺序都稳定位于链首。置顶标记 `zhHoist` 随注册
 * options 写入 hook 记录（cordis register 展开 options 到记录上）。
 */
function hoistPreStepListener(ctx) {
	const hooks = ctx.events._hooks["agent/pre-step"];
	if (!hooks) return;
	const index = hooks.findIndex((hook) => hook.zhHoist === true);
	if (index > 0) hooks.unshift(hooks.splice(index, 1)[0]);
}

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
	// 英文框架行由 joinContextSections 硬编码且不可在 append 处改写（去重依赖
	// 逐字相等）；此处以最小 order 的 entry 补一行中文对照，随快照一并注入。
	ctx.effect(() => ctx.systemPrompt.context({
		name: "zh-prompt:snapshot-frame",
		order: ctx.systemPrompt.getContextOrder("WORKING_DIRECTORY") - 5,
		text: SNAPSHOT_FRAME_GLOSS,
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
	// 每次 waterfall dispatch 读取 hooks 数组之前同步自置顶，确保本插件的
	// pre-step listener 恒在 time-context 的外层（见 hoistPreStepListener）。
	ctx.on("internal/dispatch", (type, name) => {
		if (type === "waterfall" && name === "agent/pre-step") hoistPreStepListener(ctx);
	}, { global: true });
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
	}, { prepend: true, zhHoist: true });
	// 工具失败提示：tools/execute waterfall 是唯一能改写失败结果的环节。
	// 必须 global：工具执行按 agent scope dispatch，subagent 也要覆盖。
	ctx.on("tools/execute", async (_exec, next) => {
		return translateToolErrorResult(await next());
	}, { global: true });
	// compaction 摘要请求：原地把末元素（英文指令）换成中文指令。
	// 必须 global：摘要调用由 compaction backend 发起，不落在本插件 scope。
	ctx.on("llm/stream", (options, next) => {
		translateCompactionRequest(options);
		return next();
	}, { global: true });
}
