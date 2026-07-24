import Link from "next/link";
import { getCalendar } from "@/lib/data/espn";
import { fmtDateLong, fmtTime, monShort, dayNum, eventPill } from "@/lib/format";
import Countdown from "@/components/Countdown";

export const dynamic = "force-dynamic";

const IC = {
  cal: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="16" rx="2.5" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  ),
  trophy: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 4h10v5.5a5 5 0 0 1-10 0Z" />
      <path d="M12 14.5V18M8.5 21h7" />
    </svg>
  ),
  trend: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 17.5 9 11.5l4 4L21 7" />
      <path d="M15.5 7H21v5.5" />
    </svg>
  ),
  target: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.6" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
    </svg>
  ),
  arrow: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  ),
  chev: (
    <svg className="chev" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5l7 7-7 7" />
    </svg>
  ),
};

const FEATURES: [string, string, React.ReactNode, string, boolean][] = [
  ["/events", "Events", IC.cal, "Full fight cards, main to early prelims, with live schedules and results.", false],
  ["/rankings", "Rankings", IC.trophy, "Official divisional rankings and pound-for-pound, live from ufc.com.", true],
  ["/odds", "Live Odds", IC.trend, "Live sportsbook moneylines across the card, with the favorite highlighted.", false],
  ["/predict", "Predictions", IC.target, "The engine's calibrated read: pick, market anchor, method matrix, round call.", false],
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
          <div className="hero-copy">
            <span className="kicker">Calibrated UFC Forecasting</span>
            <h1>
              EDGE<br />
              <b>ENGINE</b>
            </h1>
            <p className="lede">
              Honest win, method, and round probabilities — anchored to the Vegas market, never sold as
              locks. <b>A pick is not a bet.</b> Every read is calibrated, capped at 85% confidence, and
              shows its work.
            </p>
            <div className="cta">
              <Link href="/predict" className="btn primary">
                {IC.target} Run the engine
              </Link>
              <Link href="/events" className="btn ghost">
                {IC.cal} Browse events
              </Link>
            </div>
          </div>
          {next && (
            <Link href={`/event/${next.id}`} className="nextcard">
              <div className="top">
                <span className="live" /> Next event · Live
              </div>
              <div className="en">{next.label}</div>
              <div className="meta tnum">
                {fmtDateLong(next.start)} · {fmtTime(next.start)}
              </div>
              <Countdown target={next.start} />
              <div className="go">
                View full card <span>{IC.arrow}</span>
              </div>
            </Link>
          )}
        </section>

        <div className="section-head">
          <h2>Inside the app</h2>
          <span className="rule" />
        </div>
        <div className="features">
          {FEATURES.map(([href, title, icon, desc, gold]) => (
            <Link key={href} href={href} className={gold ? "feature gold" : "feature"}>
              <div className="ic">{icon}</div>
              <h3>{title}</h3>
              <p>{desc}</p>
              <span className="go">Open {IC.arrow}</span>
            </Link>
          ))}
        </div>

        {upcoming.length > 1 && (
          <>
            <div className="section-head">
              <h2>Upcoming</h2>
              <span className="rule" />
              <Link href="/events" className="meta">
                All events
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
                    {IC.chev}
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
