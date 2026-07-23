/**
 * Single entry point for "what's the market on this bout?".
 *
 * Order: The Odds API (real sportsbook moneylines) -> ESPN odds -> none.
 * ESPN is kept as a fallback so the app still works with no key configured and
 * so it picks odds back up automatically if ESPN ever restores its MMA feed.
 */
import { getOddsRaw } from "./espn";
import { parseMarket } from "@/lib/engine/market";
import { oddsApiMarket } from "./oddsapi";
import type { Market } from "@/lib/engine/types";

export async function resolveMarket(
  evId: string,
  compId: string,
  idA: string,
  idB: string,
  nameA: string,
  nameB: string,
): Promise<Market | null> {
  const fromBooks = await oddsApiMarket(nameA, nameB).catch(() => null);
  if (fromBooks) return fromBooks;
  try {
    return parseMarket(await getOddsRaw(evId, compId), idA, idB);
  } catch {
    return null;
  }
}
