import { o as __toESM } from "../_runtime.mjs";
import { a as pym } from "./format-DM7D2zL9.mjs";
import { S as require_jsx_runtime, Y as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { _ as sellBag, c as apeIn, t as Button } from "./api-BYyjfxhj.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { r as MIN_BUY_CENTS } from "./money-u3QFFiJD.mjs";
import { o as useWallet } from "./router-B4i5X2fk.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/buy-box-BflzyzW6.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function BuyBox({ memeId, phase, position, onDone }) {
	const address = useWallet((s) => s.address);
	const balance = useWallet((s) => s.balanceCents);
	const setBalance = useWallet((s) => s.setBalance);
	const [cents, setCents] = (0, import_react.useState)(MIN_BUY_CENTS);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const max = Math.max(MIN_BUY_CENTS, balance);
	async function buy() {
		if (!address) {
			toast("Connect a demo wallet first.");
			return;
		}
		setBusy(true);
		try {
			const res = await apeIn({ data: {
				wallet: address,
				memeId,
				cents
			} });
			if (!res.ok) {
				toast(res.reason);
				return;
			}
			setBalance(res.balanceCents);
			toast("Bag opened. Stay in through the bell.");
			onDone();
		} catch (error) {
			toast(error instanceof Error ? error.message : "Buy failed.");
		} finally {
			setBusy(false);
		}
	}
	async function sell() {
		if (!address) return;
		setBusy(true);
		try {
			const res = await sellBag({ data: {
				wallet: address,
				memeId
			} });
			if (!res.ok) {
				toast(res.reason);
				return;
			}
			setBalance(res.balanceCents);
			toast(`Sold. ${pym(res.refundCents)} came back after slippage.`);
			onDone();
		} catch (error) {
			toast(error instanceof Error ? error.message : "Sell failed.");
		} finally {
			setBusy(false);
		}
	}
	if (!address) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-mute",
		children: "Connect a wallet if you want a bag in this window."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-line bg-ink p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-baseline justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-display text-lg font-extrabold",
					children: "Your bag"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-sm text-mute tabular-nums",
					children: pym(balance)
				})]
			}),
			position?.holding ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-sm text-mute",
				children: [
					"Holding ",
					pym(position.qtyCents),
					".",
					position.qualified ? " You were still in at the bell, so the clerk sent your share with everyone else." : " Sell before the bell and you drop off the list. A buy in the last minute does not qualify. What you still hold is your share. A bigger bag is paid more. A share under the send minimum waits on the wallet until it clears a network fee."
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-mute",
				children: phase === "live" ? "Buy and hold through the bell. Your share matches your bag, here or on the coin itself. Nothing to claim." : phase === "upcoming" ? "The launch worker has not deployed this yet. It will, at the window. The desk buys none of it." : "Window closed. The holder list is whoever was still in."
			}),
			phase === "live" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "text-xs uppercase tracking-wide text-mute",
						htmlFor: `bag-${memeId}`,
						children: ["Spend ", pym(Math.min(cents, max))]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						id: `bag-${memeId}`,
						type: "range",
						min: MIN_BUY_CENTS,
						max,
						step: 100,
						value: Math.min(cents, max),
						onChange: (event) => setCents(Number(event.target.value)),
						className: "mt-2 w-full accent-lime"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							disabled: busy || balance < 1e3,
							onClick: () => void buy(),
							children: "Buy bag"
						}), position?.holding ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							disabled: busy,
							onClick: () => void sell(),
							children: "Sell"
						}) : null]
					})
				]
			}) : position?.holding ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					disabled: busy,
					onClick: () => void sell(),
					children: "Sell"
				})
			}) : null
		]
	});
}
//#endregion
export { BuyBox as t };
