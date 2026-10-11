import { createFileRoute } from "@tanstack/react-router";
import { CoinLink, Media } from "@/components/bits";
import { hourLabel, slotLabel } from "@/lib/pym/engine";
import { compact, pct, usd } from "@/lib/pym/format";
import { getArena } from "@/lib/pym/api";
import { useArena } from "@/lib/use-arena";
import { useWallet } from "@/lib/wallet-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/leaderboard")({
  loader: () => getArena({ data: { wallet: "" } }),
  component: BoardPage,
  head: () => ({ meta: [{ title: "Board · Pick Your Meme" }] }),
});

function BoardPage() {
  const seeded = Route.useLoaderData();
  const address = useWallet((s) => s.address);
  const { arena, error } = useArena(address, seeded);
  const view = arena ?? seeded;
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-4xl font-extrabold">Board</h1>
        <p className="mt-2 text-mute">Hour rank is the window score. Day rank is who went the highest. Holder pay goes to every wallet still in, by bag size.</p>
      </div>
      {error ? <p className="text-sm text-coral">{error}</p> : null}
      <section>
        <h2 className="font-display text-2xl font-extrabold">{view.hourLabel} hour</h2>
        <ol className="mt-3 flex flex-col gap-2">
          {view.hourRank.map((coin, index) => (
            <Row key={coin.id} rank={index + 1} title={coin.title} meta={`${coin.ticker} · ${slotLabel(coin.slot)} · ${coin.phase}`} media={coin} stat={compact(coin.score)} sub={pct(coin.changePct)} up={coin.changePct >= 0} id={coin.id} />
          ))}
        </ol>
      </section>
      <section>
        <h2 className="font-display text-2xl font-extrabold">{view.dayLabel} highs</h2>
        <p className="mt-1 text-sm text-mute">20% of what's left after the hourly cuts goes to this coin at midnight PT.</p>
        <ol className="mt-3 flex flex-col gap-2">
          {view.dailyTop.map((coin, index) => (
            <Row
              key={coin.id}
              rank={index + 1}
              title={coin.title}
              meta={`${hourLabel(coin.hourKey)} ${slotLabel(coin.slot)} · ATH`}
              media={coin}
              stat={usd(coin.ath)}
              sub={usd(coin.mcap)}
              up={coin.changePct >= 0}
              id={coin.id}
            />
          ))}
        </ol>
      </section>
    </div>
  );
}

function Row({
  rank,
  title,
  meta,
  media,
  stat,
  sub,
  up,
  id,
}: {
  rank: number;
  title: string;
  meta: string;
  media: { mediaKind: "image" | "video"; mediaUrl: string };
  stat: string;
  sub: string;
  up: boolean;
  id: string;
}) {
  return (
    <li>
      <CoinLink id={id} className="flex items-center gap-3 rounded-2xl border border-line bg-panel p-3">
        <span className="w-6 font-display text-xl text-mute tabular-nums">{rank}</span>
        <Media kind={media.mediaKind} url={media.mediaUrl} alt="" className="size-12 rounded-lg object-cover" />
        <span className="min-w-0 flex-1">
          <span className="block truncate font-semibold">{title}</span>
          <span className="block text-xs text-mute">{meta}</span>
        </span>
        <span className="text-right tabular-nums">
          <span className="block font-semibold">{stat}</span>
          <span className={cn("block text-xs", up ? "text-lime" : "text-coral")}>{sub}</span>
        </span>
      </CoinLink>
    </li>
  );
}
