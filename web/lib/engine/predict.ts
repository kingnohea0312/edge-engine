/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Market, MethodCol, Prediction, Profile } from "./types";
import { roundProjection } from "./round";

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const pct = (v: number) => Math.round(v * 100);
const DAY = 86_400_000;

type Factor = { w: number; label: string; detail: string };

/**
 * Itemized signed stat nudges + Bayesian shrinkage. Byte-faithful port of
 * `statsScore`.
 *
 * FIDELITY NOTE: the original keys the control-time nudge off `agg.ctrl`, but the
 * aggregate emits `ctrlPct`, so `shrink` yields NaN and `add` skips it — i.e. the
 * control-time factor never contributes. This is preserved verbatim so outputs
 * match the source app exactly; do NOT "fix" it to `ctrlPct` (that would change
 * the engine's numbers).
 */
function statsScore(A: Profile, B: Profile, f: Factor[]): number {
  const add = (w: number, label: string, detail: string) => {
    if (Math.abs(w) > 0.004) f.push({ w, label, detail });
  };
  const ra = A.bio.rec,
    rb = B.bio.rec;
  if (ra && rb && ra.w + ra.l && rb.w + rb.l) {
    const wa = ra.w / (ra.w + ra.l),
      wb = rb.w / (rb.w + rb.l);
    add((wa - wb) * 1.2, "Career record", `${ra.text} vs ${rb.text}`);
  }
  add((A.agg.form5 - B.agg.form5) * 0.12, "Recent form (last 5)", `${A.agg.form5txt} vs ${B.agg.form5txt}`);

  const LG: Record<string, number> = { slpm: 4.0, acc: 0.47, td15: 1.2, ctrl: 0.2, kd15: 0.25, sub15: 0.4 };
  const shrink = (p: Profile, k: string) => {
    const w = p.agg.minutes / (p.agg.minutes + 60);
    return w * (p.agg as any)[k] + (1 - w) * LG[k];
  };
  if (A.agg.nStats >= 2 && B.agg.nStats >= 2) {
    const s = (k: string, wt: number, cl: number, label: string, fmt: (v: number) => string) => {
      const va = shrink(A, k),
        vb = shrink(B, k);
      add(clamp((va - vb) * wt, -cl, cl), label, fmt((A.agg as any)[k]) + " vs " + fmt((B.agg as any)[k]));
    };
    s("slpm", 0.05, 0.2, "Striking volume", (v) => v.toFixed(1) + "/min");
    s("acc", 0.7, 0.15, "Striking accuracy", (v) => pct(v) + "%");
    s("td15", 0.06, 0.15, "Takedown pace", (v) => v.toFixed(1) + "/15min");
    s("ctrl", 0.45, 0.18, "Control time", (v) => pct(v) + "%"); // no-op (see fidelity note)
    s("kd15", 0.15, 0.12, "Knockdown power", (v) => v.toFixed(2) + "/15min");
    s("sub15", 0.05, 0.06, "Submission threat", (v) => v.toFixed(1) + "/15min");
  }
  const koLn = (p: Profile) => p.hist.fights.filter((x) => x.res === "L" && x.kind === "ko").length;
  const koL = (p: Profile) => (p.agg.n ? koLn(p) / p.agg.n : 0);
  add(clamp(-(koL(A) - koL(B)) * 0.35, -0.12, 0.12), "Durability (KO losses)", `${koLn(A)} vs ${koLn(B)} in UFC`);
  add(
    clamp((A.agg.finishRate - B.agg.finishRate) * 0.1, -0.06, 0.06),
    "Finish rate",
    `${pct(A.agg.finishRate)}% vs ${pct(B.agg.finishRate)}% of wins`,
  );
  if (A.bio.age && B.bio.age) {
    const d = B.bio.age - A.bio.age;
    if (Math.abs(d) > 2) add(clamp(d * 0.018, -0.15, 0.15), "Age", `${A.bio.age} vs ${B.bio.age}`);
  }
  const reach = (s: string) => parseFloat(String(s).replace(/[^\d.]/g, "")) || 0;
  const dr = reach(A.bio.reach) - reach(B.bio.reach);
  if (Math.abs(dr) >= 2) add(clamp(dr * 0.012, -0.1, 0.1), "Reach", `${A.bio.reach} vs ${B.bio.reach}`);
  const lay = (p: Profile) => (p.agg.lastDate ? (Date.now() - +new Date(p.agg.lastDate)) / DAY : null);
  const la = lay(A),
    lb = lay(B);
  if (la != null && la > 420) add(-0.1, "Layoff — " + A.bio.last, Math.round(la / 30) + " months out");
  if (lb != null && lb > 420) add(0.1, "Layoff — " + B.bio.last, Math.round(lb / 30) + " months out");
  return f.reduce((t, x) => t + x.w, 0);
}

