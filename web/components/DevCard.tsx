"use client";
import { useState } from "react";
import type { GradedCard } from "@/lib/devcards";

const pct = (v: number) => Math.round(v * 100);

export default function DevCard({ card, summary }: { card: GradedCard; summary: string[] }) {
  const [open, setOpen] = useState(false);
  const t = card.tallies;
  return (
    <article className="devcard">
      <div className="dc-head">
        <h3>{card.eventName}</h3>
        <span className="badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="11" width="14" height="10" rx="2" />
            <path d="M8 11V7a4 4 0 018 0v4" />
          </svg>
          Locked
        </span>
        <span className="date">{card.date}</span>
      </div>
      <div className="sc-wrap">
        <table className="sc">
          <thead>
            <tr>
              <th>Fight</th>
              <th>Our pick</th>
              <th>Result</th>
              <th className="c">W?</th>
              <th className="c">Method</th>
              <th className="c">Round</th>
            </tr>
          </thead>
          <tbody>
            {card.rows.map((r, i) => (
              <tr key={i}>
                <td className="f-fight">{r.fight}</td>
                <td className="f-pick"><span className="nm">{r.pickName}</span><span className="pc">{pct(r.pickPct)}%</span></td>
                <td className="f-res">{r.result}</td>
                <td className="c"><span className={`mk ${r.winnerHit ? "ok" : "no"}`}>{r.winnerHit ? "✓" : "✗"}</span></td>
                <td className="c"><span className={`mk ${r.methodHit ? "ok" : "no"}`}>{r.methodHit ? "✓" : "✗"}</span></td>
                <td className="c"><span className={`mk ${r.roundHit ? "ok" : "no"}`}>{r.roundHit ? "✓" : "✗"}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="tallies">
        <span className="t">Winners <b>{t.winners}<span className="den">/{t.n}</span></b></span>
        <span className="t">Methods <b>{t.methods}<span className="den">/{t.n}</span></b></span>
        <span className="t">Rounds <b>{t.rounds}<span className="den">/{t.n}</span></b></span>
      </div>
      <div className="dc-foot">
        <button className="summary-btn" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
          {open ? "Hide summary" : "Summary"}
        </button>
        <div className={`summary-box${open ? " open" : ""}`}>
          <ul>
            {summary.map((l, i) => (
              <li key={i}>{l}</li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}
