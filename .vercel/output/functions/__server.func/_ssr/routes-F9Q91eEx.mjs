import { o as __toESM } from "../_runtime.mjs";
import { f as hourLabel, v as slotLabel } from "./engine-B4Vkm2lN.mjs";
import { a as pym, i as pct, n as compact, r as dur, s as usd, t as clockLabel } from "./format-DM7D2zL9.mjs";
import { S as require_jsx_runtime, Y as require_react, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { d as cn, i as Pill, n as CoinLink, r as Media } from "./api-BYyjfxhj.mjs";
import { a as Route$6, o as useWallet } from "./router-B4i5X2fk.mjs";
import { t as BuyBox } from "./buy-box-BflzyzW6.mjs";
import { t as useArena } from "./use-arena-QBtM-pFN.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-F9Q91eEx.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function useClock(serverNow) {
	const [now, setNow] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		const skew = serverNow ? new Date(serverNow).getTime() - Date.now() : 0;
		const tick = () => setNow(Date.now() + skew);
		tick();
		const id = setInterval(tick, 1e3);
		return () => clearInterval(id);
	}, [serverNow]);
	return now;
}
function Tape({ seedKey, launchAt }) {
	const [Chart, setChart] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		import("./coin-chart-CxI8rLoU.mjs").then((mod) => setChart(() => mod.CoinChart));
	}, []);
	if (!Chart) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-28" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chart, {
		seedKey,
		launchAt
	});
}
function tone(n) {
	return n >= 0 ? "text-lime" : "text-coral";
}
function Desk({ arena, wallet, onRefresh }) {
	const now = useClock(arena.now);
	const feature = arena.coins.find((coin) => coin?.phase === "live") ?? arena.hourRank[0] ?? arena.coins.find((coin) => !!coin) ?? null;
	const left = feature && now ? Math.max(0, Math.ceil((new Date(feature.windowEnd).getTime() - now) / 1e3)) : arena.secondsLeftInWindow;
	const position = feature ? arena.positions.find((item) => item.memeId === feature.id) : void 0;
	const parts = [
		{
			label: "Hour winner",
			value: arena.fees.winnerCut,
			className: "bg-lime"
		},
		{
			label: "Every holder",
			value: arena.fees.holderCut,
			className: "bg-coral"
		},
		{
			label: "Parks in the treasury",
			value: arena.fees.hourRemaining,
			className: "bg-mute"
		}
	];
	const pot = parts.reduce((sum, part) => sum + part.value, 0) || 1;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "flex flex-col gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-end justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs font-semibold tracking-widest text-lime uppercase",
						children: ["Live desk · ", arena.dayLabel]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
						className: "mt-1 font-display text-4xl font-extrabold md:text-5xl",
						children: [arena.hourLabel, " hour"]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-left md:text-right",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-display text-3xl font-extrabold tabular-nums",
							children: feature?.phase === "live" ? dur(left) : "—"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-mute",
							children: feature?.phase === "live" ? `left in the ${slotLabel(feature.slot)} window` : "between windows"
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
					className: "grid grid-cols-3 gap-2 sm:grid-cols-6",
					children: arena.coins.map((coin, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: coin ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CoinLink, {
						id: coin.id,
						className: cn("block rounded-2xl border px-2 py-2", coin.phase === "live" ? "border-coral bg-panel" : "border-line bg-panel", wallet && coin.wallet === wallet && "ring-2 ring-lime"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs text-mute tabular-nums",
								children: slotLabel(coin.slot)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "truncate text-sm font-semibold",
								children: coin.ticker
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs text-mute",
								children: coin.phase === "upcoming" ? "Soon" : coin.phase === "live" ? "Live" : "Locked"
							})
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/submit",
						className: "block rounded-2xl border border-dashed border-line px-2 py-2 text-sm text-mute",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "tabular-nums",
							children: slotLabel(index)
						}), "Open"]
					}) }, coin?.id ?? `empty-${index}`))
				})]
			}),
			feature ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "overflow-hidden rounded-2xl border border-line bg-panel",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid md:grid-cols-[220px_minmax(0,1fr)]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoinLink, {
							id: feature.id,
							className: "block bg-ink",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Media, {
								kind: feature.mediaKind,
								url: feature.mediaUrl,
								alt: feature.title,
								play: feature.phase === "live",
								className: "aspect-square w-full object-cover"
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col gap-3 p-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-center gap-2",
									children: [
										feature.phase === "live" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
											tone: "live",
											children: "Live"
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, { children: feature.phase }),
										wallet && feature.wallet === wallet ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
											tone: "lime",
											children: "Your coin"
										}) : null,
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xs text-mute",
											children: feature.walletLabel
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "font-display text-3xl font-extrabold leading-none",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoinLink, {
											id: feature.id,
											children: feature.title
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-1 text-sm text-mute",
										children: [
											feature.ticker,
											" · ",
											feature.caption
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-xs text-mute",
										children: feature.phase === "upcoming" ? "The launch worker deploys this when the window opens. You don't press anything." : "Deployed by the launch worker. The desk holds 0."
									})
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-end justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-xs uppercase tracking-wide text-mute",
										children: "Market cap"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "font-display text-4xl font-extrabold tabular-nums",
										children: usd(feature.mcap)
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: cn("font-display text-2xl font-extrabold tabular-nums", tone(feature.changePct)),
										children: pct(feature.changePct)
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
									className: "grid grid-cols-2 gap-3 sm:grid-cols-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
											label: "Price",
											value: usd(feature.price)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
											label: "Holders",
											value: compact(feature.holders)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
											label: "Window vol",
											value: usd(feature.volume)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
											label: "ATH",
											value: usd(feature.ath)
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tape, {
									seedKey: feature.seedKey,
									launchAt: feature.launchAt
								})
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "border-t border-line p-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BuyBox, {
							memeId: feature.id,
							phase: feature.phase,
							position,
							onDone: onRefresh
						})
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					className: "rounded-2xl border border-line bg-panel p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-xl font-extrabold",
							children: "This hour"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-mute",
							children: "Ranked by window score: holders, plus oversell. Upcoming seats stay off the board."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
							className: "mt-3 flex flex-col gap-1",
							children: arena.hourRank.map((coin, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CoinLink, {
								id: coin.id,
								className: cn("flex items-center gap-3 rounded-xl px-2 py-2", coin.id === feature.id && "bg-ink"),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "w-5 font-display text-lg tabular-nums text-mute",
										children: index + 1
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Media, {
										kind: coin.mediaKind,
										url: coin.mediaUrl,
										alt: "",
										className: "size-11 rounded-lg object-cover"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "min-w-0 flex-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "block truncate font-semibold",
											children: coin.title
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "block text-xs text-mute",
											children: [
												coin.ticker,
												" · ",
												slotLabel(coin.slot),
												coin.phase === "live" ? " · live" : ""
											]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-right tabular-nums",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "block text-sm font-semibold",
											children: compact(coin.score)
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: cn("block text-xs", tone(coin.changePct)),
											children: pct(coin.changePct)
										})]
									})
								]
							}) }, coin.id))
						})
					]
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "rounded-2xl border border-line bg-panel p-6 text-mute",
				children: "The hour has no coins yet."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-2xl border border-line bg-panel p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-end justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-xl font-extrabold",
							children: "Launch worker"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-semibold text-lime",
							children: "Signs itself"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-mute",
						children: "One desk wallet creates the coin when its 10-minute window opens. It does not buy any of the supply. A published desk keeps its books in a real database and closes one hour at a time, so a slow visit cannot mark an hour paid and then die. Pump.fun creates stay off until a launch key is set. Nothing here signs Solana."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
						className: "mt-3 grid gap-3 sm:grid-cols-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "Next deploy",
								value: arena.worker.nextLaunchAt ? clockLabel(arena.worker.nextLaunchAt) : "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "Deployed today",
								value: String(arena.worker.deployedToday)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "Treasury",
								value: pym(arena.treasury.balanceCents)
							})
						]
					}),
					arena.worker.nextTitle ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-sm",
						children: [
							"Next up is ",
							arena.worker.nextTitle,
							" (",
							arena.worker.nextTicker,
							"). The worker sends it. You don't."
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-mute",
						children: "Next window is an open seat. If nobody takes it, the worker puts a floor meme there and deploys it."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-2xl border border-line bg-panel p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-end justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-xl font-extrabold",
							children: "How this hour pays"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-mute tabular-nums",
							children: [
								arena.fees.hourProjected ? "Projected " : "Locked ",
								"creator fees ",
								usd(arena.fees.hourPot)
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 flex h-3 overflow-hidden rounded-full bg-ink",
						children: parts.map((part) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: part.className,
							style: { width: `${part.value / pot * 100}%` }
						}, part.label))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
						className: "mt-3 grid gap-3 sm:grid-cols-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "30% to the hour winner",
								value: usd(arena.fees.winnerCut)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "By bag size, every wallet still holding",
								value: usd(arena.fees.holderCut)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "Parks in the treasury",
								value: usd(arena.fees.hourRemaining)
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-sm text-mute",
						children: ["At the bell the clerk sends the winner their cut and pays every wallet still holding that coin, wherever they bought, in proportion to the bag. The rest parks in the treasury. At midnight the same rule pays the daily bonus out of that slice and leaves 65%. Nothing to claim.", arena.clerk.holderWallets > 0 ? arena.clerk.bySize ? ` Last hour paid ${arena.clerk.holderWallets.toLocaleString("en-US")} wallets in ${arena.clerk.winnerTicker}, from ${pym(arena.clerk.minCents)} to ${pym(arena.clerk.maxCents)} by bag size.` : ` Last hour it paid ${pym(arena.clerk.eachCents)} to each of ${arena.clerk.holderWallets.toLocaleString("en-US")} wallets in ${arena.clerk.winnerTicker}.` : arena.hourRank[0] ? ` If the hour ended now, ${compact(arena.hourRank[0].holders)} wallets in ${arena.hourRank[0].ticker} would be paid by bag size.` : ""]
					}),
					arena.yourNext ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-sm",
						children: [
							"Your next coin, ",
							arena.yourNext.title,
							", launches at ",
							hourLabel(arena.yourNext.hourKey),
							" ",
							slotLabel(arena.yourNext.slot),
							".",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/mine",
								className: "text-lime",
								children: "See the rivals"
							})
						]
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "flex flex-col gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl font-extrabold",
					children: "Coming up"
				}), arena.upcoming.map((hour) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-sm font-semibold tracking-wide text-mute uppercase",
					children: hour.hourLabel
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3",
					children: hour.coins.map((coin, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "rounded-2xl border border-line bg-panel p-3",
						children: coin ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CoinLink, {
							id: coin.id,
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Media, {
								kind: coin.mediaKind,
								url: coin.mediaUrl,
								alt: "",
								className: "size-12 rounded-lg object-cover"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block truncate font-semibold",
									children: coin.title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "block text-xs text-mute tabular-nums",
									children: [
										slotLabel(coin.slot),
										" · ",
										coin.ticker
									]
								})]
							})]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs text-mute tabular-nums",
								children: slotLabel(index)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-semibold",
								children: "Open seat"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/submit",
								className: "text-xs text-lime",
								children: "Take it"
							})
						] })
					}, coin?.id ?? `${hour.hourKey}-${index}`))
				})] }, hour.hourKey))]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl font-extrabold",
					children: "Highest today"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/leaderboard",
					className: "text-sm text-lime",
					children: "Full board"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "mt-3 grid gap-2 sm:grid-cols-2",
				children: arena.dailyTop.slice(0, 4).map((coin, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CoinLink, {
					id: coin.id,
					className: "flex items-center gap-3 rounded-2xl border border-line bg-panel p-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "w-5 font-display text-lg text-mute tabular-nums",
							children: index + 1
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Media, {
							kind: coin.mediaKind,
							url: coin.mediaUrl,
							alt: "",
							className: "size-12 rounded-lg object-cover"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block truncate font-semibold",
								children: coin.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "block text-xs text-mute",
								children: [
									hourLabel(coin.hourKey),
									" ",
									slotLabel(coin.slot)
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-semibold tabular-nums",
							children: usd(coin.ath)
						})
					]
				}) }, coin.id))
			})] })
		]
	});
}
function Stat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
		className: "text-xs text-mute",
		children: label
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
		className: "mt-1 font-semibold tabular-nums",
		children: value
	})] });
}
function Home() {
	const seeded = Route$6.useLoaderData();
	const address = useWallet((s) => s.address);
	const { arena, error, reload } = useArena(address, seeded);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mb-3 text-sm text-coral",
		children: error
	}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Desk, {
		arena: arena ?? seeded,
		wallet: address,
		onRefresh: () => void reload()
	})] });
}
//#endregion
export { Home as component };
