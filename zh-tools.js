/**
 * zh-tools.js — 工具 schema description 的中译表。
 *
 * key 是运行时英文原文（精确匹配，来自 cordis_inspect_query Tool.listTools）；
 * 命中即替换，未命中的文本原样保留英文。DSH 升级后原文漂移只会导致回退英文，
 * 不会损坏 schema。
 */
const zh = new Map();

/** 登记一条「英文原文 → 中文」翻译。 */
function t(en, cn) {
	zh.set(en, cn);
}

// ── working_directory / create_worktree ──────────────────────────────────────
t(`Read the current working directory, or change it with cd. Relative paths use the current directory. Existing shells and running processes keep their own directories.`, `读取当前工作目录，或用 cd 更改它。相对路径基于当前目录解析。已有 shell 与运行中的进程保持各自的目录。`);
t(`Existing directory to enter. Omit to read the current directory.`, `要进入的现有目录。省略则读取当前目录。`);
t(`Create a new Git branch and worktree from a local commit, branch, or tag, then change this session's working directory to it. Defaults to HEAD and a generated name. Uncommitted files stay in the source checkout. Existing names fail. Use working_directory with cd to leave; the checkout and branch remain.`, `从本地 commit、branch 或 tag 创建新的 Git branch 与 worktree，然后把本会话的工作目录切到它。默认从 HEAD 起、使用生成的名字。未提交的文件留在原 checkout。重名会失败。用 working_directory 的 cd 离开；checkout 与 branch 仍然存在。`);
t(`New branch name, also used as the checkout directory. Omit to generate a unique name.`, `新 branch 名，也用作 checkout 目录名。省略则生成唯一名字。`);
t(`Local commit, branch, or tag to start from. Defaults to HEAD; no fetch is performed.`, `起始的本地 commit、branch 或 tag。默认 HEAD；不会执行 fetch。`);

// ── read / write / edit / glob / grep / read_image ───────────────────────────
t(`Read a UTF-8 text file and return line-numbered content.`, `读取 UTF-8 文本文件并返回带行号的内容。`);
t(`Path to read, resolved by the filesystem backend.`, `读取路径，由 filesystem backend 解析。`);
t(`1-based first line to return. Defaults to 1.`, `返回的起始行（从 1 开始）。默认为 1。`);
t(`Maximum number of lines to return. Defaults to 2000.`, `返回的最大行数。默认为 2000。`);
t(`Create or fully replace a UTF-8 text file.`, `创建或完全替换一个 UTF-8 文本文件。`);
t(`Path to write, resolved by the filesystem backend. Provide \`file_path\` before \`content\` in the arguments.`, `写入路径，由 filesystem backend 解析。参数中先提供 \`file_path\` 再给 \`content\`。`);
t(`Full UTF-8 text content to write.`, `要写入的完整 UTF-8 文本内容。`);
t(`Edit an existing UTF-8 text file by replacing literal text.`, `通过替换字面文本编辑现有 UTF-8 文本文件。`);
t(`Path to edit, resolved by the filesystem backend. Provide \`file_path\` before \`old_string\` and \`new_string\` in the arguments.`, `要编辑的路径，由 filesystem backend 解析。参数中先提供 \`file_path\` 再给 \`old_string\` 和 \`new_string\`。`);
t(`Literal text to replace.`, `要替换的字面文本。`);
t(`Literal replacement text. Use an empty string to delete the match.`, `替换后的字面文本。用空字符串删除匹配。`);
t(`Replace all matches. Defaults to false; when false, old_string must appear exactly once.`, `替换所有匹配。默认 false；为 false 时 old_string 必须恰好出现一次。`);
t(`The narrowest wider sandbox mode for a one-shot retry of the exact operation the sandbox just denied; the retry asks the user for approval.`, `当沙箱刚拒绝了这个确切操作时，一次性重试所用的最小可行更宽沙箱模式；重试会向用户请求批准。`);
t(`Required with sandbox_permissions: one sentence for the user explaining why this exact file operation needs the wider access. Use the language of the user’s current request.`, `与 sandbox_permissions 一起必需：向用户解释这个确切文件操作为何需要更宽访问的一句话。使用用户当前请求的语言。`);
t(`Find files, not directories, whose paths match a glob pattern, including hidden and ignored files. Returns up to 100 paths in modification-time order; a larger result keeps the first paths and reports where the complete list was saved.`, `查找路径匹配 glob 模式的文件（不含目录），包括隐藏与被忽略的文件。按修改时间顺序最多返回 100 个路径；超出时保留最前面的路径并报告完整清单的保存位置。`);
t(`Glob pattern to match file paths against (e.g. "**/*.ts", "src/**/*.test.js"). A pattern with no "/" matches the basename at any depth, so "*" and "*.ts" both search the whole tree; include a separator to anchor the depth.`, `匹配文件路径的 glob 模式（例如 "**/*.ts"、"src/**/*.test.js"）。不含 "/" 的模式在任意深度匹配 basename，因此 "*" 与 "*.ts" 都会搜索整棵树；要锚定深度请包含分隔符。`);
t(`Directory to search in. Defaults to the session workspace; a relative path resolves against it.`, `要搜索的目录。默认为会话 workspace；相对路径基于它解析。`);
t(`Search file contents with a ripgrep regular expression. Returns matching lines with line numbers, grouped by file. Returns up to 250 matches; a larger result reports where the complete match list was saved.`, `用 ripgrep 正则表达式搜索文件内容。返回按文件分组的匹配行与行号。最多返回 250 个匹配；超出时报告完整匹配清单的保存位置。`);
t(`Regular expression to search for (ripgrep syntax).`, `要搜索的正则表达式（ripgrep 语法）。`);
t(`File or directory to search. Defaults to the session workspace; a relative path resolves against it.`, `要搜索的文件或目录。默认为会话 workspace；相对路径基于它解析。`);
t(`One glob filter for which files to search (e.g. "*.ts", "*.{js,jsx}"). Not a list; negation is not supported.`, `限定搜索哪些文件的单个 glob 过滤器（例如 "*.ts"、"*.{js,jsx}"）。不是列表；不支持取反。`);
t(`Read a PNG/JPEG/WebP/GIF file and return the image itself. Large images are downscaled automatically; do not install image libraries or create thumbnails to inspect an image.`, `读取 PNG/JPEG/WebP/GIF 文件并返回图像本身。大图会自动缩小；不要为查看图像安装图像库或生成缩略图。`);
t(`Path to the image file, resolved by the filesystem backend.`, `图像文件的路径，由 filesystem backend 解析。`);

