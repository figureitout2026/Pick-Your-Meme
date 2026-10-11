import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button, Pill, RivalList } from "@/components/bits";
import { getPreview, submitMeme } from "@/lib/pym/api";
import { clockLabel, pym } from "@/lib/pym/format";
import { slotLabel } from "@/lib/pym/engine";
import { PYM_PRICE_USD, SUBMIT_USD, submitCostCents } from "@/lib/pym/money";
import { suggestTicker } from "@/lib/pym/moderate";
import type { Rival, SubmitOk } from "@/lib/pym/types";
import { useWallet } from "@/lib/wallet-store";

export const Route = createFileRoute("/submit")({
  component: SubmitPage,
  head: () => ({ meta: [{ title: "Launch · Pick Your Meme" }] }),
});

type Preview = {
  next: { hourKey: string; hourLabel: string; slot: number; launchAt: string } | null;
  rivals: Rival[];
  openSeats: number;
  costCents: number;
};

function SubmitPage() {
  const address = useWallet((s) => s.address);
  const balance = useWallet((s) => s.balanceCents);
  const setBalance = useWallet((s) => s.setBalance);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [title, setTitle] = useState("");
  const [ticker, setTicker] = useState("");
  const [tickerTouched, setTickerTouched] = useState(false);
  const [caption, setCaption] = useState("");
  const [media, setMedia] = useState<{ kind: "image" | "video"; url: string } | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [receipt, setReceipt] = useState<SubmitOk | null>(null);
  const [reject, setReject] = useState<string | null>(null);
  const cost = submitCostCents();

  useEffect(() => {
    let stop = false;
    const load = async () => {
      try {
        const data = await getPreview();
        if (!stop) setPreview(data);
      } catch {
        if (!stop) setPreview(null);
      }
    };
    void load();
    const id = setInterval(() => void load(), 5000);
    return () => {
      stop = true;
      clearInterval(id);
    };
  }, []);

  async function onFile(file: File | undefined) {
    setFileError(null);
    setMedia(null);
    if (!file) return;
    try {
      const next = await fileToMedia(file);
      setMedia(next);
    } catch (error) {
      setFileError(error instanceof Error ? error.message : "Could not read that file.");
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setReject(null);
    if (!address) {
      toast("Connect a demo wallet first.");
      return;
    }
    if (!media) {
      setFileError("Add an image or a short video.");
      return;
    }
    setBusy(true);
    try {
      const res = await submitMeme({
        data: {
          wallet: address,
          title,
          ticker: ticker || suggestTicker(title),
          caption,
          mediaKind: media.kind,
          mediaUrl: media.url,
        },
      });
      if (!res.ok) {
        setReject(res.reason);
        return;
      }
      setBalance(res.balanceCents);
      setReceipt(res);
    } catch (error) {
      setReject(error instanceof Error ? error.message : "Submit failed.");
    } finally {
      setBusy(false);
    }
  }

  if (receipt) {
    return (
      <section className="mx-auto flex max-w-xl flex-col gap-4">
        <Pill tone="lime">Booked</Pill>
        <h1 className="font-display text-4xl font-extrabold">{receipt.title} is on the desk</h1>
        <p className="text-lg">
          Launches {clockLabel(receipt.launchAt)} · {receipt.hourLabel} hour · seat {slotLabel(receipt.slot)}.
        </p>
        <p className="text-mute">
          Queue position {receipt.queuePosition}. You are up against {receipt.rivals.length ? "these coins" : "an open hour"}.
        </p>
        <RivalList rivals={receipt.rivals} />
        <div className="flex flex-wrap gap-2">
          <Link to="/mine" className="inline-flex min-h-11 items-center rounded-full bg-lime px-4 text-sm font-semibold text-lime-ink">
            My memes
          </Link>
          <Link to="/" className="inline-flex min-h-11 items-center rounded-full border border-line px-4 text-sm font-semibold">
            Back to the desk
          </Link>
        </div>
      </section>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <form className="flex flex-col gap-4" onSubmit={(event) => void onSubmit(event)}>
        <div>
          <h1 className="font-display text-4xl font-extrabold">Launch a meme</h1>
          <p className="mt-2 text-mute">
            Entry is ${SUBMIT_USD} of PYM — {pym(cost)} at ${PYM_PRICE_USD.toFixed(3)}. That listing fee goes straight to the treasury. Clean memes take the next open seat, and the launch worker deploys them when the window opens.
          </p>
        </div>
        <label className="flex flex-col gap-1 text-sm">
          Name
          <input
            required
            maxLength={28}
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              if (!tickerTouched) setTicker(suggestTicker(event.target.value));
            }}
            className="min-h-11 rounded-xl border border-line bg-panel px-3 text-base text-cream"
            placeholder="Toaster Cat"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Ticker
          <input
            required
            maxLength={6}
            value={ticker}
            onChange={(event) => {
              setTickerTouched(true);
              setTicker(event.target.value.toUpperCase());
            }}
            className="min-h-11 rounded-xl border border-line bg-panel px-3 text-base tracking-widest text-cream uppercase"
            placeholder="TOAST"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Caption
          <textarea
            maxLength={140}
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            className="min-h-24 rounded-xl border border-line bg-panel px-3 py-2 text-base text-cream"
            placeholder="One line. No gore, no NSFW."
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Image or short video
          <input
            type="file"
            accept="image/*,video/mp4,video/webm"
            className="min-h-11 text-sm text-mute file:mr-3 file:min-h-11 file:rounded-full file:border-0 file:bg-lime file:px-4 file:font-semibold file:text-lime-ink"
            onChange={(event) => void onFile(event.target.files?.[0])}
          />
        </label>
        {media?.kind === "image" ? <img src={media.url} alt="Upload preview" className="aspect-square w-40 rounded-2xl object-cover" /> : null}
        {media?.kind === "video" ? <video src={media.url} controls className="w-full max-w-xs rounded-2xl" /> : null}
        {fileError ? <p className="text-sm text-coral">{fileError}</p> : null}
        <p className="text-sm text-mute">
          Text is screened on the way in. Gruesome or NSFW copy is rejected and you are not charged. A reviewer can still pull a coin before it launches.
        </p>
        {reject ? <p className="rounded-xl border border-coral bg-coral-ink p-3 text-sm text-cream">{reject}</p> : null}
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={busy || !address}>
            {busy ? "Booking…" : `Pay ${pym(cost)} and book`}
          </Button>
          <span className="text-sm text-mute tabular-nums">{address ? `${pym(balance)} in wallet` : "Connect a wallet to pay"}</span>
        </div>
      </form>
      <aside className="h-fit rounded-2xl border border-line bg-panel p-4">
        <h2 className="font-display text-xl font-extrabold">Next open seat</h2>
        {preview?.next ? (
          <>
            <p className="mt-2 text-lg font-semibold">
              {preview.next.hourLabel} · {slotLabel(preview.next.slot)}
            </p>
            <p className="text-sm text-mute">{clockLabel(preview.next.launchAt)}</p>
            <p className="mt-2 text-sm text-mute">{preview.openSeats} other seats in that hour are still empty. Anyone can take them before you launch.</p>
            <div className="mt-3">
              <RivalList rivals={preview.rivals} />
            </div>
          </>
        ) : (
          <p className="mt-2 text-sm text-mute">Checking the queue…</p>
        )}
      </aside>
    </div>
  );
}

function fileToMedia(file: File): Promise<{ kind: "image" | "video"; url: string }> {
  if (file.type.startsWith("video/")) {
    if (file.size > 350_000) return Promise.reject(new Error("Video is over 350 KB. Use a still. Big clips don't survive a publish."));
    return readAsData(file).then((url) => ({ kind: "video" as const, url }));
  }
  if (!file.type.startsWith("image/")) return Promise.reject(new Error("Use an image or a short mp4/webm."));
  if (file.type === "image/gif" && file.size < 500_000) {
    return readAsData(file).then((url) => ({ kind: "image" as const, url }));
  }
  return shrinkImage(file).then((url) => ({ kind: "image" as const, url }));
}

function readAsData(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read that file."));
    reader.readAsDataURL(file);
  });
}

async function shrinkImage(file: File): Promise<string> {
  const data = await readAsData(file);
  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Could not read that image."));
    img.src = data;
  });
  const max = 960;
  const scale = Math.min(1, max / Math.max(img.width, img.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(img.width * scale));
  canvas.height = Math.max(1, Math.round(img.height * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) return data;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const jpeg = canvas.toDataURL("image/jpeg", 0.82);
  return jpeg.length < data.length ? jpeg : data;
}
