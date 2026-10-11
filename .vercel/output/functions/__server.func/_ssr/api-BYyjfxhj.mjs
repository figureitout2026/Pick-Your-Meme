import { v as slotLabel } from "./engine-B4Vkm2lN.mjs";
import { t as clockLabel } from "./format-DM7D2zL9.mjs";
import { S as require_jsx_runtime, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { t as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/api-BYyjfxhj.js
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function Button({ variant = "primary", className, type = "button", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type,
		className: cn("inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold transition-transform duration-150 ease-out active:not-disabled:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-40", variant === "primary" && "bg-lime text-lime-ink", variant === "ghost" && "border border-line bg-panel text-cream", variant === "coral" && "bg-coral text-coral-ink", className),
		...props
	});
}
function Media({ kind, url, alt, className, play }) {
	if (kind === "video") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
		src: url,
		className,
		muted: true,
		playsInline: true,
		loop: !!play,
		autoPlay: !!play,
		controls: !play
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src: url,
		alt,
		className
	});
}
function Pill({ children, tone = "mute" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide uppercase", tone === "mute" && "bg-panel-2 text-mute", tone === "live" && "bg-coral text-coral-ink", tone === "lime" && "bg-lime text-lime-ink"),
		children: [tone === "live" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "live-dot size-1.5 rounded-full bg-coral-ink" }) : null, children]
	});
}
function RivalList({ rivals }) {
	if (!rivals.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-mute",
		children: "No one else is booked in this hour yet. Five seats can still fill before the bell."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "flex flex-col gap-2",
		children: rivals.map((rival) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
			className: "flex items-center justify-between gap-3 rounded-xl border border-line bg-ink px-3 py-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "truncate font-semibold",
					children: [
						rival.title,
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-mute",
							children: rival.ticker
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-xs text-mute",
					children: rival.isYours ? "You" : rival.walletLabel
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "shrink-0 text-right text-sm tabular-nums",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: slotLabel(rival.slot) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-xs text-mute",
					children: clockLabel(rival.launchAt)
				})]
			})]
		}, rival.id))
	});
}
function CoinLink({ id, className, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/coin/$id",
		params: { id },
		className,
		children
	});
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
function asObj(input) {
	if (input && typeof input === "object") return input;
	return {};
}
function str(value, max) {
	if (typeof value !== "string") return "";
	return value.trim().slice(0, max);
}
var getArena = createServerFn({ method: "POST" }).validator((input) => {
	return { wallet: str(asObj(input).wallet, 80) };
}).handler(createSsrRpc("2e17e3fda221a500334102e616c92c5a37267caa56184f36857be9c68fd47d78"));
var getPreview = createServerFn({ method: "GET" }).handler(createSsrRpc("e61d501871914f8287de84d0c070d5bd434d30742b76fdfe80ff6655fbd59c5d"));
var connectWallet = createServerFn({ method: "POST" }).validator((input) => {
	const obj = asObj(input);
	return {
		address: str(obj.address, 80),
		provider: obj.provider === "solflare" ? "solflare" : "phantom"
	};
}).handler(createSsrRpc("908c35d465c3e5d54e45a511d2626b670809daaea1794f1e7ff2f0094eb16931"));
var submitMeme = createServerFn({ method: "POST" }).validator((input) => {
	const obj = asObj(input);
	return {
		wallet: str(obj.wallet, 80),
		title: str(obj.title, 40),
		ticker: str(obj.ticker, 8),
		caption: str(obj.caption, 180),
		mediaKind: obj.mediaKind === "video" ? "video" : "image",
		mediaUrl: typeof obj.mediaUrl === "string" ? obj.mediaUrl : ""
	};
}).handler(createSsrRpc("5f8048ecb586ce808c9e9387ddf2b066d80fb3dc1e0effdc129eb966ab5385b6"));
var getMine = createServerFn({ method: "POST" }).validator((input) => ({ wallet: str(asObj(input).wallet, 80) })).handler(createSsrRpc("f44402603700a2622e9e2e8755a218d8bfd6353929cc2111ddaaf1a0dc7fa1e1"));
var getCoin = createServerFn({ method: "POST" }).validator((input) => {
	const obj = asObj(input);
	return {
		id: str(obj.id, 80),
		wallet: str(obj.wallet, 80)
	};
}).handler(createSsrRpc("94aad43933ed043ad706d3b99a9a1241da87bf3fa34a0582ee74c0887b782ec6"));
var apeIn = createServerFn({ method: "POST" }).validator((input) => {
	const obj = asObj(input);
	const cents = Number(obj.cents);
	return {
		wallet: str(obj.wallet, 80),
		memeId: str(obj.memeId, 80),
		cents: Number.isFinite(cents) ? Math.floor(cents) : 0
	};
}).handler(createSsrRpc("10462766649636771a0f91d95a3108564d025a808f71bb1bf51253791c82eefc"));
var sellBag = createServerFn({ method: "POST" }).validator((input) => {
	const obj = asObj(input);
	return {
		wallet: str(obj.wallet, 80),
		memeId: str(obj.memeId, 80)
	};
}).handler(createSsrRpc("e3eecd68ec4067f7d1c0161e5ae5e316e21ea143f6c1bccc2bbc8b6eb630562a"));
var claimFaucet = createServerFn({ method: "POST" }).validator((input) => ({ wallet: str(asObj(input).wallet, 80) })).handler(createSsrRpc("3b1ace5ce703c44cc28e7430abe01f9b1a3e336436f78ca8db431391e1913077"));
var cancelMeme = createServerFn({ method: "POST" }).validator((input) => {
	const obj = asObj(input);
	return {
		wallet: str(obj.wallet, 80),
		id: str(obj.id, 80)
	};
}).handler(createSsrRpc("5695c72e124e3bad4f7e47387b8e5e744ef466a16702d8b9a8ec987fa10cebc2"));
var adminList = createServerFn({ method: "POST" }).validator((input) => ({ code: str(asObj(input).code, 40) })).handler(createSsrRpc("27aa1ce36b62eea1f755496167b43ee2c1840e1a46c1c0d5ffe698439b42403f"));
var adminReject = createServerFn({ method: "POST" }).validator((input) => {
	const obj = asObj(input);
	return {
		code: str(obj.code, 40),
		id: str(obj.id, 80),
		reason: str(obj.reason, 160)
	};
}).handler(createSsrRpc("d3ae8bf4302ac242512c9de8847469891643ee0c7fe8b5a2a615d7217565fa5a"));
//#endregion
export { sellBag as _, RivalList as a, apeIn as c, cn as d, connectWallet as f, getPreview as g, getMine as h, Pill as i, cancelMeme as l, getCoin as m, CoinLink as n, adminList as o, getArena as p, Media as r, adminReject as s, Button as t, claimFaucet as u, submitMeme as v };
