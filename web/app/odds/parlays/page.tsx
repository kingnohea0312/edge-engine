import type { Metadata } from "next";
import { getCalendar } from "@/lib/data/espn";
import { fmtDateShort } from "@/lib/format";
import ParlayBoard from "@/components/ParlayBoard";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Parlays",
  description:
    "Suggested multi-leg parlays built from the Edge Engine's calibrated read — moneyline, method, and round legs. Suggestions, never locks.",
};

export default async function ParlaysPage() {
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

  return (
    <main>
      <div className="wrap wrap-narrow pl">
        <div className="page-h">
          <h1>Parlays</h1>
          {label && <span className="ev tnum">{label} · {fmtDateShort(start)}</span>}
        </div>
        <p className="lede">
          Multi-leg builds assembled from the same calibrated read as the Predictions page — the engine picks the legs,
          you decide whether to play them. <b>These are suggestions, not locks.</b>
        </p>

        <div className="warn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
            <path d="M12 9v4M12 17h.01" />
          </svg>
          <span>
            <b>Not locks.</b> A parlay only pays if <em>every</em>{" "}leg lands, and a single punch ends any fight. The
            percentages below are the engine&apos;s honest probabilities, capped at 85% by design — they are not
            guarantees, and no parlay here is a recommendation to bet. If you bet, bet only what you can afford to lose. 21+.
          </span>
        </div>

        <div className="howto">
          <div className="h">
            <div className="k">What a leg can be</div>
            <div className="v">
              <b>Moneyline</b> — who wins. <b>Method</b> — KO/TKO, submission, or decision. <b>Round</b> — the exact
              finishing round, offered only when the Veteran Gate has enough finish-timing history to commit to one.
            </div>
          </div>
          <div className="h">
            <div className="k">How many legs</div>
            <div className="v">
              Every leg multiplies, so odds fall fast. Each build below shows a ladder of what the chance becomes if you
              stop at 2, 3, or 4 legs — use it to pick where to stop rather than guessing.
            </div>
          </div>
          <div className="h">
            <div className="k">Why some cards are empty</div>
            <div className="v">
              A build only appears when enough legs clear the engine&apos;s confidence bar. If nothing shows, the card
              didn&apos;t earn a suggestion — that restraint is the point.
            </div>
          </div>
        </div>

        <div className="section-head">
          <h2>Suggested builds</h2>
          <span className="rule" />
          <span className="meta">from the current card</span>
        </div>

        {evId ? (
          <ParlayBoard evId={evId} />
        ) : (
          <div className="empty">No upcoming card to build parlays from yet.</div>
        )}
      </div>
    </main>
  );
}
