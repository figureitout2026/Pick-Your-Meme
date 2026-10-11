import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { slotLabel } from "@/lib/pym/engine";
import type { Rival } from "@/lib/pym/types";
import { clockLabel } from "@/lib/pym/format";

export function Button({
  variant = "primary",
  className,
  type = "button",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "coral" }) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold transition-transform duration-150 ease-out active:not-disabled:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-40",
        variant === "primary" && "bg-lime text-lime-ink",
        variant === "ghost" && "border border-line bg-panel text-cream",
        variant === "coral" && "bg-coral text-coral-ink",
        className,
      )}
      {...props}
    />
  );
}

export function Media({
  kind,
  url,
  alt,
  className,
  play,
}: {
  kind: "image" | "video";
  url: string;
  alt: string;
  className?: string;
  play?: boolean;
}) {
  if (kind === "video") {
    return <video src={url} className={className} muted playsInline loop={!!play} autoPlay={!!play} controls={!play} />;
  }
  return <img src={url} alt={alt} className={className} />;
}

export function Pill({ children, tone = "mute" }: { children: ReactNode; tone?: "mute" | "live" | "lime" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide uppercase",
        tone === "mute" && "bg-panel-2 text-mute",
        tone === "live" && "bg-coral text-coral-ink",
        tone === "lime" && "bg-lime text-lime-ink",
      )}
    >
      {tone === "live" ? <span className="live-dot size-1.5 rounded-full bg-coral-ink" /> : null}
      {children}
    </span>
  );
}

export function RivalList({ rivals }: { rivals: Rival[] }) {
  if (!rivals.length) {
    return <p className="text-sm text-mute">No one else is booked in this hour yet. Five seats can still fill before the bell.</p>;
  }
  return (
    <ul className="flex flex-col gap-2">
      {rivals.map((rival) => (
        <li key={rival.id} className="flex items-center justify-between gap-3 rounded-xl border border-line bg-ink px-3 py-2">
          <div className="min-w-0">
            <div className="truncate font-semibold">
              {rival.title} <span className="text-mute">{rival.ticker}</span>
            </div>
            <div className="text-xs text-mute">{rival.isYours ? "You" : rival.walletLabel}</div>
          </div>
          <div className="shrink-0 text-right text-sm tabular-nums">
            <div>{slotLabel(rival.slot)}</div>
            <div className="text-xs text-mute">{clockLabel(rival.launchAt)}</div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function CoinLink({ id, className, children }: { id: string; className?: string; children: ReactNode }) {
  return (
    <Link to="/coin/$id" params={{ id }} className={className}>
      {children}
    </Link>
  );
}
