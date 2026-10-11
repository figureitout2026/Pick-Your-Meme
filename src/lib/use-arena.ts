import { useCallback, useEffect, useRef, useState } from "react";
import { getArena } from "@/lib/pym/api";
import type { Arena } from "@/lib/pym/types";
import { useWallet } from "@/lib/wallet-store";

export function useArena(wallet: string | null, seed?: Arena | null) {
  const [arena, setArena] = useState<Arena | null>(seed ?? null);
  const [error, setError] = useState<string | null>(null);
  const flight = useRef(false);

  const load = useCallback(async () => {
    if (flight.current) return;
    flight.current = true;
    try {
      const data = await getArena({ data: { wallet: wallet ?? "" } });
      setArena(data);
      setError(null);
      if (data.balanceCents != null) useWallet.getState().setBalance(data.balanceCents);
    } catch (err) {
      setError(err instanceof Error ? err.message : "The desk didn't answer.");
    } finally {
      flight.current = false;
    }
  }, [wallet]);

  useEffect(() => {
    const kick = setTimeout(() => void load(), 0);
    const id = setInterval(() => void load(), 5000);
    return () => {
      clearTimeout(kick);
      clearInterval(id);
    };
  }, [load]);

  return { arena, error, loading: !arena, reload: load };
}
