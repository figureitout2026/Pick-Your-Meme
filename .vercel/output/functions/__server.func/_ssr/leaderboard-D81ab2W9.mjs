import { f as hourLabel, v as slotLabel } from "./engine-B4Vkm2lN.mjs";
import { i as pct, n as compact, s as usd } from "./format-DM7D2zL9.mjs";
import { S as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { d as cn, n as CoinLink, r as Media } from "./api-BYyjfxhj.mjs";
import { i as Route$4, o as useWallet } from "./router-B4i5X2fk.mjs";
import { t as useArena } from "./use-arena-QBtM-pFN.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/leaderboard-D81ab2W9.js
var import_jsx_runtime = require_jsx_runtime();
function BoardPage() {
	const seeded = Route$4.useLoaderData();
	const address = useWallet((s) => s.address);
	const { arena, error } = useArena(address, seeded);
	const view = arena ?? seeded;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-4xl font-extrabold",
				children: "Board"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-mute",
				children: "Hour rank is the window score. Day rank is who went the highest. Holder pay goes to every wallet still in, by bag size."
			})] }),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-coral",
				children: error
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
				className: "font-display text-2xl font-extrabold",
				children: [view.hourLabel, " hour"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "mt-3 flex flex-col gap-2",
				children: view.hourRank.map((coin, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
					rank: index + 1,
					title: coin.title,
					meta: `${coin.ticker} · ${slotLabel(coin.slot)} · ${coin.phase}`,
					media: coin,
					stat: compact(coin.score),
					sub: pct(coin.changePct),
					up: coin.changePct >= 0,
					id: coin.id
				}, coin.id))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
					className: "font-display text-2xl font-extrabold",
					children: [view.dayLabel, " highs"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-mute",
					children: "20% of what's left after the hourly cuts goes to this coin at midnight PT."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
					className: "mt-3 flex flex-col gap-2",
					children: view.dailyTop.map((coin, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						rank: index + 1,
						title: coin.title,
						meta: `${hourLabel(coin.hourKey)} ${slotLabel(coin.slot)} · ATH`,
						media: coin,
						stat: usd(coin.ath),
						sub: usd(coin.mcap),
						up: coin.changePct >= 0,
						id: coin.id
					}, coin.id))
				})
			] })
		]
	});
}
function Row({ rank, title, meta, media, stat, sub, up, id }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CoinLink, {
		id,
		className: "flex items-center gap-3 rounded-2xl border border-line bg-panel p-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "w-6 font-display text-xl text-mute tabular-nums",
				children: rank
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Media, {
				kind: media.mediaKind,
				url: media.mediaUrl,
				alt: "",
				className: "size-12 rounded-lg object-cover"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "min-w-0 flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "block truncate font-semibold",
					children: title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "block text-xs text-mute",
					children: meta
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "text-right tabular-nums",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "block font-semibold",
					children: stat
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("block text-xs", up ? "text-lime" : "text-coral"),
					children: sub
				})]
			})
		]
	}) });
}
//#endregion
export { BoardPage as component };
