/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Dev cards — the honest, locked-before/graded-after track record.
 *  - lockCard: snapshot an UPCOMING card's picks (pre-result, so it's a real lock).
 *  - gradeCard: once results are final (≥ ~30h past), compare the locked picks to
 *    what actually happened. Never re-runs the engine on a finished event.
 *  - listDevCards / buildSummary: assemble the graded scorecards + a computed summary.
 * A card only surfaces if it was genuinely locked while the event was still upcoming.
 */
import { getEventById } from "./data/espn";
import { shapeEvent } from "./data/shape";
import { computeCardLegs } from "./data/card";
import { readJSON, writeJSON, listIds, has } from "./store";

const GRADE_DELAY_MS = 30 * 3_600_000; // ~1 day + margin ("Saturday → Sunday")

export interface LockedLeg {
  compId: string;
  order: number;
  aName: string;
  bName: string;
  weightClass: string;
  rounds: number;
  pick: { winnerName: string; winProb: number; winProbDisplay: number; tier: string };
  method: { top: string };
  round: { mode: "veteran" | "standard"; call: string | null; modalRound: number | null };
}
export interface LockedCard {
  eventId: string;
  eventName: string;
  date: string;
  lockedAt: string;
  legs: LockedLeg[];
}
export interface GradedRow {
  fight: string;
  pickName: string;
  pickPct: number; // 0-1
  result: string;
  winnerHit: boolean;
  methodHit: boolean;
  roundHit: boolean;
  roundSoft: boolean;
}
export interface GradedCard {
  eventId: string;
  eventName: string;
  date: string;
  seed?: boolean;
  rows: GradedRow[];
  tallies: { winners: number; methods: number; rounds: number; n: number };
}

const last = (name: string) => name.trim().split(" ").pop() || name;
const lockedMethodKind = (top: string) => (top === "KO/TKO" ? "ko" : top === "Submission" ? "sub" : "dec");
function methodKindFromText(t: string): "ko" | "sub" | "dec" {
  const s = (t || "").toLowerCase();
  if (s.includes("ko") || s.includes("tko")) return "ko";
  if (s.includes("sub")) return "sub";
  return "dec";
}
const kindShort = (k: string) => (k === "ko" ? "TKO" : k === "sub" ? "Sub" : "Dec");

function gradeRound(call: string | null, actualRound: number, wentDistance: boolean): { hit: boolean; soft: boolean } {
  if (!call) return { hit: false, soft: true };
  if (call === "Distance") return { hit: wentDistance, soft: false };
  const m = call.match(/^R(\d+)$/);
  if (m) return { hit: !wentDistance && actualRound === +m[1], soft: false };
  if (call === "Finish-early") return { hit: !wentDistance && actualRound === 1, soft: true };
  if (call === "Finish-late") return { hit: !wentDistance && actualRound >= 2, soft: true };
  return { hit: false, soft: true };
}

/** Snapshot an upcoming card's picks. No-op if already locked or the event is past. */
export async function lockCard(evId: string): Promise<void> {
  if (await has(`locked/${evId}.json`)) return;
  const res = await computeCardLegs(evId);
  if (!res) return;
  const dateStr = res.ev.date;
  if (+new Date(dateStr) <= Date.now()) return; // only lock while genuinely upcoming
  const legs: LockedLeg[] = res.legs.map((l) => ({
    compId: l.bout.id,
    order: l.bout.order,
    aName: l.fighters.a.name,
    bName: l.fighters.b.name,
    weightClass: l.bout.weightClass,
    rounds: l.bout.rounds,
    pick: { winnerName: l.pick.winnerName, winProb: l.pick.winProb, winProbDisplay: l.pick.winProbDisplay, tier: l.pick.tier },
    method: { top: l.method.top },
    round: { mode: l.round.mode, call: l.round.call, modalRound: l.round.modalRound },
  }));
  const card: LockedCard = {
    eventId: evId,
    eventName: res.ev.name || "UFC Event",
    date: dateStr,
    lockedAt: new Date().toISOString(),
    legs,
  };
  await writeJSON(`locked/${evId}.json`, card);
}

