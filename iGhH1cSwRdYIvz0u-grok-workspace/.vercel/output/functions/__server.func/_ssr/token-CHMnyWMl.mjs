import { o as __toESM } from "../_runtime.mjs";
import { a as pym, s as usd } from "./format-DM7D2zL9.mjs";
import { S as require_jsx_runtime, Y as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Button, u as claimFaucet } from "./api-BYyjfxhj.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { c as submitCostCents, i as PYM_PRICE_USD, s as SUPPLY, t as FAUCET_CENTS } from "./money-u3QFFiJD.mjs";
import { o as useWallet, r as Route$1 } from "./router-B4i5X2fk.mjs";
import { t as useArena } from "./use-arena-QBtM-pFN.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/token-CHMnyWMl.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function TokenPage() {
	const seeded = Route$1.useLoaderData();
	const address = useWallet((s) => s.address);
	const balance = useWallet((s) => s.balanceCents);
	const setBalance = useWallet((s) => s.setBalance);
	const { arena, error, reload } = useArena(address, seeded);
	const view = arena ?? seeded;
	const [busy, setBusy] = (0, import_react.useState)(false);
	async function faucet() {
		if (!address) {
			toast("Connect a demo wallet first.");
			return;
		}
		setBusy(true);
		try {
			const res = await claimFaucet({ data: { wallet: address } });
			if (!res.ok) {
				toast(res.reason);
				return;
			}
			setBalance(res.balanceCents);
			toast(`+${pym(res.addedCents)} demo PYM`);
			reload();
		} catch (error) {
			toast(error instanceof Error ? error.message : "Faucet failed.");
		} finally {
			setBusy(false);
		}
	}
	if (!view) {
		if (error) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-coral",
			children: error
		});
		return null;
	}
	const fees = view.fees;
	const clerk = view.clerk;
	const treasury = view.treasury;
	const worker = view.worker;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-semibold tracking-widest text-lime uppercase",
					children: "Platform token"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-1 font-display text-5xl font-extrabold",
					children: "PYM"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 max-w-xl text-mute",
					children: "PYM is the entry ticket and the payout token. It is not deployed. There is no contract. The desk uses a demo price so a $5 launch has a number on it."
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid gap-3 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tile, {
						label: "Demo price",
						value: `$${PYM_PRICE_USD.toFixed(3)}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tile, {
						label: "Supply",
						value: SUPPLY.toLocaleString("en-US")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tile, {
						label: "Launch fee",
						value: `${pym(submitCostCents())}`,
						hint: `$5`
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-2xl border border-line bg-panel p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl font-extrabold",
						children: "How the desk gets paid"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-mute",
						children: "Two lines, both automatic. Neither one is a bag in the meme. The desk wallet creates the coin and holds zero of the supply, so it cannot dump on holders."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
						className: "mt-3 flex flex-col gap-3 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
									className: "text-lime",
									children: "Listing fee."
								}),
								" $",
								5,
								" of PYM when a meme is accepted. It hits the treasury immediately. A rejected meme is not charged."
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
								className: "text-lime",
								children: "The pot is 0.30%"
							}), " of what traded in the window. That is the creator vault on the bonding curve. The other 0.95% belongs to pump.fun and is not split here."] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
								className: "text-lime",
								children: "30%"
							}), " of that vault goes to the wallet that submitted the winning meme."] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
								className: "text-lime",
								children: "Holder cut"
							}), " is 30% of the other coins' fees in that hour. Every wallet still holding the winner gets some, on this desk or on the coin itself. A bigger bag is paid more. Selling before the bell drops you off."] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
								className: "text-lime",
								children: "The rest parks in the treasury"
							}), " at the bell. At midnight the clerk pays 20% of that parked slice to the day's highest coin and 15% to holders, and leaves 65% as the desk's. It does not touch the winner's 30% or the holder cut."] })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
						className: "mt-4 grid gap-3 sm:grid-cols-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tile, {
								label: "Treasury now",
								value: pym(treasury.balanceCents),
								hint: "Listing fees plus the parked slice, after bonuses already sent"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tile, {
								label: "Listing fees booked",
								value: pym(treasury.listingCents)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tile, {
								label: "Parked from hours",
								value: pym(treasury.parkedCents),
								hint: "Before the midnight bonus leaves"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tile, {
								label: "You keep today, projected",
								value: usd(fees.platformCut),
								hint: "65% of today's parked slice"
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-2xl border border-line bg-panel p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl font-extrabold",
						children: "Launch worker"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-mute",
						children: "It deploys the coin at the start of each 10-minute window. You do not click deploy. On a real Solana desk this is one funded wallet signing pump.fun's create transaction. Here it writes the receipt and the books the same way."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-sm",
						children: [
							worker.deployedToday.toLocaleString("en-US"),
							" coins deployed today. The desk holds ",
							worker.holdsTokens,
							" of each.",
							worker.nextTitle ? ` Next is ${worker.nextTitle} (${worker.nextTicker}).` : ""
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-2xl border border-line bg-panel p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl font-extrabold",
						children: "Demo balance"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-mute",
						children: [
							"New wallets start with 400 PYM. The faucet adds ",
							pym(FAUCET_CENTS),
							" once an hour."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 font-display text-3xl font-extrabold tabular-nums",
						children: address ? pym(balance) : "No wallet"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							disabled: busy,
							onClick: () => void faucet(),
							children: ["Add ", pym(FAUCET_CENTS)]
						})
					}),
					view.rewards.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-4 flex flex-col gap-2",
						children: view.rewards.map((reward) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-baseline justify-between gap-3 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: reward.note }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "shrink-0 font-semibold tabular-nums text-lime",
								children: ["+", pym(reward.amountCents)]
							})]
						}, reward.id))
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-mute",
						children: "No payouts on this wallet yet. Win an hour, or be holding the winner when its window ends."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-2xl border border-line bg-panel p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl font-extrabold",
						children: "Fee clerk"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-mute",
						children: "When an hour ends it collects that hour's creator fees, pays the winner and every holder, and parks your slice. At midnight it pays the daily bonus out of that slice. You do not press claim, and you do not press deploy."
					}),
					clerk.holderWallets > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm",
						children: clerk.bySize ? `${clerk.lastHourLabel}: ${clerk.holderWallets.toLocaleString("en-US")} wallets still holding ${clerk.winnerTicker} were paid by bag size, from ${pym(clerk.minCents)} to ${pym(clerk.maxCents)}.` : `${clerk.lastHourLabel}: ${pym(clerk.eachCents)} to each of ${clerk.holderWallets.toLocaleString("en-US")} wallets still holding ${clerk.winnerTicker}.`
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-mute",
						children: "The next hour that closes is the first one paid under this rule."
					})
				]
			})
		]
	});
}
function Tile({ label, value, hint }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-line bg-ink p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-xs text-mute",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-1 font-display text-2xl font-extrabold tabular-nums",
				children: value
			}),
			hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-xs text-mute",
				children: hint
			}) : null
		]
	});
}
//#endregion
export { TokenPage as component };