// ── jobs ─────────────────────────────────────────────────────────────────────
t(`Read a background job: output since the previous read for stream jobs, or the result of a finished final-output job.`, `读取后台 job：stream 型返回自上次读取以来的输出，final-output 型返回已完成 job 的结果。`);
t(`Job id returned by the tool that started the background work.`, `由启动该后台工作的工具返回的 job id。`);
t(`Block until the job finishes or the timeout expires; a timed-out wait leaves the job running. Defaults to false.`, `阻塞直到 job 完成或超时；超时后 job 仍在运行。默认 false。`);
t(`Max wait in milliseconds with wait: true. Defaults to and is capped by configuration.`, `wait: true 时的最大等待毫秒数。默认值与上限由配置决定。`);
t(`List your background jobs (running and finished) with their ids, kinds, and statuses.`, `列出你的后台 job（运行中与已结束），包含 id、类型与状态。`);
t(`Request cancellation of a running background job.`, `请求取消一个正在运行的后台 job。`);
t(`Optional short reason, recorded in the log and forwarded to the job.`, `可选的简短理由，记入日志并转发给 job。`);

// ── skill / web / present ────────────────────────────────────────────────────
t(`Load the full instructions for a skill. Call it before acting on a task that names or clearly matches a skill in the session skill catalog.`, `加载某个 skill 的完整指令。在处理明确提及或明显匹配会话 skill 目录的 task 之前调用它。`);
t(`The exact skill name from the available skills list.`, `来自可用 skills 列表的确切 skill 名。`);
t(`Search the web for current information. Returns an optional summary answer and a list of source URLs.`, `搜索网络获取最新信息。返回可选的摘要答案与来源 URL 列表。`);
t(`1–4 search queries; their results are merged.`, `1–4 条搜索查询；结果会合并。`);
t(`Fetch the content of a specific HTTP(S) URL and return it decoded to text.`, `抓取特定 HTTP(S) URL 的内容并解码为文本返回。`);
t(`The HTTP(S) URL to fetch.`, `要抓取的 HTTP(S) URL。`);
t(`Declare existing files as final deliverables for the user. Use it when the user needs a separate file, especially Office documents, spreadsheets, and slide decks; prefer your final response when that suffices. The user opens the current files; their contents are not copied.`, `把现有文件声明为给用户的最终交付物。当用户需要独立文件时使用，尤其是 Office 文档、电子表格与幻灯片；最终回复足够时优先用回复。用户打开当前文件；内容不会被复制。`);
t(`Usually the 1-2 most important deliverables; at most 4 per call.`, `通常是 1-2 个最重要的交付物；每次调用至多 4 个。`);
t(`Path of an existing regular file. Relative paths use the Session working directory.`, `现有常规文件的路径。相对路径使用 Session 工作目录。`);
t(`Brief description for the user.`, `给用户的简短描述。`);

