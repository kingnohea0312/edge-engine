import Link from "next/link";
import { getCalendar } from "@/lib/data/espn";
import { fmtDateLong, fmtTime, monShort, dayNum, eventPill } from "@/lib/format";

export const dynamic = "force-dynamic";

const FEATURES = [
  ["/events", "Events", "Every upcoming UFC card with dates, venues, and start times — plus the full fight lineup and recent results.", "Browse schedule"],
  ["/rankings", "Rankings", "Official divisional rankings and champions, live from ufc.com. Tap any fighter for stats and full fight history.", "See the standings"],
  ["/odds", "Live Odds", "Real-time Las Vegas moneylines and line movement, swept server-side across the whole card.", "Check the lines"],
  ["/predict", "Predictions", "The Edge Engine read on every bout — win probability, method, and the Veteran-Gate round call.", "Run the engine"],
];

export default async function Home() {
  let cal: Awaited<ReturnType<typeof getCalendar>>["cal"] = [];
  try {
    ({ cal } = await getCalendar());
  } catch {}
  const now = Date.now();
  const upcoming = cal.filter((c) => +new Date(c.start) > now - 18 * 3_600_000);
  const next = upcoming[0] || null;

  return (
    <main>
      <div className="wrap">
        <section className="hero reveal">
          <span className="kicker">Calibrated UFC Forecasting</span>
          <h1>
            EDGE<b>ENGINE</b>
          </h1>
          <p>
            Live UFC schedules and full fight cards, fighter profiles with real career stats and complete
            fight history, Las Vegas betting lines in real time — and a market-anchored prediction engine
            that gives you honest probabilities, never locks.
          </p>
          <div className="cta">
            <Link href="/predict" className="btn primary">
              Run the engine
            </Link>
            <Link href="/events" className="btn ghost">
              Browse events
            </Link>
          </div>
          {next && (
            <Link href={`/event/${next.id}`} className="next-strip" style={{ maxWidth: 560 }}>
              <span className="pulse" />
              <div>
                <div className="t">{next.label}</div>
                <div className="s tnum">
                  {fmtDateLong(next.start)} · {fmtTime(next.start)}
                </div>
              </div>
              <span className="go">›</span>
            </Link>
          )}
        </section>

        <div className="section-head">
          <h2>Inside the app</h2>
          <span className="rule" />
        </div>
        <div className="features">
          {FEATURES.map(([href, title, desc, go]) => (
            <Link key={href} href={href} className="feature">
              <h3>{title}</h3>
              <p>{desc}</p>
              <span className="go">{go} ›</span>
            </Link>
          ))}
        </div>

        {upcoming.length > 1 && (
          <>
            <div className="section-head">
              <h2>Upcoming</h2>
              <span className="rule" />
              <Link href="/events" className="meta">
                All events ›
              </Link>
            </div>
            <div className="card">
              {upcoming.slice(1, 7).map((c) => {
                const p = eventPill(c.label, false);
                return (
                  <Link key={c.id} href={`/event/${c.id}`} className="ev-row">
                    <div className="date">
                      <div className="m">{monShort(c.start)}</div>
                      <div className="d">{dayNum(c.start)}</div>
                    </div>
                    <div className="info">
                      <div className="t">{c.label}</div>
                      <div className="s tnum">{fmtTime(c.start)}</div>
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
