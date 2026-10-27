/**
 * zh-contexts.js — runtime context 段与 time-context 消息的中译模板。
 *
 * context provider 每次刷新都会重跑，因此翻译必须作用在 provider 输出上
 * （见 index.js 的 wrap）；未命中模板的文本原样保留英文。动态值（路径、时区、
 * 时间戳、耗时）原样保留。
 */

/** 静态 context 文本的精确翻译。 */
const exact = new Map([
	["Approval policy: ask. Operations that require approval may ask through the configured answerers; without an available answerer, the request fails closed.", `审批策略：ask。需要审批的操作会通过已配置的 answerer 询问用户；没有可用的 answerer 时请求 fail closed。`],
	["Approval prompts are disabled in this session: actions that require approval are rejected automatically — do not request sandbox escalation (do not set `sandbox_permissions`).", `本会话禁用了审批提示：需要审批的操作会被自动拒绝——不要请求 sandbox 提权（不要设置 \`sandbox_permissions\`）。`],
	["Current DSH file policy: read-only. Any available operation enforced by the DSH file sandbox cannot modify files in the standing mode. Do not refuse a required modification from this policy alone: try an available tool normally and follow any denial and escalation guidance it returns.", `当前 DSH 文件策略：read-only。受 DSH file sandbox 约束的可用操作在此常驻模式下不能修改文件。不要仅凭本策略就拒绝必需的修改：正常尝试可用工具，并遵循其返回的拒绝与提权指引。`],
	["Current DSH file policy: danger-full-access. The DSH file sandbox does not restrict file modifications by available operations.", `当前 DSH 文件策略：danger-full-access。DSH file sandbox 不限制可用操作的文件修改。`],
]);

/** 模板规则：捕获动态值，返回译文或 undefined。 */
const rules = [
	[/^Current working directory: ("(?:[^"\\]|\\.)*")\.$/, (m) => `当前工作目录：${m[1]}。`],
	[/^Current DSH file policy: workspace-write\. Any available operation enforced by the DSH file sandbox may modify files under the session workspace: ("(?:[^"\\]|\\.)*")\. Some platform temporary areas may also be writable\.$/, (m) => `当前 DSH 文件策略：workspace-write。受 DSH file sandbox 约束的可用操作可以修改会话 workspace 下的文件：${m[1]}。部分平台临时目录也可能可写。`],
	[/^Current DeepSeek Harness implementation checkout: ("(?:[^"\\]|\\.)*")\.$/, (m) => `当前 DeepSeek Harness 实现 checkout：${m[1]}。`],
	[/^Current DeepSeek Harness Web GUI URL: ("(?:[^"\\]|\\.)*")\.$/, (m) => `当前 DeepSeek Harness Web GUI URL：${m[1]}。`],
	[/^Delegation depth for `(\w+)`: current (\d+), maximum (\d+), remaining levels 0\. Do not call `\1` at this depth; carry out the work directly\.$/, (m) => `\`${m[1]}\` 的委派深度：当前 ${m[2]}，最大 ${m[3]}，剩余 0 层。不要再在本深度调用 \`${m[1]}\`；直接完成工作。`],
	[/^You are the Team Lead named "lead"\./, () => `你是名为 "lead" 的 Team Lead。\n用 list_agents({}) 查找你的 teammates 及其名字。\n要给 teammate 发消息，用 send_message({ target: "<teammate name>", message: "..." })。`],
	[/^You are teammate "((?:[^"\\]|\\.)*)"\.\nYour Team Lead is named "lead"\.\n/, (m) => `你是 teammate "${m[1]}"。\n你的 Team Lead 名为 "lead"。\n要给 Team Lead 发消息，用 send_message({ target: "lead", message: "..." })。\n用 list_agents({}) 查找你的 teammates 及其名字。\n要给其他 teammate 发消息，用 send_message({ target: "<teammate name>", message: "..." })。`],
	// time-context 消息（agent/pre-step 注入的 user message）
	[/^Time sampled while preparing turn (\d+), step (\d+): (\S+)\nBrowser time zone for this request: (\S+)\. Interpret otherwise-unqualified dates and times in this zone\.\nElapsed since the preceding (model-visible message|step context): ([^.\n]+)\.$/, (m) => `准备第 ${m[1]} 轮第 ${m[2]} 步时采样的时间：${m[3]}\n本请求的浏览器时区：${m[4]}。无时区标注的日期与时间按该时区理解。\n距上一条${m[5] === "model-visible message" ? "模型可见消息" : "step context"}已过去：${m[6]}。`],
	[/^Time sampled while preparing turn (\d+), step (\d+): (\S+)\nBrowser time zone for this request: mixed (\S+)\. Ask the user to clarify otherwise-unqualified dates and times\.\nElapsed since the preceding (model-visible message|step context): ([^.\n]+)\.$/, (m) => `准备第 ${m[1]} 轮第 ${m[2]} 步时采样的时间：${m[3]}\n本请求的浏览器时区：mixed ${m[4]}。请让用户澄清无时区标注的日期与时间。\n距上一条${m[5] === "model-visible message" ? "模型可见消息" : "step context"}已过去：${m[6]}。`],
	[/^Time sampled while preparing turn (\d+), step (\d+): (\S+)\nBrowser time zone for this request: unavailable\. Ask the user to clarify otherwise-unqualified dates and times\.\nElapsed since the preceding (model-visible message|step context): ([^.\n]+)\.$/, (m) => `准备第 ${m[1]} 轮第 ${m[2]} 步时采样的时间：${m[3]}\n本请求的浏览器时区：不可用。请让用户澄清无时区标注的日期与时间。\n距上一条${m[5] === "model-visible message" ? "模型可见消息" : "step context"}已过去：${m[6]}。`],
];

/** 归一化：折叠连续空白并 trim。 */
function normalize(text) {
	return text.replace(/\s+/g, " ").trim();
}

/** 把一段 context/时间消息文本译成中文；未命中返回 undefined。 */
export function translateContextText(text) {
	if (typeof text !== "string" || text.length === 0) return undefined;
	const hit = exact.get(text);
	if (hit !== undefined) return hit;
	const normalized = normalize(text);
	for (const [en, cn] of exact) if (normalize(en) === normalized) return cn;
	for (const [re, fn] of rules) {
		const m = re.exec(text);
		if (m !== null) return fn(m);
	}
	return undefined;
}
