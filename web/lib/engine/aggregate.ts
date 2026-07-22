import type { Agg, Fight } from "./types";

/** Career-stat aggregation from per-fight data. Byte-faithful port of `aggregate`. */
export function aggregate(fights: Fight[]): Agg {
  const withStats = fights.filter((f) => f.st && f.secs > 0);
  const sum = (k: keyof NonNullable<Fight["st"]>) =>
    withStats.reduce((t, f) => t + (f.st ? (f.st[k] as number) || 0 : 0), 0);
  const secs = withStats.reduce((t, f) => t + f.secs, 0);
  const min = secs / 60 || 1;
  const wins = fights.filter((f) => f.res === "W");
  const finishesW = wins.filter((f) => f.kind === "ko" || f.kind === "sub");
  const koW = wins.filter((f) => f.kind === "ko").length;
  const subW = wins.filter((f) => f.kind === "sub").length;
  const last5 = fights.slice(0, 5);
  const sigA = sum("sigA");
  const tdA = sum("tdA");
  const weights = [1, 0.85, 0.7, 0.55, 0.4];
  return {
    n: fights.length,
    nStats: withStats.length,
    minutes: min,
    ufcW: wins.length,
    ufcL: fights.filter((f) => f.res === "L").length,
    slpm: sum("sigL") / min,
    acc: sigA ? sum("sigL") / sigA : 0,
    td15: (sum("tdL") / min) * 15,
    tdAcc: tdA ? sum("tdL") / tdA : 0,
    kd15: (sum("kd") / min) * 15,
    sub15: (sum("sub") / min) * 15,
    ctrlPct: secs ? withStats.reduce((t, f) => t + (f.st?.ctrl || 0), 0) / secs : 0,
    finishRate: wins.length ? finishesW.length / wins.length : 0,
    koShare: wins.length ? koW / wins.length : 0,
    subShare: wins.length ? subW / wins.length : 0,
    last5,
    form5: last5.reduce(
      (t, f, i) => t + (f.res === "W" ? 1 : f.res === "L" ? -1 : 0) * weights[i],
      0,
    ),
    form5txt:
      `${last5.filter((f) => f.res === "W").length}-${last5.filter((f) => f.res === "L").length}` +
      (last5.some((f) => f.res === "D") ? `-${last5.filter((f) => f.res === "D").length}` : ""),
    lastDate: fights[0] ? fights[0].date : null,
  };
}
