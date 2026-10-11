import { o as __toESM } from "../_runtime.mjs";
import { v as slotLabel } from "./engine-B4Vkm2lN.mjs";
import { a as pym, t as clockLabel } from "./format-DM7D2zL9.mjs";
import { S as require_jsx_runtime, Y as require_react, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as RivalList, g as getPreview, i as Pill, t as Button, v as submitMeme } from "./api-BYyjfxhj.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { r as suggestTicker } from "./moderate-KSUeoklM.mjs";
import { c as submitCostCents, i as PYM_PRICE_USD } from "./money-u3QFFiJD.mjs";
import { o as useWallet } from "./router-B4i5X2fk.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/submit-hi_WtF-t.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function SubmitPage() {
	const address = useWallet((s) => s.address);
	const balance = useWallet((s) => s.balanceCents);
	const setBalance = useWallet((s) => s.setBalance);
	const [preview, setPreview] = (0, import_react.useState)(null);
	const [title, setTitle] = (0, import_react.useState)("");
	const [ticker, setTicker] = (0, import_react.useState)("");
	const [tickerTouched, setTickerTouched] = (0, import_react.useState)(false);
	const [caption, setCaption] = (0, import_react.useState)("");
	const [media, setMedia] = (0, import_react.useState)(null);
	const [fileError, setFileError] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [receipt, setReceipt] = (0, import_react.useState)(null);
	const [reject, setReject] = (0, import_react.useState)(null);
	const cost = submitCostCents();
	(0, import_react.useEffect)(() => {
		let stop = false;
		const load = async () => {
			try {
				const data = await getPreview();
				if (!stop) setPreview(data);
			} catch {
				if (!stop) setPreview(null);
			}
		};
		load();
		const id = setInterval(() => void load(), 5e3);
		return () => {
			stop = true;
			clearInterval(id);
		};
	}, []);
	async function onFile(file) {
		setFileError(null);
		setMedia(null);
		if (!file) return;
		try {
			const next = await fileToMedia(file);
			setMedia(next);
		} catch (error) {
			setFileError(error instanceof Error ? error.message : "Could not read that file.");
		}
	}
	async function onSubmit(event) {
		event.preventDefault();
		setReject(null);
		if (!address) {
			toast("Connect a demo wallet first.");
			return;
		}
		if (!media) {
			setFileError("Add an image or a short video.");
			return;
		}
		setBusy(true);
		try {
			const res = await submitMeme({ data: {
				wallet: address,
				title,
				ticker: ticker || suggestTicker(title),
				caption,
				mediaKind: media.kind,
				mediaUrl: media.url
			} });
			if (!res.ok) {
				setReject(res.reason);
				return;
			}
			setBalance(res.balanceCents);
			setReceipt(res);
		} catch (error) {
			setReject(error instanceof Error ? error.message : "Submit failed.");
		} finally {
			setBusy(false);
		}
	}
	if (receipt) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mx-auto flex max-w-xl flex-col gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
				tone: "lime",
				children: "Booked"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
				className: "font-display text-4xl font-extrabold",
				children: [receipt.title, " is on the desk"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-lg",
				children: [
					"Launches ",
					clockLabel(receipt.launchAt),
					" · ",
					receipt.hourLabel,
					" hour · seat ",
					slotLabel(receipt.slot),
					"."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-mute",
				children: [
					"Queue position ",
					receipt.queuePosition,
					". You are up against ",
					receipt.rivals.length ? "these coins" : "an open hour",
					"."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RivalList, { rivals: receipt.rivals }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/mine",
					className: "inline-flex min-h-11 items-center rounded-full bg-lime px-4 text-sm font-semibold text-lime-ink",
					children: "My memes"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					className: "inline-flex min-h-11 items-center rounded-full border border-line px-4 text-sm font-semibold",
					children: "Back to the desk"
				})]
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "flex flex-col gap-4",
			onSubmit: (event) => void onSubmit(event),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-4xl font-extrabold",
					children: "Launch a meme"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-mute",
					children: [
						"Entry is $",
						5,
						" of PYM — ",
						pym(cost),
						" at $",
						PYM_PRICE_USD.toFixed(3),
						". That listing fee goes straight to the treasury. Clean memes take the next open seat, and the launch worker deploys them when the window opens."
					]
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "flex flex-col gap-1 text-sm",
					children: ["Name", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						required: true,
						maxLength: 28,
						value: title,
						onChange: (event) => {
							setTitle(event.target.value);
							if (!tickerTouched) setTicker(suggestTicker(event.target.value));
						},
						className: "min-h-11 rounded-xl border border-line bg-panel px-3 text-base text-cream",
						placeholder: "Toaster Cat"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "flex flex-col gap-1 text-sm",
					children: ["Ticker", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						required: true,
						maxLength: 6,
						value: ticker,
						onChange: (event) => {
							setTickerTouched(true);
							setTicker(event.target.value.toUpperCase());
						},
						className: "min-h-11 rounded-xl border border-line bg-panel px-3 text-base tracking-widest text-cream uppercase",
						placeholder: "TOAST"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "flex flex-col gap-1 text-sm",
					children: ["Caption", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						maxLength: 140,
						value: caption,
						onChange: (event) => setCaption(event.target.value),
						className: "min-h-24 rounded-xl border border-line bg-panel px-3 py-2 text-base text-cream",
						placeholder: "One line. No gore, no NSFW."
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "flex flex-col gap-1 text-sm",
					children: ["Image or short video", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "file",
						accept: "image/*,video/mp4,video/webm",
						className: "min-h-11 text-sm text-mute file:mr-3 file:min-h-11 file:rounded-full file:border-0 file:bg-lime file:px-4 file:font-semibold file:text-lime-ink",
						onChange: (event) => void onFile(event.target.files?.[0])
					})]
				}),
				media?.kind === "image" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: media.url,
					alt: "Upload preview",
					className: "aspect-square w-40 rounded-2xl object-cover"
				}) : null,
				media?.kind === "video" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
					src: media.url,
					controls: true,
					className: "w-full max-w-xs rounded-2xl"
				}) : null,
				fileError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-coral",
					children: fileError
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-mute",
					children: "Text is screened on the way in. Gruesome or NSFW copy is rejected and you are not charged. A reviewer can still pull a coin before it launches."
				}),
				reject ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "rounded-xl border border-coral bg-coral-ink p-3 text-sm text-cream",
					children: reject
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						disabled: busy || !address,
						children: busy ? "Booking…" : `Pay ${pym(cost)} and book`
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-sm text-mute tabular-nums",
						children: address ? `${pym(balance)} in wallet` : "Connect a wallet to pay"
					})]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			className: "h-fit rounded-2xl border border-line bg-panel p-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-xl font-extrabold",
				children: "Next open seat"
			}), preview?.next ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-lg font-semibold",
					children: [
						preview.next.hourLabel,
						" · ",
						slotLabel(preview.next.slot)
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-mute",
					children: clockLabel(preview.next.launchAt)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-sm text-mute",
					children: [preview.openSeats, " other seats in that hour are still empty. Anyone can take them before you launch."]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RivalList, { rivals: preview.rivals })
				})
			] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-mute",
				children: "Checking the queue…"
			})]
		})]
	});
}
function fileToMedia(file) {
	if (file.type.startsWith("video/")) {
		if (file.size > 35e4) return Promise.reject(/* @__PURE__ */ new Error("Video is over 350 KB. Use a still. Big clips don't survive a publish."));
		return readAsData(file).then((url) => ({
			kind: "video",
			url
		}));
	}
	if (!file.type.startsWith("image/")) return Promise.reject(/* @__PURE__ */ new Error("Use an image or a short mp4/webm."));
	if (file.type === "image/gif" && file.size < 5e5) return readAsData(file).then((url) => ({
		kind: "image",
		url
	}));
	return shrinkImage(file).then((url) => ({
		kind: "image",
		url
	}));
}
function readAsData(file) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(String(reader.result));
		reader.onerror = () => reject(/* @__PURE__ */ new Error("Could not read that file."));
		reader.readAsDataURL(file);
	});
}
async function shrinkImage(file) {
	const data = await readAsData(file);
	const img = new Image();
	await new Promise((resolve, reject) => {
		img.onload = () => resolve();
		img.onerror = () => reject(/* @__PURE__ */ new Error("Could not read that image."));
		img.src = data;
	});
	const scale = Math.min(1, 960 / Math.max(img.width, img.height));
	const canvas = document.createElement("canvas");
	canvas.width = Math.max(1, Math.round(img.width * scale));
	canvas.height = Math.max(1, Math.round(img.height * scale));
	const ctx = canvas.getContext("2d");
	if (!ctx) return data;
	ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
	const jpeg = canvas.toDataURL("image/jpeg", .82);
	return jpeg.length < data.length ? jpeg : data;
}
//#endregion
export { SubmitPage as component };