/** Grade a locked card against final results. Returns null until results are in. */
export async function gradeCard(evId: string): Promise<GradedCard | null> {
  const cached = await readJSON<GradedCard>(`graded/${evId}.json`);
  if (cached) return cached;
  const locked = await readJSON<LockedCard>(`locked/${evId}.json`);
  if (!locked) return null;
  if (Date.now() < +new Date(locked.date) + GRADE_DELAY_MS) return null;

  let ev;
  try {
    ev = await getEventById(evId);
  } catch {
    return null;
  }
  if (!ev) return null;
  const shaped = shapeEvent(ev.ev, ev.dateStr);
  const fights = shaped.segments.flatMap((s) => s.fights);
  const byId = new Map(fights.map((f) => [f.compId, f]));
  if (!fights.length || !fights.every((f) => f.done)) return null; // wait for complete results

  const rows: GradedRow[] = [];
  for (const leg of locked.legs) {
    const f = byId.get(leg.compId);
    if (!f) continue;
    const winnerLast = f.f1.winner ? f.f1.last : f.f2.winner ? f.f2.last : "";
    const actualKind = methodKindFromText(f.method);
    const wentDistance = actualKind === "dec";
    const pickLast = last(leg.pick.winnerName);
    const winnerHit = !!winnerLast && pickLast === winnerLast;
    const methodHit = lockedMethodKind(leg.method.top) === actualKind;
    const r = gradeRound(leg.round.call, f.round || 0, wentDistance);
    rows.push({
      fight: `${last(leg.aName)}/${last(leg.bName)}`,
      pickName: pickLast,
      pickPct: leg.pick.winProbDisplay,
      result: `${winnerLast || "—"}, ${kindShort(actualKind)} R${f.round || "-"}`,
      winnerHit,
      methodHit,
      roundHit: r.hit,
      roundSoft: r.soft,
    });
  }
  const tallies = {
    winners: rows.filter((r) => r.winnerHit).length,
    methods: rows.filter((r) => r.methodHit).length,
    rounds: rows.filter((r) => r.roundHit).length,
    n: rows.length,
  };
  const card: GradedCard = { eventId: evId, eventName: locked.eventName, date: locked.date, rows, tallies };
  await writeJSON(`graded/${evId}.json`, card);
  return card;
}

/** Seed + every locked card that is past and fully graded, newest first. */
export async function listDevCards(): Promise<GradedCard[]> {
  const lockedIds = await listIds("locked");
  for (const id of lockedIds) {
    if (!(await has(`graded/${id}.json`))) await gradeCard(id).catch(() => null);
  }
  const gradedIds = await listIds("graded");
  const cards = (await Promise.all(gradedIds.map((id) => readJSON<GradedCard>(`graded/${id}.json`)))).filter(
    (c): c is GradedCard => Boolean(c),
  );
  return cards.sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

/** Computed, honest summary from the graded rows — no prose beyond the numbers. */
export function buildSummary(card: GradedCard): string[] {
  const { rows, tallies: t } = card;
  const lines: string[] = [];
  lines.push(`Winners ${t.winners}/${t.n}, methods ${t.methods}/${t.n}, rounds ${t.rounds}/${t.n}.`);

  const confident = rows.filter((r) => r.pickPct >= 0.68);
  const confHit = confident.filter((r) => r.winnerHit).length;
  if (confident.length) {
    lines.push(
      confHit === confident.length
        ? `Every confident pick (68%+) landed: ${confHit} of ${confident.length}.`
        : `Confident picks (68%+) went ${confHit} of ${confident.length}.`,
    );
  }
  const misses = rows.filter((r) => !r.winnerHit);
  const coinFlipMisses = misses.filter((r) => r.pickPct < 0.59);
  if (misses.length) {
    lines.push(
      coinFlipMisses.length === misses.length
        ? `All ${misses.length} winner misses were coin-flips under 59% — calibrated, not broken.`
        : `${misses.length} winner misses, ${coinFlipMisses.length} of them coin-flips under 59%.`,
    );
  }
  lines.push(`Method read hit ${t.methods} of ${t.n}; round call hit ${t.rounds} of ${t.n}.`);
  return lines;
}
