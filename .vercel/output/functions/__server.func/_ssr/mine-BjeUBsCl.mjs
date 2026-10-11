import { o as __toESM } from "../_runtime.mjs";
import { v as slotLabel } from "./engine-B4Vkm2lN.mjs";
import { i as pct, s as usd, t as clockLabel } from "./format-DM7D2zL9.mjs";
import { S as require_jsx_runtime, Y as require_react, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as RivalList, h as getMine, i as Pill, l as cancelMeme, r as Media, t as Button } from "./api-BYyjfxhj.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { o as useWallet } from "./router-B4i5X2fk.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/mine-BjeUBsCl.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function MinePage() {
	const address = useWallet((s) => s.address);
	const ready = useWallet((s) => s.ready);
	const setBalance = useWallet((s) => s.setBalance);
	const [cards, setCards] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (!ready) return;
		if (!address) {
			setCards([]);
			return;
		}
		let stop = false;
		const load = async () => {
			try {
				const rows = await getMine({ data: { wallet: address } });
				if (!stop) {
					setCards(rows);
					setError(null);
				}
			} catch (err) {
				if (!stop) setError(err instanceof Error ? err.message : "Could not load your memes.");
			}
		};
		load();
		const id = setInterval(() => void load(), 5e3);
		return () => {
			stop = true;
			clearInterval(id);
		};
	}, [address, ready]);
	async function pull(id) {
		if (!address) return;
		const res = await cancelMeme({ data: {
			wallet: address,
			id
		} });
		if (!res.ok) {
			toast(res.reason);
			return;
		}
		setBalance(res.balanceCents);
		toast("Pulled. Entry fee is back in the wallet.");
		setCards((current) => current?.map((card) => card.id === id ? {
			...card,
			status: "rejected",
			rejectReason: "You pulled this coin before it launched."
		} : card) ?? null);
	}
	if (!ready || cards === null) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-40 animate-pulse rounded-2xl bg-panel" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-4xl font-extrabold",
				children: "My memes"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-mute",
				children: "Queue spot, launch time, and who else is in the hour."
			})] }),
			!address ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "rounded-2xl border border-line bg-panel p-4 text-mute",
				children: "Connect a demo wallet to see the coins you paid to launch."
			}) : null,
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-coral",
				children: error
			}) : null,
			address && cards.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "rounded-2xl border border-line bg-panel p-4",
				children: ["Nothing booked. ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/submit",
					className: "text-lime",
					children: "Launch one."
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "flex flex-col gap-4",
				children: cards.map((card) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-2xl border border-line bg-panel p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Media, {
								kind: card.mediaKind,
								url: card.mediaUrl,
								alt: "",
								className: "size-20 rounded-xl object-cover"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
											tone: card.status === "live" ? "live" : card.status === "rejected" ? "mute" : "lime",
											children: card.status
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xs text-mute",
											children: card.ticker
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "mt-1 truncate font-display text-2xl font-extrabold",
										children: card.title
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm text-mute",
										children: card.caption
									})
								]
							})]
						}),
						card.status === "rejected" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 rounded-xl bg-coral-ink p-3 text-sm",
							children: card.rejectReason
						}) : null,
						card.launchAt && card.hourLabel && card.slot != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-3 text-sm",
							children: [
								card.hourLabel,
								" hour · ",
								slotLabel(card.slot),
								" · ",
								clockLabel(card.launchAt),
								card.queuePosition ? ` · ${card.queuePosition} in the queue` : "",
								card.mcap != null && card.status !== "scheduled" ? ` · ${usd(card.mcap)}` : "",
								card.changePct != null ? ` · ${pct(card.changePct)}` : ""
							]
						}) : null,
						card.rivals.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "mb-2 text-xs font-semibold tracking-wide text-mute uppercase",
								children: "In this hour"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RivalList, { rivals: card.rivals })]
						}) : null,
						card.status === "scheduled" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								onClick: () => void pull(card.id),
								children: "Pull it and get the fee back"
							})
						}) : null
					]
				}, card.id))
			})
		]
	});
}
//#endregion
export { MinePage as component };
