import { o as __toESM } from "../_runtime.mjs";
import { t as clockLabel } from "./format-DM7D2zL9.mjs";
import { S as require_jsx_runtime, Y as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as adminList, r as Media, s as adminReject, t as Button } from "./api-BYyjfxhj.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-D99R1cw4.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AdminPage() {
	const [code, setCode] = (0, import_react.useState)("pym-floor");
	const [rows, setRows] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	async function load() {
		setError(null);
		const res = await adminList({ data: { code } });
		if (!res.ok) {
			setRows(null);
			setError(res.reason);
			return;
		}
		setRows(res.memes);
	}
	async function pull(id) {
		const res = await adminReject({ data: {
			code,
			id,
			reason: "Reviewer pulled this before launch. Gruesome or NSFW. The entry fee was returned."
		} });
		if (!res.ok) {
			toast(res.reason);
			return;
		}
		toast("Pulled and refunded.");
		await load();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex max-w-2xl flex-col gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-4xl font-extrabold",
				children: "Review queue"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-mute",
				children: [
					"Text is auto-screened. This page can still pull a booked coin before its window. Demo code is ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-cream",
						children: "pym-floor"
					}),
					"."
				]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "flex flex-col gap-1 text-sm",
				children: ["Reviewer code", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					value: code,
					onChange: (event) => setCode(event.target.value),
					className: "min-h-11 rounded-xl border border-line bg-panel px-3"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: () => void load(),
				children: "Load queue"
			}),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-coral",
				children: error
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "flex flex-col gap-3",
				children: rows?.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-2xl border border-line bg-panel p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Media, {
							kind: row.mediaKind,
							url: row.mediaUrl,
							alt: "",
							className: "size-16 rounded-lg object-cover"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "font-semibold",
									children: [
										row.title,
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-mute",
											children: row.ticker
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-xs text-mute",
									children: [
										row.status,
										" · ",
										row.walletLabel,
										row.launchAt ? ` · ${clockLabel(row.launchAt)}` : ""
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm",
									children: row.caption
								}),
								row.rejectReason ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-coral",
									children: row.rejectReason
								}) : null
							]
						})]
					}), row.canPull ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "coral",
							onClick: () => void pull(row.id),
							children: "Pull and refund"
						})
					}) : null]
				}, row.id))
			}),
			rows && rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-mute",
				children: "No player coins yet. Floor coins are not reviewed."
			}) : null
		]
	});
}
//#endregion
export { AdminPage as component };
