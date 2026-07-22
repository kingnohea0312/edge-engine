import type { MethodCol, Profile, RoundProjection } from "./types";

const DAY = 86_400_000;
export const isUFCFight = (f: { evName: string }) => /ufc/i.test(f.evName || "");

function topKey(h: Record<string, number>): number | null {
  let k: number | null = null,
    v = -1;
  for (const key in h) {
    if (h[key] > v) {
      v = h[key];
      k = +key;
    }
  }
  return k;
}

/**
 * Round projection — the Veteran Gate (spec Phase 3.5 + 4.6). Byte-faithful port
 * of `roundProjection`: builds finish-timing histograms and commits to an exact
 * modal round only when both fighters clear the gate; otherwise a soft read.
 */
export function roundProjection(
  A: Profile,
  B: Profile,
  matrix: { a: MethodCol; b: MethodCol },
  finishP: number,
  rds: number,
): RoundProjection {
  const ufcOf = (p: Profile) => p.hist.fights.filter(isUFCFight);
  const nA = ufcOf(A).length,
    nB = ufcOf(B).length;
  const layoffMo = (p: Profile) =>
    p.agg.lastDate ? (Date.now() - +new Date(p.agg.lastDate)) / DAY / 30 : 0;
  const recentKOloss = (p: Profile) =>
    p.hist.fights.slice(0, 2).some((f) => f.res === "L" && f.kind === "ko");

  const flags: string[] = [];
  if (nA < 9 || nB < 9) flags.push(`needs 9+ UFC fights each — have ${nA} and ${nB}`);
  if (layoffMo(A) > 24) flags.push(`${A.bio.last} on a 24+ month layoff`);
  if (layoffMo(B) > 24) flags.push(`${B.bio.last} on a 24+ month layoff`);
  if (recentKOloss(A)) flags.push(`${A.bio.last}'s chin cracked in a recent fight`);
  if (recentKOloss(B)) flags.push(`${B.bio.last}'s chin cracked in a recent fight`);
  const gateOpen = flags.length === 0;

  const bucket = (p: Profile, sel: (f: Profile["hist"]["fights"][number]) => boolean) => {
    const h: Record<number, number> = {};
    let tot = 0;
    ufcOf(p)
      .filter(sel)
      .forEach((f) => {
        const r = Math.min(Math.max(f.round || 1, 1), rds);
        h[r] = (h[r] || 0) + 1;
        tot++;
      });
    return { h, tot };
  };
  const finWins = (p: Profile) =>
    bucket(p, (f) => f.res === "W" && (f.kind === "ko" || f.kind === "sub"));
  const finLoss = (p: Profile) =>
    bucket(p, (f) => f.res === "L" && (f.kind === "ko" || f.kind === "sub"));

  const shape = (X: Profile, Y: Profile): Record<number, number> => {
    const fw = finWins(X),
      fl = finLoss(Y),
      out: Record<number, number> = {};
    for (let r = 1; r <= rds; r++) {
      const a = fw.tot ? (fw.h[r] || 0) / fw.tot : 0,
        d = fl.tot ? (fl.h[r] || 0) / fl.tot : 0;
      out[r] = fw.tot && fl.tot ? (a + d) / 2 : fw.tot ? a : d;
    }
    let s = 0;
    for (let r = 1; r <= rds; r++) s += out[r];
    if (s <= 0) {
      const def: Record<number, number> = { 1: 0.42, 2: 0.33, 3: 0.25 };
      for (let r = 1; r <= rds; r++) out[r] = r <= 3 ? def[r] : 0.06;
      s = 1;
    }
    if (fl.tot === 0 && fw.tot) {
      const sh: Record<number, number> = {};
      for (let r = 1; r <= rds; r++) sh[r] = out[Math.max(1, r - 1)] || 0;
      return sh;
    }
    return out;
  };

  const fA = matrix.a.ko + matrix.a.sub,
    fB = matrix.b.ko + matrix.b.sub,
    F = fA + fB;
  const norm = (sh: Record<number, number>) => {
    let s = 0;
    for (const k in sh) s += sh[k];
    s = s || 1;
    const o: Record<number, number> = {};
    for (const k in sh) o[k] = sh[k] / s;
    return o;
  };
  const shA = norm(shape(A, B)),
    shB = norm(shape(B, A));
  const dist: Record<string, number> = {};
  for (let r = 1; r <= rds; r++) dist[r] = fA * shA[r] + fB * shB[r];
  dist.distance = Math.max(0, 1 - F);

  let modal: number | "distance" = "distance",
    best = dist.distance;
  for (let r = 1; r <= rds; r++)
    if (dist[r] > best) {
      best = dist[r];
      modal = r;
    }

  if (gateOpen) {
    let reason: string;
    if (modal === "distance") {
      reason = `Two seasoned veterans (${nA} and ${nB} UFC bouts), but the styles point to the scorecards.`;
    } else {
      const favFin = finWins(fA >= fB ? A : B),
        defLoss = finLoss(fA >= fB ? B : A);
      const favName = (fA >= fB ? A : B).bio.last,
        defName = (fA >= fB ? B : A).bio.last;
      const favPeak = topKey(favFin.h as Record<string, number>),
        defPeak = topKey(defLoss.h as Record<string, number>);
      reason =
        defLoss.tot === 0
          ? `${favName} finishes most in R${favPeak || modal}, but ${defName} has never been stopped in the UFC — that durability drags the peak later.`
          : `${favName}'s stoppages cluster in R${favPeak || modal}; ${defName} has been finished around R${defPeak || modal} — the histograms meet at R${modal}.`;
    }
    return { mode: "veteran", dist, modal, modalP: best, F, nA, nB, reason };
  }

  const early = dist[1] || 0;
  let late = 0;
  for (let r = 2; r <= rds; r++) late += dist[r] || 0;
  return {
    mode: "standard",
    dist,
    F,
    finishLikely: F >= 0.5,
    lean: F >= 0.5 ? (early > late ? "early" : "late") : null,
    gateReason: flags.join("; "),
  };
}

export function roundLabel(rp: RoundProjection): string {
  if (!rp) return "";
  if (rp.mode === "veteran") return rp.modal === "distance" ? "Distance" : "R" + rp.modal;
  return rp.finishLikely ? (rp.lean === "early" ? "Finish — early" : "Finish — late") : "Distance";
}
