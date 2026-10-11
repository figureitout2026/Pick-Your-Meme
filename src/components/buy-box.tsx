import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/bits";
import { apeIn, sellBag } from "@/lib/pym/api";
import { pym } from "@/lib/pym/format";
import { MIN_BUY_CENTS } from "@/lib/pym/money";
import type { PositionView } from "@/lib/pym/types";
import { useWallet } from "@/lib/wallet-store";

export function BuyBox({
  memeId,
  phase,
  position,
  onDone,
}: {
  memeId: string;
  phase: "upcoming" | "live" | "settled";
  position?: PositionView;
  onDone: () => void;
}) {
  const address = useWallet((s) => s.address);
  const balance = useWallet((s) => s.balanceCents);
  const setBalance = useWallet((s) => s.setBalance);
  const [cents, setCents] = useState(MIN_BUY_CENTS);
  const [busy, setBusy] = useState(false);
  const max = Math.max(MIN_BUY_CENTS, balance);

  async function buy() {
    if (!address) {
      toast("Connect a demo wallet first.");
      return;
    }
    setBusy(true);
    try {
      const res = await apeIn({ data: { wallet: address, memeId, cents } });
      if (!res.ok) {
        toast(res.reason);
        return;
      }
      setBalance(res.balanceCents);
      toast("Bag opened. Stay in through the bell.");
      onDone();
    } catch (error) {
      toast(error instanceof Error ? error.message : "Buy failed.");
    } finally {
      setBusy(false);
    }
  }

  async function sell() {
    if (!address) return;
    setBusy(true);
    try {
      const res = await sellBag({ data: { wallet: address, memeId } });
      if (!res.ok) {
        toast(res.reason);
        return;
      }
      setBalance(res.balanceCents);
      toast(`Sold. ${pym(res.refundCents)} came back after slippage.`);
      onDone();
    } catch (error) {
      toast(error instanceof Error ? error.message : "Sell failed.");
    } finally {
      setBusy(false);
    }
  }

  if (!address) {
    return <p className="text-sm text-mute">Connect a wallet if you want a bag in this window.</p>;
  }

  return (
    <div className="rounded-2xl border border-line bg-ink p-4">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-display text-lg font-extrabold">Your bag</h3>
        <span className="text-sm text-mute tabular-nums">{pym(balance)}</span>
      </div>
      {position?.holding ? (
        <p className="mt-2 text-sm text-mute">
          Holding {pym(position.qtyCents)}.
          {position.qualified
            ? " You were still in at the bell, so the clerk sent your share with everyone else."
            : " Sell before the bell and you drop off the list. A buy in the last minute does not qualify. What you still hold is your share. A bigger bag is paid more. A share under the send minimum waits on the wallet until it clears a network fee."}
        </p>
      ) : (
        <p className="mt-2 text-sm text-mute">
          {phase === "live"
            ? "Buy and hold through the bell. Your share matches your bag, here or on the coin itself. Nothing to claim."
            : phase === "upcoming"
              ? "The launch worker has not deployed this yet. It will, at the window. The desk buys none of it."
              : "Window closed. The holder list is whoever was still in."}
        </p>
      )}
      {phase === "live" ? (
        <div className="mt-3">
          <label className="text-xs uppercase tracking-wide text-mute" htmlFor={`bag-${memeId}`}>
            Spend {pym(Math.min(cents, max))}
          </label>
          <input
            id={`bag-${memeId}`}
            type="range"
            min={MIN_BUY_CENTS}
            max={max}
            step={100}
            value={Math.min(cents, max)}
            onChange={(event) => setCents(Number(event.target.value))}
            className="mt-2 w-full accent-lime"
          />
          <div className="mt-3 flex gap-2">
            <Button disabled={busy || balance < MIN_BUY_CENTS} onClick={() => void buy()}>
              Buy bag
            </Button>
            {position?.holding ? (
              <Button variant="ghost" disabled={busy} onClick={() => void sell()}>
                Sell
              </Button>
            ) : null}
          </div>
        </div>
      ) : position?.holding ? (
        <div className="mt-3">
          <Button variant="ghost" disabled={busy} onClick={() => void sell()}>
            Sell
          </Button>
        </div>
      ) : null}
    </div>
  );
}
