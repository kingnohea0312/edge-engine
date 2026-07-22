/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Market } from "./types";

/** American odds → implied probability. Byte-faithful port of `amToProb`. */
export const amToProb = (a: number) => (a < 0 ? -a / (-a + 100) : 100 / (a + 100));

export const fmtMl = (m: number | null) => (m == null ? "—" : m > 0 ? "+" + m : String(m));

/**
 * Pure parse of an ESPN odds payload into the engine's Market shape.
 * Fetching lives in the data layer (`getOddsRaw`); this mirrors `loadMarket`.
 */
export function parseMarket(oddsJson: any, idA: string, idB: string): Market | null {
  try {
    const items = oddsJson?.items || [];
    if (!items.length) return null;
    const o = items.find((x: any) => x.provider && x.provider.id === "58") || items[0];
    const side = (h: any) => {
      const m = String((h && h.athlete && h.athlete.$ref) || "").match(/athletes\/(\d+)/);
      return m ? m[1] : null;
    };
    const H = o.homeAthleteOdds,
      Aw = o.awayAthleteOdds;
    if (!H || !Aw) return null;
    const forId = (id: string) =>
      side(H) === String(id) ? H : side(Aw) === String(id) ? Aw : null;
    const oa = forId(idA),
      ob = forId(idB);
    if (!oa || !ob) return null;
    const ml = (x: any): number | null => {
      const cur =
        x.current && x.current.moneyLine && parseFloat(String(x.current.moneyLine.american).replace("+", ""));
      return Number.isFinite(cur) ? cur : typeof x.moneyLine === "number" ? x.moneyLine : null;
    };
    const opn = (x: any): number | null => {
      const v =
        x.open && x.open.moneyLine && parseFloat(String(x.open.moneyLine.american).replace("+", ""));
      return Number.isFinite(v) ? (v as number) : null;
    };
    const mA = ml(oa),
      mB = ml(ob);
    if (mA == null || mB == null) return null;
    const ia = amToProb(mA),
      ib = amToProb(mB);
    const vm = (x: any) => {
      const v = x.current && x.current.victoryMethod;
      if (!v) return null;
      const g = (k: string) => (v[k] && v[k].value ? 1 / v[k].value : 0);
      const ko = g("koTkoDq"),
        sub = g("submission"),
        dec = g("points");
      const t = ko + sub + dec;
      return t > 0 ? { ko: ko / t, sub: sub / t, dec: dec / t } : null;
    };
    return {
      provider: (o.provider && o.provider.name) || "market",
      mlA: mA,
      mlB: mB,
      openA: opn(oa),
      openB: opn(ob),
      pA: ia / (ia + ib),
      vmA: vm(oa),
      vmB: vm(ob),
      ou: o.overUnder || null,
    };
  } catch {
    return null;
  }
}
