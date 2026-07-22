/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { search } from "@/lib/data/espn";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q") || "";
  if (q.trim().length < 2) return NextResponse.json({ results: [] });
  try {
    const d: any = await search(q);
    let players: any[] = [];
    (d.results || []).forEach((r: any) => {
      if (r.type === "player" || r.type === "players") players = players.concat(r.contents || []);
    });
    const results = players
      .map((p: any) => {
        const m = String(p.uid || "").match(/a:(\d+)/);
        if (!m) return null;
        return {
          id: m[1],
          name: p.displayName || p.name || "",
          subtitle: p.subtitle || p.description || "MMA",
          image: (p.image && (p.image.default || p.image.href)) || null,
        };
      })
      .filter(Boolean);
    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ error: "Search failed." }, { status: 502 });
  }
}
