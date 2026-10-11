import { createServerFn } from "@tanstack/react-start";
import { getSql, type Sql } from "@/lib/db";
import { catalogFor } from "@/lib/pym/catalog";
import {
  SLOTS,
  WINDOW_MS,
  dayKeyOf,
  dayLabel,
  dayStart,
  deskMint,
  elapsedSec,
  floorSlotsDue,
  hourFeeModel,
  hourKeyOf,
  hourLabel,
  hourStart,
  metricsAt,
  nextOpenSlots,
  phaseOf,
  prevDayKey,
  snapshotBags,
  splitPool,
  type Bag,
  type Phase,
} from "@/lib/pym/engine";
import { cleanTicker, moderateText } from "@/lib/pym/moderate";
import { readRpc } from "@/lib/pym/rpc";
import {
  FAUCET_CENTS,
  FAUCET_COOLDOWN_MS,
  MAX_QUEUE,
  MIN_BUY_CENTS,
  SELL_RETURN,
  START_CENTS,
  submitCostCents,
  usdToCents,
} from "@/lib/pym/money";
import type {
  Arena,
  Clerk,
  Coin,
  Fail,
  HourPayout,
  LaunchWorker,
  MineCard,
  PositionView,
  RewardView,
  Rival,
  SubmitOk,
  Treasury,
} from "@/lib/pym/types";

const ADDR = /^pym[1-9A-HJ-NP-Za-km-z]{32}$/;
const FLOOR_CODE = "pym-floor";

type MemeRow = {
  id: string;
  wallet: string;
  title: string;
  ticker: string;
  caption: string;
  media_kind: string;
  media_url: string;
  is_seed: boolean | string;
  status: string;
  reject_reason: string | null;
  hour_key: string | null;
  slot_index: number | null;
  launch_at: string | Date | null;
  seed_key: string;
  created_at: string | Date;
};

let gate: Promise<unknown> = Promise.resolve();
let bootFlight: Promise<void> | null = null;

