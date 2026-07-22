import Link from "next/link";
import type { Metadata } from "next";
import { getEventById, getOddsRaw } from "@/lib/data/espn";
import { shapeEvent, type ShapedFight } from "@/lib/data/shape";
import { parseMarket, fmtMl } from "@/lib/engine/market";
import { fmtDateLong } from "@/lib/format";
import FighterImg from "@/components/FighterImg";

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
    const raw = await getOddsRaw(evId, f.compId);
    return parseMarket(raw, f.f1.id, f.f2.id);
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

  return (
    <main>
      <div className="wrap wrap-narrow">
        <div className="card" style={{ padding: "20px 22px", background: "linear-gradient(160deg,#1a1014,#100d0f 70%)" }}>
          <span className="kicker">{ev.done ? "Final results" : "Fight card"}</span>
          <h1 className="display" style={{ fontSize: 30, textTransform: "uppercase", margin: "6px 0 10px" }}>
            {ev.name}
          </h1>
          <div className="tnum" style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.8 }}>
            📅 {fmtDateLong(ev.date)}
            {ev.venue ? <><br />📍 {[ev.venue, ev.city, ev.country].filter(Boolean).join(" · ")}</> : null}
            {ev.broadcast ? <><br />📺 {ev.broadcast}</> : null}
          </div>
        </div>

        {ev.segments.map((seg) => (
          <div key={seg.name}>
            <div className="section-head">
              <h2>{seg.name}</h2>
              <span className="rule" />
            </div>
            <div className="fights">
              {seg.fights.map((f) => {
                const m = markets.get(f.compId);
                return (
                  <Link key={f.compId} href={`/event/${ev.id}/${f.compId}`} className="fight reveal">
                    <div className={`side ${f.done && f.f2.winner ? "loss" : ""}`}>
                      <FighterImg id={f.f1.id} alt={f.f1.name} />
                      <div className="nm">
                        {f.f1.name}
                        <span className="rec tnum">{f.f1.rec}</span>
                        {f.done && f.f1.winner ? <span className="win"> WIN</span> : null}
                      </div>
                    </div>
                    <div className="mid">
                      <div className="wc">{f.type}</div>
                      <div className="vs">{f.done ? "" : "VS"}</div>
                      {f.done ? (
                        <div className="res">
                          {f.method || "Final"} {f.round ? `· R${f.round} ${f.clock}` : ""}
                        </div>
                      ) : m ? (
                        <div className="ml tnum">
                          {fmtMl(m.mlA)} · {fmtMl(m.mlB)}
                        </div>
                      ) : (
                        <div className="res">{f.rounds} rounds</div>
                      )}
                    </div>
                    <div className={`side right ${f.done && f.f1.winner ? "loss" : ""}`}>
                      <FighterImg id={f.f2.id} alt={f.f2.name} />
                      <div className="nm">
                        {f.f2.name}
                        <span className="rec tnum">{f.f2.rec}</span>
                        {f.done && f.f2.winner ? <span className="win"> WIN</span> : null}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
