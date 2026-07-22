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
  return delta > 0 ? "up" : "down";
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
      <div className="wrap wrap-narrow">
        <div className="section-head" style={{ marginTop: 4 }}>
          <h2>Live odds</h2>
          <span className="rule" />
          <span className="meta tnum">{label} · {fmtDateShort(start)}</span>
        </div>
        <p className="muted" style={{ marginBottom: 16 }}>
          Las Vegas moneylines (ESPN BET), swept server-side and refreshed at most every 15 minutes. Books usually post
          lines during fight week; unlined bouts show as pending.
        </p>

        {/* desktop table */}
        <div className="card" style={{ overflow: "hidden" }}>
          <table className="odds-table">
            <thead>
              <tr>
                <th>Bout</th>
                <th>Class</th>
                <th style={{ textAlign: "right" }}>Moneyline</th>
                <th style={{ textAlign: "center", width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {fights.map((f) => {
                const m = markets.get(f.compId);
                const mv = move(m);
                const favA = m && m.mlA < m.mlB;
                return (
                  <tr key={f.compId}>
                    <td>
                      <Link href={`/event/${evId}/${f.compId}`} style={{ fontWeight: 600 }}>
                        {f.f1.short} vs {f.f2.short}
                      </Link>
                    </td>
                    <td style={{ color: "var(--faint)", fontSize: 12 }}>{f.type}</td>
                    <td style={{ textAlign: "right" }} className="tnum">
                      {m ? (
                        <>
                          <span className={`ml ${favA ? "fav" : ""}`}>{fmtMl(m.mlA)}</span>
                          <span style={{ color: "var(--faint)" }}> / </span>
                          <span className={`ml ${!favA ? "fav" : ""}`}>{fmtMl(m.mlB)}</span>
                        </>
                      ) : (
                        <span className="muted">not posted</span>
                      )}
                    </td>
                    <td style={{ textAlign: "center" }} className={`mv ${mv || ""}`}>
                      {mv === "up" ? "▲" : mv === "down" ? "▼" : ""}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* mobile cards */}
          <div className="odds-cards" style={{ padding: 12 }}>
            {fights.map((f) => {
              const m = markets.get(f.compId);
              const favA = m && m.mlA < m.mlB;
              return (
                <Link key={f.compId} href={`/event/${evId}/${f.compId}`} className="card" style={{ padding: 12 }}>
                  <div style={{ fontWeight: 600 }}>{f.f1.short} vs {f.f2.short}</div>
                  <div style={{ color: "var(--faint)", fontSize: 11, margin: "3px 0 8px" }}>{f.type}</div>
                  <div className="tnum" style={{ fontWeight: 800 }}>
                    {m ? (
                      <>
                        <span className={favA ? "" : ""} style={{ color: favA ? "var(--red-soft)" : "inherit" }}>{fmtMl(m.mlA)}</span>
                        {"  /  "}
                        <span style={{ color: !favA ? "var(--red-soft)" : "inherit" }}>{fmtMl(m.mlB)}</span>
                      </>
                    ) : (
                      <span className="muted">not posted</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