// ── cordis inspect / plugin_manager ──────────────────────────────────────────
t(`List every Cordis Inspect Provider currently known to the Host, including local Host Providers and the latest manifests synchronized from the Client. Each entry includes its platform, purpose, read-only methods, and input/output schemas. Call this Tool before writing or configuring a plugin, then select the provider and method for cordis_inspect_query from its result. Do not guess names or treat an Inspect method as a business Service that Plugin code can call.`, `列出 Host 当前已知的全部 Cordis Inspect Provider，包括本地 Host Provider 与从 Client 同步的最新 manifest。每个条目包含 platform、用途、只读方法与输入/输出 schema。编写或配置 plugin 之前先调用此 Tool，然后从其结果中为 cordis_inspect_query 选择 provider 与 method。不要猜测名字，也不要把 Inspect method 当作 plugin 代码可调用的业务 Service。`);
t(`Run a read-only query declared by an Inspect Provider. platform, provider, and method must come from cordis_inspect_list, and input must satisfy that method's schema. Use this Tool before writing plugin code to read exact Service methods, Event modes, plugin Config schemas, Tool schemas, theme tokens, or live Slot trees and props. Host queries run locally. A Client query waits for the first valid page response within the configured timeout; otherwise it reports a Client failure or asks you to reconnect and retry. This Tool cannot invoke business Service methods or modify the runtime.`, `运行 Inspect Provider 声明的只读查询。platform、provider、method 必须来自 cordis_inspect_list，input 必须满足该 method 的 schema。编写 plugin 代码之前用此 Tool 读取确切的 Service method、Event mode、plugin Config schema、Tool schema、theme token 或活的 Slot tree 与 props。Host 查询本地执行。Client 查询会在配置的超时内等待第一个有效页面响应；否则报告 Client 失败或要求你重连后重试。此 Tool 不能调用业务 Service method 或修改 runtime。`);
t(`Runtime platform that owns the Provider.`, `拥有该 Provider 的 runtime platform。`);
t(`Exact Provider ID returned by cordis_inspect_list.`, `cordis_inspect_list 返回的确切 Provider ID。`);
t(`Exact method name declared by the Provider manifest.`, `Provider manifest 声明的确切 method 名。`);
t(`Optional query input; it must satisfy the method input schema.`, `可选查询输入；必须满足该 method 的输入 schema。`);
t(`List plugins or bundles in the current profile, enable or disable them, install a bundle, or remove an installed bundle. Every action requires danger-full-access permission or approval for this call. Approval does not change the session permission mode. Changes affect every session in this profile. List first to obtain exact identifiers. Package installation can execute allowed build scripts. Live profiles apply changes immediately, including upgrades of installed packages; a change result that is not applied carries nextStep, which says what to do or tell the user. Unmet DSH version requirements (engines.dsh, else DSH peer dependencies) block installation and activation. Version exemptions risk crashes and data loss: warn the user and obtain explicit permission for the exact plugin and runtime versions before granting one.`, `列出当前 profile 的 plugin 或 bundle，启用或禁用它们，安装 bundle，或移除已安装的 bundle。每个 action 都需要 danger-full-access 权限或本次调用的批准。批准不会改变会话的权限模式。变更影响该 profile 的每个会话。先 list 以获得确切标识符。包安装可以执行被允许的 build 脚本。Live profile 立即应用变更，包括升级已安装的包；未应用的变更结果带有 nextStep，说明该做什么或该告诉用户什么。未满足的 DSH 版本要求（engines.dsh，否则为 DSH peer 依赖）会阻止安装与激活。版本豁免有崩溃与数据丢失风险：先警告用户，并在授予豁免前取得针对确切 plugin 与 runtime 版本的明确许可。`);
t(`Management operation.`, `管理操作。`);
t(`Plugin entry id, bundle package name, or installation spec, according to action. For an Official catalog entry, pass list_bundles installTarget.spec to install_bundle.`, `按 action 而定：plugin entry id、bundle 包名或安装 spec。对 Official catalog 条目，把 list_bundles 的 installTarget.spec 传给 install_bundle。`);
t(`Required for set operations; defaults to true for installation. For set_version_exemption, true grants and false revokes.`, `set 操作必需；安装时默认 true。set_version_exemption 时 true 授予、false 撤销。`);
t(`For set_version_exemption: exact DSH version from list_version_exemptions. Target must be the manifest package-name@version, not an alias or version range.`, `set_version_exemption 用：来自 list_version_exemptions 的确切 DSH 版本。Target 必须是 manifest 的 package-name@version，不是别名或版本范围。`);
t(`For granting an exemption: true only after warning the user about possible crashes and data loss and receiving explicit permission for this exact plugin/runtime pair. General installation permission is not enough.`, `授予豁免时用：只有在警告用户可能的崩溃与数据丢失、并获得针对这个确切 plugin/runtime 组合的明确许可之后才能为 true。一般的安装许可不够。`);
t(`For install_bundle: pass names from pendingBuilds only after the user explicitly approves running their install scripts in the conversation. This grants persistent permission for this profile.`, `install_bundle 用：只有在用户于对话中明确批准运行其安装脚本之后，才把 pendingBuilds 中的名字传入。这为该 profile 授予持久许可。`);
t(`For install_bundle: the npm registry URL asked first, when the user names one; otherwise the configured registry is asked, and its configured fallbacks while a registry is unreachable.`, `install_bundle 用：用户指定时优先请求的 npm registry URL；否则请求已配置的 registry，及其在 registry 不可达时配置的后备。`);
t(`Zero-based list offset; defaults to 0.`, `列表的零基偏移；默认 0。`);
t(`List page size, from 1 to 100; defaults to 25.`, `列表页大小，1 到 100；默认 25。`);

