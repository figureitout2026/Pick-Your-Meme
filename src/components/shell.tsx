import { Link } from "@tanstack/react-router";
import { Coins, Images, Plus, Radio, Trophy, Wallet, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Toaster } from "sonner";
import { Button } from "@/components/bits";
import { pym, shortAddr } from "@/lib/pym/format";
import { useWallet, type WalletProvider } from "@/lib/wallet-store";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Desk", icon: Radio },
  { to: "/submit", label: "Launch", icon: Plus },
  { to: "/mine", label: "Mine", icon: Images },
  { to: "/leaderboard", label: "Board", icon: Trophy },
  { to: "/token", label: "PYM", icon: Coins },
] as const;

export function Shell({ children }: { children: ReactNode }) {
  const hydrate = useWallet((s) => s.hydrate);
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-ink text-cream">
      <header className="sticky top-0 z-30 border-b border-line bg-ink">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <Link to="/" className="flex min-w-0 items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-lime font-display text-sm font-extrabold text-lime-ink">
              PY
            </span>
            <span className="truncate font-display text-lg font-extrabold leading-none">Pick Your Meme</span>
          </Link>
          <nav className="pym-topnav ml-auto hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                className="rounded-full px-3 py-2 text-sm text-mute"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <WalletButton />
        </div>
        <p className="border-t border-line px-4 py-2 text-center text-xs text-mute">
          Launch worker deploys each coin on its own. Fee clerk pays every holder by bag size. The desk never buys the coin. Prices here are simulated.
        </p>
        <a
          href="/pick-your-meme-source.zip"
          download="pick-your-meme-source.zip"
          className="block bg-lime px-4 py-3 text-center text-sm font-extrabold text-lime-ink"
        >
          Download the app zip
        </a>
      </header>
      <main className="mx-auto max-w-5xl px-4 pt-5 pb-28 md:pb-16">{children}</main>
      <nav className="pym-nav fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-line bg-ink md:hidden">
        {NAV.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className="flex min-h-14 flex-col items-center justify-center gap-1 text-xs text-mute"
            >
              <Icon className="size-5" strokeWidth={2} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <Toaster theme="dark" position="top-center" />
    </div>
  );
}

function WalletButton() {
  const address = useWallet((s) => s.address);
  const provider = useWallet((s) => s.provider);
  const balance = useWallet((s) => s.balanceCents);
  const ready = useWallet((s) => s.ready);
  const busy = useWallet((s) => s.busy);
  const connect = useWallet((s) => s.connect);
  const disconnect = useWallet((s) => s.disconnect);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pick(next: WalletProvider) {
    const reason = await connect(next);
    if (reason) setError(reason);
    else setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
        className="ml-auto inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-panel px-3 text-sm md:ml-0"
      >
        <Wallet className="size-4 text-lime" />
        {ready && address ? (
          <span className="text-left leading-tight">
            <span className="block font-semibold tabular-nums">{pym(balance)}</span>
            <span className="block text-xs text-mute">{shortAddr(address)}</span>
          </span>
        ) : (
          <span className="font-semibold">{ready ? "Connect" : "…"}</span>
        )}
      </button>
      {open ? (
        <div className="fixed inset-0 z-40 grid place-items-end bg-ink/80 p-4 sm:place-items-center" onClick={() => setOpen(false)}>
          <div
            className="w-full max-w-sm rounded-2xl border border-line bg-panel p-5"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-labelledby="wallet-title"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id="wallet-title" className="font-display text-2xl font-extrabold">
                  {address ? "Wallet" : "Connect"}
                </h2>
                <p className="mt-1 text-sm text-mute">
                  This is a demo wallet saved in this browser. It is not Phantom, Solflare, or a real SOL balance.
                </p>
              </div>
              <button type="button" className="grid size-11 place-items-center rounded-full border border-line" onClick={() => setOpen(false)} aria-label="Close">
                <X className="size-4" />
              </button>
            </div>
            {address ? (
              <div className="mt-4 rounded-xl bg-ink p-4">
                <div className="text-xs uppercase tracking-wide text-mute">{provider}</div>
                <div className="mt-1 font-display text-2xl font-extrabold tabular-nums">{pym(balance)}</div>
                <div className="mt-1 break-all text-xs text-mute">{address}</div>
              </div>
            ) : null}
            {error ? <p className="mt-3 text-sm text-coral">{error}</p> : null}
            <div className="mt-4 flex flex-col gap-2">
              <Button disabled={busy} onClick={() => void pick("phantom")}>
                {address ? "Demo wallet ready" : "Use a demo wallet"}
              </Button>
              {address ? (
                <button type="button" className={cn("min-h-11 text-sm text-mute")} onClick={() => { disconnect(); setOpen(false); }}>
                  Disconnect this browser
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
