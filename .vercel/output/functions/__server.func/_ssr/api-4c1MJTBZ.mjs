import { _ as prevDayKey, a as dayStart, b as splitPool, c as floorSlotsDue, d as hourKeyOf, f as hourLabel, g as phaseOf, h as nextOpenSlots, i as dayLabel, l as hash, m as metricsAt, n as WINDOW_MS, o as deskMint, p as hourStart, r as dayKeyOf, s as elapsedSec, u as hourFeeModel, y as snapshotBags } from "./engine-B4Vkm2lN.mjs";
import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
import { n as moderateText, t as cleanTicker } from "./moderate-KSUeoklM.mjs";
import { a as SELL_RETURN, c as submitCostCents, l as usdToCents, n as FAUCET_COOLDOWN_MS, o as START_CENTS, t as FAUCET_CENTS } from "./money-u3QFFiJD.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/api-4c1MJTBZ.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var _0002_pym_default = "create table if not exists wallets (\n  address text primary key,\n  provider text not null,\n  balance_cents integer not null,\n  last_faucet timestamptz,\n  created_at timestamptz not null default now()\n);\n\ncreate table if not exists memes (\n  id text primary key,\n  wallet text not null,\n  title text not null,\n  ticker text not null,\n  caption text not null default '',\n  media_kind text not null,\n  media_url text not null,\n  is_seed boolean not null default false,\n  status text not null,\n  reject_reason text,\n  hour_key text,\n  slot_index integer,\n  launch_at timestamptz,\n  seed_key text not null,\n  created_at timestamptz not null default now()\n);\n\ncreate index if not exists memes_launch_idx on memes (launch_at);\ncreate index if not exists memes_wallet_idx on memes (wallet);\ncreate index if not exists memes_hour_idx on memes (hour_key);\n\ncreate table if not exists positions (\n  wallet text not null,\n  meme_id text not null,\n  qty_cents integer not null default 0,\n  cost_cents integer not null default 0,\n  held_seconds integer not null default 0,\n  last_tick timestamptz not null default now(),\n  holding boolean not null default true,\n  qualified boolean not null default false,\n  primary key (wallet, meme_id)\n);\n\ncreate table if not exists settlements (\n  id text primary key,\n  summary text not null,\n  created_at timestamptz not null default now()\n);\n\ncreate table if not exists rewards (\n  id text primary key,\n  wallet text not null,\n  meme_id text,\n  kind text not null,\n  amount_cents integer not null,\n  note text not null,\n  hour_key text,\n  day_key text,\n  created_at timestamptz not null default now()\n);\n\ncreate index if not exists rewards_wallet_idx on rewards (wallet);\n\ncreate unique index if not exists memes_slot_uidx\n  on memes (hour_key, slot_index)\n  where status = 'scheduled';\n\n";
var _0003_pym_ops_default = "alter table rewards add column if not exists payout_key text;\ncreate unique index if not exists rewards_payout_key_uidx on rewards (payout_key) where payout_key is not null;\n\nalter table wallets add column if not exists owed_cents integer not null default 0;\n\nalter table positions add column if not exists opened_at timestamptz;\n";
/**
* Migration bookkeeping shared by the two appliers — `scripts/migrate.mjs`
* (deploy, `readdir`) and `src/lib/db.ts` (PGLite preview, `import.meta.glob`).
*
* Applied files are keyed by BASENAME, so the same file applies once no matter
* which directory it is globbed from. That is what makes the auth schema safe to
* copy from `migrations/auth/` into `migrations/` when an app turns sign-in on:
* a database that already has `0001_auth.sql` will not re-run it.
*
* Neither applier descends into subdirectories, so `migrations/auth/*.sql` is
* out of scope for both until it is copied up.
*/
/**
* The `_migrations` key for a migration path (or bare filename).
* @param {string} path
* @returns {string}
*/
function migrationName(path) {
	return path.split("/").pop() ?? path;
}
/**
* @param {string} path
* @returns {boolean}
*/
function isMigrationFile(path) {
	return path.endsWith(".sql");
}
/**
* Migrations in `paths` that are not yet in `applied`, in apply order.
* Non-`.sql` entries (a `readdir` also yields `migrations/auth/`) are dropped.
* @param {Iterable<string>} paths
* @param {Iterable<string>} applied
* @returns {Array<{ name: string, path: string }>}
*/
function pendingMigrations(paths, applied) {
	const done = new Set(applied);
	return [...paths].filter(isMigrationFile).map((path) => ({
		name: migrationName(path),
		path
	})).sort((a, b) => a.name.localeCompare(b.name)).filter(({ name }) => !done.has(name));
}
function env(key) {
	return process.env[key]?.trim() || void 0;
}
/**
* Workspace preview vs deployed app. The deployer writes GROK_PROJECT_ID on
* every publish; the sandbox preview never has it. Single source of truth for
* the split — gate audience, gate endpoints and connector-token semantics all
* key off this predicate.
*/
function isWorkspacePreview() {
	return !env("GROK_PROJECT_ID");
}
var rawDatabaseUrl = typeof process !== "undefined" ? process.env.DATABASE_URL : void 0;
var databaseUrl = rawDatabaseUrl && rawDatabaseUrl.trim() ? rawDatabaseUrl : void 0;
/**
* Active backend: real **Neon** when `DATABASE_URL` is set (deployed / configured
* sandbox), otherwise a local embedded **PGLite** (Postgres compiled to WASM) so
* the app has a working database even with nothing configured — the live preview
* included. Swap in Neon later by just setting `DATABASE_URL`; no code changes.
*/
var dbSource = databaseUrl ? "neon" : "pglite";
/**
* Init state lives on globalThis as promises: dev HMR creates new instances of
* this module, and two instances racing module-level state would open a second
* pool or run two concurrent PGLite migration passes (whose duplicate
* `_migrations` insert rejects — and would get memoized, poisoning every later
* `getSql()`). A failed init clears its slot so the next call retries.
*/
var globalRef = globalThis;
/**
* Result-type parity: Postgres sends every value as text plus a type OID — the
* JS value is the DRIVER's parsing choice, and pg and PGLite disagree (pg:
* int8 -> string, date -> local-midnight Date; PGLite: int8 -> BigInt, which
* JSON.stringify rejects, date -> UTC Date). Normalize both so preview and
* production return identical, JSON-safe shapes:
*   int8/bigint (incl. count(*)) -> number (past 2^53 loses precision — cast
*                                   `::text` if you ever need huge integers)
*   date                         -> 'YYYY-MM-DD' string
*   interval                     -> Postgres interval text
* numeric already comes back as a string on both (arbitrary precision).
*/
var OID_INT8 = 20;
var OID_DATE = 1082;
var OID_INTERVAL = 1186;
var identity = (v) => v;
/** Wrap a query runner in the tagged-template + `.query()` `Sql` surface. */
function toSql(run) {
	const sql = (async (strings, ...values) => {
		let text = strings[0];
		for (let i = 0; i < values.length; i += 1) text += `$${i + 1}${strings[i + 1]}`;
		return run(text, values);
	});
	sql.query = (text, params = []) => run(text, params);
	return sql;
}
function createNeonSql() {
	globalRef.__pgSqlPromise__ ??= (async () => {
		const { Pool, types } = await import("../_libs/pg.mjs").then((n) => n.t);
		types.setTypeParser(OID_INT8, Number);
		types.setTypeParser(OID_DATE, identity);
		types.setTypeParser(OID_INTERVAL, identity);
		const pool = new Pool({ connectionString: databaseUrl });
		return toSql(async (text, params) => {
			return (await pool.query(text, params)).rows;
		});
	})().catch((err) => {
		globalRef.__pgSqlPromise__ = void 0;
		throw err;
	});
	return globalRef.__pgSqlPromise__;
}
async function createPgliteSql() {
	globalRef.__pgliteInstance__ ??= (async () => {
		const { PGlite } = await import("../_libs/electric-sql__pglite.mjs").then((n) => n.t);
		const pg = new PGlite({ parsers: {
			[OID_INT8]: Number,
			[OID_DATE]: identity,
			[OID_INTERVAL]: identity
		} });
		await pg.waitReady;
		await pg.exec("create table if not exists _migrations (name text primary key, applied_at timestamptz not null default now())");
		return pg;
	})().catch((err) => {
		globalRef.__pgliteInstance__ = void 0;
		throw err;
	});
	const pg = await globalRef.__pgliteInstance__;
	const migrate = async () => {
		const migrations = /* #__PURE__ */ Object.assign({
			"/migrations/0002_pym.sql": _0002_pym_default,
			"/migrations/0003_pym_ops.sql": _0003_pym_ops_default
		});
		const done = (await pg.query("select name from _migrations")).rows.map((r) => r.name);
		for (const { name, path } of pendingMigrations(Object.keys(migrations), done)) await pg.transaction(async (tx) => {
			await tx.exec(migrations[path]);
			await tx.query("insert into _migrations (name) values ($1)", [name]);
		});
	};
	const pass = (globalRef.__pgliteMigrateChain__ ?? Promise.resolve()).catch(() => void 0).then(migrate);
	globalRef.__pgliteMigrateChain__ = pass;
	await pass;
	return toSql(async (text, params) => {
		return (await pg.query(text, params)).rows;
	});
}
var sqlPromise = null;
async function createSql() {
	if (typeof window !== "undefined") throw new Error("@/lib/db is server-only — call getSql() from a createServerFn handler or a server route loader, never from client code.");
	if (dbSource === "pglite" && !isWorkspacePreview()) throw new Error("DATABASE_URL is missing on a published app. Refusing to start on a disposable database.");
	return dbSource === "neon" ? createNeonSql() : createPgliteSql();
}
/**
* Get the shared, **server-only** SQL client. Neon when `DATABASE_URL` is set,
* otherwise the local PGLite fallback. Memoized — safe to call per request.
*
* Schema comes from `migrations/*.sql`, auto-applied before the first query on
* both backends — define tables there, never inline in server functions.
*/
function getSql() {
	sqlPromise ??= createSql().catch((err) => {
		sqlPromise = null;
		throw err;
	});
	return sqlPromise;
}
/**
* Finish DB bootstrap before the server handles traffic.
*
* - **PGLite** (preview / no `DATABASE_URL`): open the in-memory DB and apply
*   `migrations/*.sql`. Idempotent — concurrent callers share one promise.
* - **Neon**: no-op (pool is created lazily on first query).
*
* Vite `configureServer` awaits this at dev startup; production imports of this
* module kick it off immediately (see bottom of file).
*/
function ensureDbReady() {
	if (dbSource !== "pglite") return Promise.resolve();
	return getSql().then(() => void 0);
}
var globalBoot = globalThis;
if (typeof window === "undefined" && dbSource === "pglite") globalBoot.__pgBootstrapPromise__ ??= ensureDbReady().catch((err) => {
	globalBoot.__pgBootstrapPromise__ = void 0;
	console.error("[db] PGLite bootstrap failed:", err);
	throw err;
});
var CATALOG = [
	{
		slug: "toaster-cat",
		title: "Toaster Cat",
		ticker: "TOAST",
		caption: "He popped up and never went back down."
	},
	{
		slug: "chain-frog",
		title: "Chain Frog",
		ticker: "FROG",
		caption: "Sitting on a melting coin like it pays rent."
	},
	{
		slug: "laser-pigeon",
		title: "Laser Pigeon",
		ticker: "LAZR",
		caption: "The alley elected him. He accepted."
	},
	{
		slug: "dumpster-diamond",
		title: "Dumpster Diamond",
		ticker: "DMPD",
		caption: "Found it. Not asking where."
	},
	{
		slug: "boba-samurai",
		title: "Boba Samurai",
		ticker: "BOBA",
		caption: "Pearls for armor. Taro for patience."
	},
	{
		slug: "cry-goldfish",
		title: "Cry Goldfish",
		ticker: "CRYF",
		caption: "The bowl cracked. The moon did not."
	},
	{
		slug: "moon-burrito",
		title: "Moon Burrito",
		ticker: "BURR",
		caption: "Cheddar trail, straight up."
	},
	{
		slug: "ticket-goblin",
		title: "Ticket Goblin",
		ticker: "FINE",
		caption: "He writes the fine. He is the fine."
	}
];
function catalogFor(hourKey, slot) {
	return CATALOG[(hash(hourKey) + slot * 3) % CATALOG.length];
}
var ADDR = /^pym[1-9A-HJ-NP-Za-km-z]{32}$/;
var FLOOR_CODE = "pym-floor";
var gate = Promise.resolve();
var bootFlight = null;
function serial(fn) {
	const run = gate.then(fn, fn);
	gate = run.then(() => void 0, () => void 0);
	return run;
}
function asObj(input) {
	if (input && typeof input === "object") return input;
	return {};
}
function str(value, max) {
	if (typeof value !== "string") return "";
	return value.trim().slice(0, max);
}
function nextBoundary(now) {
	const start = hourStart(hourKeyOf(now)).getTime();
	const slot = Math.floor((now.getTime() - start) / WINDOW_MS) + 1;
	if (slot < 6) return {
		at: new Date(start + slot * WINDOW_MS),
		slot
	};
	return {
		at: new Date(start + 36e5),
		slot: 0
	};
}
function iso(value) {
	if (!value) return null;
	const d = value instanceof Date ? value : new Date(value);
	if (Number.isNaN(d.getTime())) return null;
	return d.toISOString();
}
function flag(value) {
	return value === true || value === "t" || value === "true" || value === 1;
}
function isUserWallet(address) {
	return ADDR.test(address);
}
function fail(reason) {
	return {
		ok: false,
		reason
	};
}
function labelOf(address, isSeed) {
	if (isSeed || address === "floor") return "Floor desk";
	if (address === "platform") return "Platform";
	if (address === "reward-book") return "Reward book";
	if (address.length < 12) return address;
	return `${address.slice(0, 4)}…${address.slice(-4)}`;
}
function toCoin(row, nowMs) {
	const launchIso = iso(row.launch_at);
	if (!launchIso || !row.hour_key || row.slot_index == null) return null;
	const launchMs = new Date(launchIso).getTime();
	const phase = phaseOf(launchMs, nowMs);
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
		mint: deskMint(row.seed_key)
	};
}
async function boot(sql, now) {
	if (!bootFlight) bootFlight = runBoot(sql, now).finally(() => {
		bootFlight = null;
	});
	await bootFlight;
}
async function runBoot(sql, now) {
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
async function ensureFloor(sql, now) {
	const due = floorSlotsDue(now);
	if (!due.length) return;
	const takenRows = await sql`
    select hour_key, slot_index from memes
    where status = 'scheduled' and hour_key like ${`${dayKeyOf(now)}%`}
  `;
	const taken = new Set(takenRows.map((row) => `${row.hour_key}:${row.slot_index}`));
	const missing = due.filter((slot) => !taken.has(`${slot.hourKey}:${slot.slot}`));
	const chunk = 24;
	for (let i = 0; i < missing.length; i += chunk) {
		const part = missing.slice(i, i + chunk);
		const values = [];
		const tuples = part.map((slot, index) => {
			const item = catalogFor(slot.hourKey, slot.slot);
			const base = index * 9;
			values.push(`floor-${slot.hourKey}-${slot.slot}`, item.title, item.ticker, item.caption, `/memes/${item.slug}.jpg`, slot.hourKey, slot.slot, slot.launch.toISOString(), `floor:${slot.hourKey}:${slot.slot}`);
			return `($${base + 1}, 'floor', $${base + 2}, $${base + 3}, $${base + 4}, 'image', $${base + 5}, true, 'scheduled', $${base + 6}, $${base + 7}, $${base + 8}, $${base + 9})`;
		});
		await sql.query(`insert into memes (
        id, wallet, title, ticker, caption, media_kind, media_url, is_seed, status,
        hour_key, slot_index, launch_at, seed_key
      ) values ${tuples.join(", ")}
      on conflict (id) do nothing`, values);
	}
}
async function accrue(sql, now) {
	const rows = await sql`
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
		const add = holding && to > from ? Math.floor((to - from) / 1e3) : 0;
		const held = Number(row.held_seconds) + add;
		const qualified = flag(row.qualified) || nowMs >= endMs && holding;
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
async function credit(sql, wallet, cents, kind, note, hourKey, dayKey, memeId, payoutKey) {
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
async function settleHours(sql, now) {
	const rows = await sql`
    select distinct hour_key from memes where status = 'scheduled' and hour_key is not null
  `;
	const done = await sql`select id from settlements where id like 'hour:%'`;
	const doneSet = new Set(done.map((row) => row.id));
	const pending = rows.map((row) => row.hour_key).filter((key) => hourStart(key).getTime() + 36e5 <= now.getTime() && !doneSet.has(`hour:${key}`)).sort();
	if (pending[0]) await settleOneHour(sql, pending[0], hourStart(pending[0]).getTime() + 36e5);
	await parkOpenHours(sql);
	await settleDayIfDue(sql, now);
}
async function parkOpenHours(sql) {
	const closed = await sql`select id from settlements where id like 'day:%'`;
	const doneDays = new Set(closed.map((row) => row.id.slice(4)));
	const rows = await sql`
    select id, summary from settlements where id like 'hour:%'
  `;
	for (const row of rows) {
		let parsed = {};
		try {
			parsed = JSON.parse(row.summary);
		} catch {
			continue;
		}
		const hourKey = parsed.hourKey || row.id.slice(5);
		const dayKey = hourKey.slice(0, 10);
		if (doneDays.has(dayKey)) continue;
		if (!parsed.remainingUsd || parsed.remainingUsd <= 0) continue;
		const existing = await sql`
      select count(*) as n from rewards where kind = 'hour_platform' and hour_key = ${hourKey}
    `;
		if (Number(existing[0]?.n ?? 0) > 0) continue;
		const cents = usdToCents(parsed.remainingUsd);
		if (cents <= 0) continue;
		await credit(sql, "platform", cents, "hour_platform", `Parked the desk's slice for ${hourLabel(hourKey)}`, hourKey, dayKey, parsed.winnerId ?? null);
	}
}
var DUST_CENTS = 50;
var PAY_CHUNK = 120;
var SNIPE_MS = 6e4;
async function payMany(sql, rows, kind, note, hourKey, dayKey, memeId, keyPrefix) {
	const paying = rows.filter((row) => row.cents > 0 && row.wallet && row.wallet !== "platform" && row.wallet !== "floor");
	const chunk = 40;
	for (let i = 0; i < paying.length; i += chunk) {
		const part = paying.slice(i, i + chunk);
		const rewardValues = [];
		const rewardTuples = part.map((row, index) => {
			const base = index * 9;
			rewardValues.push(crypto.randomUUID(), row.wallet, memeId, kind, row.cents, note, hourKey, dayKey, `${keyPrefix}:${row.wallet}`);
			return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}, $${base + 8}, $${base + 9})`;
		});
		await sql.query(`with ins as (
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
       on conflict (address) do nothing`, rewardValues);
	}
}
function payRange(pays) {
	if (!pays.length) return {
		minCents: 0,
		maxCents: 0,
		eachCents: 0
	};
	const amounts = pays.map((row) => row.cents).sort((a, b) => a - b);
	return {
		minCents: amounts[0],
		maxCents: amounts[amounts.length - 1],
		eachCents: amounts[Math.floor(amounts.length / 2)]
	};
}
async function settleOneHour(sql, hourKey, endMs) {
	const coins = (await sql`
    select * from memes where status = 'scheduled' and hour_key = ${hourKey}
  `).map((row) => toCoin(row, endMs)).filter((coin) => !!coin);
	const fees = hourFeeModel(coins);
	const winner = coins.find((coin) => coin.id === fees.winnerId) ?? null;
	const winnerCents = usdToCents(fees.winnerCut);
	const holderPool = usdToCents(fees.holderCut);
	if ((await sql`select id from settlements where id = ${`hour:${hourKey}`}`).length) return;
	const heldRows = winner ? await sql`
        select wallet, qty_cents, holding, opened_at from positions where meme_id = ${winner.id}
      ` : [];
	const known = [];
	for (const row of heldRows) {
		if (!flag(row.holding) || Number(row.qty_cents) <= 0) continue;
		if (row.wallet === "platform" || row.wallet === "floor" || row.wallet === "reward-book") continue;
		const openedIso = iso(row.opened_at);
		if ((openedIso ? new Date(openedIso).getTime() : 0) > endMs - SNIPE_MS) continue;
		known.push({
			wallet: row.wallet,
			tokens: Number(row.qty_cents)
		});
	}
	const bags = winner ? snapshotBags(winner.seedKey, winner.holders, known) : [];
	const pays = splitPool(holderPool, bags).sort((a, b) => a.wallet < b.wallet ? -1 : 1);
	const range = payRange(pays);
	const summary = {
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
		maxCents: range.maxCents
	};
	const jobId = `hourjob:${hourKey}`;
	const jobRows = await sql`select summary from settlements where id = ${jobId}`;
	let offset = 0;
	if (jobRows[0]?.summary) try {
		offset = Number(JSON.parse(jobRows[0].summary).offset) || 0;
	} catch {
		offset = 0;
	}
	const dayKey = hourKey.slice(0, 10);
	if (offset === 0) {
		const parked = usdToCents(fees.remaining);
		if (parked > 0) await credit(sql, "platform", parked, "hour_platform", `Parked the desk's slice for ${hourLabel(hourKey)}`, hourKey, dayKey, winner?.id ?? null, `hour_platform:${hourKey}`);
		if (winner && winnerCents > 0) await credit(sql, winner.wallet, winnerCents, "hour_creator", `${winner.ticker} won the ${hourLabel(hourKey)} hour`, hourKey, dayKey, winner.id, `hour_creator:${hourKey}`);
		else if (holderPool > 0 && pays.length === 0) await credit(sql, "platform", holderPool, "platform", `No holders to pay for ${winner?.ticker ?? hourKey}`, hourKey, dayKey, winner?.id ?? null, `hour_empty:${hourKey}`);
	}
	const slice = pays.slice(offset, offset + PAY_CHUNK);
	if (slice.length > 0 && winner) await payMany(sql, slice, "hour_holders", `Holding ${winner.ticker} at the bell. Paid by bag size.`, hourKey, dayKey, winner.id, `hour_holders:${hourKey}`);
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
async function debitPlatform(sql, cents, payoutKey, note, dayKey) {
	if (cents <= 0) return true;
	if (!(await sql`
    insert into rewards (id, wallet, meme_id, kind, amount_cents, note, hour_key, day_key, payout_key)
    values (${crypto.randomUUID()}, 'platform', null, 'day_debit', ${cents}, ${note}, null, ${dayKey}, ${payoutKey})
    on conflict (payout_key) where payout_key is not null do nothing
    returning id
  `).length) return true;
	if ((await sql`
    update wallets set balance_cents = balance_cents - ${cents}
    where address = 'platform' and balance_cents >= ${cents}
    returning balance_cents
  `).length) return true;
	await sql`delete from rewards where payout_key = ${payoutKey}`;
	return false;
}
async function payDailyPool(sql, yday, winner, poolCents, fromTreasury, coins) {
	if (poolCents <= 0) return true;
	const tag = fromTreasury ? "p" : "o";
	const jobId = `dayjob:${yday}:${tag}`;
	const creatorCents = winner ? Math.floor(poolCents * .2) : 0;
	const holderBudget = Math.floor(poolCents * .15);
	const held = await sql`
    select wallet, meme_id, qty_cents from positions
    where holding = true and qty_cents > 0
      and wallet not in ('reward-book', 'floor', 'platform')
  `;
	const byMeme = /* @__PURE__ */ new Map();
	for (const row of held) {
		const list = byMeme.get(row.meme_id) ?? [];
		list.push({
			wallet: row.wallet,
			tokens: Number(row.qty_cents)
		});
		byMeme.set(row.meme_id, list);
	}
	const merged = /* @__PURE__ */ new Map();
	for (const coin of coins) for (const bag of snapshotBags(coin.seedKey, coin.holders, byMeme.get(coin.id) ?? [])) merged.set(bag.wallet, (merged.get(bag.wallet) ?? 0) + bag.tokens);
	const pays = splitPool(holderBudget, [...merged].map(([wallet, tokens]) => ({
		wallet,
		tokens
	}))).sort((a, b) => a.wallet < b.wallet ? -1 : 1);
	const holderPaid = pays.reduce((sum, row) => sum + row.cents, 0);
	const keep = poolCents - creatorCents - holderPaid;
	const jobRows = await sql`select summary from settlements where id = ${jobId}`;
	let offset = 0;
	if (jobRows[0]?.summary) try {
		offset = Number(JSON.parse(jobRows[0].summary).offset) || 0;
	} catch {
		offset = 0;
	}
	if (offset === 0 && winner && creatorCents > 0) {
		if (fromTreasury) {
			if (!await debitPlatform(sql, creatorCents, `day_debit:${yday}:${tag}:creator`, `Daily winner paid from the treasury`, yday)) return false;
		}
		await credit(sql, winner.wallet, creatorCents, "day_creator", `${winner.ticker} went the highest on ${dayLabel(yday)}`, null, yday, winner.id, `day_creator:${yday}:${tag}`);
	}
	const slice = pays.slice(offset, offset + PAY_CHUNK);
	if (fromTreasury && slice.length > 0) {
		if (!await debitPlatform(sql, slice.reduce((sum, row) => sum + row.cents, 0), `day_debit:${yday}:${tag}:${offset}`, `Daily holders paid from the treasury`, yday)) return false;
	}
	if (slice.length > 0) await payMany(sql, slice, "day_holders", `Still holding a coin on ${dayLabel(yday)}. Paid by bag size.`, null, yday, null, `day_holders:${yday}:${tag}`);
	const next = offset + slice.length;
	if (next < pays.length) {
		await sql`
      insert into settlements (id, summary)
      values (${jobId}, ${JSON.stringify({ offset: next })})
      on conflict (id) do update set summary = excluded.summary
    `;
		return false;
	}
	if (!fromTreasury && keep > 0) await credit(sql, "platform", keep, "platform", `Platform share for ${dayLabel(yday)}`, null, yday, null, `day_platform:${yday}`);
	await sql`delete from settlements where id = ${jobId}`;
	return true;
}
async function settleDayIfDue(sql, now) {
	const today = dayKeyOf(now);
	const yday = prevDayKey(today);
	const id = `day:${yday}`;
	if ((await sql`select id from settlements where id = ${id}`).length) return;
	const start = dayStart(yday);
	const end = dayStart(today);
	const memeRows = await sql`
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
	const hourKeys = [...new Set(memeRows.map((row) => row.hour_key).filter((key) => !!key))];
	if (hourKeys.length) {
		const settled = await sql`select id from settlements where id like 'hour:%'`;
		const have = new Set(settled.map((row) => row.id));
		if (hourKeys.some((key) => !have.has(`hour:${key}`))) return;
	}
	const coins = memeRows.map((row) => toCoin(row, end.getTime())).filter((coin) => !!coin);
	const byHour = /* @__PURE__ */ new Map();
	for (const coin of coins) {
		const list = byHour.get(coin.hourKey) ?? [];
		list.push(coin);
		byHour.set(coin.hourKey, list);
	}
	let remaining = 0;
	for (const group of byHour.values()) remaining += hourFeeModel(group).remaining;
	const winner = coins.reduce((best, coin) => !best || coin.ath > best.ath ? coin : best, null);
	const parkedRows = await sql`
    select coalesce(sum(amount_cents), 0) as n from rewards
    where wallet = 'platform' and kind = 'hour_platform' and day_key = ${yday}
  `;
	const parked = Number(parkedRows[0]?.n ?? 0);
	const booked = usdToCents(remaining);
	const unparked = Math.max(0, booked - parked);
	if (!await payDailyPool(sql, yday, winner, parked, true, coins)) return;
	if (!await payDailyPool(sql, yday, winner, unparked, false, coins)) return;
	await sql`
    insert into settlements (id, summary)
    values (${id}, ${JSON.stringify({
		dayKey: yday,
		remaining,
		parked,
		unparked,
		winnerId: winner?.id ?? null
	})})
    on conflict (id) do nothing
  `;
}
async function loadArena(wallet) {
	const sql = await getSql();
	const now = /* @__PURE__ */ new Date();
	await boot(sql, now);
	const nowMs = now.getTime();
	const dayKey = dayKeyOf(now);
	const hourKey = hourKeyOf(now);
	const start = dayStart(dayKey);
	const horizon = new Date(nowMs + 288e5);
	const coins = (await sql`
    select * from memes
    where status = 'scheduled'
      and launch_at >= ${start.toISOString()}
      and launch_at < ${horizon.toISOString()}
    order by launch_at asc
  `).map((row) => toCoin(row, nowMs)).filter((coin) => !!coin);
	const byHour = /* @__PURE__ */ new Map();
	for (const coin of coins) {
		const list = byHour.get(coin.hourKey) ?? [];
		list.push(coin);
		byHour.set(coin.hourKey, list);
	}
	const pack = (key) => {
		const slots = Array.from({ length: 6 }, () => null);
		for (const coin of byHour.get(key) ?? []) if (coin.slot >= 0 && coin.slot < 6 && !slots[coin.slot]) slots[coin.slot] = coin;
		return slots;
	};
	const hourSlots = pack(hourKey);
	const hourCoins = hourSlots.filter((coin) => !!coin);
	const live = hourCoins.find((coin) => coin.phase === "live") ?? null;
	const hourRank = hourCoins.filter((coin) => coin.phase !== "upcoming").slice().sort((a, b) => b.score - a.score);
	const upcoming = [
		1,
		2,
		3
	].map((delta) => {
		const key = hourKeyOf(new Date(hourStart(hourKey).getTime() + delta * 60 * 60 * 1e3));
		return {
			hourKey: key,
			hourLabel: hourLabel(key),
			coins: pack(key)
		};
	});
	const todayLaunched = coins.filter((coin) => coin.dayKey === dayKey && coin.phase !== "upcoming");
	const dailyTop = todayLaunched.slice().sort((a, b) => b.ath - a.ath).slice(0, 8);
	const hourFees = hourFeeModel(hourCoins);
	const hourKeys = new Set(todayLaunched.map((coin) => coin.hourKey));
	let dayRemaining = 0;
	for (const key of hourKeys) dayRemaining += hourFeeModel(byHour.get(key) ?? []).remaining;
	const dayWinner = todayLaunched.reduce((best, coin) => !best || coin.ath > best.ath ? coin : best, null);
	const payoutRows = await sql`
    select summary from settlements where id like 'hour:%' order by id desc limit 1
  `;
	let lastPayout = null;
	if (payoutRows[0]?.summary) try {
		const parsed = JSON.parse(payoutRows[0].summary);
		lastPayout = parsed.hourKey ? {
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
			maxCents: parsed.maxCents ?? parsed.eachCents ?? 0
		} : null;
	} catch {
		lastPayout = null;
	}
	const clerk = {
		automatic: true,
		lastHourLabel: lastPayout?.hourLabel ?? null,
		holderWallets: lastPayout?.holderWallets ?? 0,
		eachCents: lastPayout?.eachCents ?? 0,
		bySize: lastPayout?.bySize ?? false,
		minCents: lastPayout?.minCents ?? lastPayout?.eachCents ?? 0,
		maxCents: lastPayout?.maxCents ?? lastPayout?.eachCents ?? 0,
		winnerTicker: lastPayout?.winnerTicker ?? ""
	};
	const moneyRows = await sql`
    select
      coalesce((select sum(amount_cents) from rewards where wallet = 'platform' and kind = 'listing'), 0) as listing,
      coalesce((select sum(amount_cents) from rewards where wallet = 'platform' and kind = 'hour_platform'), 0) as parked,
      coalesce((select balance_cents from wallets where address = 'platform'), 0) as balance_cents
  `;
	const treasury = {
		balanceCents: Number(moneyRows[0]?.balance_cents ?? 0),
		listingCents: Number(moneyRows[0]?.listing ?? 0),
		parkedCents: Number(moneyRows[0]?.parked ?? 0)
	};
	const nextRows = await sql`
    select title, ticker, launch_at, slot_index from memes
    where status = 'scheduled' and launch_at > ${now.toISOString()}
    order by launch_at asc
    limit 1
  `;
	const deployedRows = await sql`
    select count(*) as n from memes
    where status = 'scheduled'
      and launch_at >= ${start.toISOString()}
      and launch_at <= ${now.toISOString()}
  `;
	const next = nextRows[0];
	const boundary = nextBoundary(now);
	const scheduledAt = next ? iso(next.launch_at) : null;
	const scheduledMs = scheduledAt ? new Date(scheduledAt).getTime() : Number.POSITIVE_INFINITY;
	const useScheduled = !!next && scheduledMs <= boundary.at.getTime() + 1e3;
	const worker = {
		automatic: true,
		holdsTokens: 0,
		nextLaunchAt: useScheduled ? scheduledAt : boundary.at.toISOString(),
		nextTitle: useScheduled ? next.title : null,
		nextTicker: useScheduled ? next.ticker : null,
		nextSlot: useScheduled ? Number(next.slot_index) : boundary.slot,
		deployedToday: Number(deployedRows[0]?.n ?? 0)
	};
	let balanceCents = null;
	let positions = [];
	let rewards = [];
	let yourNext = null;
	if (isUserWallet(wallet)) {
		const bals = await sql`
      select balance_cents from wallets where address = ${wallet}
    `;
		balanceCents = bals.length ? Number(bals[0].balance_cents) : null;
		positions = (await sql`
      select p.meme_id, p.qty_cents, p.held_seconds, p.holding, p.qualified, m.title, m.ticker, m.launch_at
      from positions p
      join memes m on m.id = p.meme_id
      where p.wallet = ${wallet}
      order by m.launch_at desc
      limit 12
    `).map((row) => {
			const launchIso = iso(row.launch_at) ?? now.toISOString();
			const endMs = new Date(launchIso).getTime() + WINDOW_MS;
			const left = Math.max(0, Math.ceil((endMs - nowMs) / 1e3));
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
				secondsLeft: left
			};
		});
		rewards = (await sql`
      select id, kind, amount_cents, note, hour_key, created_at
      from rewards where wallet = ${wallet}
      order by created_at desc
      limit 12
    `).map((row) => ({
			id: row.id,
			kind: row.kind,
			amountCents: Number(row.amount_cents),
			note: row.note,
			hourKey: row.hour_key,
			createdAt: iso(row.created_at) ?? now.toISOString()
		}));
		const nextRows = await sql`
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
		secondsLeftInWindow: live ? Math.max(0, Math.ceil((new Date(live.windowEnd).getTime() - nowMs) / 1e3)) : 0,
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
			dailyCreatorCut: dayRemaining * .2,
			allHoldersCut: dayRemaining * .15,
			platformCut: dayRemaining * .65,
			dayProjected: true,
			hourWinnerId: hourFees.winnerId,
			dayWinnerId: dayWinner?.id ?? null
		},
		clerk,
		worker,
		treasury,
		lastPayout,
		balanceCents,
		positions,
		rewards,
		yourNext
	};
}
function rivalsFor(coins, wallet, exceptId) {
	return coins.filter((coin) => coin.id !== exceptId).map((coin) => ({
		id: coin.id,
		title: coin.title,
		ticker: coin.ticker,
		slot: coin.slot,
		launchAt: coin.launchAt,
		walletLabel: coin.walletLabel,
		isYours: coin.wallet === wallet
	})).sort((a, b) => a.slot - b.slot);
}
async function hourRivals(sql, hourKey, wallet, exceptId, nowMs) {
	return rivalsFor((await sql`
    select * from memes where status = 'scheduled' and hour_key = ${hourKey} order by slot_index asc
  `).map((row) => toCoin(row, nowMs)).filter((coin) => !!coin), wallet, exceptId);
}
var getArena_createServerFn_handler = createServerRpc({
	id: "2e17e3fda221a500334102e616c92c5a37267caa56184f36857be9c68fd47d78",
	name: "getArena",
	filename: "src/lib/pym/api.ts"
}, (opts) => getArena.__executeServer(opts));
var getArena = createServerFn({ method: "POST" }).validator((input) => {
	return { wallet: str(asObj(input).wallet, 80) };
}).handler(getArena_createServerFn_handler, async ({ data }) => serial(() => loadArena(data.wallet)));
var getPreview_createServerFn_handler = createServerRpc({
	id: "e61d501871914f8287de84d0c070d5bd434d30742b76fdfe80ff6655fbd59c5d",
	name: "getPreview",
	filename: "src/lib/pym/api.ts"
}, (opts) => getPreview.__executeServer(opts));
var getPreview = createServerFn({ method: "GET" }).handler(getPreview_createServerFn_handler, async () => serial(async () => {
	const sql = await getSql();
	const now = /* @__PURE__ */ new Date();
	await boot(sql, now);
	const occupied = /* @__PURE__ */ new Set();
	const rows = await sql`
      select hour_key, slot_index from memes
      where status = 'scheduled' and launch_at > ${now.toISOString()}
    `;
	for (const row of rows) occupied.add(`${row.hour_key}:${row.slot_index}`);
	const [next] = nextOpenSlots(now, occupied, 1);
	if (!next) return {
		next: null,
		rivals: [],
		openSeats: 0,
		costCents: submitCostCents()
	};
	const rivals = await hourRivals(sql, next.hourKey, "", "", now.getTime());
	const openSeats = 6 - rivals.length - 1;
	return {
		next: {
			hourKey: next.hourKey,
			hourLabel: hourLabel(next.hourKey),
			slot: next.slot,
			launchAt: next.launch.toISOString()
		},
		rivals,
		openSeats: Math.max(0, openSeats),
		costCents: submitCostCents()
	};
}));
var connectWallet_createServerFn_handler = createServerRpc({
	id: "908c35d465c3e5d54e45a511d2626b670809daaea1794f1e7ff2f0094eb16931",
	name: "connectWallet",
	filename: "src/lib/pym/api.ts"
}, (opts) => connectWallet.__executeServer(opts));
var connectWallet = createServerFn({ method: "POST" }).validator((input) => {
	const obj = asObj(input);
	return {
		address: str(obj.address, 80),
		provider: obj.provider === "solflare" ? "solflare" : "phantom"
	};
}).handler(connectWallet_createServerFn_handler, async ({ data }) => serial(async () => {
	if (!isUserWallet(data.address)) return fail("That address is not a demo wallet.");
	const sql = await getSql();
	await boot(sql, /* @__PURE__ */ new Date());
	const rows = await sql`
        insert into wallets (address, provider, balance_cents)
        values (${data.address}, ${data.provider}, ${START_CENTS})
        on conflict (address) do update set provider = excluded.provider
        returning balance_cents, provider
      `;
	return {
		ok: true,
		address: data.address,
		provider: rows[0]?.provider === "solflare" ? "solflare" : "phantom",
		balanceCents: Number(rows[0]?.balance_cents ?? 0)
	};
}));
var submitMeme_createServerFn_handler = createServerRpc({
	id: "5f8048ecb586ce808c9e9387ddf2b066d80fb3dc1e0effdc129eb966ab5385b6",
	name: "submitMeme",
	filename: "src/lib/pym/api.ts"
}, (opts) => submitMeme.__executeServer(opts));
var submitMeme = createServerFn({ method: "POST" }).validator((input) => {
	const obj = asObj(input);
	return {
		wallet: str(obj.wallet, 80),
		title: str(obj.title, 40),
		ticker: str(obj.ticker, 8),
		caption: str(obj.caption, 180),
		mediaKind: obj.mediaKind === "video" ? "video" : "image",
		mediaUrl: typeof obj.mediaUrl === "string" ? obj.mediaUrl : ""
	};
}).handler(submitMeme_createServerFn_handler, async ({ data }) => serial(async () => {
	if (!isUserWallet(data.wallet)) return fail("Connect a demo wallet first.");
	if (data.mediaUrl.length > 5e5) return fail("That file is too big to keep. Use a photo, or a clip under 350 KB.");
	if (data.title.length < 2 || data.title.length > 28) return fail("Name the meme in 2 to 28 characters.");
	if (data.caption.length > 140) return fail("Keep the caption under 140 characters.");
	const ticker = cleanTicker(data.ticker);
	if (!ticker) return fail("Ticker needs 2 to 6 letters or numbers.");
	const screened = moderateText([
		data.title,
		ticker,
		data.caption
	]);
	if (!screened.ok) return screened;
	if (data.mediaKind === "video" && !data.mediaUrl.startsWith("data:video/")) return fail("That video did not come through. Try a shorter mp4 or webm.");
	if (data.mediaKind === "image" && !data.mediaUrl.startsWith("data:image/")) return fail("Upload a jpeg, png, webp, or gif.");
	if (data.mediaUrl.length > 12e5) return fail("That file is too heavy. Use a still under about 900 KB.");
	const sql = await getSql();
	const now = /* @__PURE__ */ new Date();
	await boot(sql, now);
	const queued = await sql`
        select count(*) as n from memes
        where wallet = ${data.wallet} and status = 'scheduled' and launch_at > ${now.toISOString()}
      `;
	if (Number(queued[0]?.n ?? 0) >= 6) return fail("You already have 6 coins waiting. Let one launch before you send another.");
	const cost = submitCostCents();
	for (let attempt = 0; attempt < 5; attempt++) {
		const occRows = await sql`
          select hour_key, slot_index from memes
          where status = 'scheduled' and launch_at > ${now.toISOString()}
        `;
		const occupied = new Set(occRows.map((row) => `${row.hour_key}:${row.slot_index}`));
		const [slot] = nextOpenSlots(now, occupied, 1);
		if (!slot) return fail("The next 36 hours are booked.");
		const paid = await sql`
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
			await credit(sql, "platform", cost, "listing", `Listing fee for ${ticker}`, slot.hourKey, slot.hourKey.slice(0, 10), id);
			const ahead = await sql`
            select count(*) as n from memes
            where status = 'scheduled' and launch_at > ${now.toISOString()} and launch_at < ${slot.launch.toISOString()}
          `;
			const rivals = await hourRivals(sql, slot.hourKey, data.wallet, id, now.getTime());
			return {
				ok: true,
				id,
				title: data.title,
				ticker,
				launchAt: slot.launch.toISOString(),
				hourKey: slot.hourKey,
				hourLabel: hourLabel(slot.hourKey),
				slot: slot.slot,
				queuePosition: Number(ahead[0]?.n ?? 0) + 1,
				rivals,
				balanceCents: Number(paid[0].balance_cents)
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
}));
var getMine_createServerFn_handler = createServerRpc({
	id: "f44402603700a2622e9e2e8755a218d8bfd6353929cc2111ddaaf1a0dc7fa1e1",
	name: "getMine",
	filename: "src/lib/pym/api.ts"
}, (opts) => getMine.__executeServer(opts));
var getMine = createServerFn({ method: "POST" }).validator((input) => ({ wallet: str(asObj(input).wallet, 80) })).handler(getMine_createServerFn_handler, async ({ data }) => serial(async () => {
	if (!isUserWallet(data.wallet)) return [];
	const sql = await getSql();
	const now = /* @__PURE__ */ new Date();
	await boot(sql, now);
	const nowMs = now.getTime();
	const rows = await sql`
        select * from memes where wallet = ${data.wallet} order by created_at desc limit 40
      `;
	const hourKeys = [...new Set(rows.map((row) => row.hour_key).filter((key) => !!key))];
	const rivalCoins = (hourKeys.length ? await sql.query(`select * from memes where status = 'scheduled' and hour_key = any($1::text[])`, [hourKeys]) : []).map((row) => toCoin(row, nowMs)).filter((coin) => !!coin);
	const waiting = await sql`
        select id, launch_at from memes
        where status = 'scheduled' and launch_at > ${now.toISOString()}
        order by launch_at asc
      `;
	const order = new Map(waiting.map((row, index) => [row.id, index + 1]));
	return rows.map((row) => {
		const coin = toCoin(row, nowMs);
		const status = row.status === "rejected" ? "rejected" : coin?.phase === "live" || coin?.phase === "settled" || coin?.phase === "upcoming" ? coin.phase : "scheduled";
		const rivals = coin ? rivalsFor(rivalCoins.filter((item) => item.hourKey === coin.hourKey), data.wallet, row.id) : [];
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
			changePct: coin && coin.phase !== "upcoming" ? coin.changePct : null
		};
	});
}));
var getCoin_createServerFn_handler = createServerRpc({
	id: "94aad43933ed043ad706d3b99a9a1241da87bf3fa34a0582ee74c0887b782ec6",
	name: "getCoin",
	filename: "src/lib/pym/api.ts"
}, (opts) => getCoin.__executeServer(opts));
var getCoin = createServerFn({ method: "POST" }).validator((input) => {
	const obj = asObj(input);
	return {
		id: str(obj.id, 80),
		wallet: str(obj.wallet, 80)
	};
}).handler(getCoin_createServerFn_handler, async ({ data }) => serial(async () => {
	const sql = await getSql();
	const now = /* @__PURE__ */ new Date();
	await boot(sql, now);
	const rows = await sql`select * from memes where id = ${data.id} limit 1`;
	const coin = rows[0] ? toCoin(rows[0], now.getTime()) : null;
	if (!coin) return {
		coin: null,
		rivals: []
	};
	return {
		coin,
		rivals: await hourRivals(sql, coin.hourKey, data.wallet, coin.id, now.getTime())
	};
}));
var apeIn_createServerFn_handler = createServerRpc({
	id: "10462766649636771a0f91d95a3108564d025a808f71bb1bf51253791c82eefc",
	name: "apeIn",
	filename: "src/lib/pym/api.ts"
}, (opts) => apeIn.__executeServer(opts));
var apeIn = createServerFn({ method: "POST" }).validator((input) => {
	const obj = asObj(input);
	const cents = Number(obj.cents);
	return {
		wallet: str(obj.wallet, 80),
		memeId: str(obj.memeId, 80),
		cents: Number.isFinite(cents) ? Math.floor(cents) : 0
	};
}).handler(apeIn_createServerFn_handler, async ({ data }) => serial(async () => {
	if (!isUserWallet(data.wallet)) return fail("Connect a demo wallet first.");
	if (data.cents < 1e3) return fail("Minimum bag is 10 PYM.");
	const sql = await getSql();
	const now = /* @__PURE__ */ new Date();
	await boot(sql, now);
	const rows = await sql`select * from memes where id = ${data.memeId} limit 1`;
	const coin = rows[0] ? toCoin(rows[0], now.getTime()) : null;
	if (!coin || coin.phase !== "live") return fail("You can only buy during that coin's 10-minute window.");
	const paid = await sql`
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
	return {
		ok: true,
		balanceCents: Number(paid[0].balance_cents)
	};
}));
var sellBag_createServerFn_handler = createServerRpc({
	id: "e3eecd68ec4067f7d1c0161e5ae5e316e21ea143f6c1bccc2bbc8b6eb630562a",
	name: "sellBag",
	filename: "src/lib/pym/api.ts"
}, (opts) => sellBag.__executeServer(opts));
var sellBag = createServerFn({ method: "POST" }).validator((input) => {
	const obj = asObj(input);
	return {
		wallet: str(obj.wallet, 80),
		memeId: str(obj.memeId, 80)
	};
}).handler(sellBag_createServerFn_handler, async ({ data }) => serial(async () => {
	if (!isUserWallet(data.wallet)) return fail("Connect a demo wallet first.");
	const sql = await getSql();
	const now = /* @__PURE__ */ new Date();
	await boot(sql, now);
	const rows = await sql`
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
	const bals = await sql`
        update wallets set balance_cents = balance_cents + ${refund}
        where address = ${data.wallet}
        returning balance_cents
      `;
	return {
		ok: true,
		balanceCents: Number(bals[0]?.balance_cents ?? 0),
		refundCents: refund
	};
}));
var claimFaucet_createServerFn_handler = createServerRpc({
	id: "3b1ace5ce703c44cc28e7430abe01f9b1a3e336436f78ca8db431391e1913077",
	name: "claimFaucet",
	filename: "src/lib/pym/api.ts"
}, (opts) => claimFaucet.__executeServer(opts));
var claimFaucet = createServerFn({ method: "POST" }).validator((input) => ({ wallet: str(asObj(input).wallet, 80) })).handler(claimFaucet_createServerFn_handler, async ({ data }) => serial(async () => {
	if (!isUserWallet(data.wallet)) return fail("Connect a demo wallet first.");
	const sql = await getSql();
	const now = /* @__PURE__ */ new Date();
	await boot(sql, now);
	const rows = await sql`
        select last_faucet, balance_cents from wallets where address = ${data.wallet}
      `;
	if (!rows.length) return fail("Connect the wallet again.");
	const last = iso(rows[0].last_faucet);
	if (last) {
		const wait = new Date(last).getTime() + FAUCET_COOLDOWN_MS - now.getTime();
		if (wait > 0) return fail(`Faucet refills in ${Math.ceil(wait / 6e4)} min.`);
	}
	const bals = await sql`
        update wallets
        set balance_cents = balance_cents + ${FAUCET_CENTS}, last_faucet = ${now.toISOString()}
        where address = ${data.wallet}
        returning balance_cents
      `;
	return {
		ok: true,
		balanceCents: Number(bals[0]?.balance_cents ?? 0),
		addedCents: FAUCET_CENTS
	};
}));
async function pullMeme(sql, id, wallet, reason) {
	const rows = await sql`
    update memes
    set status = 'rejected', reject_reason = ${reason}, hour_key = null, slot_index = null, launch_at = null
    where id = ${id}
      and status = 'scheduled'
      and launch_at > ${(/* @__PURE__ */ new Date()).toISOString()}
      and is_seed = false
      and (${wallet}::text is null or wallet = ${wallet})
    returning wallet, is_seed
  `;
	if (!rows.length) return fail("That coin has already left the queue, or it is not yours.");
	const bals = await sql`
    update wallets set balance_cents = balance_cents + ${submitCostCents()}
    where address = ${rows[0].wallet}
    returning balance_cents
  `;
	return {
		ok: true,
		balanceCents: Number(bals[0]?.balance_cents ?? 0)
	};
}
var cancelMeme_createServerFn_handler = createServerRpc({
	id: "5695c72e124e3bad4f7e47387b8e5e744ef466a16702d8b9a8ec987fa10cebc2",
	name: "cancelMeme",
	filename: "src/lib/pym/api.ts"
}, (opts) => cancelMeme.__executeServer(opts));
var cancelMeme = createServerFn({ method: "POST" }).validator((input) => {
	const obj = asObj(input);
	return {
		wallet: str(obj.wallet, 80),
		id: str(obj.id, 80)
	};
}).handler(cancelMeme_createServerFn_handler, async ({ data }) => serial(async () => {
	if (!isUserWallet(data.wallet)) return fail("Connect a demo wallet first.");
	const sql = await getSql();
	await boot(sql, /* @__PURE__ */ new Date());
	return pullMeme(sql, data.id, data.wallet, "You pulled this coin before it launched. The entry fee was returned.");
}));
var adminList_createServerFn_handler = createServerRpc({
	id: "27aa1ce36b62eea1f755496167b43ee2c1840e1a46c1c0d5ffe698439b42403f",
	name: "adminList",
	filename: "src/lib/pym/api.ts"
}, (opts) => adminList.__executeServer(opts));
var adminList = createServerFn({ method: "POST" }).validator((input) => ({ code: str(asObj(input).code, 40) })).handler(adminList_createServerFn_handler, async ({ data }) => serial(async () => {
	if (data.code !== FLOOR_CODE) return fail("Wrong reviewer code.");
	const sql = await getSql();
	const now = /* @__PURE__ */ new Date();
	await boot(sql, now);
	return {
		ok: true,
		memes: (await sql`
        select * from memes where is_seed = false order by created_at desc limit 40
      `).map((row) => {
			const coin = toCoin(row, now.getTime());
			return {
				id: row.id,
				title: row.title,
				ticker: row.ticker,
				caption: row.caption,
				walletLabel: labelOf(row.wallet, false),
				status: row.status === "rejected" ? "rejected" : coin?.phase ?? row.status,
				rejectReason: row.reject_reason,
				launchAt: iso(row.launch_at),
				mediaUrl: row.media_url,
				mediaKind: row.media_kind === "video" ? "video" : "image",
				canPull: row.status === "scheduled" && !!row.launch_at && new Date(row.launch_at).getTime() > now.getTime()
			};
		})
	};
}));
var adminReject_createServerFn_handler = createServerRpc({
	id: "d3ae8bf4302ac242512c9de8847469891643ee0c7fe8b5a2a615d7217565fa5a",
	name: "adminReject",
	filename: "src/lib/pym/api.ts"
}, (opts) => adminReject.__executeServer(opts));
var adminReject = createServerFn({ method: "POST" }).validator((input) => {
	const obj = asObj(input);
	return {
		code: str(obj.code, 40),
		id: str(obj.id, 80),
		reason: str(obj.reason, 160)
	};
}).handler(adminReject_createServerFn_handler, async ({ data }) => serial(async () => {
	if (data.code !== FLOOR_CODE) return fail("Wrong reviewer code.");
	const sql = await getSql();
	await boot(sql, /* @__PURE__ */ new Date());
	const reason = data.reason || "A reviewer pulled this coin before launch. The entry fee was returned.";
	const result = await pullMeme(sql, data.id, null, reason);
	if (!result.ok) return result;
	return { ok: true };
}));
//#endregion
export { adminList_createServerFn_handler, adminReject_createServerFn_handler, apeIn_createServerFn_handler, cancelMeme_createServerFn_handler, claimFaucet_createServerFn_handler, connectWallet_createServerFn_handler, getArena_createServerFn_handler, getCoin_createServerFn_handler, getMine_createServerFn_handler, getPreview_createServerFn_handler, sellBag_createServerFn_handler, submitMeme_createServerFn_handler };
