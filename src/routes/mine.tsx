import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button, Media, Pill, RivalList } from "@/components/bits";
import { cancelMeme, getMine } from "@/lib/pym/api";
import { clockLabel, pct, usd } from "@/lib/pym/format";
import { slotLabel } from "@/lib/pym/engine";
import type { MineCard } from "@/lib/pym/types";
import { useWallet } from "@/lib/wallet-store";

export const Route = createFileRoute("/mine")({
  component: MinePage,
  head: () => ({ meta: [{ title: "My memes · Pick Your Meme" }] }),
});

function MinePage() {
  const address = useWallet((s) => s.address);
  const ready = useWallet((s) => s.ready);
  const setBalance = useWallet((s) => s.setBalance);
  const [cards, setCards] = useState<MineCard[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;
    if (!address) {
      setCards([]);
      return;
    }
    let stop = false;
    const load = async () => {
      try {
        const rows = await getMine({ data: { wallet: address } });
        if (!stop) {
          setCards(rows);
          setError(null);
        }
      } catch (err) {
        if (!stop) setError(err instanceof Error ? err.message : "Could not load your memes.");
      }
    };
    void load();
    const id = setInterval(() => void load(), 5000);
    return () => {
      stop = true;
      clearInterval(id);
    };
  }, [address, ready]);

  async function pull(id: string) {
    if (!address) return;
    const res = await cancelMeme({ data: { wallet: address, id } });
    if (!res.ok) {
      toast(res.reason);
      return;
    }
    setBalance(res.balanceCents);
    toast("Pulled. Entry fee is back in the wallet.");
    setCards((current) => current?.map((card) => (card.id === id ? { ...card, status: "rejected", rejectReason: "You pulled this coin before it launched." } : card)) ?? null);
  }

  if (!ready || cards === null) return <div className="h-40 animate-pulse rounded-2xl bg-panel" />;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-4xl font-extrabold">My memes</h1>
        <p className="mt-2 text-mute">Queue spot, launch time, and who else is in the hour.</p>
      </div>
      {!address ? (
        <p className="rounded-2xl border border-line bg-panel p-4 text-mute">Connect a demo wallet to see the coins you paid to launch.</p>
      ) : null}
      {error ? <p className="text-sm text-coral">{error}</p> : null}
      {address && cards.length === 0 ? (
        <p className="rounded-2xl border border-line bg-panel p-4">
          Nothing booked. <Link to="/submit" className="text-lime">Launch one.</Link>
        </p>
      ) : null}
      <ul className="flex flex-col gap-4">
        {cards.map((card) => (
          <li key={card.id} className="rounded-2xl border border-line bg-panel p-4">
            <div className="flex gap-3">
              <Media kind={card.mediaKind} url={card.mediaUrl} alt="" className="size-20 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Pill tone={card.status === "live" ? "live" : card.status === "rejected" ? "mute" : "lime"}>{card.status}</Pill>
                  <span className="text-xs text-mute">{card.ticker}</span>
                </div>
                <h2 className="mt-1 truncate font-display text-2xl font-extrabold">{card.title}</h2>
                <p className="text-sm text-mute">{card.caption}</p>
              </div>
            </div>
            {card.status === "rejected" ? <p className="mt-3 rounded-xl bg-coral-ink p-3 text-sm">{card.rejectReason}</p> : null}
            {card.launchAt && card.hourLabel && card.slot != null ? (
              <p className="mt-3 text-sm">
                {card.hourLabel} hour · {slotLabel(card.slot)} · {clockLabel(card.launchAt)}
                {card.queuePosition ? ` · ${card.queuePosition} in the queue` : ""}
                {card.mcap != null && card.status !== "scheduled" ? ` · ${usd(card.mcap)}` : ""}
                {card.changePct != null ? ` · ${pct(card.changePct)}` : ""}
              </p>
            ) : null}
            {card.rivals.length ? (
              <div className="mt-3">
                <h3 className="mb-2 text-xs font-semibold tracking-wide text-mute uppercase">In this hour</h3>
                <RivalList rivals={card.rivals} />
              </div>
            ) : null}
            {card.status === "scheduled" ? (
              <div className="mt-3">
                <Button variant="ghost" onClick={() => void pull(card.id)}>
                  Pull it and get the fee back
                </Button>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
