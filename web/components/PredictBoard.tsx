"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Leg } from "@/lib/engine/reasoning";
import { CardReasoningButton } from "@/components/ReasoningModal";

export interface PBBout {
  compId: string;
  aName: string;
  bName: string;
  aLast: string;
  bLast: string;
  wcAbbr: string;
  roundsLabel: string;
  slot: string | null;
  type: string;
}
export interface PBSegment {
  name: string;
  bouts: PBBout[];
}
interface Props {
  evId: string;
  eventName: string;
  eventMeta: string;
  segments: PBSegment[];
}

const pct = (v: number) => Math.round(v * 100);
const methodChip = (top: string) => (top === "KO/TKO" ? "KO / TKO" : top === "Submission" ? "Sub" : "Decision");
const tierWord = (t: string) => (t === "STRONG" ? "Strong" : t === "SOLID" ? "Solid" : "Lean");

function roundChip(leg: Leg): string {
  const r = leg.round;
  if (r.mode === "veteran" && typeof r.modalRound === "number") return "R" + r.modalRound;
  if (r.call === "Distance") return "Distance";
  if (r.call === "Finish-early") return "Early";
  if (r.call === "Finish-late") return "Late";
  return r.call || "—";
}

export default function PredictBoard({ evId, eventName, eventMeta, segments }: Props) {
  const [results, setResults] = useState<Record<string, Leg | "error">>({});
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const allBouts = segments.flatMap((s) => s.bouts);
  const total = allBouts.length;

  const reveal = useCallback((id: string) => {
    requestAnimationFrame(() => requestAnimationFrame(() => setRevealed((s) => new Set(s).add(id))));
  }, []);

  useEffect(() => {
    let cancelled = false;
    const queue = [...allBouts];
    const worker = async () => {
      while (queue.length && !cancelled) {
        const b = queue.shift()!;
        try {
          const r = await fetch(`/api/predict/${evId}/${b.compId}`);
          if (!r.ok) throw new Error();
          const d = await r.json();
          if (cancelled) return;
          setResults((s) => ({ ...s, [b.compId]: d.leg as Leg }));
          reveal(b.compId);
        } catch {
          if (!cancelled) setResults((s) => ({ ...s, [b.compId]: "error" }));
        }
      }
    };
    // limited concurrency
    Promise.all([worker(), worker(), worker()]).catch(() => {});
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [evId]);

  const legs = Object.values(results).filter((r): r is Leg => r !== "error");
  const boutsRead = legs.length;
  const strongPicks = legs.filter((l) => l.pick.tier === "STRONG").length;
  const finishes = legs.filter((l) => l.method.top !== "Decision").length;

  const modalBouts = allBouts.map((b) => ({ compId: b.compId, a: b.aName, b: b.bName, type: b.type }));

  return (
    <div className="pb">
      {/* forecast hero */}
      <section className="fc-hero">
        <div className="in">
          <span className="kick"><span className="dot" /> Edge Engine · current card forecast</span>
          <h1>{eventName}</h1>
          <div className="meta">{eventMeta}{eventMeta && " — "}<b>market-anchored</b> when lines are posted</div>
          <div className="stats">
            <div className="stat"><div className="n">{boutsRead}<span style={{ color: "var(--faint)", fontSize: 20 }}>/{total}</span></div><div className="l">Bouts read</div></div>
            <div className="stat"><div className="n" style={{ color: "var(--gold)" }}>{strongPicks}</div><div className="l">Strong picks</div></div>
            <div className="stat"><div className="n">{finishes}</div><div className="l">Finishes projected</div></div>
            <div className="stat"><div className="n" style={{ color: "var(--muted)" }}>85%</div><div className="l">Confidence cap</div></div>
          </div>
          <div className="cta">
            <CardReasoningButton evId={evId} bouts={modalBouts} label="Run full card" className="btn primary" />
            <Link className="btn ghost" href="/events">Full schedule</Link>
          </div>
        </div>
      </section>

      {segments.map((seg) => (
        <div key={seg.name}>
          <div className="section-head">
            <h2>{seg.name}</h2>
            <span className="rule" />
          </div>
          <div className="board">
            {seg.bouts.map((b, i) => {
              const r = results[b.compId];
              const leg = r && r !== "error" ? r : null;
              const favIsA = leg ? leg.pick.winnerId === leg.fighters.a.id : true;
              const favPct = leg ? pct(leg.pick.winProbDisplay) : 50;
              const pctA = leg ? (favIsA ? favPct : 100 - favPct) : 50;
              const pctB = 100 - pctA;
              const shown = revealed.has(b.compId);
              const tierCls = leg ? (leg.pick.winProb < 0.55 ? "tier-flip" : `tier-${tierWord(leg.pick.tier).toLowerCase()}`) : "";
              const tierLabel = leg ? (leg.pick.winProb < 0.55 ? `${leg.pick.winnerName.split(" ").pop()} · Coin-flip` : `${leg.pick.winnerName.split(" ").pop()} · ${tierWord(leg.pick.tier)}`) : "";
              const isVet = leg?.round.mode === "veteran" && typeof leg.round.modalRound === "number";
              const anchorTxt = leg?.market
                ? `Vegas ${pct(favIsA ? leg.market.impliedA : 1 - leg.market.impliedA)}% · nudge ${leg.market.nudgePts >= 0 ? "+" : ""}${Math.round(leg.market.nudgePts)}`
                : leg
                  ? "no line posted"
                  : "";
              return (
                <Link key={b.compId} href={`/event/${evId}/${b.compId}`} className="bout" style={{ animationDelay: `${Math.min(i * 0.06, 0.4)}s` }}>
                  <div className="bout-top">
                    <div className="bout-slot">
                      {b.slot && <span className="tg main">{b.slot}</span>}
                      {b.wcAbbr && <span className="tg">{b.wcAbbr}</span>}
                      <span className="tg">{b.roundsLabel}</span>
                    </div>
                    <span className="bout-run">
                      {leg ? "View" : "Run"}
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5l7 7-7 7" /></svg>
                    </span>
                  </div>
                  <div className="bout-names">{b.aLast}<span className="vs">vs</span>{b.bLast}</div>
                  <div className="ptug">
                    <div className="end"><div className={`nm${favIsA && leg ? " fav" : ""}`}>{b.aLast}</div><div className={`p${favIsA && leg ? " fav" : ""}`}>{leg ? pctA : "·"}</div></div>
                    <div className={`track${leg && !favIsA ? " rightfav" : ""}`}>
                      <div className="fill" style={{ width: `${shown ? favPct : 0}%` }} />
                      <div className="mid" />
                      {leg && <div className="knot" style={favIsA ? { left: `${shown ? favPct : 50}%` } : { right: `${shown ? favPct : 50}%` }} />}
                    </div>
                    <div className="end r"><div className={`nm${!favIsA && leg ? " fav" : ""}`}>{b.bLast}</div><div className={`p${!favIsA && leg ? " fav" : ""}`}>{leg ? pctB : "·"}</div></div>
                  </div>
                  <div className="bout-read">
                    {leg ? (
                      <>
                        <span className={`chip ${tierCls}`}>{tierLabel}</span>
                        <span className="chip method">{methodChip(leg.method.top)}</span>
                        <span className="chip round">{roundChip(leg)}</span>
                        {isVet && <span className="chip vet">VET</span>}
                        <span className="anchor">{anchorTxt}</span>
                      </>
                    ) : r === "error" ? (
                      <span className="analyzing">Couldn&apos;t run this bout.</span>
                    ) : (
                      <span className="analyzing">Analyzing…</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
