import type { Metadata } from "next";
import { getCalendar, getEventById } from "@/lib/data/espn";
import { shapeEvent } from "@/lib/data/shape";
import { resolveMarket } from "@/lib/data/market";
import { amToProb, fmtMl } from "@/lib/engine/market";
import type { Market } from "@/lib/engine/types";
import OddsTable, { type ORow } from "@/components/OddsTable";
import { fmtDateShort } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Live UFC Odds",
  description: "Real-time Las Vegas moneylines and line movement for the next UFC card.",
};

function move(m: Market | null | undefined): "up" | "down" | null {
  if (!m || m.openA == null) return null;
  const delta = amToProb(m.mlA) - amToProb(m.openA);
  if (Math.abs(delta) <= 0.02) return null;
  return delta > 0 ? "up" : "down"; // A shortened / drifted
}

export default async function OddsPage() {
  let evId: string | null = null;
  let label = "";
  let start = "";
  try {
    const { cal } = await getCalendar();
    const next = cal.filter((c) => +new Date(c.start) > Date.now() - 18 * 3_600_000)[0];
    if (next) {
      evId = next.id;
      label = next.label;
      start = next.start;
    }
  } catch {}

  if (!evId) {
    return (
      <main>
        <div className="wrap wrap-narrow err card">No upcoming event to price.</div>
      </main>
    );
  }
  const res = await getEventById(evId);
  const ev = res ? shapeEvent(res.ev, res.dateStr) : null;
  const fights = ev ? ev.segments.flatMap((s) => s.fights).filter((f) => !f.done) : [];
  const markets = new Map<string, Market | null>();
  await Promise.all(
    fights.map(async (f) => {
      markets.set(f.compId, await resolveMarket(evId!, f.compId, f.f1.id, f.f2.id, f.f1.name, f.f2.name));
    }),
  );

  // Name the book(s) actually quoting this card, rather than assuming one.
  const books = [...new Set([...markets.values()].filter(Boolean).map((m) => m!.provider))];
  const bookLabel = books.length === 0 ? "No book connected" : books.length === 1 ? books[0] : `${books[0]} +${books.length - 1}`;

  const rows: ORow[] = fights.map((f) => {
    const m = markets.get(f.compId);
    return {
      compId: f.compId,
      aLast: f.f1.last,
      aRec: f.f1.rec,
      bLast: f.f2.last,
      bRec: f.f2.rec,
      wc: f.type,
      rounds: f.rounds,
      mlA: m ? fmtMl(m.mlA) : null,
      mlB: m ? fmtMl(m.mlB) : null,
      favA: !!m && m.mlA < m.mlB,
      mv: move(m),
    };
  });

  return (
    <main>
      <div className="wrap wrap-narrow od">
        <div className="page-h">
          <h1>Live Odds</h1>
          <span className="ev tnum">{label} · {fmtDateShort(start)}</span>
          <span className="live"><span className="dot" /> {bookLabel}</span>
        </div>
        <p className="cap">
          {bookLabel === "No book connected"
            ? "No odds provider is configured, so lines can't be shown. Add an ODDS_API_KEY to pull live moneylines from DraftKings, FanDuel, BetMGM and others."
            : <>Live moneylines from {bookLabel}, swept server-side. <b>Favorite highlighted in gold.</b> Bouts show <b>Pending</b> until a book posts a line.</>}
        </p>
        <div className="legend">
          <span className="l"><span className="sw fav" /> Favorite</span>
          <span className="l"><span className="up">▲</span> Line shortened</span>
          <span className="l"><span className="dn">▼</span> Line drifted</span>
          <span className="l">Prices are American odds.</span>
        </div>

        <OddsTable evId={evId} rows={rows} />
      </div>
    </main>
  );
}
