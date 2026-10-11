import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { BuyBox } from "@/components/buy-box";
import { Media, Pill, RivalList } from "@/components/bits";
import { getCoin } from "@/lib/pym/api";
import { compact, pct, shortAddr, usd } from "@/lib/pym/format";
import { hourLabel, slotLabel } from "@/lib/pym/engine";
import type { Coin, PositionView, Rival } from "@/lib/pym/types";
import { useArena } from "@/lib/use-arena";
import { useWallet } from "@/lib/wallet-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/coin/$id")({
  loader: ({ params }) => getCoin({ data: { id: params.id, wallet: "" } }),
  component: CoinPage,
  head: () => ({ meta: [{ title: "Coin · Pick Your Meme" }] }),
});

function CoinPage() {
  const { id } = Route.useParams();
  const initial = Route.useLoaderData();
  const address = useWallet((s) => s.address);
  const { arena, reload } = useArena(address);
  const [coin, setCoin] = useState<Coin | null>(initial.coin);
  const [rivals, setRivals] = useState<Rival[]>(initial.rivals);
  const [Chart, setChart] = useState<typeof import("@/components/coin-chart").CoinChart | null>(null);

  const load = useCallback(async () => {
    const res = await getCoin({ data: { id, wallet: address ?? "" } });
    setCoin(res.coin);
    setRivals(res.rivals);
  }, [address, id]);

  useEffect(() => {
    void load().catch(() => setCoin(null));
    const timer = setInterval(() => void load().catch(() => undefined), 4000);
    void import("@/components/coin-chart").then((mod) => setChart(() => mod.CoinChart));
    return () => clearInterval(timer);
  }, [load]);

  if (!coin) {
    return (
      <p className="text-mute">
        That coin is not on the desk. <Link to="/" className="text-lime">Back</Link>
      </p>
    );
  }
  const position: PositionView | undefined = arena?.positions.find((item) => item.memeId === coin.id);

  return (
    <article className="flex flex-col gap-5">
      <Link to="/" className="text-sm text-lime">
        Desk
      </Link>
      <div className="grid gap-4 md:grid-cols-[minmax(0,16rem)_minmax(0,1fr)]">
        <Media kind={coin.mediaKind} url={coin.mediaUrl} alt={coin.title} play={coin.phase === "live"} className="aspect-square w-full rounded-2xl object-cover" />
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            {coin.phase === "live" ? <Pill tone="live">Live</Pill> : <Pill>{coin.phase}</Pill>}
            <Pill>{hourLabel(coin.hourKey)} {slotLabel(coin.slot)}</Pill>
          </div>
          <h1 className="font-display text-4xl font-extrabold">{coin.title}</h1>
          <p className="text-mute">
            {coin.ticker} · {coin.caption}
          </p>
          <p className="text-sm text-mute">{coin.walletLabel}</p>
          <p className="text-sm text-mute">
            {coin.phase === "upcoming"
              ? "The launch worker deploys this when the window opens. The desk holds 0 of it."
              : `Launch receipt ${shortAddr(coin.mint)}. Deployed by the worker. The desk holds 0.`}
          </p>
          <p className="text-sm text-mute">Every wallet still holding at the bell is paid by bag size, whether the buy was here or on the coin itself. Selling first drops you off. The clerk sends it.</p>
          <div className="flex items-end justify-between">
            <div className="font-display text-4xl font-extrabold tabular-nums">{usd(coin.mcap)}</div>
            <div className={cn("font-display text-2xl font-extrabold tabular-nums", coin.changePct >= 0 ? "text-lime" : "text-coral")}>
              {pct(coin.changePct)}
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-sm">
            <div><dt className="text-mute">Price</dt><dd className="tabular-nums">{usd(coin.price)}</dd></div>
            <div><dt className="text-mute">Holders</dt><dd className="tabular-nums">{compact(coin.holders)}</dd></div>
            <div><dt className="text-mute">Window vol</dt><dd className="tabular-nums">{usd(coin.volume)}</dd></div>
            <div><dt className="text-mute">Score</dt><dd className="tabular-nums">{coin.phase === "upcoming" ? "—" : compact(coin.score)}</dd></div>
          </dl>
        </div>
      </div>
      {Chart ? <Chart seedKey={coin.seedKey} launchAt={coin.launchAt} /> : <div className="h-28" />}
      <BuyBox memeId={coin.id} phase={coin.phase} position={position} onDone={() => { void load(); void reload(); }} />
      <section>
        <h2 className="font-display text-xl font-extrabold">Same hour</h2>
        <div className="mt-2">
          <RivalList rivals={rivals} />
        </div>
      </section>
    </article>
  );
}
