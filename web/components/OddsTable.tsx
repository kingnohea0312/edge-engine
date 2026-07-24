"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Leg } from "@/lib/engine/reasoning";

export interface ORow {
  compId: string;
  aLast: string;
  aRec: string;
  bLast: string;
  bRec: string;
  wc: string;
  rounds: number;
  mlA: string | null;
  mlB: string | null;
  favA: boolean;
  mv: "up" | "down" | null;
}

const ArrowUp = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6 15l6-6 6 6" /></svg>
);
const ArrowDn = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
);

const pct = (v: number) => Math.round(v * 100);
const methodShort = (t: string) => (t === "KO/TKO" ? "KO/TKO" : t === "Submission" ? "Sub" : "Decision");
function roundShort(l: Leg): string {
  const r = l.round;
  if (r.mode === "veteran" && typeof r.modalRound === "number") return "R" + r.modalRound;
  if (r.call === "Distance") return "Distance";
  if (r.call === "Finish-early") return "Early";
  if (r.call === "Finish-late") return "Late";
  return "";
}
const tierCls = (l: Leg) =>
  l.pick.winProb < 0.55 ? "flip" : l.pick.tier === "STRONG" ? "strong" : l.pick.tier === "SOLID" ? "solid" : "lean";

export default function OddsTable({ evId, rows }: { evId: string; rows: ORow[] }) {
  const [legs, setLegs] = useState<Record<string, Leg> | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch(`/api/predict/${evId}`);
        if (!r.ok) throw new Error();
        const d = await r.json();
        if (cancelled) return;
        const map: Record<string, Leg> = {};
        for (const l of (d.legs || []) as Leg[]) map[l.bout.id] = l;
        setLegs(map);
      } catch {
        if (!cancelled) setLegs({});
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [evId]);

  return (
    <div className="oddscard">
      <table className="odds">
        <thead>
          <tr>
            <th>Bout</th>
            <th>Class</th>
            <th className="r">Moneyline · Engine pick</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((f) => {
            const leg = legs?.[f.compId];
            return (
              <tr key={f.compId}>
                <td>
                  <div className="bout">
                    <Link href={`/event/${evId}/${f.compId}`} className="f">
                      {f.aLast}{f.aRec && <span className="rec">{f.aRec}</span>}
                    </Link>
                    <div className="vs">vs</div>
                    <Link href={`/event/${evId}/${f.compId}`} className="f">
                      {f.bLast}{f.bRec && <span className="rec">{f.bRec}</span>}
                    </Link>
                  </div>
                </td>
                <td className="wc">{f.wc}<span className="rd">{f.rounds} Rounds</span></td>
                <td className="ml-cell">
                  {f.mlA && f.mlB ? (
                    <div className="ml-line">
                      <span className={`ml${f.favA ? " fav" : ""}`}><span className="who">{f.aLast}</span><span className="v">{f.mlA}</span></span>
                      {f.mv && <span className={`mv ${f.mv === "up" ? "up" : "dn"}`}>{f.mv === "up" ? <ArrowUp /> : <ArrowDn />}</span>}
                      <span className={`ml${!f.favA ? " fav" : ""}`}><span className="who">{f.bLast}</span><span className="v">{f.mlB}</span></span>
                    </div>
                  ) : (
                    <div className="ml-line"><span className="pending">Pending — line not posted</span></div>
                  )}

                  {/* engine's read on this bout */}
                  {legs === null ? (
                    <div className="pick-note loading">Engine reading…</div>
                  ) : leg ? (
                    <div className="pick-note">
                      <span className="lbl">Engine</span>
                      <b className={tierCls(leg)}>{leg.pick.winnerName.split(" ").pop()}</b>
                      <span className="p">{pct(leg.pick.winProbDisplay)}%</span>
                      <span className="sep">·</span>
                      <span className="m">{methodShort(leg.method.top)}</span>
                      {roundShort(leg) && <><span className="sep">·</span><span className="m">{roundShort(leg)}</span></>}
                    </div>
                  ) : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