function serial<T>(fn: () => Promise<T>): Promise<T> {
  const run = gate.then(fn, fn);
  gate = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

function asObj(input: unknown): Record<string, unknown> {
  if (input && typeof input === "object") return input as Record<string, unknown>;
  return {};
}

function str(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

function nextBoundary(now: Date): { at: Date; slot: number } {
  const start = hourStart(hourKeyOf(now)).getTime();
  const slot = Math.floor((now.getTime() - start) / WINDOW_MS) + 1;
  if (slot < SLOTS) return { at: new Date(start + slot * WINDOW_MS), slot };
  return { at: new Date(start + 60 * 60 * 1000), slot: 0 };
}

function iso(value: string | Date | null | undefined): string | null {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

function flag(value: unknown): boolean {
  return value === true || value === "t" || value === "true" || value === 1;
}

function isUserWallet(address: string): boolean {
  return ADDR.test(address);
}

function fail(reason: string): Fail {
  return { ok: false, reason };
}

function labelOf(address: string, isSeed: boolean): string {
  if (isSeed || address === "floor") return "Floor desk";
  if (address === "platform") return "Platform";
  if (address === "reward-book") return "Reward book";
  if (address.length < 12) return address;
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

function toCoin(row: MemeRow, nowMs: number): Coin | null {
  const launchIso = iso(row.launch_at);
  if (!launchIso || !row.hour_key || row.slot_index == null) return null;
  const launchMs = new Date(launchIso).getTime();
  const phase: Phase = phaseOf(launchMs, nowMs);
  const elapsed = phase === "upcoming" ? 0 : elapsedSec(launchMs, nowMs);
  const metrics = metricsAt(row.seed_key, elapsed);
  if (phase === "upcoming") {
    metrics.score = 0;
    metrics.volume = 0;
    metrics.holders = 0;
    metrics.creatorFeeUsd = 0;
    metrics.changePct = 0;
    metrics.windowChangePct = 0;
  }
  return {
    id: row.id,
    wallet: row.wallet,
    walletLabel: labelOf(row.wallet, flag(row.is_seed)),
    title: row.title,
    ticker: row.ticker,
    caption: row.caption,
    mediaKind: row.media_kind === "video" ? "video" : "image",
    mediaUrl: row.media_url,
    isSeed: flag(row.is_seed),
    hourKey: row.hour_key,
    dayKey: row.hour_key.slice(0, 10),
    slot: Number(row.slot_index),
    launchAt: launchIso,
    windowEnd: new Date(launchMs + WINDOW_MS).toISOString(),
    phase,
    seedKey: row.seed_key,
    price: metrics.price,
    mcap: metrics.mcap,
    ath: metrics.ath,
    volume: metrics.volume,
    holders: metrics.holders,
    changePct: metrics.changePct,
    windowChangePct: metrics.windowChangePct,
    score: metrics.score,
    creatorFeeUsd: metrics.creatorFeeUsd,
    mint: deskMint(row.seed_key),
  };
}

async function boot(sql: Sql, now: Date) {
  if (!bootFlight) {
    bootFlight = runBoot(sql, now).finally(() => {
      bootFlight = null;
    });
  }
  await bootFlight;
}

async function runBoot(sql: Sql, now: Date) {
  await sql`
    insert into wallets (address, provider, balance_cents) values
      ('floor', 'desk', 0),
      ('platform', 'desk', 0),
      ('reward-book', 'desk', 0)
    on conflict (address) do nothing
  `;
  await ensureFloor(sql, now);
  await accrue(sql, now);
  await settleHours(sql, now);
}

async function ensureFloor(sql: Sql, now: Date) {
  const due = floorSlotsDue(now);
  if (!due.length) return;
  const day = dayKeyOf(now);
  const takenRows = await sql<{ hour_key: string; slot_index: number }>`
    select hour_key, slot_index from memes
    where status = 'scheduled' and hour_key like ${`${day}%`}
  `;
  const taken = new Set(takenRows.map((row) => `${row.hour_key}:${row.slot_index}`));
  const missing = due.filter((slot) => !taken.has(`${slot.hourKey}:${slot.slot}`));
  const chunk = 24;
  for (let i = 0; i < missing.length; i += chunk) {
    const part = missing.slice(i, i + chunk);
    const values: unknown[] = [];
    const tuples = part.map((slot, index) => {
      const item = catalogFor(slot.hourKey, slot.slot);
      const base = index * 9;
      values.push(
        `floor-${slot.hourKey}-${slot.slot}`,
        item.title,
        item.ticker,
        item.caption,
        `/memes/${item.slug}.jpg`,
        slot.hourKey,
        slot.slot,
        slot.launch.toISOString(),
        `floor:${slot.hourKey}:${slot.slot}`,
      );
      return `($${base + 1}, 'floor', $${base + 2}, $${base + 3}, $${base + 4}, 'image', $${base + 5}, true, 'scheduled', $${base + 6}, $${base + 7}, $${base + 8}, $${base + 9})`;
    });
    await sql.query(
      `insert into memes (
        id, wallet, title, ticker, caption, media_kind, media_url, is_seed, status,
        hour_key, slot_index, launch_at, seed_key
      ) values ${tuples.join(", ")}
      on conflict (id) do nothing`,
      values,
    );
  }
}

async function accrue(sql: Sql, now: Date) {
  const rows = await sql<{
    wallet: string;
    meme_id: string;
    held_seconds: number;
    last_tick: string | Date;
    holding: boolean | string;
    qualified: boolean | string;
    launch_at: string | Date;
  }>`
    select p.wallet, p.meme_id, p.held_seconds, p.last_tick, p.holding, p.qualified, m.launch_at
    from positions p
    join memes m on m.id = p.meme_id
    where p.holding = true
  `;
  const nowMs = now.getTime();
  for (const row of rows) {
    const launchIso = iso(row.launch_at);
    const lastIso = iso(row.last_tick);
    if (!launchIso || !lastIso) continue;
    const launchMs = new Date(launchIso).getTime();
    const endMs = launchMs + WINDOW_MS;
    const from = Math.max(new Date(lastIso).getTime(), launchMs);
    const to = Math.min(nowMs, endMs);
    const holding = flag(row.holding);
    const add = holding && to > from ? Math.floor((to - from) / 1000) : 0;
    const held = Number(row.held_seconds) + add;
    const qualified = flag(row.qualified) || (nowMs >= endMs && holding);
    if (add === 0 && qualified === flag(row.qualified)) continue;
    await sql`
      update positions
      set held_seconds = ${held},
          last_tick = ${new Date(Math.min(nowMs, endMs)).toISOString()},
          qualified = ${qualified}
      where wallet = ${row.wallet} and meme_id = ${row.meme_id}
    `;
  }
}

async function credit(
  sql: Sql,
  wallet: string,
  cents: number,
  kind: string,
  note: string,
  hourKey: string | null,
  dayKey: string | null,
  memeId: string | null,
  payoutKey?: string,
) {
  if (cents <= 0 || !wallet) return;
  if (!payoutKey) {
    await sql`update wallets set balance_cents = balance_cents + ${cents} where address = ${wallet}`;
    await sql`
      insert into rewards (id, wallet, meme_id, kind, amount_cents, note, hour_key, day_key)
      values (${crypto.randomUUID()}, ${wallet}, ${memeId}, ${kind}, ${cents}, ${note}, ${hourKey}, ${dayKey})
    `;
    return;
  }
  await sql`
    with ins as (
      insert into rewards (id, wallet, meme_id, kind, amount_cents, note, hour_key, day_key, payout_key)
      values (${crypto.randomUUID()}, ${wallet}, ${memeId}, ${kind}, ${cents}, ${note}, ${hourKey}, ${dayKey}, ${payoutKey})
      on conflict (payout_key) where payout_key is not null do nothing
      returning amount_cents
    )
    update wallets
    set balance_cents = balance_cents + (select amount_cents from ins)
    where address = ${wallet} and exists (select 1 from ins)
  `;
}

async function settleHours(sql: Sql, now: Date) {
  const rows = await sql<{ hour_key: string }>`
    select distinct hour_key from memes where status = 'scheduled' and hour_key is not null
  `;
  const done = await sql<{ id: string }>`select id from settlements where id like 'hour:%'`;
  const doneSet = new Set(done.map((row) => row.id));
  const pending = rows
    .map((row) => row.hour_key)
    .filter((key) => hourStart(key).getTime() + 60 * 60 * 1000 <= now.getTime() && !doneSet.has(`hour:${key}`))
    .sort();
  if (pending[0]) await settleOneHour(sql, pending[0], hourStart(pending[0]).getTime() + 60 * 60 * 1000);
  await parkOpenHours(sql);
  await settleDayIfDue(sql, now);
}

async function parkOpenHours(sql: Sql) {
  const closed = await sql<{ id: string }>`select id from settlements where id like 'day:%'`;
  const doneDays = new Set(closed.map((row) => row.id.slice(4)));
  const rows = await sql<{ id: string; summary: string }>`
    select id, summary from settlements where id like 'hour:%'
  `;
  for (const row of rows) {
    let parsed: { hourKey?: string; remainingUsd?: number; winnerId?: string | null } = {};
    try {
      parsed = JSON.parse(row.summary) as typeof parsed;
    } catch {
      continue;
    }
    const hourKey = parsed.hourKey || row.id.slice(5);
    const dayKey = hourKey.slice(0, 10);
    if (doneDays.has(dayKey)) continue;
    if (!parsed.remainingUsd || parsed.remainingUsd <= 0) continue;
    const existing = await sql<{ n: number }>`
      select count(*) as n from rewards where kind = 'hour_platform' and hour_key = ${hourKey}
    `;
    if (Number(existing[0]?.n ?? 0) > 0) continue;
    const cents = usdToCents(parsed.remainingUsd);
    if (cents <= 0) continue;
    await credit(
      sql,
      "platform",
      cents,
      "hour_platform",
      `Parked the desk's slice for ${hourLabel(hourKey)}`,
      hourKey,
      dayKey,
      parsed.winnerId ?? null,
    );
  }
}

const DUST_CENTS = 50;
const PAY_CHUNK = 120;
const SNIPE_MS = 60_000;

async function payMany(
  sql: Sql,
  rows: { wallet: string; cents: number }[],
  kind: string,
  note: string,
  hourKey: string | null,
  dayKey: string | null,
  memeId: string | null,
  keyPrefix: string,
) {
  const paying = rows.filter((row) => row.cents > 0 && row.wallet && row.wallet !== "platform" && row.wallet !== "floor");
  const chunk = 40;
  for (let i = 0; i < paying.length; i += chunk) {
    const part = paying.slice(i, i + chunk);
    const rewardValues: unknown[] = [];
    const rewardTuples = part.map((row, index) => {
      const base = index * 9;
      rewardValues.push(
        crypto.randomUUID(),
        row.wallet,
        memeId,
        kind,
        row.cents,
        note,
        hourKey,
        dayKey,
        `${keyPrefix}:${row.wallet}`,
      );
      return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}, $${base + 8}, $${base + 9})`;
    });
    await sql.query(
      `with ins as (
         insert into rewards (id, wallet, meme_id, kind, amount_cents, note, hour_key, day_key, payout_key)
         values ${rewardTuples.join(", ")}
         on conflict (payout_key) where payout_key is not null do nothing
         returning wallet, amount_cents
       ),
       upd as (
         update wallets w set
           balance_cents = w.balance_cents + case when w.owed_cents + ins.amount_cents >= ${DUST_CENTS} then w.owed_cents + ins.amount_cents else 0 end,
           owed_cents = case when w.owed_cents + ins.amount_cents >= ${DUST_CENTS} then 0 else w.owed_cents + ins.amount_cents end
         from ins
         where w.address = ins.wallet
         returning w.address
       )
       insert into wallets (address, provider, balance_cents, owed_cents)
       select ins.wallet, 'snapshot',
         case when ins.amount_cents >= ${DUST_CENTS} then ins.amount_cents else 0 end,
         case when ins.amount_cents >= ${DUST_CENTS} then 0 else ins.amount_cents end
       from ins
       where not exists (select 1 from wallets w where w.address = ins.wallet)
       on conflict (address) do nothing`,
      rewardValues,
    );
  }
}

function payRange(pays: { cents: number }[]): { minCents: number; maxCents: number; eachCents: number } {
  if (!pays.length) return { minCents: 0, maxCents: 0, eachCents: 0 };
  const amounts = pays.map((row) => row.cents).sort((a, b) => a - b);
  return {
    minCents: amounts[0],
    maxCents: amounts[amounts.length - 1],
    eachCents: amounts[Math.floor(amounts.length / 2)],
  };
}

async function settleOneHour(sql: Sql, hourKey: string, endMs: number) {
  const memeRows = await sql<MemeRow>`
    select * from memes where status = 'scheduled' and hour_key = ${hourKey}
  `;
  const coins = memeRows.map((row) => toCoin(row, endMs)).filter((coin): coin is Coin => !!coin);
  const fees = hourFeeModel(coins);
  const winner = coins.find((coin) => coin.id === fees.winnerId) ?? null;
  const winnerCents = usdToCents(fees.winnerCut);
  const holderPool = usdToCents(fees.holderCut);
  const closed = await sql<{ id: string }>`select id from settlements where id = ${`hour:${hourKey}`}`;
  if (closed.length) return;
  const heldRows = winner
    ? await sql<{ wallet: string; qty_cents: number; holding: boolean | string; opened_at: string | Date | null }>`
        select wallet, qty_cents, holding, opened_at from positions where meme_id = ${winner.id}
      `
    : [];
  const known: Bag[] = [];
  for (const row of heldRows) {
    if (!flag(row.holding) || Number(row.qty_cents) <= 0) continue;
    if (row.wallet === "platform" || row.wallet === "floor" || row.wallet === "reward-book") continue;
    const openedIso = iso(row.opened_at);
    const opened = openedIso ? new Date(openedIso).getTime() : 0;
    if (opened > endMs - SNIPE_MS) continue;
    known.push({ wallet: row.wallet, tokens: Number(row.qty_cents) });
  }
  const bags = winner ? snapshotBags(winner.seedKey, winner.holders, known) : [];
  const pays = splitPool(holderPool, bags).sort((a, b) => (a.wallet < b.wallet ? -1 : 1));
  const range = payRange(pays);
  const summary: HourPayout = {
    hourKey,
    hourLabel: hourLabel(hourKey),
    winnerId: winner?.id ?? null,
    winnerTicker: winner?.ticker ?? "",
    potUsd: fees.pot,
    winnerCutUsd: fees.winnerCut,
    holderCutUsd: fees.holderCut,
    remainingUsd: fees.remaining,
    winnerCents,
    holderCents: holderPool,
    holderWallets: pays.length,
    eachCents: range.eachCents,
    bySize: true,
    minCents: range.minCents,
    maxCents: range.maxCents,
  };
  const jobId = `hourjob:${hourKey}`;
  const jobRows = await sql<{ summary: string }>`select summary from settlements where id = ${jobId}`;
  let offset = 0;
  if (jobRows[0]?.summary) {
    try {
      offset = Number((JSON.parse(jobRows[0].summary) as { offset?: number }).offset) || 0;
    } catch {
      offset = 0;
    }
  }
  const dayKey = hourKey.slice(0, 10);
  if (offset === 0) {
    const parked = usdToCents(fees.remaining);
    if (parked > 0) {
      await credit(sql, "platform", parked, "hour_platform", `Parked the desk's slice for ${hourLabel(hourKey)}`, hourKey, dayKey, winner?.id ?? null, `hour_platform:${hourKey}`);
    }
    if (winner && winnerCents > 0) {
      await credit(sql, winner.wallet, winnerCents, "hour_creator", `${winner.ticker} won the ${hourLabel(hourKey)} hour`, hourKey, dayKey, winner.id, `hour_creator:${hourKey}`);
    } else if (holderPool > 0 && pays.length === 0) {
      await credit(sql, "platform", holderPool, "platform", `No holders to pay for ${winner?.ticker ?? hourKey}`, hourKey, dayKey, winner?.id ?? null, `hour_empty:${hourKey}`);
    }
  }
  const slice = pays.slice(offset, offset + PAY_CHUNK);
  if (slice.length > 0 && winner) {
    await payMany(sql, slice, "hour_holders", `Holding ${winner.ticker} at the bell. Paid by bag size.`, hourKey, dayKey, winner.id, `hour_holders:${hourKey}`);
  }
  const next = offset + slice.length;
  if (next >= pays.length) {
    await sql`
      insert into settlements (id, summary)
      values (${`hour:${hourKey}`}, ${JSON.stringify(summary)})
      on conflict (id) do nothing
    `;
    await sql`delete from settlements where id = ${jobId}`;
    return;
  }
  await sql`
    insert into settlements (id, summary)
    values (${jobId}, ${JSON.stringify({ offset: next })})
    on conflict (id) do update set summary = excluded.summary
  `;
}

async function debitPlatform(sql: Sql, cents: number, payoutKey: string, note: string, dayKey: string): Promise<boolean> {
  if (cents <= 0) return true;
  const inserted = await sql<{ id: string }>`
    insert into rewards (id, wallet, meme_id, kind, amount_cents, note, hour_key, day_key, payout_key)
    values (${crypto.randomUUID()}, 'platform', null, 'day_debit', ${cents}, ${note}, null, ${dayKey}, ${payoutKey})
    on conflict (payout_key) where payout_key is not null do nothing
    returning id
  `;
  if (!inserted.length) return true;
  const took = await sql<{ balance_cents: number }>`
    update wallets set balance_cents = balance_cents - ${cents}
    where address = 'platform' and balance_cents >= ${cents}
    returning balance_cents
  `;
  if (took.length) return true;
  await sql`delete from rewards where payout_key = ${payoutKey}`;
  return false;
}

async function payDailyPool(
  sql: Sql,
  yday: string,
  winner: Coin | null,
  poolCents: number,
  fromTreasury: boolean,
  coins: Coin[],
): Promise<boolean> {
  if (poolCents <= 0) return true;
  const tag = fromTreasury ? "p" : "o";
  const jobId = `dayjob:${yday}:${tag}`;
  const creatorCents = winner ? Math.floor(poolCents * 0.2) : 0;
  const holderBudget = Math.floor(poolCents * 0.15);
  const held = await sql<{ wallet: string; meme_id: string; qty_cents: number }>`
    select wallet, meme_id, qty_cents from positions
    where holding = true and qty_cents > 0
      and wallet not in ('reward-book', 'floor', 'platform')
  `;
  const byMeme = new Map<string, Bag[]>();
  for (const row of held) {
    const list = byMeme.get(row.meme_id) ?? [];
    list.push({ wallet: row.wallet, tokens: Number(row.qty_cents) });
    byMeme.set(row.meme_id, list);
  }
  const merged = new Map<string, number>();
  for (const coin of coins) {
    for (const bag of snapshotBags(coin.seedKey, coin.holders, byMeme.get(coin.id) ?? [])) {
      merged.set(bag.wallet, (merged.get(bag.wallet) ?? 0) + bag.tokens);
    }
  }
  const pays = splitPool(
    holderBudget,
    [...merged].map(([wallet, tokens]) => ({ wallet, tokens })),
  ).sort((a, b) => (a.wallet < b.wallet ? -1 : 1));
  const holderPaid = pays.reduce((sum, row) => sum + row.cents, 0);
  const keep = poolCents - creatorCents - holderPaid;
  const jobRows = await sql<{ summary: string }>`select summary from settlements where id = ${jobId}`;
  let offset = 0;
  if (jobRows[0]?.summary) {
    try {
      offset = Number((JSON.parse(jobRows[0].summary) as { offset?: number }).offset) || 0;
    } catch {
      offset = 0;
    }
  }
  if (offset === 0 && winner && creatorCents > 0) {
    if (fromTreasury) {
      const ok = await debitPlatform(sql, creatorCents, `day_debit:${yday}:${tag}:creator`, `Daily winner paid from the treasury`, yday);
      if (!ok) return false;
    }
    await credit(sql, winner.wallet, creatorCents, "day_creator", `${winner.ticker} went the highest on ${dayLabel(yday)}`, null, yday, winner.id, `day_creator:${yday}:${tag}`);
  }
  const slice = pays.slice(offset, offset + PAY_CHUNK);
  if (fromTreasury && slice.length > 0) {
    const take = slice.reduce((sum, row) => sum + row.cents, 0);
    const ok = await debitPlatform(sql, take, `day_debit:${yday}:${tag}:${offset}`, `Daily holders paid from the treasury`, yday);
    if (!ok) return false;
  }
  if (slice.length > 0) {
    await payMany(sql, slice, "day_holders", `Still holding a coin on ${dayLabel(yday)}. Paid by bag size.`, null, yday, null, `day_holders:${yday}:${tag}`);
  }
  const next = offset + slice.length;
  if (next < pays.length) {
    await sql`
      insert into settlements (id, summary)
      values (${jobId}, ${JSON.stringify({ offset: next })})
      on conflict (id) do update set summary = excluded.summary
    `;
    return false;
  }
  if (!fromTreasury && keep > 0) {
    await credit(sql, "platform", keep, "platform", `Platform share for ${dayLabel(yday)}`, null, yday, null, `day_platform:${yday}`);
  }
  await sql`delete from settlements where id = ${jobId}`;
  return true;
}

async function settleDayIfDue(sql: Sql, now: Date) {
  const today = dayKeyOf(now);
  const yday = prevDayKey(today);
  const id = `day:${yday}`;
  const existing = await sql<{ id: string }>`select id from settlements where id = ${id}`;
  if (existing.length) return;
  const start = dayStart(yday);
  const end = dayStart(today);
  const memeRows = await sql<MemeRow>`
    select * from memes
    where status = 'scheduled'
      and launch_at >= ${start.toISOString()}
      and launch_at < ${end.toISOString()}
  `;
  if (!memeRows.length) {
    await sql`
      insert into settlements (id, summary) values (${id}, ${"{}"})
      on conflict (id) do nothing
    `;
    return;
  }
  const hourKeys = [...new Set(memeRows.map((row) => row.hour_key).filter((key): key is string => !!key))];
  if (hourKeys.length) {
    const settled = await sql<{ id: string }>`select id from settlements where id like 'hour:%'`;
    const have = new Set(settled.map((row) => row.id));
    if (hourKeys.some((key) => !have.has(`hour:${key}`))) return;
  }
  const coins = memeRows.map((row) => toCoin(row, end.getTime())).filter((coin): coin is Coin => !!coin);
  const byHour = new Map<string, Coin[]>();
  for (const coin of coins) {
    const list = byHour.get(coin.hourKey) ?? [];
    list.push(coin);
    byHour.set(coin.hourKey, list);
  }
  let remaining = 0;
  for (const group of byHour.values()) remaining += hourFeeModel(group).remaining;
  const winner = coins.reduce<Coin | null>((best, coin) => (!best || coin.ath > best.ath ? coin : best), null);
  const parkedRows = await sql<{ n: number }>`
    select coalesce(sum(amount_cents), 0) as n from rewards
    where wallet = 'platform' and kind = 'hour_platform' and day_key = ${yday}
  `;
  const parked = Number(parkedRows[0]?.n ?? 0);
  const booked = usdToCents(remaining);
  const unparked = Math.max(0, booked - parked);
  const parkedDone = await payDailyPool(sql, yday, winner, parked, true, coins);
  if (!parkedDone) return;
  const openDone = await payDailyPool(sql, yday, winner, unparked, false, coins);
  if (!openDone) return;
  await sql`
    insert into settlements (id, summary)
    values (${id}, ${JSON.stringify({ dayKey: yday, remaining, parked, unparked, winnerId: winner?.id ?? null })})
    on conflict (id) do nothing
  `;
}

async function loadArena(wallet: string): Promise<Arena> {
  const sql = await getSql();
  const now = new Date();
  await boot(sql, now);
  const nowMs = now.getTime();
  const dayKey = dayKeyOf(now);
  const hourKey = hourKeyOf(now);
  const start = dayStart(dayKey);
  const horizon = new Date(nowMs + 8 * 60 * 60 * 1000);
  const memeRows = await sql<MemeRow>`
    select * from memes
    where status = 'scheduled'
      and launch_at >= ${start.toISOString()}
      and launch_at < ${horizon.toISOString()}
    order by launch_at asc
  `;
  const coins = memeRows.map((row) => toCoin(row, nowMs)).filter((coin): coin is Coin => !!coin);
  const byHour = new Map<string, Coin[]>();
  for (const coin of coins) {
    const list = byHour.get(coin.hourKey) ?? [];
    list.push(coin);
    byHour.set(coin.hourKey, list);
  }
  const pack = (key: string): (Coin | null)[] => {
    const slots: (Coin | null)[] = Array.from({ length: SLOTS }, () => null);
    for (const coin of byHour.get(key) ?? []) {
      if (coin.slot >= 0 && coin.slot < SLOTS && !slots[coin.slot]) slots[coin.slot] = coin;
    }
    return slots;
  };
  const hourSlots = pack(hourKey);
  const hourCoins = hourSlots.filter((coin): coin is Coin => !!coin);
  const live = hourCoins.find((coin) => coin.phase === "live") ?? null;
  const hourRank = hourCoins
    .filter((coin) => coin.phase !== "upcoming")
    .slice()
    .sort((a, b) => b.score - a.score);
  const upcoming = [1, 2, 3].map((delta) => {
    const key = hourKeyOf(new Date(hourStart(hourKey).getTime() + delta * 60 * 60 * 1000));
    return { hourKey: key, hourLabel: hourLabel(key), coins: pack(key) };
  });
  const todayLaunched = coins.filter((coin) => coin.dayKey === dayKey && coin.phase !== "upcoming");
  const dailyTop = todayLaunched.slice().sort((a, b) => b.ath - a.ath).slice(0, 8);
  const hourFees = hourFeeModel(hourCoins);
  const hourKeys = new Set(todayLaunched.map((coin) => coin.hourKey));
  let dayRemaining = 0;
  for (const key of hourKeys) dayRemaining += hourFeeModel(byHour.get(key) ?? []).remaining;
  const dayWinner = todayLaunched.reduce<Coin | null>((best, coin) => (!best || coin.ath > best.ath ? coin : best), null);
  const payoutRows = await sql<{ summary: string }>`
    select summary from settlements where id like 'hour:%' order by id desc limit 1
  `;
  let lastPayout: HourPayout | null = null;
  if (payoutRows[0]?.summary) {
    try {
      const parsed = JSON.parse(payoutRows[0].summary) as Partial<HourPayout>;
      lastPayout = parsed.hourKey
        ? {
            hourKey: parsed.hourKey,
            hourLabel: parsed.hourLabel ?? hourLabel(parsed.hourKey),
            winnerId: parsed.winnerId ?? null,
            winnerTicker: parsed.winnerTicker ?? "",
            potUsd: parsed.potUsd ?? 0,
            winnerCutUsd: parsed.winnerCutUsd ?? 0,
            holderCutUsd: parsed.holderCutUsd ?? 0,
            remainingUsd: parsed.remainingUsd ?? 0,
            winnerCents: parsed.winnerCents ?? 0,
            holderCents: parsed.holderCents ?? 0,
            holderWallets: parsed.holderWallets ?? 0,
            eachCents: parsed.eachCents ?? 0,
            bySize: parsed.bySize ?? false,
            minCents: parsed.minCents ?? parsed.eachCents ?? 0,
            maxCents: parsed.maxCents ?? parsed.eachCents ?? 0,
          }
        : null;
    } catch {
      lastPayout = null;
    }
  }
  const clerk: Clerk = {
    automatic: true,
    lastHourLabel: lastPayout?.hourLabel ?? null,
    holderWallets: lastPayout?.holderWallets ?? 0,
    eachCents: lastPayout?.eachCents ?? 0,
    bySize: lastPayout?.bySize ?? false,
    minCents: lastPayout?.minCents ?? lastPayout?.eachCents ?? 0,
    maxCents: lastPayout?.maxCents ?? lastPayout?.eachCents ?? 0,
    winnerTicker: lastPayout?.winnerTicker ?? "",
  };
  const moneyRows = await sql<{ listing: number; parked: number; balance_cents: number }>`
    select
      coalesce((select sum(amount_cents) from rewards where wallet = 'platform' and kind = 'listing'), 0) as listing,
      coalesce((select sum(amount_cents) from rewards where wallet = 'platform' and kind = 'hour_platform'), 0) as parked,
      coalesce((select balance_cents from wallets where address = 'platform'), 0) as balance_cents
  `;
  const treasury: Treasury = {
    balanceCents: Number(moneyRows[0]?.balance_cents ?? 0),
    listingCents: Number(moneyRows[0]?.listing ?? 0),
    parkedCents: Number(moneyRows[0]?.parked ?? 0),
  };
  const nextRows = await sql<{
    title: string;
    ticker: string;
    launch_at: string | Date;
    slot_index: number;
  }>`
    select title, ticker, launch_at, slot_index from memes
    where status = 'scheduled' and launch_at > ${now.toISOString()}
    order by launch_at asc
    limit 1
  `;
  const deployedRows = await sql<{ n: number }>`
    select count(*) as n from memes
    where status = 'scheduled'
      and launch_at >= ${start.toISOString()}
      and launch_at <= ${now.toISOString()}
  `;
  const next = nextRows[0];
  const boundary = nextBoundary(now);
  const scheduledAt = next ? iso(next.launch_at) : null;
  const scheduledMs = scheduledAt ? new Date(scheduledAt).getTime() : Number.POSITIVE_INFINITY;
  const useScheduled = !!next && scheduledMs <= boundary.at.getTime() + 1000;
  const rpc = await readRpc();
  const worker: LaunchWorker = {
    automatic: true,
    holdsTokens: 0,
    nextLaunchAt: useScheduled ? scheduledAt : boundary.at.toISOString(),
    nextTitle: useScheduled ? next.title : null,
    nextTicker: useScheduled ? next.ticker : null,
    nextSlot: useScheduled ? Number(next.slot_index) : boundary.slot,
    deployedToday: Number(deployedRows[0]?.n ?? 0),
    rpcOk: rpc.ok,
    rpcSlot: rpc.slot,
    rpcLabel: rpc.label,
  };
  let balanceCents: number | null = null;
  let positions: PositionView[] = [];
  let rewards: RewardView[] = [];
  let yourNext: Coin | null = null;
  if (isUserWallet(wallet)) {
    const bals = await sql<{ balance_cents: number }>`
      select balance_cents from wallets where address = ${wallet}
    `;
    balanceCents = bals.length ? Number(bals[0].balance_cents) : null;
    const posRows = await sql<{
      meme_id: string;
      qty_cents: number;
      held_seconds: number;
      holding: boolean | string;
      qualified: boolean | string;
      title: string;
      ticker: string;
      launch_at: string | Date;
    }>`
      select p.meme_id, p.qty_cents, p.held_seconds, p.holding, p.qualified, m.title, m.ticker, m.launch_at
      from positions p
      join memes m on m.id = p.meme_id
      where p.wallet = ${wallet}
      order by m.launch_at desc
      limit 12
    `;
    positions = posRows.map((row) => {
      const launchIso = iso(row.launch_at) ?? now.toISOString();
      const endMs = new Date(launchIso).getTime() + WINDOW_MS;
      const left = Math.max(0, Math.ceil((endMs - nowMs) / 1000));
      const held = Number(row.held_seconds);
      const holding = flag(row.holding);
      const qualified = flag(row.qualified);
      return {
        memeId: row.meme_id,
        title: row.title,
        ticker: row.ticker,
        qtyCents: Number(row.qty_cents),
        heldSeconds: held,
        holding,
        qualified,
        canStillQualify: !qualified && left > 0,
        secondsLeft: left,
      };
    });
    const rewardRows = await sql<{
      id: string;
      kind: string;
      amount_cents: number;
      note: string;
      hour_key: string | null;
      created_at: string | Date;
    }>`
      select id, kind, amount_cents, note, hour_key, created_at
      from rewards where wallet = ${wallet}
      order by created_at desc
      limit 12
    `;
    rewards = rewardRows.map((row) => ({
      id: row.id,
      kind: row.kind,
      amountCents: Number(row.amount_cents),
      note: row.note,
      hourKey: row.hour_key,
      createdAt: iso(row.created_at) ?? now.toISOString(),
    }));
    const nextRows = await sql<MemeRow>`
      select * from memes
      where wallet = ${wallet} and status = 'scheduled' and launch_at > ${now.toISOString()}
      order by launch_at asc
      limit 1
    `;
    yourNext = nextRows[0] ? toCoin(nextRows[0], nowMs) : null;
  }
  return {
    now: now.toISOString(),
    hourKey,
    hourLabel: hourLabel(hourKey),
    dayKey,
    dayLabel: dayLabel(dayKey),
    liveSlot: live?.slot ?? null,
    secondsLeftInWindow: live ? Math.max(0, Math.ceil((new Date(live.windowEnd).getTime() - nowMs) / 1000)) : 0,
    coins: hourSlots,
    hourRank,
    upcoming,
    dailyTop,
    fees: {
      hourPot: hourFees.pot,
      hourProjected: hourFees.projected,
      winnerCut: hourFees.winnerCut,
      holderCut: hourFees.holderCut,
      hourRemaining: hourFees.remaining,
      dayRemaining,
      dailyCreatorCut: dayRemaining * 0.2,
      allHoldersCut: dayRemaining * 0.15,
      platformCut: dayRemaining * 0.65,
      dayProjected: true,
      hourWinnerId: hourFees.winnerId,
      dayWinnerId: dayWinner?.id ?? null,
    },
    clerk,
    worker,
    treasury,
    lastPayout,
    balanceCents,
    positions,
    rewards,
    yourNext,
  };
}

function rivalsFor(coins: { id: string; title: string; ticker: string; slot: number; launchAt: string; walletLabel: string; wallet: string }[], wallet: string, exceptId?: string): Rival[] {
  return coins
    .filter((coin) => coin.id !== exceptId)
    .map((coin) => ({
      id: coin.id,
      title: coin.title,
      ticker: coin.ticker,
      slot: coin.slot,
      launchAt: coin.launchAt,
      walletLabel: coin.walletLabel,
      isYours: coin.wallet === wallet,
    }))
    .sort((a, b) => a.slot - b.slot);
}

async function hourRivals(sql: Sql, hourKey: string, wallet: string, exceptId: string, nowMs: number): Promise<Rival[]> {
  const rows = await sql<MemeRow>`
    select * from memes where status = 'scheduled' and hour_key = ${hourKey} order by slot_index asc
  `;
  const coins = rows.map((row) => toCoin(row, nowMs)).filter((coin): coin is Coin => !!coin);
  return rivalsFor(coins, wallet, exceptId);
}

export const getArena = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const wallet = str(asObj(input).wallet, 80);
    return { wallet };
  })
  .handler(async ({ data }): Promise<Arena> => serial(() => loadArena(data.wallet)));

export const getPreview = createServerFn({ method: "GET" }).handler(async () =>
  serial(async () => {
    const sql = await getSql();
    const now = new Date();
    await boot(sql, now);
    const occupied = new Set<string>();
    const rows = await sql<{ hour_key: string; slot_index: number }>`
      select hour_key, slot_index from memes
      where status = 'scheduled' and launch_at > ${now.toISOString()}
    `;
    for (const row of rows) occupied.add(`${row.hour_key}:${row.slot_index}`);
    const [next] = nextOpenSlots(now, occupied, 1);
    if (!next) {
      return { next: null, rivals: [] as Rival[], openSeats: 0, costCents: submitCostCents() };
    }
    const rivals = await hourRivals(sql, next.hourKey, "", "", now.getTime());
    const openSeats = SLOTS - rivals.length - 1;
    return {
      next: {
        hourKey: next.hourKey,
        hourLabel: hourLabel(next.hourKey),
        slot: next.slot,
        launchAt: next.launch.toISOString(),
      },
      rivals,
      openSeats: Math.max(0, openSeats),
      costCents: submitCostCents(),
    };
  }),
);

export const connectWallet = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const obj = asObj(input);
    return {
      address: str(obj.address, 80),
      provider: obj.provider === "solflare" ? "solflare" : "phantom",
    } as const;
  })
  .handler(async ({ data }) =>
    serial(async () => {
      if (!isUserWallet(data.address)) return fail("That address is not a demo wallet.");
      const sql = await getSql();
      await boot(sql, new Date());
      const rows = await sql<{ balance_cents: number; provider: string }>`
        insert into wallets (address, provider, balance_cents)
        values (${data.address}, ${data.provider}, ${START_CENTS})
        on conflict (address) do update set provider = excluded.provider
        returning balance_cents, provider
      `;
      return {
        ok: true as const,
        address: data.address,
        provider: rows[0]?.provider === "solflare" ? ("solflare" as const) : ("phantom" as const),
        balanceCents: Number(rows[0]?.balance_cents ?? 0),
      };
    }),
  );

