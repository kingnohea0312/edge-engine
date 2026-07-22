import { NextResponse } from "next/server";
import { getProfile } from "@/lib/data/profile";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    return NextResponse.json(await getProfile(id));
  } catch {
    return NextResponse.json({ error: "Couldn't load fighter." }, { status: 502 });
  }
}
