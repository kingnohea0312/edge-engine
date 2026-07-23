import type { Metadata } from "next";
import { listDevCards, buildSummary } from "@/lib/devcards";
import DevCard from "@/components/DevCard";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Predictions · Dev cards",
  description: "The Edge Engine's graded track record — picks locked before each event, scored against the results.",
};

export default async function DevCardsPage() {
  let cards: Awaited<ReturnType<typeof listDevCards>> = [];
  try {
    cards = await listDevCards();
  } catch {}

  const agg = cards.reduce(
    (a, c) => ({ winners: a.winners + c.tallies.winners, methods: a.methods + c.tallies.methods, rounds: a.rounds + c.tallies.rounds, n: a.n + c.tallies.n }),
    { winners: 0, methods: 0, rounds: 0, n: 0 },
  );
  const rate = (x: number) => (agg.n ? Math.round((x / agg.n) * 100) : 0);
  const rows: [string, number, string][] = [
    ["Winners", agg.winners, "called correctly"],
    ["Methods", agg.methods, "KO / Sub / Dec"],
    ["Rounds", agg.rounds, "round call landed"],
  ];

  return (
    <main>
      <div className="wrap wrap-narrow dev2">
        <div className="page-h">
          <h1>Dev Cards</h1>
          <p className="lede">
            Every pick here was <b>locked before the event</b>, then scored against what actually happened. New cards post
            the day after each event once the results are in. No hindsight, no edits.
          </p>
        </div>

        {cards.length > 0 && (
          <>
            {/* aggregate counts */}
            <section className="record">
              <div className="record-h">
                <span className="k">Track record</span>
                <span className="over">{cards.length} card{cards.length === 1 ? "" : "s"} graded · {agg.n} bouts</span>
              </div>
              <div className="record-grid">
                {rows.map(([label, val, note]) => (
                  <div className="rc" key={label}>
                    <div className="lbl">{label}</div>
                    <div className="big">{val}<span className="den">/{agg.n}</span></div>
                    <div className="rate"><b>{rate(val)}%</b> {note}</div>
                    <div className="minibar"><i style={{ width: `${rate(val)}%` }} /></div>
                  </div>
                ))}
              </div>
            </section>

            {/* by-percentage box */}
            <section className="record pctbox">
              <div className="record-h">
                <span className="k">By percentage</span>
                <span className="over">hit rate across all graded cards</span>
              </div>
              <div className="record-grid">
                {rows.map(([label, val]) => (
                  <div className="rc pct" key={label}>
                    <div className="lbl">{label}</div>
                    <div className="big">{rate(val)}<span className="den">%</span></div>
                    <div className="rate">{val} of {agg.n} landed</div>
                    <div className="minibar"><i style={{ width: `${rate(val)}%` }} /></div>
                  </div>
                ))}
              </div>
            </section>

            <div className="section-head">
              <h2>Graded cards</h2>
              <span className="rule" />
              <span className="meta">newest first</span>
            </div>

            {cards.map((card) => (
              <DevCard key={card.eventId} card={card} summary={buildSummary(card)} />
            ))}

            <div className="method-note">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 16v-4M12 8h.01" />
              </svg>
              <span>
                Cards grade automatically once results are final — <b>never re-run after the fact</b>. Winner, method, and
                round are scored independently, so a correct method on a wrong winner still counts. Confident picks are
                68%+; coin-flips fall under 59%.
              </span>
            </div>
          </>
        )}

        {cards.length === 0 && (
          <div className="devcard-empty" style={{ marginTop: 22 }}>
            No graded cards yet. The next locked card posts the day after it runs.
          </div>
        )}
      </div>
    </main>
  );
}