// ── bash ─────────────────────────────────────────────────────────────────────
t(`Execute a bash command (\`bash -c\`) and return its stdout/stderr. Each call runs in a fresh shell; pass \`workdir\` instead of using \`cd\`. Managed \`$DSH_*\` variables expose current harness environment facts. Long output is truncated to its tail; the full output is saved to a file whose path is reported when available. Provide \`description\` before \`command\` in the arguments. Before any delete or move, verify that the resolved absolute target path is the intended one; never run it against a computed path you have not checked. An unset variable expands to an empty string, so guard variables in such paths with \`\${VAR:?}\`. Commands may run under a file sandbox; a blocked file operation is reported as \`[sandbox: file access denied under <mode> mode]\`, a policy denial: do not retry another way.`, `执行一条 bash 命令（\`bash -c\`）并返回其 stdout/stderr。每次调用都在全新 shell 中运行；用 \`workdir\` 而不是 \`cd\`。受管理的 \`$DSH_*\` 变量暴露当前 harness 环境事实。长输出会截断为末尾部分；完整输出保存到文件，可用时报告其路径。参数中先提供 \`description\` 再给 \`command\`。任何删除或移动之前，先确认解析后的绝对目标路径就是预期目标；绝不对未核对的计算路径执行。未设置的变量展开为空字符串，因此这类路径中的变量要用 \`\${VAR:?}\` 守卫。命令可能在文件沙箱下运行；被阻止的文件操作会报告为 \`[sandbox: file access denied under <mode> mode]\`，这是策略拒绝：不要换其他途径重试。`);
t(`Clear, concise description of what this command does in active voice, 5-10 words (shown in the UI). Examples: "ls" → "List files in current directory"; "git status" → "Show working tree status"; "npm install" → "Install package dependencies".`, `对这条命令做什么的清晰简洁描述，主动语态，5-10 个词（显示在 UI 中）。示例："ls" → "List files in current directory"；"git status" → "Show working tree status"；"npm install" → "Install package dependencies"。`);
t(`The bash command to execute.`, `要执行的 bash 命令。`);
t(`Timeout in milliseconds. The executor applies its configured default and cap; on expiry the command moves to the background as a job instead of being killed.`, `超时毫秒数。执行器应用其配置的默认值与上限；超时后命令转入后台成为 job，而不是被杀死。`);
t(`Working directory for this command. Defaults to the session workspace; a relative path is resolved against it.`, `该命令的工作目录。默认为会话 workspace；相对路径基于它解析。`);
t(`Run in the background and return a job id immediately (collect with job_output, stop with job_kill). No timeout applies.`, `在后台运行并立即返回 job id（用 job_output 收集，用 job_kill 停止）。不适用超时。`);
t(`The narrowest wider sandbox mode for a one-shot retry of the exact command the sandbox just denied; the retry asks the user for approval.`, `当沙箱刚拒绝了这个确切命令时，一次性重试所用的最小可行更宽沙箱模式；重试会向用户请求批准。`);
t(`Required with sandbox_permissions: one sentence for the user explaining why this exact command needs the wider access. Use the language of the user’s current request.`, `与 sandbox_permissions 一起必需：向用户解释这个确切命令为何需要更宽访问的一句话。使用用户当前请求的语言。`);

