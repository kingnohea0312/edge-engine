import { NextResponse } from "next/server";
import { getEventById } from "@/lib/data/espn";
import { shapeEvent } from "@/lib/data/shape";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const res = await getEventById(id);
    if (!res) return NextResponse.json({ error: "Event not found." }, { status: 404 });
    return NextResponse.json(shapeEvent(res.ev, res.dateStr));
  } catch {
    return NextResponse.json({ error: "Couldn't reach live data." }, { status: 502 });
  }
}
