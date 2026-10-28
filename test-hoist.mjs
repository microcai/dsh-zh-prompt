/**
 * 验证 hoistPreStepListener：即使本插件的 pre-step listener 先注册（内层），
 * 每次 dispatch 前的自置顶也能让它升到链首（外层），拿到 time-context 追加的消息。
 */
import { Context } from "/usr/lib64/node_modules/@deepseek-ai/dsh/node_modules/@deepseek-ai/cordis/lib/index.js";

const ctx = new Context();

function hoistPreStepListener(context) {
	const hooks = context.events._hooks["agent/pre-step"];
	if (!hooks) return;
	const index = hooks.findIndex((hook) => hook.zhHoist === true);
	if (index > 0) hooks.unshift(hooks.splice(index, 1)[0]);
}

// 场景：zh 先注册（本应落在内层），time-context 后注册。
const zhSeen = [];
ctx.on("agent/pre-step", async (_payload, next) => {
	const decision = await next();
	decision.messages.forEach((m) => zhSeen.push(m));
	return decision.kind === "pass" ? { ...decision, messages: decision.messages.map((m) => m === "TIME" ? "ZH_TIME" : m) } : decision;
}, { prepend: true, zhHoist: true });

ctx.on("agent/pre-step", async (_payload, next) => {
	const decision = await next();
	return { ...decision, messages: [...decision.messages, "TIME"] };
}, { prepend: true });

ctx.on("internal/dispatch", (type, name) => {
	if (type === "waterfall" && name === "agent/pre-step") hoistPreStepListener(ctx);
}, { global: true });

const result = await ctx.events.waterfall("agent/pre-step", {}, () => ({ kind: "pass", messages: [] }));

console.log("hooks order:", ctx.events._hooks["agent/pre-step"].map((h) => (h.zhHoist ? "zh" : "tc")));
console.log("zh saw:", zhSeen);
console.log("final messages:", result.messages);
console.log(result.messages.includes("ZH_TIME") ? "PASS: hoist 生效，zh 位于外层并翻译了 tc 消息" : "FAIL: zh 落在内层");
