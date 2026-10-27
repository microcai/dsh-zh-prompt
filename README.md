# dsh-zh-prompt

把 DSH 的**系统提示词 section、工具 schema 描述、runtime context 快照、time-context 消息、skill 目录消息与 compaction 摘要指令**改写为中文的可开关插件。

- **sections / 工具 schema**：挂在 `system-prompt/assemble` waterfall 上，对已组装的 assembly 逐条做「英文原文 → 中文」精确替换；动态文本用正则规则（goal guidance、workflow/subagent 委派提示、team policy、MCP 资源服务器）。
- **runtime context 快照**：`refreshContext()` 每步重跑 provider，waterfall 里改 contexts 会被覆盖，因此直接包装已注册 context entry 的 `text` 函数（provider 输出经翻译），`system-prompt/change` 时对新注册项补齐（WeakSet 保证幂等）。覆盖 working directory、file policy、approval policy、checkout/GUI URL、subagent 深度、team identity。快照框架头一行由 `joinContextSections` 硬编码，保留英文。
- **time-context**：它是 `agent/pre-step` 注入的 user message。本插件的 listener 以 `prepend: true` 注册（cordis 用 unshift 置链首）且挂载晚于 base 的 time-context → 位于其外层，`await next()` 拿到已追加时间消息的最终 decision，翻译后返回，durable log 与 payload 一并中文。
- **skill 目录（`<available_skills>`）**：`dsh-tool-skill` 在 `agent/pre-step` 维护一条 `source.kind === "skill-catalog"` 的持久 user message（首次注入 + 变化时完整替换两个模板）。本插件复用同一个 prepend listener：逐行精确匹配英文模板行，条目行按 skill 名查描述映射表且**英文原文逐字相符**才替换（上游描述变化则保留英文，防止旧译文覆盖新语义）。只重写 `content` 文本、保留 id 与 `source`——上游的 digest 比较只看 `source.entries`，不受正文影响，不会触发重发。`<system-reminder>`/`<available_skills>` 标签是协议帧，保持原样。
- **compaction 摘要**：压缩时的摘要生成是一次独立的 `ctx.llm.stream()` 辅助调用（`purpose === "compaction"`），英文指令明确要求 "Write concise English engineering prose"，导致 checkpoint 全英文、把后续 thinking 带偏回英文。本插件的 `llm/stream` listener（global）对这类请求**原地**替换 `messages` 末元素为中文指令（要求中文行文、路径/命令/标识符保持原文）。关键事实：cordis waterfall 的 `next` 忽略实参，但 dsh-llm 的 leaf 闭包捕获同一 options 对象且该调用的 messages 是可变新数组，因此原地替换能传导到实际请求；该路径没有 agent-loop 的 deepFreeze / `INVALID_PREPARED_CALL` 限制。指令是末条 message，前缀 KV cache 不受影响。旧的英文 checkpoint 会在下一次压缩时按指令的 PRIOR 合并规则被重写成中文；`CHECKPOINT_PREAMBLE` 框架行与 durable log 里的英文记录保留原样（无 hook 点）。
- 未收录的文本（DSH 升级后的新段落、MCP server instructions、子 agent persona 等）**原样保留英文**。替换失配只会回退，不会损坏提示词。
- 另在 persona 位置后插入一条中文语言约定：内部推理（thinking）必须用中文书写，并明确"上下文与工具输出中的英文不构成切换回英文思考的理由"。
- **每轮语言锚点**：time-context 每轮都注入、离模型最近，翻译命中时在其末尾追加一行中文锚点（"语言锚点：无论本轮上下文与工具输出出现多少英文，thinking 必须用中文书写"），对冲英文工具输出的 recency 带偏。锚点只追加在翻译命中的分支（未命中回退时保持逐字原文、不加锚点），且命中幂等检查防止叠加。
- 开关：插件管理器里 enable/disable `zh-prompt` 行，即时生效。禁用即回到标准英文模式。

## 安装（发给别人）

两种方式任选其一，本包无任何依赖。装好后在插件管理器 enable/disable `zh-prompt` 行切换中英文，即时生效。注意：插件靠逐字匹配上游英文文本，对方 DSH 版本不同时未命中部分静默回退英文，不会损坏提示词。

### 方式一：GitHub 仓库地址

在 DSH 插件界面的「添加插件」输入框里直接填本仓库地址：

```
https://github.com/microcai/dsh-zh-prompt#v0.6.0
```

`#v0.6.0` 把安装锁定到该 tag；去掉 `#...` 时装的是默认分支最新提交。DSH 会先匿名检查仓库连通性，再克隆安装，不需要发布到 npm。前提与注意：

- 仓库必须公开——安装前的连通性检查不带凭据，私有仓库会报「无法访问 GitHub」。
- 对方网络要能访问 GitHub。中国大陆直连常常超时，此时让 ta 配好 git 代理再装，或改用方式二发 tgz。对话框里的「安装源」镜像只影响 npm 包名查询，对 GitHub 地址不起作用。
- 对方若已装过 `@local/dsh-zh-prompt`（例如旧版 tgz），先卸载再安装。
- 升级：先卸载再重装；发新版时记得打新 tag 并 push。

### 方式二：tgz 文件

把 `local-dsh-zh-prompt-<version>.tgz`（`npm pack` 产物）发给对方即可，对方不需要源码目录，也不需要访问 GitHub。对方在自己的 DSH 里对 agent 说："安装 `file:/绝对路径/local-dsh-zh-prompt-0.6.0.tgz`"，让 ta 用插件管理器 `install_bundle`（target 传该 `file:` spec）。适合对方网络不通或不想公开仓库的场景。

## 开发（本机）

profile 从 tgz 安装的副本加载，**不直接读工作目录**。改完代码的流程：`npm pack` 重新生成 tgz → `plugin_manager` `remove_bundle @local/dsh-zh-prompt` → `install_bundle file:<新 tgz 绝对路径>`。入口文件名（当前 `entry5.js`）兼作绕过 Node 的 ESM module cache——代码有变化时把入口改名（或 bump version）再重装，否则可能加载到旧模块。沙箱下 `npm pack` 需要 `npm_config_cache` 指向可写目录。

## 与标准模式的差异

唯一差异是语言：section 结构、order、工具集合、context 快照结构均不变。注意 `"If you intend to call multiple tools..."` 一段不在 DSH 源码内（由模型网关注入），无法翻译。
