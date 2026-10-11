import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button, Media } from "@/components/bits";
import { adminList, adminReject } from "@/lib/pym/api";
import { clockLabel } from "@/lib/pym/format";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({ meta: [{ title: "Review · Pick Your Meme" }] }),
});

type Row = {
  id: string;
  title: string;
  ticker: string;
  caption: string;
  walletLabel: string;
  status: string;
  rejectReason: string | null;
  launchAt: string | null;
  mediaUrl: string;
  mediaKind: "image" | "video";
  canPull: boolean;
};

function AdminPage() {
  const [code, setCode] = useState("pym-floor");
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    const res = await adminList({ data: { code } });
    if (!res.ok) {
      setRows(null);
      setError(res.reason);
      return;
    }
    setRows(res.memes);
  }

  async function pull(id: string) {
    const res = await adminReject({
      data: { code, id, reason: "Reviewer pulled this before launch. Gruesome or NSFW. The entry fee was returned." },
    });
    if (!res.ok) {
      toast(res.reason);
      return;
    }
    toast("Pulled and refunded.");
    await load();
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <div>
        <h1 className="font-display text-4xl font-extrabold">Review queue</h1>
        <p className="mt-2 text-mute">
          Text is auto-screened. This page can still pull a booked coin before its window. Demo code is <span className="text-cream">pym-floor</span>.
        </p>
      </div>
      <label className="flex flex-col gap-1 text-sm">
        Reviewer code
        <input value={code} onChange={(event) => setCode(event.target.value)} className="min-h-11 rounded-xl border border-line bg-panel px-3" />
      </label>
      <Button onClick={() => void load()}>Load queue</Button>
      {error ? <p className="text-sm text-coral">{error}</p> : null}
      <ul className="flex flex-col gap-3">
        {rows?.map((row) => (
          <li key={row.id} className="rounded-2xl border border-line bg-panel p-3">
            <div className="flex gap-3">
              <Media kind={row.mediaKind} url={row.mediaUrl} alt="" className="size-16 rounded-lg object-cover" />
              <div className="min-w-0">
                <div className="font-semibold">
                  {row.title} <span className="text-mute">{row.ticker}</span>
                </div>
                <div className="text-xs text-mute">
                  {row.status} · {row.walletLabel}
                  {row.launchAt ? ` · ${clockLabel(row.launchAt)}` : ""}
                </div>
                <p className="text-sm">{row.caption}</p>
                {row.rejectReason ? <p className="text-sm text-coral">{row.rejectReason}</p> : null}
              </div>
            </div>
            {row.canPull ? (
              <div className="mt-2">
                <Button variant="coral" onClick={() => void pull(row.id)}>
                  Pull and refund
                </Button>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
      {rows && rows.length === 0 ? <p className="text-sm text-mute">No player coins yet. Floor coins are not reviewed.</p> : null}
    </div>
  );
}
