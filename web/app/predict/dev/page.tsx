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

  return (
    <main>
      <div className="wrap wrap-narrow">
        <div className="section-head" style={{ marginTop: 4 }}>
          <h2>Dev cards</h2>
          <span className="rule" />
          <span className="meta">graded track record</span>
        </div>
        <p className="muted" style={{ marginBottom: 18, lineHeight: 1.6 }}>
          Every pick here was locked before the event, then scored against what actually happened. New cards post the day
          after each event once the results are in. No hindsight, no edits.
        </p>

        {cards.length ? (
          cards.map((card) => <DevCard key={card.eventId} card={card} summary={buildSummary(card)} />)
        ) : (
          <div className="card devcard-empty">
            No graded cards yet. The next locked card posts the day after it runs.
          </div>
        )}
      </div>
    </main>
  );
}
