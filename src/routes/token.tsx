import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/bits";
import { claimFaucet, getArena } from "@/lib/pym/api";
import { pym, usd } from "@/lib/pym/format";
import { FAUCET_CENTS, PYM_PRICE_USD, SUBMIT_USD, SUPPLY, submitCostCents } from "@/lib/pym/money";
import { useArena } from "@/lib/use-arena";
import { useWallet } from "@/lib/wallet-store";

export const Route = createFileRoute("/token")({
  loader: () => getArena({ data: { wallet: "" } }),
  component: TokenPage,
  head: () => ({ meta: [{ title: "PYM · Pick Your Meme" }] }),
});

function TokenPage() {
  const seeded = Route.useLoaderData();
  const address = useWallet((s) => s.address);
  const balance = useWallet((s) => s.balanceCents);
  const setBalance = useWallet((s) => s.setBalance);
  const { arena, error, reload } = useArena(address, seeded);
  const view = arena ?? seeded;
  const [busy, setBusy] = useState(false);

  async function faucet() {
    if (!address) {
      toast("Connect a demo wallet first.");
      return;
    }
    setBusy(true);
    try {
      const res = await claimFaucet({ data: { wallet: address } });
      if (!res.ok) {
        toast(res.reason);
        return;
      }
      setBalance(res.balanceCents);
      toast(`+${pym(res.addedCents)} demo PYM`);
      void reload();
    } catch (error) {
      toast(error instanceof Error ? error.message : "Faucet failed.");
    } finally {
      setBusy(false);
    }
  }

  if (!view) {
    if (error) return <p className="text-coral">{error}</p>;
    return null;
  }
  const fees = view.fees;
  const clerk = view.clerk;
  const treasury = view.treasury;
  const worker = view.worker;

  return (
    <div className="flex flex-col gap-6">
      <section>
        <p className="text-xs font-semibold tracking-widest text-lime uppercase">Platform token</p>
        <h1 className="mt-1 font-display text-5xl font-extrabold">PYM</h1>
        <p className="mt-3 max-w-xl text-mute">
          PYM is the entry ticket and the payout token. It is not deployed. There is no contract. The desk uses a demo price so a $5 launch has a number on it.
        </p>
      </section>
      <section className="grid gap-3 sm:grid-cols-3">
        <Tile label="Demo price" value={`$${PYM_PRICE_USD.toFixed(3)}`} />
        <Tile label="Supply" value={SUPPLY.toLocaleString("en-US")} />
        <Tile label="Launch fee" value={`${pym(submitCostCents())}`} hint={`$${SUBMIT_USD}`} />
      </section>
      <section className="rounded-2xl border border-line bg-panel p-4">
        <h2 className="font-display text-2xl font-extrabold">How the desk gets paid</h2>
        <p className="mt-2 text-sm text-mute">
          Two lines, both automatic. Neither one is a bag in the meme. The desk wallet creates the coin and holds zero of the supply, so it cannot dump on holders.
        </p>
        <ol className="mt-3 flex flex-col gap-3 text-sm">
          <li>
            <strong className="text-lime">Listing fee.</strong> ${SUBMIT_USD} of PYM when a meme is accepted. It hits the treasury immediately. A rejected meme is not charged.
          </li>
          <li>
            <strong className="text-lime">The pot is 0.30%</strong> of what traded in the window. That is the creator vault on the bonding curve. The other 0.95% belongs to pump.fun and is not split here.
          </li>
          <li>
            <strong className="text-lime">30%</strong> of that vault goes to the wallet that submitted the winning meme.
          </li>
          <li>
            <strong className="text-lime">Holder cut</strong> is 30% of the other coins' fees in that hour. Every wallet still holding the winner gets some, on this desk or on the coin itself. A bigger bag is paid more. Selling before the bell drops you off.
          </li>
          <li>
            <strong className="text-lime">The rest parks in the treasury</strong> at the bell. At midnight the clerk pays 20% of that parked slice to the day's highest coin and 15% to holders, and leaves 65% as the desk's. It does not touch the winner's 30% or the holder cut.
          </li>
        </ol>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <Tile label="Treasury now" value={pym(treasury.balanceCents)} hint="Listing fees plus the parked slice, after bonuses already sent" />
          <Tile label="Listing fees booked" value={pym(treasury.listingCents)} />
          <Tile label="Parked from hours" value={pym(treasury.parkedCents)} hint="Before the midnight bonus leaves" />
          <Tile label="You keep today, projected" value={usd(fees.platformCut)} hint="65% of today's parked slice" />
        </dl>
      </section>
      <section className="rounded-2xl border border-line bg-panel p-4">
        <h2 className="font-display text-2xl font-extrabold">Launch worker</h2>
        <p className="mt-2 text-sm text-mute">
          It deploys the coin at the start of each 10-minute window. You do not click deploy. On a real Solana desk this is one funded wallet signing pump.fun's create transaction. Here it writes the receipt and the books the same way.
        </p>
        <p className="mt-3 text-sm">
          {worker.deployedToday.toLocaleString("en-US")} coins deployed today. The desk holds {worker.holdsTokens} of each.
          {worker.rpcOk
            ? ` ${worker.rpcLabel} is answering at slot ${worker.rpcSlot?.toLocaleString("en-US")}. It is only reading the chain. It is not launching coins.`
            : ` ${worker.rpcLabel} is not answering.`}
          {worker.nextTitle
            ? ` Next is ${worker.nextTitle} (${worker.nextTicker}).`
            : ""}
        </p>
      </section>
      <section className="rounded-2xl border border-line bg-panel p-4">
        <h2 className="font-display text-2xl font-extrabold">Demo balance</h2>
        <p className="mt-2 text-mute">New wallets start with 400 PYM. The faucet adds {pym(FAUCET_CENTS)} once an hour.</p>
        <p className="mt-3 font-display text-3xl font-extrabold tabular-nums">{address ? pym(balance) : "No wallet"}</p>
        <div className="mt-3">
          <Button disabled={busy} onClick={() => void faucet()}>
            Add {pym(FAUCET_CENTS)}
          </Button>
        </div>
        {view.rewards.length ? (
          <ul className="mt-4 flex flex-col gap-2">
            {view.rewards.map((reward) => (
              <li key={reward.id} className="flex items-baseline justify-between gap-3 text-sm">
                <span>{reward.note}</span>
                <span className="shrink-0 font-semibold tabular-nums text-lime">+{pym(reward.amountCents)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-mute">No payouts on this wallet yet. Win an hour, or be holding the winner when its window ends.</p>
        )}
      </section>
      <section className="rounded-2xl border border-line bg-panel p-4">
        <h2 className="font-display text-2xl font-extrabold">Fee clerk</h2>
        <p className="mt-2 text-sm text-mute">
          When an hour ends it collects that hour's creator fees, pays the winner and every holder, and parks your slice. At midnight it pays the daily bonus out of that slice. You do not press claim, and you do not press deploy.
        </p>
        {clerk.holderWallets > 0 ? (
          <p className="mt-3 text-sm">
            {clerk.bySize
              ? `${clerk.lastHourLabel}: ${clerk.holderWallets.toLocaleString("en-US")} wallets still holding ${clerk.winnerTicker} were paid by bag size, from ${pym(clerk.minCents)} to ${pym(clerk.maxCents)}.`
              : `${clerk.lastHourLabel}: ${pym(clerk.eachCents)} to each of ${clerk.holderWallets.toLocaleString("en-US")} wallets still holding ${clerk.winnerTicker}.`}
          </p>
        ) : (
          <p className="mt-3 text-sm text-mute">The next hour that closes is the first one paid under this rule.</p>
        )}
      </section>
    </div>
  );
}

function Tile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-line bg-ink p-4">
      <div className="text-xs text-mute">{label}</div>
      <div className="mt-1 font-display text-2xl font-extrabold tabular-nums">{value}</div>
      {hint ? <div className="text-xs text-mute">{hint}</div> : null}
    </div>
  );
}