export const submitMeme = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const obj = asObj(input);
    return {
      wallet: str(obj.wallet, 80),
      title: str(obj.title, 40),
      ticker: str(obj.ticker, 8),
      caption: str(obj.caption, 180),
      mediaKind: obj.mediaKind === "video" ? "video" : "image",
      mediaUrl: typeof obj.mediaUrl === "string" ? obj.mediaUrl : "",
    };
  })
  .handler(async ({ data }): Promise<SubmitOk | Fail> =>
    serial(async () => {
      if (!isUserWallet(data.wallet)) return fail("Connect a demo wallet first.");
      if (data.mediaUrl.length > 500_000) return fail("That file is too big to keep. Use a photo, or a clip under 350 KB.");
      if (data.title.length < 2 || data.title.length > 28) return fail("Name the meme in 2 to 28 characters.");
      if (data.caption.length > 140) return fail("Keep the caption under 140 characters.");
      const ticker = cleanTicker(data.ticker);
      if (!ticker) return fail("Ticker needs 2 to 6 letters or numbers.");
      const screened = moderateText([data.title, ticker, data.caption]);
      if (!screened.ok) return screened;
      if (data.mediaKind === "video" && !data.mediaUrl.startsWith("data:video/")) {
        return fail("That video did not come through. Try a shorter mp4 or webm.");
      }
      if (data.mediaKind === "image" && !data.mediaUrl.startsWith("data:image/")) {
        return fail("Upload a jpeg, png, webp, or gif.");
      }
      if (data.mediaUrl.length > 1_200_000) return fail("That file is too heavy. Use a still under about 900 KB.");
      const sql = await getSql();
      const now = new Date();
      await boot(sql, now);
      const queued = await sql<{ n: number }>`
        select count(*) as n from memes
        where wallet = ${data.wallet} and status = 'scheduled' and launch_at > ${now.toISOString()}
      `;
      if (Number(queued[0]?.n ?? 0) >= MAX_QUEUE) {
        return fail("You already have 6 coins waiting. Let one launch before you send another.");
      }
      const cost = submitCostCents();
      for (let attempt = 0; attempt < 5; attempt++) {
        const occRows = await sql<{ hour_key: string; slot_index: number }>`
          select hour_key, slot_index from memes
          where status = 'scheduled' and launch_at > ${now.toISOString()}
        `;
        const occupied = new Set(occRows.map((row) => `${row.hour_key}:${row.slot_index}`));
        const [slot] = nextOpenSlots(now, occupied, 1);
        if (!slot) return fail("The next 36 hours are booked.");
        const paid = await sql<{ balance_cents: number }>`
          update wallets
          set balance_cents = balance_cents - ${cost}
          where address = ${data.wallet} and balance_cents >= ${cost}
          returning balance_cents
        `;
        if (!paid.length) return fail(`You need ${cost / 100} PYM. That's $5 at the demo price. Hit the faucet on the PYM page.`);
        const id = crypto.randomUUID();
        try {
          await sql`
            insert into memes (
              id, wallet, title, ticker, caption, media_kind, media_url, is_seed, status,
              hour_key, slot_index, launch_at, seed_key
            ) values (
              ${id}, ${data.wallet}, ${data.title}, ${ticker}, ${data.caption}, ${data.mediaKind},
              ${data.mediaUrl}, false, 'scheduled', ${slot.hourKey}, ${slot.slot},
              ${slot.launch.toISOString()}, ${id}
            )
          `;
          await credit(
            sql,
            "platform",
            cost,
            "listing",
            `Listing fee for ${ticker}`,
            slot.hourKey,
            slot.hourKey.slice(0, 10),
            id,
          );
          const ahead = await sql<{ n: number }>`
            select count(*) as n from memes
            where status = 'scheduled' and launch_at > ${now.toISOString()} and launch_at < ${slot.launch.toISOString()}
          `;
          const rivals = await hourRivals(sql, slot.hourKey, data.wallet, id, now.getTime());
          return {
            ok: true as const,
            id,
            title: data.title,
            ticker,
            launchAt: slot.launch.toISOString(),
            hourKey: slot.hourKey,
            hourLabel: hourLabel(slot.hourKey),
            slot: slot.slot,
            queuePosition: Number(ahead[0]?.n ?? 0) + 1,
            rivals,
            balanceCents: Number(paid[0].balance_cents),
          };
        } catch (error) {
          await sql`
            update wallets set balance_cents = balance_cents + ${cost} where address = ${data.wallet}
          `;
          const message = error instanceof Error ? error.message : String(error);
          if (/unique|duplicate/i.test(message)) continue;
          throw error;
        }
      }
      return fail("The slot slipped. Try once more.");
    }),
  );

