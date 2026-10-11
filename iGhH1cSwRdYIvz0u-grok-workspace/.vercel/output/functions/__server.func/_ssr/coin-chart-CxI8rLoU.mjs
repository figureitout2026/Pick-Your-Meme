import { o as __toESM } from "../_runtime.mjs";
import { m as metricsAt } from "./engine-B4Vkm2lN.mjs";
import { s as usd } from "./format-DM7D2zL9.mjs";
import { S as require_jsx_runtime, Y as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as Tooltip, n as Area, r as ResponsiveContainer, t as AreaChart } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/coin-chart-CxI8rLoU.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function CoinChart({ seedKey, launchAt }) {
	const [now, setNow] = (0, import_react.useState)(() => Date.now());
	(0, import_react.useEffect)(() => {
		const id = setInterval(() => setNow(Date.now()), 1e3);
		return () => clearInterval(id);
	}, []);
	const start = new Date(launchAt).getTime();
	const elapsed = Math.max(0, (now - start) / 1e3);
	const end = Math.min(Math.max(elapsed, 20), 600);
	const points = Array.from({ length: 29 }, (_, i) => {
		const sec = end * i / 28;
		return {
			t: Math.round(sec),
			mcap: Math.round(metricsAt(seedKey, sec).mcap)
		};
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "h-28 w-full",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
			width: "100%",
			height: "100%",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AreaChart, {
				data: points,
				margin: {
					top: 8,
					right: 0,
					left: 0,
					bottom: 0
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
					contentStyle: {
						background: "var(--color-panel)",
						border: "1px solid var(--color-line)",
						borderRadius: 12,
						color: "var(--color-cream)"
					},
					formatter: (value) => [usd(Number(value)), "Mcap"],
					labelFormatter: (label) => `${label}s`
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
					dataKey: "mcap",
					stroke: "var(--color-lime)",
					fill: "var(--color-lime)",
					fillOpacity: .16,
					strokeWidth: 2
				})]
			})
		})
	});
}
//#endregion
export { CoinChart };