/** Market-anchored win/method/round prediction. Byte-faithful port of `predict`. */
export function predict(A: Profile, B: Profile, market: Market | null, rds = 3): Prediction {
  const f: Factor[] = [];
  const raw = statsScore(A, B, f);
  const minN = Math.min(A.agg.n, B.agg.n);
  const damp = minN >= 6 ? 1 : minN >= 3 ? 0.75 : minN >= 1 ? 0.5 : 0.35;
  const lowData = damp < 1;
  const score = raw * damp;

  let pA: number,
    anchored = false,
    nudge = 0;
  if (market && market.pA != null) {
    anchored = true;
    nudge = clamp(score * 0.22, -0.07, 0.07) * damp;
    pA = clamp(market.pA + nudge, 0.05, 0.95);
  } else {
    pA = clamp(1 / (1 + Math.exp(-1.9 * score)), 0.15, 0.85);
  }

  const mShare = (p: Profile, vm: MethodCol | null | undefined): MethodCol => {
    if (vm) return vm;
    let ko = 0.28 + p.agg.koShare * 0.45 + clamp(p.agg.kd15 * 0.08, 0, 0.1);
    let sub = 0.12 + p.agg.subShare * 0.45 + clamp(p.agg.sub15 * 0.04, 0, 0.08);
    let dec = 1.15 - ko - sub;
    if (dec < 0.18) {
      const s = ko + sub;
      ko = (ko / s) * 0.97;
      sub = (sub / s) * 0.97;
      dec = 0.18;
    }
    const t = ko + sub + dec;
    return { ko: ko / t, sub: sub / t, dec: dec / t };
  };
  const sa = mShare(A, market && market.vmA),
    sb = mShare(B, market && market.vmB);
  const matrix = {
    a: { ko: pA * sa.ko, sub: pA * sa.sub, dec: pA * sa.dec },
    b: { ko: (1 - pA) * sb.ko, sub: (1 - pA) * sb.sub, dec: (1 - pA) * sb.dec },
  };
  const cells = [
    { who: A.bio.last, how: "KO/TKO", v: matrix.a.ko },
    { who: A.bio.last, how: "Submission", v: matrix.a.sub },
    { who: A.bio.last, how: "Decision", v: matrix.a.dec },
    { who: B.bio.last, how: "KO/TKO", v: matrix.b.ko },
    { who: B.bio.last, how: "Submission", v: matrix.b.sub },
    { who: B.bio.last, how: "Decision", v: matrix.b.dec },
  ];
  const top = cells.reduce((m, c) => (c.v > m.v ? c : m));
  const finishP = matrix.a.ko + matrix.a.sub + matrix.b.ko + matrix.b.sub;

  f.sort((x, y) => Math.abs(y.w) - Math.abs(x.w));
  const round = roundProjection(A, B, matrix, finishP, rds);
  const fav = pA >= 0.5 ? A : B;
  const dog = pA >= 0.5 ? B : A;
  return {
    pA,
    favLast: fav.bio.last,
    favName: fav.bio.name,
    dogLast: dog.bio.last,
    favP: Math.max(pA, 1 - pA),
    matrix,
    top,
    finishP,
    factors: f.slice(0, 6),
    lowData,
    damp,
    anchored,
    nudge,
    market,
    round,
    aLast: A.bio.last,
    bLast: B.bio.last,
  };
}

export function tierOf(p: number, anchored: boolean): [string, string] {
  let t: [string, string] = p >= 0.68 ? ["STRONG", "strong"] : p >= 0.59 ? ["SOLID", ""] : ["LEAN", "lean"];
  if (!anchored && t[0] === "STRONG") t = ["SOLID", ""];
  return t;
}
