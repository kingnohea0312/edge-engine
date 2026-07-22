import { NextResponse } from "next/server";
import { lockCard } from "@/lib/devcards";

export const dynamic = "force-dynamic";

/** Optional: lets a host scheduler pre-lock an upcoming card even if nobody visits.
 *  On-view locking (from the Current-events page) covers the no-infra case. */
export async function GET(_req: Request, { params }: { params: Promise<{ evId: string }> }) {
  const { evId } = await params;
  try {
    await lockCard(evId);
    return NextResponse.json({ locked: true });
  } catch {
    return NextResponse.json({ error: "Lock failed." }, { status: 502 });
  }
}
