/**
 * Reasoning payload builders — the single source of truth for the reasoning
 * modal, the recap, exports, and the parlay builder. Every field is derived from
 * engine output computed on live data; nothing here is invented or narrated.
 */
import type { Market, Prediction, Profile } from "./types";
import { amToProb } from "./market";

const pctI = (v: number) => Math.round(v * 100);

export interface Driver {
  label: string;
  detail: string;
  favors: string; // fighter last name the factor favors
  weight: number;
  dir: "+" | "-";
}

export interface Leg {
  bout: {
    id: string;
    eventId: string;
    order: number;
    weightClass: string;
    rounds: number;
    isMainEvent: boolean;
    isTitle: boolean;
  };
  fighters: { a: { id: string; name: string; last: string }; b: { id: string; name: string; last: string } };
  pick: {
    winnerId: string;
    winnerName: string;
    winProb: number;
    winProbDisplay: number;
    tier: "LEAN" | "SOLID" | "STRONG";
    anchored: boolean;
    valueDog: boolean;
  };
  method: {
    top: string;
    topProb: number;
    matrix: { a: { ko: number; sub: number; dec: number }; b: { ko: number; sub: number; dec: number } };
  };
  round: {
    mode: "veteran" | "standard";
    call: string | null;
    modalRound: number | null;
    modalProb: number | null;
    histogram: { [k: string]: number };
    gateReason: string | null;
  };
  distance: { goesDistanceProb: number; ouLine: number | null };
  market: { mlA: number; mlB: number; impliedA: number; nudgePts: number; moved: boolean; provider: string } | null;
  dataQuality: { fightsSweptA: number; fightsSweptB: number; lowData: boolean; minSample: number; asOf: string };
  /** Full reasoning for expand-per-bout render (kept in the one payload; no recompute). */
  reasoning: {
    drivers: Driver[];
    mostLikelyPath: { who: string; how: string; prob: number };
    finishProb: number;
    feeds: string[];
  };
}

const FEEDS = ["ESPN scoreboard", "ESPN core (athlete, records, event log, per-fight stats)", "ESPN BET odds"];

function tierWord(t: string): "LEAN" | "SOLID" | "STRONG" {
  return t === "STRONG" ? "STRONG" : t === "SOLID" ? "SOLID" : "LEAN";
}

/** Build the canonical per-bout leg from engine output. */
export function buildLeg(
  meta: { id: string; eventId: string; order: number; weightClass: string; rounds: number; isMainEvent: boolean; isTitle: boolean },
  A: Profile,
  B: Profile,
  P: Prediction,
  market: Market | null,
  tier: string,
): Leg {
  const winnerIsA = P.pA >= 0.5;
  const winnerId = winnerIsA ? A.bio.id : B.bio.id;
  const winProb = P.favP;
  const anchored = P.anchored;
  const valueDog = anchored && market != null && ((winnerIsA && market.pA < 0.5) || (!winnerIsA && market.pA >= 0.5));

  const rp = P.round;
  let call: string | null = null;
  if (rp.mode === "veteran") call = rp.modal === "distance" ? "Distance" : "R" + rp.modal;
  else if (rp.finishLikely) call = rp.lean === "early" ? "Finish-early" : "Finish-late";
  else call = "Distance";
  const modalRound = rp.mode === "veteran" && typeof rp.modal === "number" ? rp.modal : null;
  const modalProb = rp.mode === "veteran" && typeof rp.modal === "number" ? rp.modalP ?? null : null;

  const goesDistanceProb = P.matrix.a.dec + P.matrix.b.dec;

  const drivers: Driver[] = P.factors.map((f) => ({
    label: f.label,
    detail: f.detail,
    favors: f.w > 0 ? A.bio.last : B.bio.last,
    weight: Math.abs(f.w),
    dir: f.w > 0 ? "+" : "-",
  }));

  return {
    bout: meta,
    fighters: {
      a: { id: A.bio.id, name: A.bio.name, last: A.bio.last },
      b: { id: B.bio.id, name: B.bio.name, last: B.bio.last },
    },
    pick: {
      winnerId,
      winnerName: P.favName,
      winProb,
      winProbDisplay: Math.min(winProb, 0.85),
      tier: tierWord(tier),
      anchored,
      valueDog,
    },
    method: {
      top: P.top.how,
      topProb: P.top.v,
      matrix: { a: P.matrix.a, b: P.matrix.b },
    },
    round: {
      mode: rp.mode,
      call,
      modalRound,
      modalProb,
      histogram: rp.dist,
      gateReason: rp.mode === "standard" ? rp.gateReason ?? null : null,
    },
    distance: { goesDistanceProb, ouLine: market?.ou ?? null },
    market: anchored && market
      ? {
          mlA: market.mlA,
          mlB: market.mlB,
          impliedA: market.pA,
          nudgePts: P.nudge * 100,
          moved: market.openA != null && Math.abs(amToProb(market.mlA) - amToProb(market.openA)) > 0.02,
          provider: market.provider,
        }
      : null,
    dataQuality: {
      fightsSweptA: A.hist.fights.length,
      fightsSweptB: B.hist.fights.length,
      lowData: P.lowData,
      minSample: Math.min(A.agg.n, B.agg.n),
      asOf: new Date().toISOString(),
    },
    reasoning: {
      drivers,
      mostLikelyPath: { who: P.top.who, how: P.top.how, prob: P.top.v },
      finishProb: P.finishP,
      feeds: FEEDS,
    },
  };
}

