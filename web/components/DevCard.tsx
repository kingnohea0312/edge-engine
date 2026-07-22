"use client";
import { useState } from "react";
import type { GradedCard } from "@/lib/devcards";

const pct = (v: number) => Math.round(v * 100);

function Mark({ hit }: { hit: boolean }) {
  return (
    <span className={`mk ${hit ? "ok" : "no"}`} role="img" aria-label={hit ? "hit" : "miss"}>
      {hit ? "✓" : "✗"}
    </span>
  );
}

export default function DevCard({ card, summary }: { card: GradedCard; summary: string[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card devcard">
      <div className="devcard-head">
        <h3>{card.eventName}</h3>
        <span className="badge">Locked</span>
        <span className="date tnum">{card.date}</span>
      </div>
      <div className="scorecard-wrap">
        <table className="scorecard">
          <thead>
            <tr>
              <th>Fight</th>
              <th>Our pick</th>
              <th>Result</th>
              <th style={{ textAlign: "center" }}>W?</th>
              <th style={{ textAlign: "center" }}>Method</th>
              <th style={{ textAlign: "center" }}>Round</th>
            </tr>
          </thead>
          <tbody>
            {card.rows.map((r, i) => (
              <tr key={i}>
                <td>{r.fight}</td>
                <td className="pk">
                  {r.pickName} <span className="tnum" style={{ color: "var(--faint)", fontWeight: 400 }}>{pct(r.pickPct)}%</span>
                </td>
                <td className="tnum">{r.result}</td>
                <td className="mk">
                  <Mark hit={r.winnerHit} />
                </td>
                <td className="mk">
                  <Mark hit={r.methodHit} />
                </td>
                <td className="mk">
                  <Mark hit={r.roundHit} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="tallies">
        <span>Winners <b>{card.tallies.winners}/{card.tallies.n}</b></span>
        <span>Methods <b>{card.tallies.methods}/{card.tallies.n}</b></span>
        <span>Rounds <b>{card.tallies.rounds}/{card.tallies.n}</b></span>
      </div>
      <button className="btn ghost summary-btn" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        {open ? "Hide summary" : "Summary"}
      </button>
      {open && (
        <div className="summary-box">
          <ul>
            {summary.map((l, i) => (
              <li key={i}>{l}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
