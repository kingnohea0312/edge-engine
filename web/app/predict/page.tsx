import type { Metadata } from "next";
import Link from "next/link";
import { getCalendar, getEventById } from "@/lib/data/espn";
import { shapeEvent } from "@/lib/data/shape";
import { fmtTime, monShort, dayNum, eventPill } from "@/lib/format";
import LockOnView from "@/components/LockOnView";
import PredictBoard, { type PBSegment } from "@/components/PredictBoard";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Predictions · Current events",
  description: "Run the Edge Engine on a current UFC card — win probability, method, and the Veteran-Gate round call.",
};

const WC_ABBR: [string, string][] = [
  ["light heavyweight", "LHW"], ["strawweight", "SW"], ["flyweight", "FLW"], ["bantamweight", "BW"],
  ["featherweight", "FW"], ["lightweight", "LW"], ["welterweight", "WW"], ["middleweight", "MW"], ["heavyweight", "HW"],
];
function wcAbbr(t: string): string {
  const s = (t || "").toLowerCase();
  const women = /women/.test(s);
  for (const [k, v] of WC_ABBR) if (s.includes(k)) return (women ? "W " : "") + v;
  return t ? t.split(/\s+/).map((w) => w[0]).join("").toUpperCase().slice(0, 4) : "";
}
const SEG_LABEL: Record<string, string> = {
  "Main Card": "Main Card",
  Prelims: "Preliminary Card",
  "Early Prelims": "Early Preliminary Card",
  "Fight Card": "Fight Card",
};

export default async function PredictPage() {
  let evId: string | null = null;
  let eventName = "";
  let eventMeta = "";
  let segments: PBSegment[] = [];
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
        eventName = ev.name;
        const dt = ev.date
          ? new Date(ev.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "America/New_York" }) + " · " + fmtTime(ev.date)
          : "";
        const place = [ev.venue, ev.city].filter(Boolean).join(", ");
        eventMeta = [dt, place].filter(Boolean).join(" · ");
        segments = ev.segments
          .map((seg) => {
            const isMainCard = seg.name === "Main Card";
            const bouts = seg.fights
              .filter((f) => !f.done)
              .map((f, i) => ({
                compId: f.compId,
                aName: f.f1.name,
                bName: f.f2.name,
                aLast: f.f1.last,
                bLast: f.f2.last,
                wcAbbr: wcAbbr(f.type),
                roundsLabel: `${f.rounds} Rds`,
                slot: isMainCard ? (i === 0 ? "Main event" : i === 1 ? "Co-main" : null) : null,
                type: f.type,
              }));
            return { name: SEG_LABEL[seg.name] || seg.name, bouts };
          })
          .filter((seg) => seg.bouts.length > 0);
      }
    }
  } catch {}

  const hasBouts = segments.some((s) => s.bouts.length > 0);

  return (
    <main>
      <div className="wrap wrap-narrow">
        {evId && <LockOnView evId={evId} />}
        {evId && hasBouts ? (
          <PredictBoard evId={evId} eventName={eventName} eventMeta={eventMeta} segments={segments} />
        ) : (
          <div className="card err">No upcoming card available to predict yet.</div>
        )}

        {others.length > 0 && (
          <>
            <div className="section-head">
              <h2>Other upcoming cards</h2>
              <span className="rule" />
              <span className="meta">pick a matchup to run</span>
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
                      <div className="s">Lines not yet posted</div>
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
