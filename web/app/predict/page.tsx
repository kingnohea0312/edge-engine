import type { Metadata } from "next";
import Link from "next/link";
import { getCalendar, getEventById } from "@/lib/data/espn";
import { shapeEvent } from "@/lib/data/shape";
import { fmtDateLong, monShort, dayNum, eventPill } from "@/lib/format";
import { CardReasoningButton, ReasoningButton } from "@/components/ReasoningModal";
import LockOnView from "@/components/LockOnView";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Predictions · Current events",
  description: "Run the Edge Engine on a current UFC card — win probability, method, and the Veteran-Gate round call.",
};

export default async function PredictPage() {
  let evId: string | null = null;
  let name = "";
  let date = "";
  let bouts: { compId: string; a: string; b: string; type: string }[] = [];
  let others: { id: string; label: string; start: string }[] = [];
  try {
    const { cal } = await getCalendar();
    const upcoming = cal.filter((c) => +new Date(c.start) > Date.now() - 18 * 3_600_000);
    const next = upcoming[0];
    others = upcoming.slice(1, 7);
    if (next) {
      evId = next.id;
      const res = await getEventById(next.id);
      if (res) {
        const ev = shapeEvent(res.ev, res.dateStr);
        name = ev.name;
        date = ev.date;
        bouts = ev.segments
          .flatMap((s) => s.fights)
          .filter((f) => !f.done)
          .map((f) => ({ compId: f.compId, a: f.f1.name, b: f.f2.name, type: f.type }));
      }
    }
  } catch {}

  return (
    <main>
      <div className="wrap wrap-narrow">
        {evId && <LockOnView evId={evId} />}
        <div className="pred" style={{ marginBottom: 20 }}>
          <div className="ph">
            <span className="dot" />
            <b>Edge Engine</b>
            <span>current card forecast</span>
          </div>
          <div style={{ padding: "16px 18px" }}>
            <div className="display" style={{ fontSize: 22, textTransform: "uppercase" }}>{name || "No upcoming card"}</div>
            {date && <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 5 }}>{fmtDateLong(date)} · market-anchored when lines are posted</div>}
            <p style={{ color: "var(--faint)", fontSize: 12.5, marginTop: 10, lineHeight: 1.6 }}>
              Open a bout to run the engine and see the full reasoning, or run the whole card for a recap and suggestion parlays.
            </p>
            {evId && bouts.length > 0 && (
              <div style={{ marginTop: 14 }}>
                <CardReasoningButton evId={evId} bouts={bouts} />
              </div>
            )}
          </div>
        </div>

        {evId && bouts.length ? (
          <div className="fights">
            {bouts.map((b) => (
              <div key={b.compId} className="card" style={{ padding: 16, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <Link href={`/event/${evId}/${b.compId}`} style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ fontWeight: 700 }}>
                    {b.a} <span style={{ color: "var(--red)" }}>vs</span> {b.b}
                  </div>
                  <div style={{ color: "var(--faint)", fontSize: 11, textTransform: "uppercase", letterSpacing: ".06em", marginTop: 2 }}>{b.type}</div>
                </Link>
                <ReasoningButton evId={evId} compId={b.compId} label="Run" />
              </div>
            ))}
          </div>
        ) : (
          <div className="card err">No upcoming card available to predict yet.</div>
        )}

        {others.length > 0 && (
          <>
            <div className="section-head">
              <h2>Other upcoming cards</h2>
              <span className="rule" />
            </div>
            <div className="card">
              {others.map((c) => {
                const p = eventPill(c.label, false);
                return (
                  <Link key={c.id} href={`/event/${c.id}`} className="ev-row">
                    <div className="date">
                      <div className="m">{monShort(c.start)}</div>
                      <div className="d">{dayNum(c.start)}</div>
                    </div>
                    <div className="info">
                      <div className="t">{c.label}</div>
                      <div className="s">Pick a matchup to run</div>
                    </div>
                    <span className={`pill ${p.cls}`}>{p.txt}</span>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
