export const PYM_PRICE_USD = 0.073;
export const SUBMIT_USD = 5;
export const START_CENTS = 40_000;
export const FAUCET_CENTS = 10_000;
export const FAUCET_COOLDOWN_MS = 60 * 60 * 1000;
export const MIN_BUY_CENTS = 1_000;
export const MAX_QUEUE = 6;
export const HOLD_NEED_SEC = 600;
export const SELL_RETURN = 0.85;
export const SUPPLY = 1_000_000_000;

export function submitCostCents(): number {
  return Math.round((SUBMIT_USD / PYM_PRICE_USD) * 100);
}

export function usdToCents(usd: number): number {
  if (!Number.isFinite(usd) || usd <= 0) return 0;
  return Math.max(0, Math.round((usd / PYM_PRICE_USD) * 100));
}

export function centsToUsd(cents: number): number {
  return (cents / 100) * PYM_PRICE_USD;
}
