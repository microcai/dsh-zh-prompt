/**
 * zh-toolerrors.js — 工具执行失败提示（isError content 文本）的中译模板。
 *
 * 文本来自历史会话聚合（真实运行产物，与 checkout 源码措辞略有出入）。
 * 命中则整段替换为中文；未命中原样保留英文。`error` 对象与 `isError` 结构
 * 不动——机器路由依赖 error.code，与 content 文本无关。
 *
 * 模板按运行时实测频度排序；前缀式规则只译首行，保留后续原文。
 */

/** 动词中译。 */
const VERB = { edit: "编辑", write: "写入", modify: "修改", create: "创建", delete: "删除" };

/** 完整文本模板：捕获动态值，返回译文或 undefined。 */
const rules = [
	[/^Error: cannot (edit|write|modify|create|delete) "(.*?)": file has not been read — read the file, then retry$/, (m) => `错误：无法${VERB[m[1]]} "${m[2]}"——文件尚未被 read，请先 read 该文件再重试`],
	[/^Error: cannot (edit|write|modify|create|delete) "(.*?)": file changed since it was read — re-read the file, then retry$/, (m) => `错误：无法${VERB[m[1]]} "${m[2]}"——文件自上次 read 后已变化，请重新 read 该文件后再重试`],
	[/^Error: invalid arguments: (.+)$/s, (m) => {
		const zh = m[1].split("; ").map((clause) => {
			const missing = /^missing required property "(.*?)"$/.exec(clause);
			if (missing !== null) return `缺少必需属性 "${missing[1]}"`;
			const array = /^"(.*?)" must be an array$/.exec(clause);
			if (array !== null) return `"${array[1]}" 必须是数组`;
			return undefined;
		});
		return zh.every((t) => t !== undefined) ? `错误：参数无效：${zh.join("；")}` : undefined;
	}],
	[/^Error: cannot read "(.*?)": not found$/, (m) => `错误：无法读取 "${m[1]}"：文件不存在`],
	[/^Error: cannot (read|edit|write|modify) "(.*?)": not a regular file$/, (m) => `错误：无法${m[1] === "read" ? "读取" : VERB[m[1]]} "${m[2]}"：目标不是常规文件`],
	[/^Error: old_string was not found in "(.*?)"$/, (m) => `错误：在 "${m[1]}" 中未找到 old_string`],
	[/^Error: (grep|glob) subprocess failed before reporting an outcome \(ripgrep provider failure\)$/, (m) => `错误：${m[1]} 子进程在报告结果前失败（ripgrep provider 故障）`],
	[/^Error: offset (\d+) is out of range for "(.*?)" \((\d+) lines\)$/, (m) => `错误：offset ${m[1]} 超出 "${m[2]}" 的行号范围（共 ${m[3]} 行）`],
	[/^Error: cannot read "(.*?)" as an image: model "(.*?)" does not declare image input; switch to an image-capable model to read images$/, (m) => `错误：无法把 "${m[1]}" 作为图片读取：模型 "${m[2]}" 未声明图片输入能力；请改用支持图片的模型再读取图片`],
	[/^Error: \[sandbox: file access denied under (\S+) mode\]\n\[sandbox: escalation available — retry this exact (\w+) once with sandbox_permissions \(the narrowest wider mode that suffices\) \+ justification; the approval prompt asks the user\]$/, (m) => `错误：[sandbox: ${m[1]} 模式下该${m[2] === "operation" ? "操作" : m[2]}被拒绝]\n[sandbox: 可提权——对该${m[2] === "operation" ? "操作" : m[2]}原样重试一次并带上 sandbox_permissions（足以覆盖需求的最窄更宽模式）与 justification；审批提示会询问用户]`],
	[/^Error: the user rejected escalating this operation to "(.*?)"; it stays denied, so stop and explain instead of working around it$/, (m) => `错误：用户拒绝把本次操作提权到 "${m[1]}"；维持拒绝——停下来向用户说明，不要绕过它`],
	[/^Error: tool call timed out after (\S+)$/, (m) => `错误：工具调用超时（${m[1]}）`],
	[/^Error: tool call aborted$/, () => `错误：工具调用已中止`],
	// 前缀式：只译首行，保留后续原文。
	[/^Error: web fetch failed: (.*)$/s, (m) => `错误：网页抓取失败：${m[1]}`],
	[/^Error: grep search failed \(exit (\d+)\): (.*)$/s, (m) => `错误：grep 检索失败（退出码 ${m[1]}）：${m[2]}`],
	[/^Error: DeepSeek API error \(HTTP (\d+)\): (.*)$/s, (m) => `错误：DeepSeek API 错误（HTTP ${m[1]}）：${m[2]}`],
];

/** 把一段工具错误文本译成中文；未命中返回 undefined。 */
export function translateToolErrorText(text) {
	if (typeof text !== "string" || !text.startsWith("Error: ")) return undefined;
	for (const [re, fn] of rules) {
		const m = re.exec(text);
		if (m !== null) return fn(m);
	}
	return undefined;
}

/** 翻译一次工具执行结果：isError 时逐块重写 text，其余原样返回。 */
export function translateToolErrorResult(result) {
	if (result?.isError !== true || !Array.isArray(result.content)) return result;
	let changed = false;
	const content = result.content.map((block) => {
		if (block?.type !== "text") return block;
		const zh = translateToolErrorText(block.text);
		if (zh === undefined) return block;
		changed = true;
		return { ...block, text: zh };
	});
	return changed ? { ...result, content } : result;
}
