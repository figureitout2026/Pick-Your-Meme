import { create } from "zustand";
import { connectWallet } from "@/lib/pym/api";
import { hash } from "@/lib/pym/engine";

const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const KEY = "pym.wallet";

export type WalletProvider = "phantom" | "solflare";

export function makeAddress(seed: string): string {
  let h = hash(seed);
  let out = "pym";
  for (let i = 0; i < 32; i++) {
    h = Math.imul(h ^ (h >>> 13), 0x5bd1e995);
    out += ALPHABET[(h >>> 0) % ALPHABET.length];
  }
  return out;
}

type State = {
  address: string | null;
  provider: WalletProvider | null;
  balanceCents: number;
  ready: boolean;
  busy: boolean;
  hydrate: () => void;
  connect: (provider: WalletProvider) => Promise<string | null>;
  disconnect: () => void;
  setBalance: (cents: number) => void;
};

export const useWallet = create<State>((set) => ({
  address: null,
  provider: null,
  balanceCents: 0,
  ready: true,
  busy: false,
  hydrate: () => {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) {
        set({ ready: true });
        return;
      }
      const saved = JSON.parse(raw) as { address: string; provider: WalletProvider };
      set({ address: saved.address, provider: saved.provider, ready: true });
      void connectWallet({ data: { address: saved.address, provider: saved.provider } }).then((res) => {
        if (res.ok) set({ balanceCents: res.balanceCents, provider: res.provider });
      });
    } catch {
      set({ ready: true });
    }
  },
  connect: async (provider) => {
    set({ busy: true });
    try {
      let secret = localStorage.getItem("pym.secret");
      if (!secret) {
        secret = crypto.randomUUID();
        localStorage.setItem("pym.secret", secret);
      }
      const address = makeAddress(`${provider}:${secret}`);
      const res = await connectWallet({ data: { address, provider } });
      if (!res.ok) return res.reason;
      localStorage.setItem(KEY, JSON.stringify({ address, provider }));
      set({ address, provider, balanceCents: res.balanceCents, ready: true });
      return null;
    } catch (error) {
      return error instanceof Error ? error.message : "Could not connect.";
    } finally {
      set({ busy: false });
    }
  },
  disconnect: () => {
    localStorage.removeItem(KEY);
    set({ address: null, provider: null, balanceCents: 0 });
  },
  setBalance: (cents) => set({ balanceCents: cents }),
}));
