import Link from "next/link";
import type { Metadata } from "next";
import { getCalendar, getEventById, getOddsRaw } from "@/lib/data/espn";
import { shapeEvent } from "@/lib/data/shape";
import { parseMarket, amToProb, fmtMl } from "@/lib/engine/market";
import { fmtDateShort } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Live UFC Odds",
  description: "Real-time Las Vegas moneylines and line movement for the next UFC card.",
};

function move(m: ReturnType<typeof parseMarket> | undefined) {
  if (!m || m.openA == null) return null;
  const delta = amToProb(m.mlA) - amToProb(m.openA);
  if (Math.abs(delta) <= 0.02) return null;
  return delta > 0 ? "up" : ("down" as const); // A shortened / drifted
}

const ArrowUp = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6 15l6-6 6 6" /></svg>
);
const ArrowDn = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
);

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
  const markets = new Map<string, ReturnType<typeof parseMarket>>();
  await Promise.all(
    fights.map(async (f) => {
      try {
        markets.set(f.compId, parseMarket(await getOddsRaw(evId!, f.compId), f.f1.id, f.f2.id));
      } catch {
        markets.set(f.compId, null);
      }
    }),
  );

  return (
    <main>
      <div className="wrap wrap-narrow od">
        <div className="page-h">
          <h1>Live Odds</h1>
          <span className="ev tnum">{label} · {fmtDateShort(start)}</span>
          <span className="live"><span className="dot" /> ESPN BET</span>
        </div>
        <p className="cap">
          ESPN BET moneylines, swept server-side and refreshed at most every 15 minutes. <b>Favorite highlighted in gold;
          arrows show line movement since open.</b> Bouts show <b>Pending</b> until a line is posted.
        </p>
        <div className="legend">
          <span className="l"><span className="sw fav" /> Favorite</span>
          <span className="l"><span className="up">▲</span> Line shortened</span>
          <span className="l"><span className="dn">▼</span> Line drifted</span>
          <span className="l">Prices are American odds.</span>
        </div>

        <div className="oddscard">
          <table className="odds">
            <thead>
              <tr>
                <th>Bout</th>
                <th>Class</th>
                <th className="r">Moneyline · Movement</th>
              </tr>
            </thead>
            <tbody>
              {fights.map((f) => {
                const m = markets.get(f.compId);
                const favA = !!m && m.mlA < m.mlB;
                const mv = move(m);
                return (
                  <tr key={f.compId}>
                    <td>
                      <div className="bout">
                        <Link href={`/event/${evId}/${f.compId}`} className="f">
                          {f.f1.last}{f.f1.rec && <span className="rec">{f.f1.rec}</span>}
                        </Link>
                        <div className="vs">vs</div>
                        <Link href={`/event/${evId}/${f.compId}`} className="f">
                          {f.f2.last}{f.f2.rec && <span className="rec">{f.f2.rec}</span>}
                        </Link>
                      </div>
                    </td>
                    <td className="wc">{f.type}<span className="rd">{f.rounds} Rounds</span></td>
                    <td className="ml-cell">
                      {m ? (
                        <div className="ml-line">
                          <span className={`ml${favA ? " fav" : ""}`}><span className="who">{f.f1.last}</span><span className="v">{fmtMl(m.mlA)}</span></span>
                          {mv && <span className={`mv ${mv === "up" ? "up" : "dn"}`}>{mv === "up" ? <ArrowUp /> : <ArrowDn />}</span>}
                          <span className={`ml${!favA ? " fav" : ""}`}><span className="who">{f.f2.last}</span><span className="v">{fmtMl(m.mlB)}</span></span>
                        </div>
                      ) : (
                        <div className="ml-line"><span className="pending">Pending — line not posted</span></div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