/* ---------------- parlay builder ---------------- */
export interface ParlayLeg {
  boutId: string;
  type: "winner" | "method" | "round" | "ou-rounds" | "goes-distance";
  selection: string;
  legProb: number;
  valueDog: boolean;
  rationale: string;
}
export interface Parlay {
  id: string;
  label: string;
  isSuggestion: true;
  legs: ParlayLeg[];
  combinedProb: number;
  independenceCaveat: true;
}

const WORD: Record<number, string> = { 3: "triple", 4: "four-leg", 5: "five-leg" };

function winnerLeg(l: Leg): ParlayLeg {
  const wp = pctI(l.pick.winProb);
  const last = l.pick.winnerName.split(" ").pop();
  let rationale: string;
  if (l.pick.valueDog) {
    rationale = `Underdog on the line; model backs ${last} at ${wp}%.`;
  } else if (l.pick.anchored && l.market) {
    const winImplied = pctI(l.pick.winnerId === l.fighters.a.id ? l.market.impliedA : 1 - l.market.impliedA);
    rationale = `Model ${wp}%, market ${winImplied}%.`;
  } else {
    rationale = `Stats-only read: ${last} ${wp}%.`;
  }
  return { boutId: l.bout.id, type: "winner", selection: l.pick.winnerName, legProb: l.pick.winProb, valueDog: l.pick.valueDog, rationale };
}
function methodLeg(l: Leg): ParlayLeg {
  const last = l.pick.winnerName.split(" ").pop();
  return {
    boutId: l.bout.id,
    type: "method",
    selection: `${l.pick.winnerName} by ${l.method.top}`,
    legProb: l.method.topProb,
    valueDog: l.pick.valueDog,
    rationale: `${last}'s ${l.method.top} is the top cell at ${pctI(l.method.topProb)}%.`,
  };
}
function roundLeg(l: Leg): ParlayLeg {
  return {
    boutId: l.bout.id,
    type: "round",
    selection: `Ends R${l.round.modalRound}`,
    legProb: l.round.modalProb!,
    valueDog: l.pick.valueDog,
    rationale: `Veteran finish-timing peaks at R${l.round.modalRound} (${pctI(l.round.modalProb!)}%).`,
  };
}
const mk = (id: string, label: string, legs: ParlayLeg[]): Parlay => ({
  id,
  label,
  isSuggestion: true,
  legs,
  combinedProb: legs.reduce((t, l) => t * l.legProb, 1),
  independenceCaveat: true,
});

/** 0–3 suggestion parlays; guardrails enforced here, not in copy. */
export function buildParlays(legs: Leg[]): Parlay[] {
  const out: Parlay[] = [];

  const conf = [...legs].sort((a, b) => b.pick.winProb - a.pick.winProb).slice(0, 4);
  if (conf.length >= 3) out.push(mk("confidence", `Confidence ${WORD[conf.length] || conf.length + "-leg"}`, conf.map(winnerLeg)));

  const dogs = legs.filter((l) => l.pick.valueDog).sort((a, b) => b.pick.winProb - a.pick.winProb).slice(0, 4);
  if (dogs.length >= 3) out.push(mk("value-dogs", `Value-dog ${WORD[dogs.length] || dogs.length + "-leg"}`, dogs.map(winnerLeg)));

  // finishes: veteran-gate round legs where available, else top method-finish cells
  const finishers = legs
    .filter((l) => l.method.top !== "Decision")
    .sort((a, b) => b.method.topProb - a.method.topProb)
    .slice(0, 4);
  if (finishers.length >= 3)
    out.push(
      mk(
        "finishes",
        `Finish ${WORD[finishers.length] || finishers.length + "-leg"}`,
        finishers.map((l) => (l.round.mode === "veteran" && l.round.modalRound ? roundLeg(l) : methodLeg(l))),
      ),
    );

  return out.slice(0, 3);
}

/* ---------------- card assembler ---------------- */
export interface Card {
  event: { id: string; name: string; date: string; asOf: string };
  legs: Leg[];
  parlays: Parlay[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function assembleCard(ev: any, legs: Leg[]): Card {
  return {
    event: { id: String(ev.id), name: ev.name || "UFC Event", date: ev.date, asOf: new Date().toISOString() },
    legs,
    parlays: buildParlays(legs),
  };
}
