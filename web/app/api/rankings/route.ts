import { NextResponse } from "next/server";
import { getRankings } from "@/lib/data/rankings";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(await getRankings());
  } catch {
    return NextResponse.json({ error: "Rankings unavailable." }, { status: 502 });
  }
}
