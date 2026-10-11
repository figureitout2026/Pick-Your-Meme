import { o as __toESM } from "../_runtime.mjs";
import { f as hourLabel, v as slotLabel } from "./engine-B4Vkm2lN.mjs";
import { i as pct, n as compact, o as shortAddr, s as usd } from "./format-DM7D2zL9.mjs";
import { S as require_jsx_runtime, Y as require_react, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as RivalList, d as cn, i as Pill, m as getCoin, r as Media } from "./api-BYyjfxhj.mjs";
import { n as Route, o as useWallet } from "./router-B4i5X2fk.mjs";
import { t as BuyBox } from "./buy-box-BflzyzW6.mjs";
import { t as useArena } from "./use-arena-QBtM-pFN.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/coin._id-C9cyhkfd.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function CoinPage() {
	const { id } = Route.useParams();
	const initial = Route.useLoaderData();
	const address = useWallet((s) => s.address);
	const { arena, reload } = useArena(address);
	const [coin, setCoin] = (0, import_react.useState)(initial.coin);
	const [rivals, setRivals] = (0, import_react.useState)(initial.rivals);
	const [Chart, setChart] = (0, import_react.useState)(null);
	const load = (0, import_react.useCallback)(async () => {
		const res = await getCoin({ data: {
			id,
			wallet: address ?? ""
		} });
		setCoin(res.coin);
		setRivals(res.rivals);
	}, [address, id]);
	(0, import_react.useEffect)(() => {
		load().catch(() => setCoin(null));
		const timer = setInterval(() => void load().catch(() => void 0), 4e3);
		import("./coin-chart-CxI8rLoU.mjs").then((mod) => setChart(() => mod.CoinChart));
		return () => clearInterval(timer);
	}, [load]);
	if (!coin) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
		className: "text-mute",
		children: ["That coin is not on the desk. ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/",
			className: "text-lime",
			children: "Back"
		})]
	});
	const position = arena?.positions.find((item) => item.memeId === coin.id);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "flex flex-col gap-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/",
				className: "text-sm text-lime",
				children: "Desk"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 md:grid-cols-[minmax(0,16rem)_minmax(0,1fr)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Media, {
					kind: coin.mediaKind,
					url: coin.mediaUrl,
					alt: coin.title,
					play: coin.phase === "live",
					className: "aspect-square w-full rounded-2xl object-cover"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap gap-2",
							children: [coin.phase === "live" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
								tone: "live",
								children: "Live"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, { children: coin.phase }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Pill, { children: [
								hourLabel(coin.hourKey),
								" ",
								slotLabel(coin.slot)
							] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "font-display text-4xl font-extrabold",
							children: coin.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-mute",
							children: [
								coin.ticker,
								" · ",
								coin.caption
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-mute",
							children: coin.walletLabel
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-mute",
							children: coin.phase === "upcoming" ? "The launch worker deploys this when the window opens. The desk holds 0 of it." : `Launch receipt ${shortAddr(coin.mint)}. Deployed by the worker. The desk holds 0.`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-mute",
							children: "Every wallet still holding at the bell is paid by bag size, whether the buy was here or on the coin itself. Selling first drops you off. The clerk sends it."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-end justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-display text-4xl font-extrabold tabular-nums",
								children: usd(coin.mcap)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: cn("font-display text-2xl font-extrabold tabular-nums", coin.changePct >= 0 ? "text-lime" : "text-coral"),
								children: pct(coin.changePct)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
							className: "grid grid-cols-2 gap-3 sm:grid-cols-4 text-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-mute",
									children: "Price"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
									className: "tabular-nums",
									children: usd(coin.price)
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-mute",
									children: "Holders"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
									className: "tabular-nums",
									children: compact(coin.holders)
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-mute",
									children: "Window vol"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
									className: "tabular-nums",
									children: usd(coin.volume)
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-mute",
									children: "Score"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
									className: "tabular-nums",
									children: coin.phase === "upcoming" ? "—" : compact(coin.score)
								})] })
							]
						})
					]
				})]
			}),
			Chart ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chart, {
				seedKey: coin.seedKey,
				launchAt: coin.launchAt
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-28" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BuyBox, {
				memeId: coin.id,
				phase: coin.phase,
				position,
				onDone: () => {
					load();
					reload();
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-xl font-extrabold",
				children: "Same hour"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RivalList, { rivals })
			})] })
		]
	});
}
//#endregion
export { CoinPage as component };