// ── 会话协作：send_message / interrupt / list_agents / todo ─────────────────
t(`Send a message to an agent. A working agent receives it at its next step; an idle agent starts a new turn with it. Returns delivery confirmation, not the agent's answer.`, `向一个 agent 发送消息。工作中的 agent 在其下一步收到；空闲的 agent 会带着它开始新一轮。返回送达确认，而不是 agent 的回答。`);
t(`The agent id of your direct continuable child, or your direct parent when you are a resident continuable child.`, `你的直接可继续子 agent 的 id；当你自己是常驻可继续子 agent 时，则填你的直接父 agent。`);
t(`The message to deliver to the agent.`, `要送达给 agent 的消息。`);
t(`Ask a subagent to stop its current work. This call returns without waiting for it to stop. You can continue a local direct child's conversation later with send_message. External executions stop permanently and cannot receive follow-ups. Subagents it started will keep running.`, `请求一个 subagent 停止当前工作。此调用立即返回，不等待其停止。之后可用 send_message 继续本地直接子 agent 的对话。外部执行会永久停止且无法接收后续消息。它启动的 subagent 会继续运行。`);
t(`The id of an agent created under you: your direct child or a deeper descendant.`, `你之下创建的 agent 的 id：直接子 agent 或更深层后代。`);
t(`List subagents you started, with their ids, labels, and status. running means it is working; inactive means it is not currently working. You will be notified when a subagent finishes; there is no need to keep checking its status. Use send_message to continue the conversation.`, `列出你启动的 subagent，包含 id、标签与状态。running 表示正在工作；inactive 表示当前不在工作。subagent 结束时会通知你，无需持续检查状态。用 send_message 继续对话。`);
t(`children (default) lists direct children, which accept send_message in any status. descendants lists the whole tree below you with each entry's parent session id and depth; entries deeper than 1 accept only interrupt_agent.`, `children（默认）列出直接子 agent，它们在任何状态下都接受 send_message。descendants 列出你之下的整棵树，每个条目带父 session id 与深度；深度大于 1 的条目只接受 interrupt_agent。`);
t(`Record and update a task list to plan multi-step work and show progress; skip it for trivial single-step tasks. Add one todo per concrete step before you start. While work remains, keep the todos being worked on \`in_progress\`, several only when work runs in parallel. Mark each todo \`completed\` as soon as it is done.`, `记录并更新任务列表以规划多步工作并展示进度；琐碎的单步任务跳过它。开始前为每个具体步骤添加一个 todo。工作未完时，把正在做的 todo 保持 \`in_progress\`，只有并行工作才同时多个。每完成一个立即标记 \`completed\`。`);
t(`The COMPLETE task list, replacing any previous list.`, `完整任务列表，替换之前的全部列表。`);
t(`What the task is — a short imperative line.`, `任务是什么——一行简短的祈使句。`);
t(`pending (not started) | in_progress (now) | completed (done).`, `pending（未开始）| in_progress（正在做）| completed（已完成）。`);

