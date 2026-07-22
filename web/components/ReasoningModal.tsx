"use client";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { Leg } from "@/lib/engine/reasoning";
import { fmtMl } from "@/lib/engine/market";

const pct = (v: number) => Math.round(v * 100);
const fmtAsOf = (iso: string) => {
  try {
    return new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/New_York" }) + " ET";
  } catch {
    return iso;
  }
};

/* ---------------- shell ---------------- */
function Modal({ open, onClose, labelId, kicker, title, children }: {
  open: boolean;
  onClose: () => void;
  labelId: string;
  kicker: string;
  title: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const prev = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    prev.current = document.activeElement as HTMLElement;
    document.body.style.overflow = "hidden";
    const el = ref.current;
    const focusables = () =>
      el ? Array.from(el.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input,[tabindex]:not([tabindex="-1"])')) : [];
    const t = setTimeout(() => (focusables()[0] || el)?.focus(), 20);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return onClose();
      if (e.key === "Tab") {
        const f = focusables();
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      prev.current?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="rm-backdrop" onMouseDown={onClose}>
      <div className="rm-sheet" role="dialog" aria-modal="true" aria-labelledby={labelId} ref={ref} tabIndex={-1} onMouseDown={(e) => e.stopPropagation()}>
        <div className="rm-head">
          <div>
            <div className="kicker">{kicker}</div>
            <h3 id={labelId}>{title}</h3>
          </div>
          <button className="rm-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="rm-body">{children}</div>
      </div>
    </div>
  );
}

/* ---------------- single-bout reasoning body ---------------- */
export function BoutReasoning({ leg }: { leg: Leg }) {
  const capped = leg.pick.winProb > 0.855;
  const rounds = leg.bout.rounds;
  const cells: { lab: string; key: string; p: number; peak: boolean; dist?: boolean }[] = [];
  for (let r = 1; r <= rounds; r++)
    cells.push({ lab: "R" + r, key: String(r), p: leg.round.histogram[r] || 0, peak: leg.round.mode === "veteran" && leg.round.modalRound === r });
  cells.push({ lab: "DIST", key: "distance", p: leg.round.histogram.distance || 0, peak: leg.round.mode === "veteran" && leg.round.call === "Distance", dist: true });

  return (
    <>
      {/* 1 · pick */}
      <div className="rm-sec rm-pick">
        <div className="who">{leg.pick.winnerName}</div>
        <div className={`tier ${leg.pick.tier === "STRONG" ? "strong" : leg.pick.tier === "LEAN" ? "lean" : ""}`} style={{ display: "inline-block", marginTop: 8 }}>
          {leg.pick.tier} · {pct(leg.pick.winProbDisplay)}%{capped ? "+" : ""}
        </div>
        {capped && <div style={{ fontSize: 11, color: "var(--faint)", marginTop: 6 }}>Display capped at 85%. Model reads {pct(leg.pick.winProb)}%.</div>}
        <div className="probbar" style={{ margin: "14px 0 0" }}>
          <span className="pa tnum" style={{ width: `${Math.max(8, Math.min(92, pct(leg.pick.winnerId === leg.fighters.a.id ? leg.pick.winProb : 1 - leg.pick.winProb)))}%` }}>
            {pct(leg.pick.winnerId === leg.fighters.a.id ? leg.pick.winProb : 1 - leg.pick.winProb)}%
          </span>
          <span className="pb tnum">{leg.fighters.a.last} / {leg.fighters.b.last}</span>
        </div>
      </div>

      {/* 2 · market anchor */}
      <div className="rm-sec">
        <h4>Market anchor</h4>
        {leg.market ? (
          <>
            <div className="anchor-line" style={{ margin: 0 }}>
              <div className="cell">
                <div className="k">Line</div>
                <div className="v gold tnum">{fmtMl(leg.market.mlA)} / {fmtMl(leg.market.mlB)}</div>
              </div>
              <div className="cell">
                <div className="k">Implied {leg.fighters.a.last}</div>
                <div className="v tnum">{pct(leg.market.impliedA)}%</div>
              </div>
              <div className="cell">
                <div className="k">Model nudge</div>
                <div className={`v tnum ${leg.market.nudgePts >= 0 ? "up" : "down"}`}>{leg.market.nudgePts >= 0 ? "+" : ""}{leg.market.nudgePts.toFixed(1)} pts</div>
              </div>
            </div>
            <p className="muted" style={{ marginTop: 10 }}>
              {leg.market.provider} line, de-vigged. {leg.market.moved ? "The line has moved since open." : "The pick sits on the market prior, adjusted by the itemized nudges below."}
            </p>
          </>
        ) : (
          <p className="muted">No line posted for this bout. This is a stats-only read, so the confidence tier is capped.</p>
        )}
      </div>

      {/* 3 · drivers */}
      <div className="rm-sec">
        <h4>Why — the drivers</h4>
        <div className="drivers" style={{ padding: 0 }}>
          <div className="dr">
            <span className="s">★</span>
            <span>
              Most likely path: <b>{leg.reasoning.mostLikelyPath.who} by {leg.reasoning.mostLikelyPath.how}</b> ({pct(leg.reasoning.mostLikelyPath.prob)}%). {pct(leg.reasoning.finishProb)}% chance of a finish.
            </span>
          </div>
          {leg.reasoning.drivers.map((d, i) => (
            <div className="dr" key={i}>
              <span className={`s ${d.dir === "+" ? "plus" : "minus"}`}>{d.dir === "+" ? "▲" : "▼"}</span>
              <span>
                <b>{d.label}</b>: {d.detail} <i style={{ color: "var(--faint)" }}>· favors {d.favors}</i>
              </span>
            </div>
          ))}
          {leg.dataQuality.lowData && (
            <div className="dr">
              <span className="s">◐</span>
              <span><b>Low data.</b> Thin UFC sample on one side, so the model stays near the market line.</span>
            </div>
          )}
        </div>
      </div>

      {/* 4 · method */}
      <div className="rm-sec">
        <h4>How it likely ends</h4>
        <table className="mtx" style={{ width: "100%", margin: 0 }}>
          <tbody>
            <tr>
              <th />
              <th>{leg.fighters.a.last}</th>
              <th>{leg.fighters.b.last}</th>
            </tr>
            {(["KO/TKO", "Submission", "Decision"] as const).map((how, i) => {
              const k = (["ko", "sub", "dec"] as const)[i];
              const hot = leg.method.top === how;
              return (
                <tr key={how}>
                  <td>{how}</td>
                  <td className={hot && leg.pick.winnerId === leg.fighters.a.id ? "hot tnum" : "tnum"}>{pct(leg.method.matrix.a[k])}%</td>
                  <td className={hot && leg.pick.winnerId === leg.fighters.b.id ? "hot tnum" : "tnum"}>{pct(leg.method.matrix.b[k])}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="muted" style={{ marginTop: 8 }}>Goes the distance: {pct(leg.distance.goesDistanceProb)}%{leg.distance.ouLine ? ` · O/U ${leg.distance.ouLine} rounds` : ""}.</p>
      </div>

      {/* 5 · round */}
      <div className="rm-sec">
        <h4>Round projection</h4>
        <div className="roundcall" style={{ margin: 0 }}>
          <div className="rh">
            <span className="lbl">{leg.round.mode === "veteran" ? "Finish-timing histogram" : "Soft read"}</span>
            <span className={`badge ${leg.round.mode === "veteran" ? "" : "std"}`}>{leg.round.mode === "veteran" ? "Veteran read" : "Standard read"}</span>
          </div>
          <div className="rr display">
            {leg.round.mode === "veteran"
              ? leg.round.call === "Distance"
                ? <>Goes the distance <span className="p tnum">{pct(leg.round.modalProb || leg.round.histogram.distance || 0)}%</span></>
                : <>Finish — Round {leg.round.modalRound} <span className="p tnum">{pct(leg.round.modalProb || 0)}%</span></>
              : leg.round.call === "Finish-early"
                ? "Finish likely — early"
                : leg.round.call === "Finish-late"
                  ? "Finish likely — late"
                  : "Likely goes the distance"}
          </div>
          <div className="rbar">
            {cells.map((c) => (
              <div key={c.key} className={`seg ${c.peak ? "peak" : c.dist ? "dist" : "dim"}`} style={{ flex: Math.max(c.p * 100, 3) }}>
                {c.p >= 0.13 ? pct(c.p) + "%" : ""}
              </div>
            ))}
          </div>
          <div className="rlabels">
            {cells.map((c) => (
              <span key={c.key} style={{ flex: Math.max(c.p * 100, 3) }}>{c.lab}</span>
            ))}
          </div>
          {leg.round.mode === "standard" && leg.round.gateReason && (
            <div className="reason">Exact round withheld: {leg.round.gateReason}. The engine only commits a round when the finish-timing sample earns it.</div>
          )}
        </div>
      </div>

      {/* 6 · grounding */}
      <div className="rm-sec">
        <h4>Grounding</h4>
        <p className="muted" style={{ lineHeight: 1.7 }}>
          Swept {leg.dataQuality.fightsSweptA} fights for {leg.fighters.a.last}, {leg.dataQuality.fightsSweptB} for {leg.fighters.b.last}.
          <br />
          Feeds: {leg.reasoning.feeds.join(", ")}.
          <br />
          As of {fmtAsOf(leg.dataQuality.asOf)}.
        </p>
      </div>

      {/* 7 · footer */}
      <div className="rm-sec">
        <p style={{ fontSize: 11.5, color: "var(--faint)", lineHeight: 1.6 }}>
          Probabilities, not locks — a single punch ends any fight. If you bet, bet only what you can afford to lose. 21+.
        </p>
      </div>
    </>
  );
}

/* ---------------- single-bout launcher ---------------- */
export function ReasoningButton({ evId, compId, label = "Why it picked this", className = "btn ghost" }: {
  evId: string;
  compId: string;
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [leg, setLeg] = useState<Leg | null>(null);
  const [err, setErr] = useState(false);
  const labelId = useId();

  const load = useCallback(async () => {
    setOpen(true);
    if (leg) return;
    try {
      const r = await fetch(`/api/predict/${evId}/${compId}`);
      if (!r.ok) throw new Error();
      const d = await r.json();
      setLeg(d.leg);
    } catch {
      setErr(true);
    }
  }, [evId, compId, leg]);

  return (
    <>
      <button className={className} onClick={load}>{label}</button>
      <Modal open={open} onClose={() => setOpen(false)} labelId={labelId} kicker="Edge Engine · why" title={leg ? `${leg.fighters.a.last} vs ${leg.fighters.b.last}` : "Reasoning"}>
        {err ? (
          <div className="rm-sec err">Couldn&apos;t load the reasoning. Try again.</div>
        ) : !leg ? (
          <div className="rm-progress" aria-live="polite">
            Sweeping fight archives…
            <div className="barwrap"><i style={{ width: "40%" }} /></div>
          </div>
        ) : (
          <BoutReasoning leg={leg} />
        )}
      </Modal>
    </>
  );
}

/* ---------------- full-card launcher ---------------- */
interface Bout { compId: string; a: string; b: string; type: string }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Parlay = any;

export function CardReasoningButton({ evId, bouts, label = "Run full card", className = "btn primary" }: {
  evId: string;
  bouts: Bout[];
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [legs, setLegs] = useState<Record<string, Leg>>({});
  const [done, setDone] = useState(0);
  const [parlays, setParlays] = useState<Parlay[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [running, setRunning] = useState(false);
  const labelId = useId();
  const started = useRef(false);

  const run = useCallback(async () => {
    setOpen(true);
    if (started.current) return;
    started.current = true;
    setRunning(true);
    for (const b of bouts) {
      try {
        const r = await fetch(`/api/predict/${evId}/${b.compId}`);
        if (r.ok) {
          const d = await r.json();
          setLegs((m) => ({ ...m, [b.compId]: d.leg }));
        }
      } catch {}
      setDone((n) => n + 1);
    }
    try {
      const r = await fetch(`/api/predict/${evId}`);
      if (r.ok) {
        const card = await r.json();
        setParlays(card.parlays || []);
      }
    } catch {}
    setRunning(false);
  }, [evId, bouts]);

  const total = bouts.length;

  return (
    <>
      <button className={className} onClick={run}>{label}</button>
      <Modal open={open} onClose={() => setOpen(false)} labelId={labelId} kicker="Edge Engine · full card" title="Card reasoning">
        {done < total && (
          <div className="rm-progress" aria-live="polite">
            Analyzing — {done} of {total} bouts processed
            <div className="barwrap"><i style={{ width: `${(done / total) * 100}%` }} /></div>
          </div>
        )}
        <div className="rm-sec">
          {bouts.map((b) => {
            const leg = legs[b.compId];
            const isOpen = expanded[b.compId];
            return (
              <div className="recap-row" key={b.compId}>
                <button className="rhead" onClick={() => leg && setExpanded((e) => ({ ...e, [b.compId]: !e[b.compId] }))} aria-expanded={!!isOpen}>
                  <span className="bout">
                    <span className="bn">{b.a} vs {b.b}</span>
                    <span className="bm">{b.type}</span>
                  </span>
                  {leg ? (
                    <span className="pk">
                      <span className="p tnum">
                        {leg.pick.winnerName.split(" ").pop()} {pct(leg.pick.winProbDisplay)}%{leg.pick.winProb > 0.855 ? "+" : ""}
                      </span>
                      <span className="r">
                        {leg.method.top} · {leg.round.call}
                        {leg.round.mode === "veteran" && typeof leg.round.modalRound === "number" ? <span className="vetchip">VET</span> : null}
                      </span>
                    </span>
                  ) : (
                    <span className="r" style={{ color: "var(--faint)", fontSize: 12 }}>analyzing…</span>
                  )}
                  {leg && <span style={{ color: "var(--faint)", marginLeft: 4 }}>{isOpen ? "▾" : "▸"}</span>}
                </button>
                {leg && isOpen && (
                  <div className="rbody">
                    <BoutReasoning leg={leg} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {parlays.length > 0 && (
          <div className="rm-sec">
            <h4>Suggestion parlays</h4>
            {parlays.map((p: Parlay) => (
              <div className="parlay" key={p.id}>
                <div className="ph">
                  <span className="nm">{p.label}</span>
                  <span className="sug">Suggestion</span>
                  <span className="cp tnum">{pct(p.combinedProb)}%</span>
                </div>
                {p.legs.map((lg: Parlay["legs"][number], i: number) => (
                  <div className="leg" key={i}>
                    <span>
                      <span className="sel">{lg.selection}</span>
                      <br />
                      <span className="rat">{lg.rationale}</span>
                    </span>
                    <span className="lp tnum">{pct(lg.legProb)}%</span>
                  </div>
                ))}
                <div className="caveat">
                  Suggestion, not a lock. Combined probability multiplies the legs; bouts on one card aren&apos;t fully independent, so treat it as indicative. Stake small or skip.
                </div>
              </div>
            ))}
          </div>
        )}

        {!running && parlays.length === 0 && done >= total && (
          <div className="rm-sec"><p className="muted">No value-backed parlay met the guardrails for this card.</p></div>
        )}

        <div className="rm-sec">
          <p style={{ fontSize: 11.5, color: "var(--faint)", lineHeight: 1.6 }}>
            Probabilities, not locks — a single punch ends any fight. If you bet, bet only what you can afford to lose. 21+.
          </p>
        </div>
      </Modal>
    </>
  );
}
