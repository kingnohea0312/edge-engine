/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getEventById, getOddsRaw } from "@/lib/data/espn";
import { parseMarket } from "@/lib/engine/market";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ evId: string }> }) {
  const { evId } = await params;
  try {
    const res = await getEventById(evId);
    if (!res) return NextResponse.json({ error: "Event not found." }, { status: 404 });
    const comps: any[] = res.ev.competitions || [];
    const out: Record<string, ReturnType<typeof parseMarket>> = {};
    await Promise.all(
      comps.map(async (c) => {
        const [a, b] = c.competitors || [];
        if (!a || !b) return;
        try {
          const raw = await getOddsRaw(evId, String(c.id));
          out[String(c.id)] = parseMarket(raw, String(a.id), String(b.id));
        } catch {
          out[String(c.id)] = null;
        }
      }),
    );
    return NextResponse.json(out);
  } catch {
    return NextResponse.json({ error: "Couldn't reach live data." }, { status: 502 });
  }
}