// ── workflow ─────────────────────────────────────────────────────────────────
t(`Run a JavaScript workflow script that orchestrates subagents at scale. Use this for work that fans out across many independent pieces — an audit over many files, a migration, multi-angle research, adversarial verification of findings — where you write the orchestration as a script instead of delegating turn by turn.

Script-body hooks:
- \`agent(prompt, opts?): Promise<any>\` — run one subagent to completion. Without \`opts.schema\` it resolves to the child's final text; with \`opts.schema\` (an object-rooted JSON Schema using ONLY type/properties/required/additionalProperties/items/enum/const/oneOf) it resolves to the validated object. Resolves \`null\` when the child fails (filter with \`.filter(Boolean)\`). Other opts: \`label\` (display), \`phase\` (progress group), and independent \`provider\`/\`model\` LLM target overrides.
- \`pipeline(items, ...stages): Promise<any[]>\` — run each item through the stages independently with NO barrier between stages (prefer this for multi-stage work). Each stage receives \`(prev, item, index)\`. A stage throw drops that ITEM to \`null\` and skips its remaining stages.
- \`parallel(thunks): Promise<any[]>\` — run zero-argument functions concurrently and await ALL of them (a barrier; use only when a stage genuinely needs every prior result together). A throwing thunk resolves to \`null\`.
- \`phase(title)\` — start a progress phase; \`log(message)\` — narrate progress; \`args\` — the tool call's \`args\` input, verbatim.

Misused hooks (bad arguments, unknown options, unsupported schemas, tripped caps) end the whole script instead of producing \`null\`. The script has no filesystem, network, timer, or Node.js APIs; the agents do the work.`, `运行一个 JavaScript workflow 脚本，大规模编排 subagent。当工作扇出到许多独立部分——跨许多文件的审计、迁移、多角度研究、对结论的对抗性验证——且你以脚本形式编写编排、而不是逐轮委派时使用。

脚本正文 hook：
- \`agent(prompt, opts?): Promise<any>\` —— 把一个 subagent 跑到完成。没有 \`opts.schema\` 时解析为子 agent 的最终文本；带 \`opts.schema\`（对象根 JSON Schema，只用 type/properties/required/additionalProperties/items/enum/const/oneOf）时解析为已校验对象。子 agent 失败时解析为 \`null\`（用 \`.filter(Boolean)\` 过滤）。其他 opts：\`label\`（展示）、\`phase\`（进度分组）、独立的 \`provider\`/\`model\` LLM 目标覆盖。
- \`pipeline(items, ...stages): Promise<any[]>\` —— 各 item 独立流过各 stage，stage 之间没有 barrier（多阶段工作优先用它）。每个 stage 收到 \`(prev, item, index)\`。某 stage 抛出会把该 ITEM 置为 \`null\` 并跳过其剩余 stage。
- \`parallel(thunks): Promise<any[]>\` —— 并发运行零参数函数并等待全部完成（barrier；仅当某 stage 确实需要此前全部结果一起到位时用）。抛出的 thunk 解析为 \`null\`。
- \`phase(title)\` —— 开始一个进度 phase；\`log(message)\` —— 叙述进度；\`args\` —— 本 tool 调用的 \`args\` 输入，原样。

误用 hook（错误参数、未知选项、不支持的 schema、触发上限）会使整个脚本终止而不是产生 \`null\`。脚本没有 filesystem、network、timer 或 Node.js API；工作由 agent 完成。`);
t(`The plain JavaScript body, not TypeScript and without an \`export const meta\` statement; top-level await is allowed. End with \`return <value>\`; the JSON-serializable value is this tool's result.`, `纯 JavaScript 脚本正文，不是 TypeScript，也不含 \`export const meta\` 语句；允许顶层 await。以 \`return <value>\` 结尾；可 JSON 序列化的值即此 tool 的结果。`);
t(`The workflow identity as plain JSON, not code.`, `workflow 的身份信息，用普通 JSON，不是代码。`);
t(`Short kebab-case workflow name.`, `简短 kebab-case 的 workflow 名。`);
t(`One-line description of what the workflow does.`, `一行说明该 workflow 做什么。`);
t(`Optional guidance on when this workflow applies.`, `可选：说明此 workflow 何时适用。`);
t(`Optional phase declarations matched by phase() calls.`, `可选的 phase 声明列表，由 phase() 调用按 title 精确匹配。`);
t(`The phase title phase() calls match by exact string.`, `phase() 调用按精确字符串匹配的 phase 标题。`);
t(`Optional one-line description of the phase.`, `可选：一行描述该 phase。`);
t(`Optional provider override this phase is expected to use.`, `可选：该 phase 预期使用的 provider 覆盖。`);
t(`Optional model override this phase is expected to use.`, `可选：该 phase 预期使用的 model 覆盖。`);
t(`Optional JSON input exposed to the script as the \`args\` global (wrap a bare list as a field, e.g. {"files": [...]}).`, `可选 JSON 输入，以 \`args\` 全局变量暴露给脚本（裸列表要包成字段，例如 {"files": [...]}）。`);
t(`Run as a background job: return a job id immediately instead of waiting; the return value arrives with the completion notice.`, `作为后台 job 运行：立即返回 job id 而不是等待；返回值随完成通知到达。`);

// ── goal ─────────────────────────────────────────────────────────────────────
t(`Read the current session goal, including the id and revision that update_goal requires.`, `读取当前会话 goal，包括 update_goal 所需的 id 与 revision。`);
t(`Create a persisted goal that keeps this session working across automatic continuation rounds. Use it when the direct human request is a long-running objective, even if the user did not say "goal"; not for single-turn work.`, `创建一个持久 goal，使本会话在自动继续轮次中保持工作。当人类的直接请求是长期目标时使用，即使用户没有说 "goal"；不适用于单轮工作。`);
t(`The concrete completion objective inferred from the direct human request.`, `从人类的直接请求推断出的具体完成目标。`);
t(`Optional positive safe-integer limit on automatic continuation rounds.`, `可选的正安全整数上限，限制自动继续轮次。`);
t(`Update the current goal.`, `更新当前 goal。`);
t(`Exact id returned by get_goal.`, `get_goal 返回的确切 id。`);
t(`Exact positive revision returned by get_goal.`, `get_goal 返回的确切正 revision。`);
t(`edit, pause, and resume require a direct top-level human request. complete and blocked are also allowed during an automatic continuation of this goal; blocked is rejected before the configured minimum round count.`, `edit、pause、resume 需要人类的直接顶层请求。complete 与 blocked 在本 goal 的自动继续期间也允许；blocked 在达到配置的最小轮数之前会被拒绝。`);
t(`Replacement objective; valid only with action edit.`, `替换目标；仅 action edit 时有效。`);
t(`Replacement cap; valid only with action edit.`, `替换上限；仅 action edit 时有效。`);
t(`Required only with action blocked: the concrete condition that persisted across rounds and blocks progress.`, `仅 action blocked 时必需：持续多轮并阻碍进展的具体条件。`);

