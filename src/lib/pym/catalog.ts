import { hash } from "@/lib/pym/engine";

export type CatalogItem = {
  slug: string;
  title: string;
  ticker: string;
  caption: string;
};

export const CATALOG: CatalogItem[] = [
  {
    slug: "toaster-cat",
    title: "Toaster Cat",
    ticker: "TOAST",
    caption: "He popped up and never went back down.",
  },
  {
    slug: "chain-frog",
    title: "Chain Frog",
    ticker: "FROG",
    caption: "Sitting on a melting coin like it pays rent.",
  },
  {
    slug: "laser-pigeon",
    title: "Laser Pigeon",
    ticker: "LAZR",
    caption: "The alley elected him. He accepted.",
  },
  {
    slug: "dumpster-diamond",
    title: "Dumpster Diamond",
    ticker: "DMPD",
    caption: "Found it. Not asking where.",
  },
  {
    slug: "boba-samurai",
    title: "Boba Samurai",
    ticker: "BOBA",
    caption: "Pearls for armor. Taro for patience.",
  },
  {
    slug: "cry-goldfish",
    title: "Cry Goldfish",
    ticker: "CRYF",
    caption: "The bowl cracked. The moon did not.",
  },
  {
    slug: "moon-burrito",
    title: "Moon Burrito",
    ticker: "BURR",
    caption: "Cheddar trail, straight up.",
  },
  {
    slug: "ticket-goblin",
    title: "Ticket Goblin",
    ticker: "FINE",
    caption: "He writes the fine. He is the fine.",
  },
];

export function catalogFor(hourKey: string, slot: number): CatalogItem {
  const idx = (hash(hourKey) + slot * 3) % CATALOG.length;
  return CATALOG[idx];
}