export const getMine = createServerFn({ method: "POST" })
  .validator((input: unknown) => ({ wallet: str(asObj(input).wallet, 80) }))
  .handler(async ({ data }): Promise<MineCard[]> =>
    serial(async () => {
      if (!isUserWallet(data.wallet)) return [];
      const sql = await getSql();
      const now = new Date();
      await boot(sql, now);
      const nowMs = now.getTime();
      const rows = await sql<MemeRow>`
        select * from memes where wallet = ${data.wallet} order by created_at desc limit 40
      `;
      const hourKeys = [...new Set(rows.map((row) => row.hour_key).filter((key): key is string => !!key))];
      const rivalRows = hourKeys.length
        ? await sql.query<MemeRow>(
            `select * from memes where status = 'scheduled' and hour_key = any($1::text[])`,
            [hourKeys],
          )
        : [];
      const rivalCoins = rivalRows.map((row) => toCoin(row, nowMs)).filter((coin): coin is Coin => !!coin);
      const waiting = await sql<{ id: string; launch_at: string | Date }>`
        select id, launch_at from memes
        where status = 'scheduled' and launch_at > ${now.toISOString()}
        order by launch_at asc
      `;
      const order = new Map(waiting.map((row, index) => [row.id, index + 1]));
      return rows.map((row) => {
        const coin = toCoin(row, nowMs);
        const status: MineCard["status"] =
          row.status === "rejected" ? "rejected" : coin?.phase === "live" || coin?.phase === "settled" || coin?.phase === "upcoming" ? coin.phase : "scheduled";
        const rivals = coin
          ? rivalsFor(
              rivalCoins.filter((item) => item.hourKey === coin.hourKey),
              data.wallet,
              row.id,
            )
          : [];
        return {
          id: row.id,
          title: row.title,
          ticker: row.ticker,
          caption: row.caption,
          mediaKind: row.media_kind === "video" ? "video" : "image",
          mediaUrl: row.media_url,
          status,
          rejectReason: row.reject_reason,
          hourKey: row.hour_key,
          hourLabel: row.hour_key ? hourLabel(row.hour_key) : null,
          slot: row.slot_index == null ? null : Number(row.slot_index),
          launchAt: iso(row.launch_at),
          queuePosition: order.get(row.id) ?? null,
          rivals,
          score: coin && coin.phase !== "upcoming" ? coin.score : null,
          mcap: coin ? coin.mcap : null,
          changePct: coin && coin.phase !== "upcoming" ? coin.changePct : null,
        };
      });
    }),
  );