// ── ask_user_question / exit_plan_mode ───────────────────────────────────────
t(`Ask the user a concise question when you need confirmation, a choice, or missing information before proceeding.`, `在继续之前需要确认、选择或缺失信息时，向用户提出简洁的问题。`);
t(`Questions to ask the user before continuing.`, `继续之前要问用户的问题。`);
t(`Stable id for this question; echoed in the answer.`, `本问题的稳定 id；回答中会回显。`);
t(`The specific question to ask the user.`, `要问用户的具体问题。`);
t(`Optional short heading for the question, such as "Confirm" or "Choose Mode".`, `可选的短标题，例如 "Confirm" 或 "Choose Mode"。`);
t(`Optional choices to show the user. If you recommend one, put it first and append "(Recommended)" to that label.`, `展示给用户的可选选项。如有推荐项，放在第一个并在 label 末尾追加 "(Recommended)"。`);
t(`Short user-facing option label.`, `面向用户的简短选项标签。`);
t(`One sentence explaining the tradeoff or impact.`, `一句话解释权衡或影响。`);
t(`Whether the user may select more than one option. Defaults to false.`, `用户是否可以选择多个选项。默认 false。`);
t(`Use only in plan mode. Present your plan for the user's review and, on approval, leave plan mode. The user may approve (carry out the plan from your next step) or keep planning — their feedback comes back in the tool result; revise and present again.`, `仅在 plan mode 中使用。向用户展示你的计划以供审阅，批准后离开 plan mode。用户可以批准（从你的下一步开始执行计划）或继续规划——他们的反馈在 tool 结果中返回；修改后再次展示。`);
t(`The complete plan, as markdown, starting with a # heading that names it.`, `完整的计划，markdown 格式，以 # 标题开头。`);

// ── subagent / subagent_fork ─────────────────────────────────────────────────
t(`Delegate a task to a subagent that inherits this conversation: a child agent seeded with all completed turns so far (it does not see the current in-flight turn). Use this when the subtask builds on this conversation's context — a follow-up analysis, a review, a continuation — without consuming this conversation's context for the work itself. You receive its result, not its intermediate steps. This tool starts an independently managed subagent and immediately returns its id. The runtime notifies you when it finishes. The child reports results with \`send_message\`; use \`send_message\` to steer it while running or continue its conversation after it finishes.`, `把一个任务委派给继承本对话的 subagent：一个以至此所有已完成轮次为种子的子 agent（它看不到当前进行中的一轮）。当子任务基于本对话的上下文——后续分析、review、继续——而不把本对话的上下文消耗在工作上时使用。你收到其结果，而不是中间步骤。此 tool 启动一个独立管理的 subagent 并立即返回其 id。runtime 在其结束时通知你。子 agent 用 \`send_message\` 上报结果；运行中用 \`send_message\` 引导它，结束后用它继续对话。`);
t(`Initial child working directory. Relative paths use your current directory; omitted inherits it. Later directory changes in either agent are independent.`, `子 agent 初始工作目录。相对路径基于你当前目录；省略则继承。之后两边各自的目录变更互不影响。`);
t(`A short (3-5 word) description of the delegated task, for display.`, `简短（3-5 词）的委派任务描述，用于展示。`);
t(`The task for the subagent. It already sees this conversation's completed turns, so build on them freely and state only what is new.`, `给子 agent 的任务。它已经看到本会话已完成的轮次，所以可以自由基于它们，只说明新的部分。`);
t(`Delegate a self-contained task to a subagent (a separate agent that works in its own context) to offload focused, independent work — research, a scoped implementation, an analysis — so it does not consume this conversation's context. The subagent returns its result, not its intermediate steps. This tool starts an independently managed subagent and immediately returns its id. The runtime notifies you when it finishes. The child reports results with \`send_message\`; use \`send_message\` to steer it while running or continue its conversation after it finishes.`, `把一个自包含任务委派给 subagent（在自己的上下文中工作的独立 agent），以卸载专注、独立的工作——研究、限定范围的实现、分析——从而不消耗本对话的上下文。subagent 返回其结果，而不是中间步骤。此 tool 启动一个独立管理的 subagent 并立即返回其 id。runtime 在其结束时通知你。子 agent 用 \`send_message\` 上报结果；运行中用 \`send_message\` 引导它，结束后用它继续对话。`);
t(`The complete, self-contained task for the subagent. It does not share this conversation's context, so include everything it needs.`, `给 subagent 的完整自包含任务。它不共享本对话的上下文，所以包含它所需的一切。`);

