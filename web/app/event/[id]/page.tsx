import type { Metadata } from "next";
import { getEventById, getOddsRaw } from "@/lib/data/espn";
import { shapeEvent, type ShapedFight } from "@/lib/data/shape";
import { parseMarket, fmtMl } from "@/lib/engine/market";
import { fmtDateLong, fmtTime } from "@/lib/format";
import EventDetail, { type ESegment } from "@/components/EventDetail";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await getEventById(id);
    if (res) {
      const name = res.ev.name || "UFC Event";
      return { title: name, description: `Full fight card, start times, and Edge Engine predictions for ${name}.`, openGraph: { title: name } };
    }
  } catch {}
  return { title: "UFC Event" };
}

async function marketFor(evId: string, f: ShapedFight) {
  if (f.done) return null;
  try {
    return parseMarket(await getOddsRaw(evId, f.compId), f.f1.id, f.f2.id);
  } catch {
    return null;
  }
}

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let res: Awaited<ReturnType<typeof getEventById>> = null;
  try {
    res = await getEventById(id);
  } catch {}
  if (!res) {
    return (
      <main>
        <div className="wrap wrap-narrow err card">Event not found or live data unavailable.</div>
      </main>
    );
  }
  const ev = shapeEvent(res.ev, res.dateStr);
  const allFights = ev.segments.flatMap((s) => s.fights);
  const markets = new Map<string, ReturnType<typeof parseMarket>>();
  await Promise.all(allFights.map(async (f) => markets.set(f.compId, await marketFor(ev.id, f))));

  const colon = ev.name.indexOf(":");
  const typeKicker = colon > 0 ? ev.name.slice(0, colon).trim() : "UFC";
  const title = colon > 0 ? ev.name.slice(colon + 1).trim() : ev.name;
  const dateText = ev.date ? `${fmtDateLong(ev.date)} · ${fmtTime(ev.date)}` : "";
  const place = [ev.venue, ev.city, ev.country].filter(Boolean).join(" · ");

  const segments: ESegment[] = ev.segments.map((seg) => ({
    name: seg.name,
    bouts: seg.fights.map((f) => {
      const m = markets.get(f.compId);
      const favA = !!m && m.mlA < m.mlB;
      const winnerLast = f.f1.winner ? f.f1.last : f.f2.winner ? f.f2.last : "";
      const resText = f.done
        ? `${winnerLast ? winnerLast + " · " : ""}${f.method || "Final"}${f.round ? ` · R${f.round}${f.clock ? " " + f.clock : ""}` : ""}`
        : "";
      return {
        compId: f.compId,
        aName: f.f1.name,
        aRec: f.f1.rec,
        aWinner: f.f1.winner,
        bName: f.f2.name,
        bRec: f.f2.rec,
        bWinner: f.f2.winner,
        wc: f.type,
        rounds: f.rounds,
        done: f.done,
        resText,
        mlA: m ? fmtMl(m.mlA) : null,
        mlB: m ? fmtMl(m.mlB) : null,
        favA,
      };
    }),
  }));

  return (
    <main>
      <div className="wrap wrap-narrow">
        <EventDetail evId={ev.id} name={title} typeKicker={typeKicker} dateText={dateText} place={place} broadcast={ev.broadcast} segments={segments} />
      </div>
    </main>
  );
}