export const getCoin = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const obj = asObj(input);
    return { id: str(obj.id, 80), wallet: str(obj.wallet, 80) };
  })
  .handler(async ({ data }) =>
    serial(async () => {
      const sql = await getSql();
      const now = new Date();
      await boot(sql, now);
      const rows = await sql<MemeRow>`select * from memes where id = ${data.id} limit 1`;
      const coin = rows[0] ? toCoin(rows[0], now.getTime()) : null;
      if (!coin) return { coin: null, rivals: [] as Rival[] };
      const rivals = await hourRivals(sql, coin.hourKey, data.wallet, coin.id, now.getTime());
      return { coin, rivals };
    }),
  );

export const apeIn = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const obj = asObj(input);
    const cents = Number(obj.cents);
    return {
      wallet: str(obj.wallet, 80),
      memeId: str(obj.memeId, 80),
      cents: Number.isFinite(cents) ? Math.floor(cents) : 0,
    };
  })
  .handler(async ({ data }) =>
    serial(async () => {
      if (!isUserWallet(data.wallet)) return fail("Connect a demo wallet first.");
      if (data.cents < MIN_BUY_CENTS) return fail("Minimum bag is 10 PYM.");
      const sql = await getSql();
      const now = new Date();
      await boot(sql, now);
      const rows = await sql<MemeRow>`select * from memes where id = ${data.memeId} limit 1`;
      const coin = rows[0] ? toCoin(rows[0], now.getTime()) : null;
      if (!coin || coin.phase !== "live") return fail("You can only buy during that coin's 10-minute window.");
      const paid = await sql<{ balance_cents: number }>`
        update wallets set balance_cents = balance_cents - ${data.cents}
        where address = ${data.wallet} and balance_cents >= ${data.cents}
        returning balance_cents
      `;
      if (!paid.length) return fail("Not enough PYM in this wallet.");
      await sql`
        insert into positions (wallet, meme_id, qty_cents, cost_cents, held_seconds, last_tick, holding, qualified, opened_at)
        values (${data.wallet}, ${data.memeId}, ${data.cents}, ${data.cents}, 0, ${now.toISOString()}, true, false, ${now.toISOString()})
        on conflict (wallet, meme_id) do update set
          qty_cents = positions.qty_cents + ${data.cents},
          cost_cents = positions.cost_cents + ${data.cents},
          holding = true,
          last_tick = ${now.toISOString()},
          opened_at = case when positions.holding = false then ${now.toISOString()} else positions.opened_at end
      `;
      return { ok: true as const, balanceCents: Number(paid[0].balance_cents) };
    }),
  );

