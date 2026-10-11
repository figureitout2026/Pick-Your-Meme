import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { BuyBox } from "@/components/buy-box";
import { CoinLink, Media, Pill } from "@/components/bits";
import { hourLabel, slotLabel } from "@/lib/pym/engine";
import { compact, clockLabel, dur, pct, pym, usd } from "@/lib/pym/format";
import type { Arena, Coin } from "@/lib/pym/types";
import { cn } from "@/lib/utils";

function useClock(serverNow?: string) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const skew = serverNow ? new Date(serverNow).getTime() - Date.now() : 0;
    const tick = () => setNow(Date.now() + skew);
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [serverNow]);
  return now;
}

function Tape({ seedKey, launchAt }: { seedKey: string; launchAt: string }) {
  const [Chart, setChart] = useState<typeof import("@/components/coin-chart").CoinChart | null>(null);
  useEffect(() => {
    void import("@/components/coin-chart").then((mod) => setChart(() => mod.CoinChart));
  }, []);
  if (!Chart) return <div className="h-28" />;
  return <Chart seedKey={seedKey} launchAt={launchAt} />;
}

function tone(n: number): string {
  return n >= 0 ? "text-lime" : "text-coral";
}

export function Desk({ arena, wallet, onRefresh }: { arena: Arena; wallet: string | null; onRefresh: () => void }) {
  const now = useClock(arena.now);
  const feature =
    arena.coins.find((coin) => coin?.phase === "live") ??
    arena.hourRank[0] ??
    arena.coins.find((coin): coin is Coin => !!coin) ??
    null;
  const left = feature && now ? Math.max(0, Math.ceil((new Date(feature.windowEnd).getTime() - now) / 1000)) : arena.secondsLeftInWindow;
  const position = feature ? arena.positions.find((item) => item.memeId === feature.id) : undefined;
  const parts = [
    { label: "Hour winner", value: arena.fees.winnerCut, className: "bg-lime" },
    { label: "Every holder", value: arena.fees.holderCut, className: "bg-coral" },
    { label: "Parks in the treasury", value: arena.fees.hourRemaining, className: "bg-mute" },
  ];
  const pot = parts.reduce((sum, part) => sum + part.value, 0) || 1;

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-widest text-lime uppercase">Live desk · {arena.dayLabel}</p>
            <h1 className="mt-1 font-display text-4xl font-extrabold md:text-5xl">{arena.hourLabel} hour</h1>
          </div>
          <div className="text-left md:text-right">
            <div className="font-display text-3xl font-extrabold tabular-nums">
              {feature?.phase === "live" ? dur(left) : "—"}
            </div>
            <p className="text-sm text-mute">
              {feature?.phase === "live" ? `left in the ${slotLabel(feature.slot)} window` : "between windows"}
            </p>
          </div>
        </div>
        <ol className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {arena.coins.map((coin, index) => (
            <li key={coin?.id ?? `empty-${index}`}>
              {coin ? (
                <CoinLink
                  id={coin.id}
                  className={cn(
                    "block rounded-2xl border px-2 py-2",
                    coin.phase === "live" ? "border-coral bg-panel" : "border-line bg-panel",
                    wallet && coin.wallet === wallet && "ring-2 ring-lime",
                  )}
                >
                  <div className="text-xs text-mute tabular-nums">{slotLabel(coin.slot)}</div>
                  <div className="truncate text-sm font-semibold">{coin.ticker}</div>
                  <div className="text-xs text-mute">{coin.phase === "upcoming" ? "Soon" : coin.phase === "live" ? "Live" : "Locked"}</div>
                </CoinLink>
              ) : (
                <Link to="/submit" className="block rounded-2xl border border-dashed border-line px-2 py-2 text-sm text-mute">
                  <div className="tabular-nums">{slotLabel(index)}</div>
                  Open
                </Link>
              )}
            </li>
          ))}
        </ol>
      </section>

      {feature ? (
        <section className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
          <article className="overflow-hidden rounded-2xl border border-line bg-panel">
            <div className="grid md:grid-cols-[220px_minmax(0,1fr)]">
              <CoinLink id={feature.id} className="block bg-ink">
                <Media kind={feature.mediaKind} url={feature.mediaUrl} alt={feature.title} play={feature.phase === "live"} className="aspect-square w-full object-cover" />
              </CoinLink>
              <div className="flex flex-col gap-3 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  {feature.phase === "live" ? <Pill tone="live">Live</Pill> : <Pill>{feature.phase}</Pill>}
                  {wallet && feature.wallet === wallet ? <Pill tone="lime">Your coin</Pill> : null}
                  <span className="text-xs text-mute">{feature.walletLabel}</span>
                </div>
                <div>
                  <h2 className="font-display text-3xl font-extrabold leading-none">
                    <CoinLink id={feature.id}>{feature.title}</CoinLink>
                  </h2>
                  <p className="mt-1 text-sm text-mute">
                    {feature.ticker} · {feature.caption}
                  </p>
                  <p className="mt-1 text-xs text-mute">
                    {feature.phase === "upcoming"
                      ? "The launch worker deploys this when the window opens. You don't press anything."
                      : "Deployed by the launch worker. The desk holds 0."}
                  </p>
                </div>
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-mute">Market cap</div>
                    <div className="font-display text-4xl font-extrabold tabular-nums">{usd(feature.mcap)}</div>
                  </div>
                  <div className={cn("font-display text-2xl font-extrabold tabular-nums", tone(feature.changePct))}>{pct(feature.changePct)}</div>
                </div>
                <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Stat label="Price" value={usd(feature.price)} />
                  <Stat label="Holders" value={compact(feature.holders)} />
                  <Stat label="Window vol" value={usd(feature.volume)} />
                  <Stat label="ATH" value={usd(feature.ath)} />
                </dl>
                <Tape seedKey={feature.seedKey} launchAt={feature.launchAt} />
              </div>
            </div>
            <div className="border-t border-line p-4">
              <BuyBox memeId={feature.id} phase={feature.phase} position={position} onDone={onRefresh} />
            </div>
          </article>

          <aside className="rounded-2xl border border-line bg-panel p-4">
            <h2 className="font-display text-xl font-extrabold">This hour</h2>
            <p className="mt-1 text-sm text-mute">Ranked by window score: holders, plus oversell. Upcoming seats stay off the board.</p>
            <ol className="mt-3 flex flex-col gap-1">
              {arena.hourRank.map((coin, index) => (
                <li key={coin.id}>
                  <CoinLink id={coin.id} className={cn("flex items-center gap-3 rounded-xl px-2 py-2", coin.id === feature.id && "bg-ink")}>
                    <span className="w-5 font-display text-lg tabular-nums text-mute">{index + 1}</span>
                    <Media kind={coin.mediaKind} url={coin.mediaUrl} alt="" className="size-11 rounded-lg object-cover" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{coin.title}</span>
                      <span className="block text-xs text-mute">
                        {coin.ticker} · {slotLabel(coin.slot)}
                        {coin.phase === "live" ? " · live" : ""}
                      </span>
                    </span>
                    <span className="text-right tabular-nums">
                      <span className="block text-sm font-semibold">{compact(coin.score)}</span>
                      <span className={cn("block text-xs", tone(coin.changePct))}>{pct(coin.changePct)}</span>
                    </span>
                  </CoinLink>
                </li>
              ))}
            </ol>
          </aside>
        </section>
      ) : (
        <p className="rounded-2xl border border-line bg-panel p-6 text-mute">The hour has no coins yet.</p>
      )}

      <section className="rounded-2xl border border-line bg-panel p-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 className="font-display text-xl font-extrabold">Launch worker</h2>
          <p className={cn("text-sm font-semibold", arena.worker.rpcOk ? "text-lime" : "text-coral")}>
            {arena.worker.rpcOk
              ? `${arena.worker.rpcLabel} · slot ${arena.worker.rpcSlot?.toLocaleString("en-US")}`
              : `${arena.worker.rpcLabel} not answering`}
          </p>
        </div>
        <p className="mt-2 text-sm text-mute">
          One desk wallet creates the coin when its 10-minute window opens. It does not buy any of the supply. A published desk keeps its books in a real database and closes one hour at a time, so a slow visit cannot mark an hour paid and then die. Pump.fun creates stay off until a launch key is set. Nothing here signs Solana.
        </p>
        <dl className="mt-3 grid gap-3 sm:grid-cols-3">
          <Stat
            label="Next deploy"
            value={arena.worker.nextLaunchAt ? clockLabel(arena.worker.nextLaunchAt) : "—"}
          />
          <Stat label="Deployed today" value={String(arena.worker.deployedToday)} />
          <Stat label="Treasury" value={pym(arena.treasury.balanceCents)} />
        </dl>
        {arena.worker.nextTitle ? (
          <p className="mt-3 text-sm">
            Next up is {arena.worker.nextTitle} ({arena.worker.nextTicker}). The worker sends it. You don't.
          </p>
        ) : (
          <p className="mt-3 text-sm text-mute">
            Next window is an open seat. If nobody takes it, the worker puts a floor meme there and deploys it.
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-line bg-panel p-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 className="font-display text-xl font-extrabold">How this hour pays</h2>
          <p className="text-sm text-mute tabular-nums">
            {arena.fees.hourProjected ? "Projected " : "Locked "}
            creator fees {usd(arena.fees.hourPot)}
          </p>
        </div>
        <div className="mt-3 flex h-3 overflow-hidden rounded-full bg-ink">
          {parts.map((part) => (
            <div key={part.label} className={part.className} style={{ width: `${(part.value / pot) * 100}%` }} />
          ))}
        </div>
        <dl className="mt-3 grid gap-3 sm:grid-cols-3">
          <Stat label="30% to the hour winner" value={usd(arena.fees.winnerCut)} />
          <Stat label="By bag size, every wallet still holding" value={usd(arena.fees.holderCut)} />
          <Stat label="Parks in the treasury" value={usd(arena.fees.hourRemaining)} />
        </dl>
        <p className="mt-3 text-sm text-mute">
          At the bell the clerk sends the winner their cut and pays every wallet still holding that coin, wherever they bought, in proportion to the bag. The rest parks in the treasury. At midnight the same rule pays the daily bonus out of that slice and leaves 65%. Nothing to claim.
          {arena.clerk.holderWallets > 0
            ? arena.clerk.bySize
              ? ` Last hour paid ${arena.clerk.holderWallets.toLocaleString("en-US")} wallets in ${arena.clerk.winnerTicker}, from ${pym(arena.clerk.minCents)} to ${pym(arena.clerk.maxCents)} by bag size.`
              : ` Last hour it paid ${pym(arena.clerk.eachCents)} to each of ${arena.clerk.holderWallets.toLocaleString("en-US")} wallets in ${arena.clerk.winnerTicker}.`
            : arena.hourRank[0]
              ? ` If the hour ended now, ${compact(arena.hourRank[0].holders)} wallets in ${arena.hourRank[0].ticker} would be paid by bag size.`
              : ""}
        </p>
        {arena.yourNext ? (
          <p className="mt-2 text-sm">
            Your next coin, {arena.yourNext.title}, launches at {hourLabel(arena.yourNext.hourKey)} {slotLabel(arena.yourNext.slot)}.{" "}
            <Link to="/mine" className="text-lime">
              See the rivals
            </Link>
          </p>
        ) : null}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-2xl font-extrabold">Coming up</h2>
        {arena.upcoming.map((hour) => (
          <div key={hour.hourKey}>
            <h3 className="text-sm font-semibold tracking-wide text-mute uppercase">{hour.hourLabel}</h3>
            <ul className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {hour.coins.map((coin, index) => (
                <li key={coin?.id ?? `${hour.hourKey}-${index}`} className="rounded-2xl border border-line bg-panel p-3">
                  {coin ? (
                    <CoinLink id={coin.id} className="flex items-center gap-3">
                      <Media kind={coin.mediaKind} url={coin.mediaUrl} alt="" className="size-12 rounded-lg object-cover" />
                      <span className="min-w-0">
                        <span className="block truncate font-semibold">{coin.title}</span>
                        <span className="block text-xs text-mute tabular-nums">
                          {slotLabel(coin.slot)} · {coin.ticker}
                        </span>
                      </span>
                    </CoinLink>
                  ) : (
                    <div>
                      <div className="text-xs text-mute tabular-nums">{slotLabel(index)}</div>
                      <div className="font-semibold">Open seat</div>
                      <Link to="/submit" className="text-xs text-lime">
                        Take it
                      </Link>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section>
        <div className="flex items-end justify-between gap-3">
          <h2 className="font-display text-2xl font-extrabold">Highest today</h2>
          <Link to="/leaderboard" className="text-sm text-lime">
            Full board
          </Link>
        </div>
        <ol className="mt-3 grid gap-2 sm:grid-cols-2">
          {arena.dailyTop.slice(0, 4).map((coin, index) => (
            <li key={coin.id}>
              <CoinLink id={coin.id} className="flex items-center gap-3 rounded-2xl border border-line bg-panel p-3">
                <span className="w-5 font-display text-lg text-mute tabular-nums">{index + 1}</span>
                <Media kind={coin.mediaKind} url={coin.mediaUrl} alt="" className="size-12 rounded-lg object-cover" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{coin.title}</span>
                  <span className="block text-xs text-mute">
                    {hourLabel(coin.hourKey)} {slotLabel(coin.slot)}
                  </span>
                </span>
                <span className="font-semibold tabular-nums">{usd(coin.ath)}</span>
              </CoinLink>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-mute">{label}</dt>
      <dd className="mt-1 font-semibold tabular-nums">{value}</dd>
    </div>
  );
}

export function DeskSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true">
      <div className="h-16 animate-pulse rounded-2xl bg-panel" />
      <div className="h-72 animate-pulse rounded-2xl bg-panel" />
      <p className="text-sm text-mute">Setting today's coins on the desk…</p>
    </div>
  );
}
