/**
 * compaction 摘要中文化。
 *
 * `dsh-compaction-basic` 的摘要生成是一次独立的 `ctx.llm.stream()` 辅助调用
 * （purpose === "compaction"），其指令作为最后一条 user message 追加在会话
 * 前缀之后（dsh-compaction-basic/lib/index.js:305-323）。英文指令明确要求
 * "Write concise English engineering prose"，所以压缩后的 checkpoint 必然全
 * 英文，模型续写时 thinking 被大片英文上下文带偏回英文。
 *
 * hook 方式：`llm/stream` waterfall listener 里对 purpose === "compaction"
 * 的请求做**原地**数组元素替换。两个关键事实：
 * - cordis waterfall 的 `next` 忽略实参（cordis lib/index.js:320），传改过的
 *   options 无效；但 dsh-llm 的 leaf 闭包捕获同一个 options 对象
 *   （dsh-llm/lib/index.js:2397），而 summarizeWithLlm 构造的 messages 是
 *   可变新数组——原地替换数组元素即可传导到实际请求。
 * - 这条辅助调用路径没有 prepared，不存在 agent-loop 请求的 deepFreeze /
 *   callConfigEquals / INVALID_PREPARED_CALL 限制；指令 message 本身是
 *   deepFreeze 的，展开副本替换即可。
 *
 * 命中条件用前缀+结构标记而非全文匹配：上游若微调指令文本仍能命中；若上游
 * 更换指令语义导致未命中，摘要保持英文（安全回退）。历史 checkpoint 会在
 * 下一次压缩时按中文结构合并重写（指令的 PRIOR checkpoint 合并规则）。
 */

/** 中文版压缩指令；`<compacted-summary>` 标签与结构必须与上游语义一一对应。 */
export const COMPACTION_INSTRUCTION_ZH = [
	"你现在充当这个 AI 编码助手的上下文压缩引擎。把上方（ABOVE）的对话浓缩为一份结构化 checkpoint，让另一个模型在不丢失关键上下文的前提下接续工作。",
	"",
	"严格输出下面这份 Markdown 结构：保留每个 section，顺序不变。用简洁的条目符号，不要写成段落。空的 section 写 \"（无）\"——绝不能删掉某个 section。",
	"",
	"## 原始请求与意图",
	"- [用户最初的与不断演化的目标；措辞精确性重要时逐字引用]",
	"",
	"## 关键技术概念",
	"- [涉及的技术、框架、模式与约定]",
	"",
	"## 文件与代码",
	"- [确切路径：为什么重要、关键改动或代码片段]",
	"",
	"## 错误与修复",
	"- [错误：如何解决，以及相关的用户反馈]",
	"",
	"## 待办工作",
	"- [明确要求但尚未完成的工作]",
	"",
	"## 当前进行中的工作",
	"- [在这个 checkpoint 时刻确切正在做什么]",
	"",
	"## 下一步",
	"- [紧接最近一次请求的下一个单一动作；没有则写 \"（无）\"]",
	"",
	"## 关键上下文",
	"- [决策及其理由、约束、用户偏好、未决问题、继续工作所需的数据]",
	"",
	"规则：",
	"- 叙述性文字用简洁的中文工程表述。文件路径、命令、错误字符串、标识符、数值、函数签名与语法片段保持原文，不做翻译。",
	"- 忠实记录用户的反馈与明确指令，尤其是纠正性意见。",
	"- 不要提及本摘要请求本身，也不要提及上下文曾被压缩。",
	"- 只输出 checkpoint 文本：不要调用任何工具，也不要执行其他动作。",
	"- 若对话中已存在 <compacted-summary> 块，那是一个此前的 checkpoint。不要逐字照搬：保留仍然成立的事实，丢弃过时内容，并把新信息合并为同一结构下的一份统一摘要。",
].join("\n");

/** 判断一段文本是否是尚未翻译的英文压缩指令（前缀 + 结构标记匹配）。 */
export function isCompactionInstruction(text) {
	return typeof text === "string"
		&& text.startsWith("You are now acting as a compaction engine")
		&& text.includes("## Primary Request and Intent");
}

/**
 * 若 options 是一次 compaction 摘要请求且其最后一条 message 是英文指令，
 * 原地替换 messages 数组的最后一个元素为中文指令副本。
 * @param options - `llm/stream` 的完整请求对象。
 * @returns 是否做了替换。
 */
export function translateCompactionRequest(options) {
	if (options?.purpose !== "compaction") return false;
	const messages = options.messages;
	if (!Array.isArray(messages) || Object.isFrozen(messages)) return false;
	const last = messages[messages.length - 1];
	const part = last?.content?.[0];
	if (last?.role !== "user" || part?.type !== "text" || !isCompactionInstruction(part.text)) return false;
	messages[messages.length - 1] = { ...last, content: [{ ...part, text: COMPACTION_INSTRUCTION_ZH }] };
	return true;
}