export const sellBag = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const obj = asObj(input);
    return { wallet: str(obj.wallet, 80), memeId: str(obj.memeId, 80) };
  })
  .handler(async ({ data }) =>
    serial(async () => {
      if (!isUserWallet(data.wallet)) return fail("Connect a demo wallet first.");
      const sql = await getSql();
      const now = new Date();
      await boot(sql, now);
      const rows = await sql<{ cost_cents: number; holding: boolean | string }>`
        select cost_cents, holding from positions
        where wallet = ${data.wallet} and meme_id = ${data.memeId}
      `;
      if (!rows.length || !flag(rows[0].holding)) return fail("You are not holding that coin.");
      const refund = Math.floor(Number(rows[0].cost_cents) * SELL_RETURN);
      await sql`
        update positions
        set holding = false, qty_cents = 0, cost_cents = 0, last_tick = ${now.toISOString()}
        where wallet = ${data.wallet} and meme_id = ${data.memeId}
      `;
      const bals = await sql<{ balance_cents: number }>`
        update wallets set balance_cents = balance_cents + ${refund}
        where address = ${data.wallet}
        returning balance_cents
      `;
      return {
        ok: true as const,
        balanceCents: Number(bals[0]?.balance_cents ?? 0),
        refundCents: refund,
      };
    }),
  );

