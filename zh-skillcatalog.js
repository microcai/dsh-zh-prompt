/**
 * skill 目录（`<available_skills>`）消息中文化。
 *
 * `dsh-tool-skill` 在 `agent/pre-step` 上维护一条持久的 user message
 * （`source.kind === "skill-catalog"`，dsh-tool-skill/lib/index.js:931-1014）：
 * 首次注入 renderCatalogMessage，目录变化时追加 renderCatalogUpdate 完整替换，
 * 模板与每个 skill 的描述都是英文。它的 digest 比较只看 `source.entries`，
 * 与正文文本无关——所以我们只重写 content 文本、保留 id 与 source，不会
 * 触发上游重发或误判。
 *
 * 翻译策略与 zh-contexts 一致：逐行精确匹配英文模板行 → 中文行；条目行
 * `- \`name\`: description` 按 skill 名查描述映射表，且**英文原文必须逐字
 * 相符**才替换（上游描述若变化则保留英文，防止旧译文覆盖新语义）。
 * `<system-reminder>` 与 `<available_skills>` 标签本身是协议帧，保持原样。
 */

/** 精确匹配的模板行：英文整行 → 中文整行。 */
const LINE_MAP = new Map([
	[
		"A skill is a reusable set of task-specific instructions. The following skills are available in this session:",
		"skill 是可复用的、面向特定任务的指令集合。本会话中可用的 skill 如下：",
	],
	[
		"If the user names a skill, or the task clearly matches a skill's description, call the `skill` tool with the exact skill name before taking task actions. Load all applicable skills, then follow their full instructions. This catalog contains summaries only; do not infer or follow a skill's instructions until it has been loaded.",
		"如果用户点名某个 skill，或任务明显匹配某个 skill 的描述，先调用 `skill` 工具并传入确切的 skill 名，再开始任务动作。加载所有适用的 skill，然后遵循其完整指令。本目录只包含摘要；在某个 skill 未被加载之前，不要推断或遵循其指令。",
	],
	[
		"A user may also invoke a skill directly; its <skill_content> block then appears in this conversation. Follow it, and do not call the `skill` tool again for that skill.",
		"用户也可以直接调用某个 skill；其 <skill_content> 块随后会出现在本对话中。遵循该块，并且不要再为同一个 skill 调用 `skill` 工具。",
	],
	[
		"The available skill catalog changed. This complete catalog replaces every earlier available-skills list in this session:",
		"可用 skill 目录已变化。以下完整目录取代本会话中此前所有 available-skills 列表：",
	],
	[
		"Use only names in this replacement catalog. If the user names a listed skill, or the task clearly matches its description, call the `skill` tool with the exact name before acting.",
		"只使用本替换目录中列出的名称。如果用户点名某个已列出的 skill，或任务明显匹配其描述，先调用 `skill` 工具并传入确切的名称，再开始动作。",
	],
	[
		"No skills are currently available through the `skill` tool. Do not use names from earlier skill catalogs.",
		"当前没有可通过 `skill` 工具使用的 skill。不要使用此前 skill 目录中的名称。",
	],
	[
		"A user may still invoke a skill directly; its <skill_content> block then appears in this conversation. Follow it, and do not call the `skill` tool for it.",
		"用户仍可直接调用某个 skill；其 <skill_content> 块随后会出现在本对话中。遵循该块，并且不要为其调用 `skill` 工具。",
	],
]);

/** 条目描述映射：skill 名 → { en: 目录中逐字的英文渲染, zh: 中文译文 }。 */
const SKILL_DESC = new Map([
	[
		"agent-experience",
		{
			en: "Use when writing or changing a model-facing tool definition (name, description, parameter schema, or its system-prompt section), and when designing skills, context loading, or multi-step workflows, to make information discoverable and use context efficiently.",
			zh: "在编写或修改面向模型的工具定义（名称、描述、参数 schema，或其系统提示词 section）时使用；也在设计 skill、上下文加载或多步工作流时使用，以便让信息可被发现并高效利用上下文。",
		},
	],
	[
		"cordis-composition-reference",
		{
			en: "Use when writing or reading a Cordis bundle patch or agent preset for this harness and you need the Loader YAML dialect (insert, override by id, group, disabled, isolate, !!js) or the list of installable Harness plugin packages and what each provides.",
			zh: "在为当前 harness 编写或阅读 Cordis bundle patch 或 agent preset 时使用，当你需要 Loader YAML 方言（insert、按 id override、group、disabled、isolate、!!js）或可安装的 Harness plugin 包清单及各自的用途时。",
		},
	],
	[
		"cordis-plugin-development",
		{
			en: "Use when designing, reviewing, adding, enabling, disabling, installing, configuring, or debugging a plugin, bundle, feature, page, panel, tool, or MCP connection in the current Harness profile, including a shipped plugin that is disabled by default, and for any visual object, decoration, or widget request that names no other destination, which means an installed UI plugin rendered in the Harness Web UI.",
			zh: "在设计、评审、添加、启用、禁用、安装、配置或调试当前 Harness profile 中的 plugin、bundle、feature、页面、面板、tool 或 MCP 连接时使用，包括默认禁用的内置 plugin；也包括未指明其他去处、即渲染在 Harness Web UI 中的已安装 UI plugin 的任何视觉对象、装饰或部件请求。",
		},
	],
	[
		"editing-cordis-compositions",
		{
			en: "Use when creating, changing, or validating an agent preset or other Cordis composition for this harness, including deciding host versus preset placement and checking that an authored preset mounts.",
			zh: "在为当前 harness 创建、修改或校验 agent preset 及其他 Cordis composition 时使用，包括决定 host 与 preset 的放置位置，以及检查所编写的 preset 能否成功挂载。",
		},
	],
]);

/** 目录条目行的渲染形态：`- \`name\`: description`。 */
const ENTRY_LINE = /^- `([^`]+)`: (.*)$/;

/**
 * 逐行翻译 skill 目录正文；没有任何行命中时返回 undefined（原样保留）。
 * @param text - 目录消息的完整文本。
 */
export function translateSkillCatalogText(text) {
	if (typeof text !== "string") return undefined;
	let changed = false;
	const lines = text.split("\n").map((line) => {
		const mapped = LINE_MAP.get(line);
		if (mapped !== undefined) {
			changed = true;
			return mapped;
		}
		const match = ENTRY_LINE.exec(line);
		if (match !== null) {
			const entry = SKILL_DESC.get(match[1]);
			if (entry !== undefined && entry.en === match[2]) {
				changed = true;
				return `- \`${match[1]}\`: ${entry.zh}`;
			}
		}
		return line;
	});
	return changed ? lines.join("\n") : undefined;
}

/**
 * 翻译一条 skill-catalog 消息；不是、未命中或已翻译则原样返回 message。
 * 保留 id 与 source（digest 逻辑依赖 source.entries，不能被改动）。
 */
export function translateSkillCatalogMessage(message) {
	if (message?.source?.kind !== "skill-catalog") return message;
	const part = message.content?.[0];
	if (part?.type !== "text" || typeof part.text !== "string") return message;
	const zh = translateSkillCatalogText(part.text);
	if (zh === undefined) return message;
	return { ...message, content: [{ ...part, text: zh }] };
}
