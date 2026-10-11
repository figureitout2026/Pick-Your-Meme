export const TZ = "America/Los_Angeles";
export const WINDOW_MS = 10 * 60 * 1000;
export const WINDOW_SEC = 600;
export const HOUR_MS = 60 * 60 * 1000;
export const SLOTS = 6;
/** Creator vault on the bonding curve. Protocol keeps the other 0.95%. Not in this pot. */
export const CREATOR_FEE_RATE = 0.003;

export type Phase = "upcoming" | "live" | "settled";

export type Zoned = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

export function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const B58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

/** Stable launch receipt. Same seed always mints the same id. */
export function deskMint(seed: string): string {
  let h = hash(`mint:${seed}`);
  let out = "";
  for (let i = 0; i < 44; i++) {
    h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
    out += B58[h % B58.length];
  }
  return out;
}

function unit(seed: string, salt: string): number {
  return (hash(`${seed}:${salt}`) % 1_000_000) / 1_000_000;
}

export function zonedParts(date: Date): Zoned {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const bag: Record<string, string> = {};
  for (const part of fmt.formatToParts(date)) bag[part.type] = part.value;
  let hour = Number(bag.hour);
  if (hour === 24) hour = 0;
  return {
    year: Number(bag.year),
    month: Number(bag.month),
    day: Number(bag.day),
    hour,
    minute: Number(bag.minute),
    second: Number(bag.second),
  };
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function hourKeyFromParts(p: Pick<Zoned, "year" | "month" | "day" | "hour">): string {
  return `${p.year}-${pad(p.month)}-${pad(p.day)}T${pad(p.hour)}`;
}

export function dayKeyFromParts(p: Pick<Zoned, "year" | "month" | "day">): string {
  return `${p.year}-${pad(p.month)}-${pad(p.day)}`;
}

export function hourKeyOf(date: Date): string {
  return hourKeyFromParts(zonedParts(date));
}

export function dayKeyOf(date: Date): string {
  return dayKeyFromParts(zonedParts(date));
}

export function ptToUtc(year: number, month: number, day: number, hour: number, minute: number): Date {
  let t = Date.UTC(year, month - 1, day, hour, minute, 0);
  const desired = t;
  for (let i = 0; i < 4; i++) {
    const p = zonedParts(new Date(t));
    const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
    t += desired - asUtc;
  }
  return new Date(t);
}

export function parseHourKey(hourKey: string): { year: number; month: number; day: number; hour: number } {
  const [date, h] = hourKey.split("T");
  const [year, month, day] = date.split("-").map(Number);
  return { year, month, day, hour: Number(h) };
}

export function hourStart(hourKey: string): Date {
  const p = parseHourKey(hourKey);
  return ptToUtc(p.year, p.month, p.day, p.hour, 0);
}

export function slotLaunch(hourKey: string, slot: number): Date {
  return new Date(hourStart(hourKey).getTime() + slot * WINDOW_MS);
}

export function addHoursKey(hourKey: string, delta: number): string {
  return hourKeyOf(new Date(hourStart(hourKey).getTime() + delta * HOUR_MS));
}

export function dayStart(dayKey: string): Date {
  const [year, month, day] = dayKey.split("-").map(Number);
  return ptToUtc(year, month, day, 0, 0);
}

export function nextDayKey(dayKey: string): string {
  const start = dayStart(dayKey).getTime();
  return dayKeyOf(new Date(start + 26 * HOUR_MS));
}

export function prevDayKey(dayKey: string): string {
  const start = dayStart(dayKey).getTime();
  return dayKeyOf(new Date(start - 2 * HOUR_MS));
}

export function hourLabel(hourKey: string): string {
  const { hour } = parseHourKey(hourKey);
  const suffix = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 || 12;
  return `${h12} ${suffix}`;
}

export function dayLabel(dayKey: string): string {
  const [year, month, day] = dayKey.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(ptToUtc(year, month, day, 12, 0));
}

export function slotLabel(slot: number): string {
  return `:${String(slot * 10).padStart(2, "0")}`;
}

export function phaseOf(launchMs: number, nowMs: number): Phase {
  if (nowMs < launchMs) return "upcoming";
  if (nowMs < launchMs + WINDOW_MS) return "live";
  return "settled";
}

export type SlotPick = { hourKey: string; slot: number; launch: Date };

export function floorSlotsDue(now: Date): SlotPick[] {
  const today = dayKeyOf(now);
  const current = hourKeyOf(now);
  const [year, month, day] = today.split("-").map(Number);
  let cursor = hourKeyFromParts({ year, month, day, hour: 0 });
  const out: SlotPick[] = [];
  for (let i = 0; i < 30; i++) {
    if (cursor.slice(0, 10) !== today) break;
    for (let slot = 0; slot < SLOTS; slot++) {
      const launch = slotLaunch(cursor, slot);
      if (launch.getTime() <= now.getTime()) out.push({ hourKey: cursor, slot, launch });
    }
    if (cursor === current) break;
    const next = addHoursKey(cursor, 1);
    if (next === cursor) break;
    cursor = next;
  }
  return out;
}

export function nextOpenSlots(now: Date, occupied: Set<string>, count = 1, horizonHours = 36): SlotPick[] {
  const startKey = hourKeyOf(now);
  const out: SlotPick[] = [];
  for (let h = 0; h < horizonHours && out.length < count; h++) {
    const hourKey = addHoursKey(startKey, h);
    for (let slot = 0; slot < SLOTS; slot++) {
      const launch = slotLaunch(hourKey, slot);
      if (launch.getTime() <= now.getTime() + 20_000) continue;
      if (occupied.has(`${hourKey}:${slot}`)) continue;
      out.push({ hourKey, slot, launch });
      if (out.length >= count) break;
    }
  }
  return out;
}

export type Metrics = {
  price: number;
  mcap: number;
  ath: number;
  volume: number;
  holders: number;
  changePct: number;
  windowChangePct: number;
  score: number;
  creatorFeeUsd: number;
};

function windowMultiplier(personality: number, trend: number, t: number): number {
  const wave = Math.sin(t * Math.PI * (2.5 + personality * 3.5)) * (0.06 + personality * 0.05);
  return Math.max(0.32, 1 + trend * Math.pow(Math.min(1, Math.max(0, t)), 0.8) + wave);
}

function afterMultiplier(personality: number, endMul: number, extraHours: number): number {
  const drift = (personality - 0.45) * 0.22 * Math.min(extraHours, 10);
  const wobble = Math.sin(extraHours * 1.7 + personality * 6) * 0.04;
  return Math.max(0.18, endMul * (1 + drift + wobble));
}

export function metricsAt(seed: string, elapsedSec: number): Metrics {
  const personality = unit(seed, "p");
  const openPrice = 0.000008 + unit(seed, "px") * 0.00005;
  const supply = 1_000_000_000;
  const openMcap = openPrice * supply;
  const elapsed = Math.max(0, elapsedSec);
  const inWindow = Math.min(elapsed, WINDOW_SEC);
  const t = inWindow / WINDOW_SEC;
  const extraHours = elapsed > WINDOW_SEC ? (elapsed - WINDOW_SEC) / 3600 : 0;
  const trend = (personality - 0.38) * 2.6;
  const windowMul = windowMultiplier(personality, trend, t);
  const endMul = windowMultiplier(personality, trend, 1);
  const liveMul = extraHours > 0 ? afterMultiplier(personality, endMul, extraHours) : windowMul;

  let athMul = 1;
  const steps = 20;
  for (let i = 0; i <= steps; i++) {
    athMul = Math.max(athMul, windowMultiplier(personality, trend, t * (i / steps)));
  }
  if (extraHours > 0) {
    for (let i = 1; i <= 8; i++) {
      athMul = Math.max(athMul, afterMultiplier(personality, endMul, extraHours * (i / 8)));
    }
  }

  const mcap = openMcap * liveMul;
  const ath = openMcap * Math.max(athMul, liveMul);
  const volRate = 6_000 + personality * 52_000;
  const windowVolume = volRate * t * (0.75 + personality * 0.7);
  const holders = Math.round(12 + personality * 30 + t * (70 + personality * 680));
  const windowChange = (windowMul - 1) * 100;
  const oversell = (windowVolume / Math.max(openMcap, 1)) * 100 + Math.max(0, windowChange);
  const score = holders * 0.65 + oversell * 0.35;

  return {
    price: mcap / supply,
    mcap,
    ath,
    volume: windowVolume,
    holders,
    changePct: (liveMul - 1) * 100,
    windowChangePct: windowChange,
    score,
    creatorFeeUsd: windowVolume * CREATOR_FEE_RATE,
  };
}

export type FeeCoin = {
  id: string;
  phase: Phase;
  score: number;
  ath: number;
  creatorFeeUsd: number;
};

export type HourFees = {
  pot: number;
  winnerId: string | null;
  winnerCut: number;
  holderCut: number;
  remaining: number;
  projected: boolean;
};

export function hourFeeModel(coins: FeeCoin[]): HourFees {
  const active = coins.filter((c) => c.phase !== "upcoming");
  const pot = active.reduce((sum, c) => sum + c.creatorFeeUsd, 0);
  const winner = active.reduce<FeeCoin | null>((best, c) => (!best || c.score > best.score ? c : best), null);
  const winnerFee = winner?.creatorFeeUsd ?? 0;
  const winnerCut = pot * 0.3;
  const holderCut = Math.max(0, pot - winnerFee) * 0.3;
  const remaining = Math.max(0, pot - winnerCut - holderCut);
  return {
    pot,
    winnerId: winner?.id ?? null,
    winnerCut,
    holderCut,
    remaining,
    projected: coins.some((c) => c.phase !== "settled"),
  };
}

export function elapsedSec(launchMs: number, nowMs: number): number {
  return Math.max(0, (nowMs - launchMs) / 1000);
}

export type Bag = { wallet: string; tokens: number };

export function snapshotWallet(seed: string, index: number): string {
  return `pym${deskMint(`${seed}:hold:${index}`).slice(0, 32)}`;
}

/** Known buyers count toward the chain holder total. The rest are the other wallets still in. */
export function snapshotBags(seed: string, chainHolders: number, known: Bag[]): Bag[] {
  const seen = new Set<string>();
  const bags: Bag[] = [];
  for (const bag of known) {
    if (bag.tokens <= 0 || seen.has(bag.wallet)) continue;
    seen.add(bag.wallet);
    bags.push({ wallet: bag.wallet, tokens: bag.tokens });
  }
  const need = Math.max(0, Math.round(chainHolders) - bags.length);
  for (let i = 0; i < need; i++) {
    const wallet = snapshotWallet(seed, i);
    if (seen.has(wallet)) continue;
    seen.add(wallet);
    const roll = hash(`${seed}:bag:${i}`) % 100;
    const mix = hash(`${seed}:size:${i}`);
    const tokens = roll < 70 ? 800 + (mix % 2200) : roll < 95 ? 3_000 + (mix % 12_000) : 20_000 + (mix % 80_000);
    bags.push({ wallet, tokens });
  }
  return bags;
}

/** Every bag is paid in proportion to size. Leftover cents go to unpaid bags first, smallest first. */
export function splitPool(poolCents: number, bags: Bag[]): { wallet: string; cents: number }[] {
  const alive = bags.filter((bag) => bag.tokens > 0 && bag.wallet);
  if (poolCents <= 0 || alive.length === 0) return [];
  const total = alive.reduce((sum, bag) => sum + bag.tokens, 0);
  const pays = alive.map((bag) => ({
    wallet: bag.wallet,
    tokens: bag.tokens,
    cents: Math.floor((poolCents * bag.tokens) / total),
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
  return pays.filter((row) => row.cents > 0).map((row) => ({ wallet: row.wallet, cents: row.cents }));
}
