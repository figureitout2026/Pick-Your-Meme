//#region node_modules/.nitro/vite/services/ssr/assets/money-u3QFFiJD.js
var PYM_PRICE_USD = .073;
var START_CENTS = 4e4;
var FAUCET_CENTS = 1e4;
var FAUCET_COOLDOWN_MS = 36e5;
var MIN_BUY_CENTS = 1e3;
var SELL_RETURN = .85;
var SUPPLY = 1e9;
function submitCostCents() {
	return Math.round(5 / PYM_PRICE_USD * 100);
}
function usdToCents(usd) {
	if (!Number.isFinite(usd) || usd <= 0) return 0;
	return Math.max(0, Math.round(usd / PYM_PRICE_USD * 100));
}
//#endregion
export { SELL_RETURN as a, submitCostCents as c, PYM_PRICE_USD as i, usdToCents as l, FAUCET_COOLDOWN_MS as n, START_CENTS as o, MIN_BUY_CENTS as r, SUPPLY as s, FAUCET_CENTS as t };
