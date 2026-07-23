/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * The Odds API adapter — real sportsbook moneylines (DraftKings, FanDuel,
 * BetMGM, …) for UFC/MMA.
 *
 * Why this exists: ESPN's odds feed returns an empty `items` array for every UFC
 * bout (verified on both upcoming AND completed events), so the engine's
 * market anchor had no input. This restores it from a live book feed.
 *
 * Cost control: ONE request returns every upcoming MMA event, so a refresh is a
 * single credit. The TTL is adaptive — short during fight week (when lines
 * actually move and get posted), long otherwise — so a free 500/month key is
 * enough to stay current. Override with ODDS_TTL_FIGHTWEEK_MIN / ODDS_TTL_MIN.
 *
 * Not covered by this feed (documented honestly rather than faked):
 *   - victory-method prices  -> the method matrix stays model-only
 *   - opening lines          -> line-movement arrows stay unavailable
 */
import { cached, MIN } from "@/lib/cache";
import { getCalendar } from "./espn";
import { amToProb } from "@/lib/engine/market";
import type { Market } from "@/lib/engine/types";

const API = "https://api.the-odds-api.com/v4/sports/mma_mixed_martial_arts/odds";

/** Preferred books, best first. First one quoting a bout wins (real, quotable prices). */
const BOOK_PREFERENCE = ["draftkings", "fanduel", "betmgm", "williamhill_us", "betrivers", "caesars"];

const FIGHTWEEK_MIN = Number(process.env.ODDS_TTL_FIGHTWEEK_MIN || 15);
const IDLE_MIN = Number(process.env.ODDS_TTL_MIN || 240);
/** Treat "fight week" as any MMA event starting within this many hours. */
const FIGHTWEEK_HOURS = Number(process.env.ODDS_FIGHTWEEK_HOURS || 72);

export const hasOddsApi = () => Boolean(process.env.ODDS_API_KEY);

export interface OddsEvent {
  id: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: { key: string; title: string; last_update: string; markets: { key: string; outcomes: { name: string; price: number }[] }[] }[];
}

/* ---------------- name matching ---------------- */
const COMBINING = /[̀-ͯ]/g;
const norm = (s: string) =>
  (s || "")
    .normalize("NFD")
    .replace(COMBINING, "")
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
const lastOf = (s: string) => norm(s).split(" ").filter(Boolean).pop() || "";

/** Same fighter? Full normalized name, or a last-name match (books abbreviate). */
function sameFighter(a: string, b: string): boolean {
  const na = norm(a), nb = norm(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  const la = lastOf(a), lb = lastOf(b);
  return la.length > 2 && la === lb;
}

/* ---------------- fetch ---------------- */
async function ttlMs(): Promise<number> {
  try {
    const { cal } = await getCalendar();
    const now = Date.now();
    const next = cal
      .map((c) => +new Date(c.start))
      .filter((t) => t > now - 6 * 3_600_000)
      .sort((a, b) => a - b)[0];
    if (next && (next - now) / 3_600_000 <= FIGHTWEEK_HOURS) return FIGHTWEEK_MIN * MIN;
  } catch {}
  return IDLE_MIN * MIN;
}

/** All upcoming MMA odds in one cached request. Empty array when unconfigured. */
export async function fetchMmaOdds(): Promise<OddsEvent[]> {
  const key = process.env.ODDS_API_KEY;
  if (!key) return [];
  const ttl = await ttlMs();
  return cached<OddsEvent[]>("oddsapi:mma:h2h", ttl, async () => {
    const url = `${API}/?apiKey=${encodeURIComponent(key)}&regions=us&markets=h2h&oddsFormat=american`;
    const r = await fetch(url, { cache: "no-store" });
    if (!r.ok) throw new Error(`odds api ${r.status}`);
    const data = await r.json();
    return Array.isArray(data) ? (data as OddsEvent[]) : [];
  });
}

/* ---------------- normalize to the engine's Market ---------------- */
/**
 * Find a bout by fighter names and convert the best available book's moneyline
 * into the engine's Market shape (de-vigged pA, as the original did).
 */
export async function oddsApiMarket(nameA: string, nameB: string): Promise<Market | null> {
  let events: OddsEvent[] = [];
  try {
    events = await fetchMmaOdds();
  } catch {
    return null;
  }
  if (!events.length) return null;

  for (const ev of events) {
    const homeIsA = sameFighter(ev.home_team, nameA) && sameFighter(ev.away_team, nameB);
    const homeIsB = sameFighter(ev.home_team, nameB) && sameFighter(ev.away_team, nameA);
    if (!homeIsA && !homeIsB) continue;

    const books = [...(ev.bookmakers || [])].sort((x, y) => {
      const ix = BOOK_PREFERENCE.indexOf(x.key), iy = BOOK_PREFERENCE.indexOf(y.key);
      return (ix < 0 ? 99 : ix) - (iy < 0 ? 99 : iy);
    });

    for (const bk of books) {
      const h2h = (bk.markets || []).find((m) => m.key === "h2h");
      if (!h2h) continue;
      const oA = h2h.outcomes.find((o) => sameFighter(o.name, nameA));
      const oB = h2h.outcomes.find((o) => sameFighter(o.name, nameB));
      if (!oA || !oB || !Number.isFinite(oA.price) || !Number.isFinite(oB.price)) continue;

      const ia = amToProb(oA.price), ib = amToProb(oB.price);
      if (!(ia + ib > 0)) continue;
      return {
        provider: bk.title || bk.key,
        mlA: oA.price,
        mlB: oB.price,
        openA: null, // opening lines are not in this feed
        openB: null,
        pA: ia / (ia + ib), // de-vigged, same as the ESPN path
        vmA: null, // victory-method prices not offered on this feed
        vmB: null,
        ou: null,
      };
    }
  }
  return null;
}
