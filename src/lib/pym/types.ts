import type { Phase } from "@/lib/pym/engine";

export type Coin = {
  id: string;
  wallet: string;
  walletLabel: string;
  title: string;
  ticker: string;
  caption: string;
  mediaKind: "image" | "video";
  mediaUrl: string;
  isSeed: boolean;
  hourKey: string;
  dayKey: string;
  slot: number;
  launchAt: string;
  windowEnd: string;
  phase: Phase;
  seedKey: string;
  price: number;
  mcap: number;
  ath: number;
  volume: number;
  holders: number;
  changePct: number;
  windowChangePct: number;
  score: number;
  creatorFeeUsd: number;
  mint: string;
};

export type Rival = {
  id: string;
  title: string;
  ticker: string;
  slot: number;
  launchAt: string;
  walletLabel: string;
  isYours: boolean;
};

export type PositionView = {
  memeId: string;
  title: string;
  ticker: string;
  qtyCents: number;
  heldSeconds: number;
  holding: boolean;
  qualified: boolean;
  canStillQualify: boolean;
  secondsLeft: number;
};

export type RewardView = {
  id: string;
  kind: string;
  amountCents: number;
  note: string;
  hourKey: string | null;
  createdAt: string;
};

export type HourPayout = {
  hourKey: string;
  hourLabel: string;
  winnerId: string | null;
  winnerTicker: string;
  potUsd: number;
  winnerCutUsd: number;
  holderCutUsd: number;
  remainingUsd: number;
  winnerCents: number;
  holderCents: number;
  holderWallets: number;
  eachCents: number;
  bySize: boolean;
  minCents: number;
  maxCents: number;
};

export type LaunchWorker = {
  automatic: true;
  holdsTokens: 0;
  nextLaunchAt: string | null;
  nextTitle: string | null;
  nextTicker: string | null;
  nextSlot: number | null;
  deployedToday: number;
  rpcOk: boolean;
  rpcSlot: number | null;
  rpcLabel: string;
};

export type Treasury = {
  balanceCents: number;
  listingCents: number;
  parkedCents: number;
};

export type Clerk = {
  automatic: true;
  lastHourLabel: string | null;
  holderWallets: number;
  eachCents: number;
  bySize: boolean;
  minCents: number;
  maxCents: number;
  winnerTicker: string;
};

export type FeeView = {
  hourPot: number;
  hourProjected: boolean;
  winnerCut: number;
  holderCut: number;
  hourRemaining: number;
  dayRemaining: number;
  dailyCreatorCut: number;
  allHoldersCut: number;
  platformCut: number;
  dayProjected: boolean;
  hourWinnerId: string | null;
  dayWinnerId: string | null;
};

export type Arena = {
  now: string;
  hourKey: string;
  hourLabel: string;
  dayKey: string;
  dayLabel: string;
  liveSlot: number | null;
  secondsLeftInWindow: number;
  coins: (Coin | null)[];
  hourRank: Coin[];
  upcoming: { hourKey: string; hourLabel: string; coins: (Coin | null)[] }[];
  dailyTop: Coin[];
  fees: FeeView;
  clerk: Clerk;
  worker: LaunchWorker;
  treasury: Treasury;
  lastPayout: HourPayout | null;
  balanceCents: number | null;
  positions: PositionView[];
  rewards: RewardView[];
  yourNext: Coin | null;
};

export type MineCard = {
  id: string;
  title: string;
  ticker: string;
  caption: string;
  mediaKind: "image" | "video";
  mediaUrl: string;
  status: "rejected" | "upcoming" | "scheduled" | "live" | "settled";
  rejectReason: string | null;
  hourKey: string | null;
  hourLabel: string | null;
  slot: number | null;
  launchAt: string | null;
  queuePosition: number | null;
  rivals: Rival[];
  score: number | null;
  mcap: number | null;
  changePct: number | null;
};

export type SubmitOk = {
  ok: true;
  id: string;
  title: string;
  ticker: string;
  launchAt: string;
  hourKey: string;
  hourLabel: string;
  slot: number;
  queuePosition: number;
  rivals: Rival[];
  balanceCents: number;
};

export type Fail = { ok: false; reason: string };
