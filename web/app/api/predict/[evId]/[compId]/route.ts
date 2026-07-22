/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getEventById, getOddsRaw, headshotUrl } from "@/lib/data/espn";
import { getProfile } from "@/lib/data/profile";
import { parseMarket } from "@/lib/engine/market";
import { predict, tierOf } from "@/lib/engine/predict";
import { buildLeg } from "@/lib/engine/reasoning";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ evId: string; compId: string }> },
) {
  const { evId, compId } = await params;
  try {
    const res = await getEventById(evId);
    if (!res) return NextResponse.json({ error: "Event not found." }, { status: 404 });
    const comps: any[] = res.ev.competitions || [];
    const idx = comps.findIndex((c) => String(c.id) === String(compId));
    const comp = comps[idx];
    if (!comp) return NextResponse.json({ error: "Bout not found." }, { status: 404 });
    const [c1, c2] = comp.competitors || [];
    const id1 = String(c1.id),
      id2 = String(c2.id);
    const rds = (comp.format && comp.format.regulation && comp.format.regulation.periods) || 3;
    const wc = (comp.type && (comp.type.text || comp.type.abbreviation)) || "";
    const isMain = idx === comps.length - 1;

    const [A, B, oddsRaw] = await Promise.all([
      getProfile(id1),
      getProfile(id2),
      getOddsRaw(evId, compId).catch(() => null),
    ]);
    const market = oddsRaw ? parseMarket(oddsRaw, id1, id2) : null;
    const prediction = predict(A, B, market, rds);
    const [tierTxt, tierCls] = tierOf(prediction.favP, prediction.anchored);
    const leg = buildLeg(
      {
        id: compId,
        eventId: evId,
        order: comps.length - idx,
        weightClass: wc,
        rounds: rds,
        isMainEvent: isMain,
        isTitle: /title/i.test(wc) || (rds === 5 && isMain),
      },
      A,
      B,
      prediction,
      market,
      tierTxt,
    );

    return NextResponse.json({
      leg,
      // compatibility fields used by existing views
      prediction,
      tier: { text: tierTxt, cls: tierCls },
      rounds: rds,
      wcType: wc,
      a: { id: id1, name: A.bio.name, last: A.bio.last, headshot: A.bio.headshot || headshotUrl(id1) },
      b: { id: id2, name: B.bio.name, last: B.bio.last, headshot: B.bio.headshot || headshotUrl(id2) },
    });
  } catch {
    return NextResponse.json({ error: "Couldn't run the engine." }, { status: 502 });
  }
}
