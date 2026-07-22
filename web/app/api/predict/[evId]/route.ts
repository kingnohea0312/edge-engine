import { NextResponse } from "next/server";
import { computeCardLegs } from "@/lib/data/card";
import { assembleCard } from "@/lib/engine/reasoning";

export const dynamic = "force-dynamic";

/** Canonical full-card payload: { event, legs, parlays } — the single source of
 *  truth for the recap, export, and parlay builder. */
export async function GET(_req: Request, { params }: { params: Promise<{ evId: string }> }) {
  const { evId } = await params;
  try {
    const res = await computeCardLegs(evId);
    if (!res) return NextResponse.json({ error: "Event not found." }, { status: 404 });
    return NextResponse.json(assembleCard(res.ev, res.legs));
  } catch {
    return NextResponse.json({ error: "Couldn't run the card." }, { status: 502 });
  }
}