export const claimFaucet = createServerFn({ method: "POST" })
  .validator((input: unknown) => ({ wallet: str(asObj(input).wallet, 80) }))
  .handler(async ({ data }) =>
    serial(async () => {
      if (!isUserWallet(data.wallet)) return fail("Connect a demo wallet first.");
      const sql = await getSql();
      const now = new Date();
      await boot(sql, now);
      const rows = await sql<{ last_faucet: string | Date | null; balance_cents: number }>`
        select last_faucet, balance_cents from wallets where address = ${data.wallet}
      `;
      if (!rows.length) return fail("Connect the wallet again.");
      const last = iso(rows[0].last_faucet);
      if (last) {
        const wait = new Date(last).getTime() + FAUCET_COOLDOWN_MS - now.getTime();
        if (wait > 0) {
          const mins = Math.ceil(wait / 60000);
          return fail(`Faucet refills in ${mins} min.`);
        }
      }
      const bals = await sql<{ balance_cents: number }>`
        update wallets
        set balance_cents = balance_cents + ${FAUCET_CENTS}, last_faucet = ${now.toISOString()}
        where address = ${data.wallet}
        returning balance_cents
      `;
      return { ok: true as const, balanceCents: Number(bals[0]?.balance_cents ?? 0), addedCents: FAUCET_CENTS };
    }),
  );

