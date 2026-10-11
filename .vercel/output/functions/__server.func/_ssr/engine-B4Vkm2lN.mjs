//#region node_modules/.nitro/vite/services/ssr/assets/engine-B4Vkm2lN.js
var TZ = "America/Los_Angeles";
var WINDOW_MS = 6e5;
var HOUR_MS = 36e5;
/** Creator vault on the bonding curve. Protocol keeps the other 0.95%. Not in this pot. */
var CREATOR_FEE_RATE = .003;
function hash(s) {
	let h = 2166136261;
	for (let i = 0; i < s.length; i++) {
		h ^= s.charCodeAt(i);
		h = Math.imul(h, 16777619);
	}
	return h >>> 0;
}
var B58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
/** Stable launch receipt. Same seed always mints the same id. */
function deskMint(seed) {
	let h = hash(`mint:${seed}`);
	let out = "";
	for (let i = 0; i < 44; i++) {
		h = Math.imul(h ^ h >>> 13, 1274126177) >>> 0;
		out += B58[h % 58];
	}
	return out;
}
function unit(seed, salt) {
	return hash(`${seed}:${salt}`) % 1e6 / 1e6;
}
function zonedParts(date) {
	const fmt = new Intl.DateTimeFormat("en-US", {
		timeZone: TZ,
		hourCycle: "h23",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit"
	});
	const bag = {};
	for (const part of fmt.formatToParts(date)) bag[part.type] = part.value;
	let hour = Number(bag.hour);
	if (hour === 24) hour = 0;
	return {
		year: Number(bag.year),
		month: Number(bag.month),
		day: Number(bag.day),
		hour,
		minute: Number(bag.minute),
		second: Number(bag.second)
	};
}
function pad(n) {
	return String(n).padStart(2, "0");
}
function hourKeyFromParts(p) {
	return `${p.year}-${pad(p.month)}-${pad(p.day)}T${pad(p.hour)}`;
}
function dayKeyFromParts(p) {
	return `${p.year}-${pad(p.month)}-${pad(p.day)}`;
}
function hourKeyOf(date) {
	return hourKeyFromParts(zonedParts(date));
}
function dayKeyOf(date) {
	return dayKeyFromParts(zonedParts(date));
}
function ptToUtc(year, month, day, hour, minute) {
	let t = Date.UTC(year, month - 1, day, hour, minute, 0);
	const desired = t;
	for (let i = 0; i < 4; i++) {
		const p = zonedParts(new Date(t));
		const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
		t += desired - asUtc;
	}
	return new Date(t);
}
function parseHourKey(hourKey) {
	const [date, h] = hourKey.split("T");
	const [year, month, day] = date.split("-").map(Number);
	return {
		year,
		month,
		day,
		hour: Number(h)
	};
}
function hourStart(hourKey) {
	const p = parseHourKey(hourKey);
	return ptToUtc(p.year, p.month, p.day, p.hour, 0);
}
function slotLaunch(hourKey, slot) {
	return new Date(hourStart(hourKey).getTime() + slot * WINDOW_MS);
}
function addHoursKey(hourKey, delta) {
	return hourKeyOf(new Date(hourStart(hourKey).getTime() + delta * HOUR_MS));
}
function dayStart(dayKey) {
	const [year, month, day] = dayKey.split("-").map(Number);
	return ptToUtc(year, month, day, 0, 0);
}
function prevDayKey(dayKey) {
	const start = dayStart(dayKey).getTime();
	return dayKeyOf(/* @__PURE__ */ new Date(start - 2 * HOUR_MS));
}
function hourLabel(hourKey) {
	const { hour } = parseHourKey(hourKey);
	const suffix = hour >= 12 ? "PM" : "AM";
	return `${hour % 12 || 12} ${suffix}`;
}
function dayLabel(dayKey) {
	const [year, month, day] = dayKey.split("-").map(Number);
	return new Intl.DateTimeFormat("en-US", {
		timeZone: TZ,
		weekday: "short",
		month: "short",
		day: "numeric"
	}).format(ptToUtc(year, month, day, 12, 0));
}
function slotLabel(slot) {
	return `:${String(slot * 10).padStart(2, "0")}`;
}
function phaseOf(launchMs, nowMs) {
	if (nowMs < launchMs) return "upcoming";
	if (nowMs < launchMs + 6e5) return "live";
	return "settled";
}
function floorSlotsDue(now) {
	const today = dayKeyOf(now);
	const current = hourKeyOf(now);
	const [year, month, day] = today.split("-").map(Number);
	let cursor = hourKeyFromParts({
		year,
		month,
		day,
		hour: 0
	});
	const out = [];
	for (let i = 0; i < 30; i++) {
		if (cursor.slice(0, 10) !== today) break;
		for (let slot = 0; slot < 6; slot++) {
			const launch = slotLaunch(cursor, slot);
			if (launch.getTime() <= now.getTime()) out.push({
				hourKey: cursor,
				slot,
				launch
			});
		}
		if (cursor === current) break;
		const next = addHoursKey(cursor, 1);
		if (next === cursor) break;
		cursor = next;
	}
	return out;
}
function nextOpenSlots(now, occupied, count = 1, horizonHours = 36) {
	const startKey = hourKeyOf(now);
	const out = [];
	for (let h = 0; h < horizonHours && out.length < count; h++) {
		const hourKey = addHoursKey(startKey, h);
		for (let slot = 0; slot < 6; slot++) {
			const launch = slotLaunch(hourKey, slot);
			if (launch.getTime() <= now.getTime() + 2e4) continue;
			if (occupied.has(`${hourKey}:${slot}`)) continue;
			out.push({
				hourKey,
				slot,
				launch
			});
			if (out.length >= count) break;
		}
	}
	return out;
}
function windowMultiplier(personality, trend, t) {
	const wave = Math.sin(t * Math.PI * (2.5 + personality * 3.5)) * (.06 + personality * .05);
	return Math.max(.32, 1 + trend * Math.pow(Math.min(1, Math.max(0, t)), .8) + wave);
}
function afterMultiplier(personality, endMul, extraHours) {
	const drift = (personality - .45) * .22 * Math.min(extraHours, 10);
	const wobble = Math.sin(extraHours * 1.7 + personality * 6) * .04;
	return Math.max(.18, endMul * (1 + drift + wobble));
}
function metricsAt(seed, elapsedSec) {
	const personality = unit(seed, "p");
	const openPrice = 8e-6 + unit(seed, "px") * 5e-5;
	const supply = 1e9;
	const openMcap = openPrice * supply;
	const elapsed = Math.max(0, elapsedSec);
	const t = Math.min(elapsed, 600) / 600;
	const extraHours = elapsed > 600 ? (elapsed - 600) / 3600 : 0;
	const trend = (personality - .38) * 2.6;
	const windowMul = windowMultiplier(personality, trend, t);
	const endMul = windowMultiplier(personality, trend, 1);
	const liveMul = extraHours > 0 ? afterMultiplier(personality, endMul, extraHours) : windowMul;
	let athMul = 1;
	const steps = 20;
	for (let i = 0; i <= steps; i++) athMul = Math.max(athMul, windowMultiplier(personality, trend, t * (i / steps)));
	if (extraHours > 0) for (let i = 1; i <= 8; i++) athMul = Math.max(athMul, afterMultiplier(personality, endMul, extraHours * (i / 8)));
	const mcap = openMcap * liveMul;
	const ath = openMcap * Math.max(athMul, liveMul);
	const windowVolume = (6e3 + personality * 52e3) * t * (.75 + personality * .7);
	const holders = Math.round(12 + personality * 30 + t * (70 + personality * 680));
	const windowChange = (windowMul - 1) * 100;
	const oversell = windowVolume / Math.max(openMcap, 1) * 100 + Math.max(0, windowChange);
	const score = holders * .65 + oversell * .35;
	return {
		price: mcap / supply,
		mcap,
		ath,
		volume: windowVolume,
		holders,
		changePct: (liveMul - 1) * 100,
		windowChangePct: windowChange,
		score,
		creatorFeeUsd: windowVolume * CREATOR_FEE_RATE
	};
}
function hourFeeModel(coins) {
	const active = coins.filter((c) => c.phase !== "upcoming");
	const pot = active.reduce((sum, c) => sum + c.creatorFeeUsd, 0);
	const winner = active.reduce((best, c) => !best || c.score > best.score ? c : best, null);
	const winnerFee = winner?.creatorFeeUsd ?? 0;
	const winnerCut = pot * .3;
	const holderCut = Math.max(0, pot - winnerFee) * .3;
	const remaining = Math.max(0, pot - winnerCut - holderCut);
	return {
		pot,
		winnerId: winner?.id ?? null,
		winnerCut,
		holderCut,
		remaining,
		projected: coins.some((c) => c.phase !== "settled")
	};
}
function elapsedSec(launchMs, nowMs) {
	return Math.max(0, (nowMs - launchMs) / 1e3);
}
function snapshotWallet(seed, index) {
	return `pym${deskMint(`${seed}:hold:${index}`).slice(0, 32)}`;
}
/** Known buyers count toward the chain holder total. The rest are the other wallets still in. */
function snapshotBags(seed, chainHolders, known) {
	const seen = /* @__PURE__ */ new Set();
	const bags = [];
	for (const bag of known) {
		if (bag.tokens <= 0 || seen.has(bag.wallet)) continue;
		seen.add(bag.wallet);
		bags.push({
			wallet: bag.wallet,
			tokens: bag.tokens
		});
	}
	const need = Math.max(0, Math.round(chainHolders) - bags.length);
	for (let i = 0; i < need; i++) {
		const wallet = snapshotWallet(seed, i);
		if (seen.has(wallet)) continue;
		seen.add(wallet);
		const roll = hash(`${seed}:bag:${i}`) % 100;
		const mix = hash(`${seed}:size:${i}`);
		const tokens = roll < 70 ? 800 + mix % 2200 : roll < 95 ? 3e3 + mix % 12e3 : 2e4 + mix % 8e4;
		bags.push({
			wallet,
			tokens
		});
	}
	return bags;
}
/** Every bag is paid in proportion to size. Leftover cents go to unpaid bags first, smallest first. */
function splitPool(poolCents, bags) {
	const alive = bags.filter((bag) => bag.tokens > 0 && bag.wallet);
	if (poolCents <= 0 || alive.length === 0) return [];
	const total = alive.reduce((sum, bag) => sum + bag.tokens, 0);
	const pays = alive.map((bag) => ({
		wallet: bag.wallet,
		tokens: bag.tokens,
		cents: Math.floor(poolCents * bag.tokens / total)
	}));
	let left = poolCents - pays.reduce((sum, row) => sum + row.cents, 0);
	const zeros = pays.filter((row) => row.cents === 0).sort((a, b) => a.tokens - b.tokens);
	for (const row of zeros) {
		if (left <= 0) break;
		row.cents = 1;
		left -= 1;
	}
	const bySize = pays.slice().sort((a, b) => b.tokens - a.tokens);
	let cursor = 0;
	while (left > 0 && bySize.length > 0) {
		bySize[cursor % bySize.length].cents += 1;
		left -= 1;
		cursor += 1;
	}
	return pays.filter((row) => row.cents > 0).map((row) => ({
		wallet: row.wallet,
		cents: row.cents
	}));
}
//#endregion
export { prevDayKey as _, dayStart as a, splitPool as b, floorSlotsDue as c, hourKeyOf as d, hourLabel as f, phaseOf as g, nextOpenSlots as h, dayLabel as i, hash as l, metricsAt as m, WINDOW_MS as n, deskMint as o, hourStart as p, dayKeyOf as r, elapsedSec as s, TZ as t, hourFeeModel as u, slotLabel as v, snapshotBags as y };