// ── schedule ─────────────────────────────────────────────────────────────────
t(`Create a reminder in the current session that delivers prompt when it becomes due. Supply exactly one timing parameter: after_seconds, at, every_seconds, daily, weekly, or cron. Local times that do not exist in the zone are skipped; repeated local times fire once, at the earlier instant. After downtime, a recurring reminder delivers only its latest missed occurrence. Delivery can repeat after a crash.`, `在当前会话创建一个到期时送达 prompt 的提醒。提供且仅提供一个 timing 参数：after_seconds、at、every_seconds、daily、weekly 或 cron。时区中不存在的本地时间会被跳过；重复出现的本地时间只触发一次，在较早的瞬间。停机之后，重复提醒只送达最近一次错过的发生。崩溃后送达可能重复。`);
t(`Reminder content to present when the target becomes due.`, `到期时呈现的提醒内容。`);
t(`Concise task name in the user's language, at most 120 characters. Name only the core action and subject; keep essential target identifiers such as PR numbers and branch names. Do not include execution frequency (e.g. daily, hourly), scheduled dates/times, time zones, task status, or configuration and execution details (e.g. read-only mode, profile-tag filters), even when embedded in the requested or existing title. Do not append parenthetical notes. Put scheduling information in the timing parameters and execution instructions in prompt.`, `以用户语言命名的简洁任务名，至多 120 个字符。只命名核心动作与主题；保留必要的目标标识符，如 PR 编号与 branch 名。不要包含执行频率（如 daily、hourly）、计划日期/时间、时区、任务状态，或配置与执行细节（如只读模式、profile-tag 过滤），即使它们嵌在请求的或已有的 title 里。不要追加括号备注。调度信息放进 timing 参数，执行指令放进 prompt。`);
t(`Delay in whole seconds.`, `延迟的整秒数。`);
t(`Fixed-rate interval in whole seconds, at least 60, aligned to the creation time; changing it with schedule_update re-aligns it to the save time.`, `固定间隔的整秒数，至少 60，对齐到创建时刻；用 schedule_update 修改会重新对齐到保存时刻。`);
t(`Every day at a local time.`, `每天在一个本地时间触发。`);
t(`HH:mm:ss with optional 1-3 fractional digits, for example 23:00:00.`, `HH:mm:ss，可带 1-3 位小数，例如 23:00:00。`);
t(`HH:mm:ss with optional 1-3 fractional digits, for example 09:00:00.`, `HH:mm:ss，可带 1-3 位小数，例如 09:00:00。`);
t(`UTC or IANA Area/Location, for example Asia/Shanghai.`, `UTC 或 IANA Area/Location，例如 Asia/Shanghai。`);
t(`On the given weekdays at a local time.`, `在给定 weekday 的本地时间触发。`);
t(`ISO weekdays, Monday 1 through Sunday 7, without repetitions.`, `ISO weekday，周一为 1 到周日为 7，不可重复。`);
t(`Five-field Vixie cron expression in a time zone.`, `带时区的五字段 Vixie cron 表达式。`);
t(`minute hour day-of-month month day-of-week, for example "*/15 9-17 * * 1-5". When both day fields are restricted, a date matches if either one matches.`, `minute hour day-of-month month day-of-week，例如 "*/15 9-17 * * 1-5"。当两个 day 字段都被限制时，任一匹配即命中。`);
t(`Absolute target: an RFC 3339 date-time with offset, or a local date, time, and IANA time_zone.`, `绝对目标：带 offset 的 RFC 3339 date-time，或本地日期、时间与 IANA time_zone。`);
t(`List the active reminders in the current session.`, `列出当前会话中活动的提醒。`);
t(`Delete a reminder in the current session, active or inactive. Deletion does not retract a reminder message that is already queued.`, `删除当前会话中的提醒，活动或 inactive 均可。删除不会撤回已排队的提醒消息。`);
t(`Exact schedule id.`, `确切的 schedule id。`);
t(`Change a reminder in place, keeping its id. Supply a new title, prompt, or at most one timing parameter; omitted fields keep their stored values. To change a relative delay, create a new reminder.`, `就地修改一个提醒，保持其 id。提供新的 title、prompt，或至多一个 timing 参数；省略的字段保留存储值。要修改相对延迟，请新建提醒。`);
t(`Schedule id returned by schedule_list.`, `schedule_list 返回的 schedule id。`);
t(`New task name; follow the schedule_create title rules.`, `新任务名；遵循 schedule_create 的 title 规则。`);
t(`New reminder content.`, `新的提醒内容。`);

/** 递归翻译 schema 节点及其嵌套 description。 */
function walk(node) {
	if (node === null || typeof node !== "object") return;
	if (typeof node.description === "string") {
		const hit = zh.get(node.description);
		if (hit !== undefined) node.description = hit;
	}
	if (node.properties !== null && typeof node.properties === "object") for (const child of Object.values(node.properties)) walk(child);
	if (node.items !== undefined) walk(node.items);
	for (const key of ["oneOf", "anyOf", "allOf"]) if (Array.isArray(node[key])) for (const child of node[key]) walk(child);
}

/** 把一个 tool schema 的 description 中文化（就地修改）。 */
export function translateTool(tool) {
	if (typeof tool.description === "string") {
		const hit = zh.get(tool.description);
		if (hit !== undefined) tool.description = hit;
	}
	if (tool.parameters !== undefined) walk(tool.parameters);
}