async function pullMeme(sql: Sql, id: string, wallet: string | null, reason: string): Promise<Fail | { ok: true; balanceCents: number }> {
  const now = new Date().toISOString();
  const rows = await sql<{ wallet: string; is_seed: boolean | string }>`
    update memes
    set status = 'rejected', reject_reason = ${reason}, hour_key = null, slot_index = null, launch_at = null
    where id = ${id}
      and status = 'scheduled'
      and launch_at > ${now}
      and is_seed = false
      and (${wallet}::text is null or wallet = ${wallet})
    returning wallet, is_seed
  `;
  if (!rows.length) return fail("That coin has already left the queue, or it is not yours.");
  const cost = submitCostCents();
  const bals = await sql<{ balance_cents: number }>`
    update wallets set balance_cents = balance_cents + ${cost}
    where address = ${rows[0].wallet}
    returning balance_cents
  `;
  return { ok: true, balanceCents: Number(bals[0]?.balance_cents ?? 0) };
}

export const cancelMeme = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const obj = asObj(input);
    return { wallet: str(obj.wallet, 80), id: str(obj.id, 80) };
  })
  .handler(async ({ data }) =>
    serial(async () => {
      if (!isUserWallet(data.wallet)) return fail("Connect a demo wallet first.");
      const sql = await getSql();
      await boot(sql, new Date());
      return pullMeme(sql, data.id, data.wallet, "You pulled this coin before it launched. The entry fee was returned.");
    }),
  );

export const adminList = createServerFn({ method: "POST" })
  .validator((input: unknown) => ({ code: str(asObj(input).code, 40) }))
  .handler(async ({ data }) =>
    serial(async () => {
      if (data.code !== FLOOR_CODE) return fail("Wrong reviewer code.");
      const sql = await getSql();
      const now = new Date();
      await boot(sql, now);
      const rows = await sql<MemeRow>`
        select * from memes where is_seed = false order by created_at desc limit 40
      `;
      return {
        ok: true as const,
        memes: rows.map((row) => {
          const coin = toCoin(row, now.getTime());
          return {
            id: row.id,
            title: row.title,
            ticker: row.ticker,
            caption: row.caption,
            walletLabel: labelOf(row.wallet, false),
            status: row.status === "rejected" ? "rejected" : (coin?.phase ?? row.status),
            rejectReason: row.reject_reason,
            launchAt: iso(row.launch_at),
            mediaUrl: row.media_url,
            mediaKind: row.media_kind === "video" ? ("video" as const) : ("image" as const),
            canPull: row.status === "scheduled" && !!row.launch_at && new Date(row.launch_at).getTime() > now.getTime(),
          };
        }),
      };
    }),
  );

export const adminReject = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const obj = asObj(input);
    return { code: str(obj.code, 40), id: str(obj.id, 80), reason: str(obj.reason, 160) };
  })
  .handler(async ({ data }) =>
    serial(async () => {
      if (data.code !== FLOOR_CODE) return fail("Wrong reviewer code.");
      const sql = await getSql();
      await boot(sql, new Date());
      const reason = data.reason || "A reviewer pulled this coin before launch. The entry fee was returned.";
      const result = await pullMeme(sql, data.id, null, reason);
      if (!result.ok) return result;
      return { ok: true as const };
    }),
  );
