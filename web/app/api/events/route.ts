import { NextResponse } from "next/server";
import { getCalendar } from "@/lib/data/espn";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { cal } = await getCalendar();
    const now = Date.now();
    const upcoming = cal.filter((c) => +new Date(c.start) > now - 18 * 3_600_000);
    const past = cal.filter((c) => +new Date(c.start) <= now - 18 * 3_600_000).reverse();
    return NextResponse.json({ next: upcoming[0] || null, upcoming, past });
  } catch {
    return NextResponse.json({ error: "Couldn't reach live data." }, { status: 502 });
  }
}
