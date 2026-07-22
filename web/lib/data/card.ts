/* eslint-disable @typescript-eslint/no-explicit-any */
/** Shared card-legs computation — one engine path used by the /api/predict/[evId]
 *  route AND by lockCard, so the API, the modal recap, and the locked snapshot all
 *  come from the same computation (no duplicate/divergent engine runs). */
import { getEventById, getOddsRaw } from "./espn";
import { getProfile } from "./profile";
import { parseMarket } from "@/lib/engine/market";
import { predict, tierOf } from "@/lib/engine/predict";
import { buildLeg, type Leg } from "@/lib/engine/reasoning";

export interface CardResult {
  ev: any;
  legs: Leg[];
}

export async function computeCardLegs(evId: string): Promise<CardResult | null> {
  const res = await getEventById(evId);
  if (!res) return null;
  const comps: any[] = (res.ev.competitions || []).filter((c: any) => (c.competitors || []).length === 2);
  const n = comps.length;

  const legs = (
    await Promise.all(
      comps.map(async (comp, idx): Promise<Leg | null> => {
        try {
          const [c1, c2] = comp.competitors;
          const id1 = String(c1.id),
            id2 = String(c2.id);
          const rds = (comp.format && comp.format.regulation && comp.format.regulation.periods) || 3;
          const wc = (comp.type && (comp.type.text || comp.type.abbreviation)) || "";
          const isMain = idx === n - 1;
          const [A, B, oddsRaw] = await Promise.all([
            getProfile(id1),
            getProfile(id2),
            getOddsRaw(evId, String(comp.id)).catch(() => null),
          ]);
          const market = oddsRaw ? parseMarket(oddsRaw, id1, id2) : null;
          const P = predict(A, B, market, rds);
          const [tierTxt] = tierOf(P.favP, P.anchored);
          return buildLeg(
            {
              id: String(comp.id),
              eventId: evId,
              order: n - idx,
              weightClass: wc,
              rounds: rds,
              isMainEvent: isMain,
              isTitle: /title/i.test(wc) || (rds === 5 && isMain),
            },
            A,
            B,
            P,
            market,
            tierTxt,
          );
        } catch {
          return null;
        }
      }),
    )
  )
    .filter((l): l is Leg => Boolean(l))
    .sort((a, b) => a.bout.order - b.bout.order);

  return { ev: res.ev, legs };
}
