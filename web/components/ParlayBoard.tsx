"use client";
import { useEffect, useState } from "react";
import type { Parlay, ParlayLeg } from "@/lib/engine/reasoning";

const pct = (v: number) => Math.round(v * 100);

/** Leg type -> human label + colour class. Mirrors the engine's leg kinds. */
const TYPE_LABEL: Record<ParlayLeg["type"], [string, string]> = {
  winner: ["Moneyline", "winner"],
  method: ["Method", "method"],
  round: ["Round", "round"],
  "ou-rounds": ["O/U Rounds", "round"],
  "goes-distance": ["Distance", "round"],
};

/**
 * Cumulative probability as legs are added — the honest answer to "how many
 * legs should I add?". Straight multiplication of the engine's leg
 * probabilities; no smoothing, no invented numbers.
 */
function ladder(legs: ParlayLeg[]) {
  const out: { n: number; cum: number }[] = [];
  let cum = 1;
  legs.forEach((l, i) => {
    cum *= l.legProb;
    if (i >= 1) out.push({ n: i + 1, cum });
  });
  return out;
}

export default function ParlayBoard({ evId }: { evId: string }) {
  const [parlays, setParlays] = useState<Parlay[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch(`/api/predict/${evId}`);
        if (!r.ok) throw new Error();
        const d = await r.json();
        if (!cancelled) setParlays((d.parlays || []) as Parlay[]);
      } catch {
        if (!cancelled) setParlays([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [evId]);

  if (parlays === null) return <div className="skeleton" style={{ height: 260, marginTop: 18 }} />;

  if (!parlays.length)
    return (
      <div className="empty">
        No parlay met the engine&apos;s guardrails for this card. That&apos;s a deliberate outcome, not a gap — a
        suggestion only appears when enough legs clear the confidence bar.
      </div>
    );

  return (
    <>
      {parlays.map((p) => {
        const steps = ladder(p.legs);
        const bestIdx = steps.reduce((b, s, i) => (s.cum >= 0.5 ? i : b), -1);
        return (
          <article className="parlay" key={p.id}>
            <div className="p-head">
              <h3>{p.label}</h3>
              <span className="sug">Suggestion</span>
              <div className="cp">
                <div className="n">{pct(p.combinedProb)}%</div>
                <div className="l">All {p.legs.length} legs hit</div>
              </div>
            </div>

            {p.legs.map((l, i) => {
              const [label, cls] = TYPE_LABEL[l.type] || ["Leg", ""];
              return (
                <div className="leg" key={i}>
                  <span className={`tag ${cls}`}>{label}</span>
                  <div>
                    <div className="sel">{l.selection}</div>
                    <div className="rat">{l.rationale}</div>
                  </div>
                  <span className="lp">{pct(l.legProb)}%</span>
                </div>
              );
            })}

            <div className="ladder">
              <div className="k">If you stop early — chance all legs hit</div>
              <div className="rows">
                {steps.map((s, i) => (
                  <div className={`step${i === bestIdx ? " best" : ""}`} key={s.n}>
                    <div className="n">{pct(s.cum)}%</div>
                    <div className="l">{s.n} legs</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="caveat">
              Suggestion, not a lock. Combined probability multiplies the legs, so every leg you add lowers the chance
              of cashing. Bouts on one card aren&apos;t fully independent, so treat these as indicative. Stake small or skip.
            </div>
          </article>
        );
      })}
    </>
  );
}
