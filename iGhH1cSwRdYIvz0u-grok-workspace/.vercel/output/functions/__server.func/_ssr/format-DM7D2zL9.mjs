import { t as TZ } from "./engine-B4Vkm2lN.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/format-DM7D2zL9.js
function pym(cents) {
	return `${(cents / 100).toLocaleString("en-US", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	})} PYM`;
}
function usd(n) {
	if (!Number.isFinite(n)) return "$0";
	const sign = n < 0 ? "-" : "";
	const abs = Math.abs(n);
	if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(2)}M`;
	if (abs >= 1e4) return `${sign}$${(abs / 1e3).toFixed(1)}k`;
	if (abs >= 1e3) return `${sign}$${(abs / 1e3).toFixed(2)}k`;
	if (abs >= 1) return `${sign}$${abs.toFixed(2)}`;
	if (abs >= .01) return `${sign}$${abs.toFixed(4)}`;
	return `${sign}$${abs.toFixed(8)}`;
}
function pct(n) {
	return `${n > 0 ? "+" : ""}${n.toFixed(1)}%`;
}
function compact(n) {
	if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
	if (n >= 1e4) return `${(n / 1e3).toFixed(1)}k`;
	if (n >= 1e3) return `${(n / 1e3).toFixed(2)}k`;
	return Math.round(n).toLocaleString("en-US");
}
function dur(sec) {
	const s = Math.max(0, Math.floor(sec));
	const m = Math.floor(s / 60);
	const r = s % 60;
	if (m >= 60) return `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, "0")}m`;
	return `${m}:${r.toString().padStart(2, "0")}`;
}
function shortAddr(address) {
	if (address.length < 12) return address;
	return `${address.slice(0, 4)}…${address.slice(-4)}`;
}
function clockLabel(iso) {
	return new Intl.DateTimeFormat("en-US", {
		timeZone: TZ,
		hour: "numeric",
		minute: "2-digit",
		timeZoneName: "short"
	}).format(new Date(iso));
}
//#endregion
export { pym as a, pct as i, compact as n, shortAddr as o, dur as r, usd as s, clockLabel as t };
