import { env } from "@/lib/env.server";

/** Solana's public mainnet endpoint. Free, shared, and rate limited. No key. */
export const PUBLIC_RPC = "https://api.mainnet-beta.solana.com";

const TTL_MS = 20_000;

type Cache = { at: number; ok: boolean; slot: number | null; label: string };
let cache: Cache | null = null;

export function rpcUrl(): string {
  return env("SOLANA_RPC_URL") ?? PUBLIC_RPC;
}

export async function readRpc(): Promise<{ ok: boolean; slot: number | null; label: string }> {
  const now = Date.now();
  if (cache && now - cache.at < TTL_MS) {
    return { ok: cache.ok, slot: cache.slot, label: cache.label };
  }
  const url = rpcUrl();
  const label = url === PUBLIC_RPC ? "Public Solana RPC" : "Custom RPC";
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "getSlot" }),
      signal: AbortSignal.timeout(4000),
    });
    const body = (await res.json()) as { result?: unknown };
    const slot = typeof body.result === "number" ? body.result : null;
    const next = { at: now, ok: slot != null, slot, label };
    cache = next;
    return { ok: next.ok, slot: next.slot, label };
  } catch {
    const next = { at: now, ok: false, slot: null, label };
    cache = next;
    return { ok: false, slot: null, label };
  }
}
