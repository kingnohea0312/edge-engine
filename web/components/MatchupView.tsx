"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/* ---- serializable data shape passed from the server page ---- */
export interface DriverSeg {
  text: string;
  hl?: boolean;
  num?: boolean;
}
export interface MatchupData {
  eventId: string;
  evName: string;
  wc: string;
  roundsLabel: string;
  dateText: string;
  a: { id: string; first: string; last: string; record: string; sub: string; img: string };
  b: { id: string; first: string; last: string; record: string; sub: string; img: string };
  favIsA: boolean;
  pctA: number;
  pctB: number;
  favName: string;
  tierText: string;
  tierClass: "solid" | "strong" | "lean";
  anchored: boolean;
  modelPct: number;
  vegasPct: number | null;
  nudge: number | null;
  favMl: string | null;
  method: {
    rows: { who: string; ko: number; sub: number; dec: number; peak: "ko" | "sub" | "dec" | null; hot: string[] }[];
    distancePct: number;
  };
  round: {
    mode: "veteran" | "standard";
    headPre: string;
    headEm: string;
    cells: { lab: string; pct: number; height: number; kind: "round" | "dist" | "empty" }[];
    noteVet: boolean;
    noteText: string;
  };
  drivers: { dir: "up" | "dn"; segs: DriverSeg[]; sub: string; fav: string }[];
  finishPct: number;
  grounding: { sweptA: number; sweptB: number; asOf: string };
  fin: boolean;
  resultText: string | null;
}

const ArrowUp = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 15l6-6 6 6" />
  </svg>
);
const ArrowDn = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9l6 6 6-6" />
  </svg>
);
const Silhouette = () => (
  <svg viewBox="0 0 100 120" fill="currentColor" style={{ width: "64%", opacity: 0.5, marginBottom: -2, color: "var(--faint)" }}>
    <circle cx="50" cy="38" r="20" />
    <path d="M12 120c3-30 18-44 38-44s35 14 38 44z" />
  </svg>
);

function Slot({ id, img, corner }: { id: string; img: string; corner: string }) {
  const [ok, setOk] = useState(true);
  return (
    <div className="tug-slot">
      {!ok && <span style={{ position: "absolute", top: 8, left: 0, right: 0, textAlign: "center", fontSize: 8, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--faint)", fontWeight: 600 }}>{corner}</span>}
      <Silhouette />
      {img && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={img} alt="" onError={() => setOk(false)} style={{ position: "absolute", inset: 0, display: ok ? "block" : "none" }} />
      )}
    </div>
  );
}

export default function MatchupView({ d }: { d: MatchupData }) {
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState(d.round.mode);
  const fillRef = useRef<HTMLDivElement>(null);
  useEffect(() => setMounted(true), []);

  const leftFav = d.favIsA;
  const knot = d.pctB; // knot/fill position from the left = fighter B's win %

  return (
    <main>
      <div className="wrap mu2">
        {/* breadcrumb */}
        <div className="ctx">
          <Link href={`/event/${d.eventId}`} className="back">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 5l-7 7 7 7" />
            </svg>
            {d.evName}
          </Link>
          {d.wc && <span className="tag">{d.wc}</span>}
          <span className="tag">{d.roundsLabel}</span>
          {d.dateText && <span className="tnum" style={{ color: "var(--muted)" }}>{d.dateText}</span>}
        </div>

        {d.fin && d.resultText && (
          <div className="panel" style={{ marginBottom: 16, padding: "14px 18px", borderColor: "rgba(53,194,129,.28)" }}>
            <span style={{ fontFamily: "var(--font-display),sans-serif", fontSize: 12, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--up)" }}>Final · </span>
            <span style={{ color: "var(--ink)", fontWeight: 600 }}>{d.resultText}</span>
          </div>
        )}

        {/* ===== TUG-OF-WAR HERO ===== */}
        <section className="tug" aria-label="Matchup and win probability">
          <div className="tug-top">
            <div className="tug-side a">
              <Slot id={d.a.id} img={d.a.img} corner="Red" />
              <div className="tug-name">
                <div className="cor">Red Corner</div>
                <div className="nm">{d.a.first}<br />{d.a.last}</div>
                <div className="rec tnum">{d.a.record} <span className="wc">{d.a.sub}</span></div>
              </div>
            </div>
            <div className="tug-vs">
              <div className="vs">V<b>S</b></div>
              <div className="rd">{d.roundsLabel}</div>
            </div>
            <div className="tug-side b">
              <Slot id={d.b.id} img={d.b.img} corner="Blue" />
              <div className="tug-name">
                <div className="cor">Blue Corner</div>
                <div className="nm">{d.b.first}<br />{d.b.last}</div>
                <div className="rec tnum">{d.b.record} <span className="wc">{d.b.sub}</span></div>
              </div>
            </div>
          </div>

          <div className="tug-bar-wrap">
            <div className="tug-scale">
              <div>
                <span className={leftFav ? "win" : "pct"}>{d.pctA}</span>
                <span className="lbl">{d.a.last}{leftFav ? " · Favored" : ""}</span>
              </div>
              <div style={{ textAlign: "right" }}>
                <span className={leftFav ? "pct" : "win"}>{d.pctB}</span>
                <span className="lbl">{d.b.last}{leftFav ? "" : " · Favored"}</span>
              </div>
            </div>
            <div className="tug-track">
              <div className="fill" ref={fillRef} style={{ width: `${mounted ? knot : 50}%` }} />
              <div className="tug-mid" />
              <div className="knot" style={{ left: `${mounted ? knot : 50}%` }} />
            </div>
            <div className="tug-verdict">
              <span className={`tier ${d.tierClass}`}>Pick · {d.favName} · {d.tierText}</span>
              <span className="say">
                Model reads <b>{d.modelPct}%</b>
                {d.anchored && d.vegasPct != null && (
                  <> · Vegas (de-vigged) <b>{d.vegasPct}%</b> · nudge <b style={{ color: (d.nudge || 0) >= 0 ? "var(--up)" : "var(--down)" }}>{(d.nudge || 0) >= 0 ? "+" : ""}{d.nudge}</b></>
                )}
              </span>
              <span className="cap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
                </svg>
                Capped at 85% by design
              </span>
            </div>
          </div>
        </section>

        {/* ===== MARKET + METHOD ===== */}
        <div className="grid2">
          <section className="panel">
            <div className="panel-h"><span className="k">Market anchor</span></div>
            {d.anchored && d.vegasPct != null ? (
              <div className="market">
                <div className="m"><div className="k">Vegas (de-vigged)</div><div className="v">{d.vegasPct}%</div><div className="s">{d.favName} {d.favMl}</div></div>
                <div className="m"><div className="k">Model reads</div><div className="v">{d.modelPct}%</div><div className="s">Market-anchored</div></div>
                <div className="m edge"><div className="k">Engine nudge</div><div className="v">{(d.nudge || 0) >= 0 ? "▲ +" : "▼ "}{d.nudge}</div><div className="s">points vs market</div></div>
              </div>
            ) : (
              <div style={{ padding: "16px 18px", fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>
                No line posted for this bout — a stats-only read, so the confidence tier is capped.
              </div>
            )}
          </section>
          <section className="panel">
            <div className="panel-h"><span className="k">How it likely ends</span></div>
            <div className="matrix">
              <table className="mtx">
                <thead>
                  <tr><th style={{ textAlign: "left" }} /><th>KO / TKO</th><th>Sub</th><th>Dec</th></tr>
                </thead>
                <tbody>
                  {d.method.rows.map((r) => (
                    <tr key={r.who}>
                      <th>{r.who}</th>
                      {(["ko", "sub", "dec"] as const).map((k) => (
                        <td key={k} className={r.peak === k ? "peak" : r.hot.includes(k) ? "hot" : ""}>
                          {r[k]}%
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mtx-foot"><span>Goes the distance</span><b>{d.method.distancePct}%</b></div>
            </div>
          </section>
        </div>

        {/* ===== ROUND ===== */}
        <section className="panel stack">
          <div className="panel-h"><span className="k">Round projection</span></div>
          <div className="round">
            <div className="round-head">
              <div className="call">{d.round.headPre}<span className="em">{d.round.headEm}</span></div>
              <div className="toggle" role="group" aria-label="Read model">
                <button className={mode === "veteran" ? "on" : ""} onClick={() => setMode("veteran")}>Veteran read</button>
                <button className={mode === "standard" ? "on" : ""} onClick={() => setMode("standard")}>Standard read</button>
              </div>
            </div>
            <div className="histo">
              {d.round.cells.map((c, i) => (
                <div key={i} className={`hbar ${c.kind === "dist" ? "dist" : c.kind === "empty" ? "empty" : c.pct === Math.max(...d.round.cells.map((x) => x.pct)) ? "peak" : ""}`}>
                  <div className="fill" style={{ height: `${mounted ? c.height : 0}%` }}>
                    <span className="v">{c.pct > 0 ? c.pct + "%" : "—"}</span>
                  </div>
                  <span className="lb">{c.lab}</span>
                </div>
              ))}
            </div>
            <div className="round-note">
              {d.round.noteVet && <span className="vet">Veteran read</span>} {d.round.noteText}
            </div>
          </div>
        </section>

        {/* ===== DRIVERS ===== */}
        <section className="panel stack">
          <div className="panel-h"><span className="k">Why — the drivers</span></div>
          <div className="drivers">
            {d.drivers.map((dr, i) => (
              <div className="dr" key={i}>
                <span className={`dir ${dr.dir}`}>{dr.dir === "up" ? <ArrowUp /> : <ArrowDn />}</span>
                <div className="body">
                  <div className="t">
                    {dr.segs.map((s, j) => (
                      <span key={j} className={`${s.hl ? "hl" : ""} ${s.num ? "num" : ""}`.trim()}>{s.text}</span>
                    ))}
                  </div>
                  {dr.sub && <div className="sub">{dr.sub}</div>}
                </div>
                {dr.fav && <div className="fav">favors <b>{dr.fav}</b></div>}
              </div>
            ))}
          </div>
        </section>

        <div className="ground">
          <span className="feed"><span className="d" /> Swept {d.grounding.sweptA} / {d.grounding.sweptB} fights</span>
          <span className="feed">Feeds: ESPN scoreboard · ESPN core · ESPN BET odds</span>
          <span className="stamp">As of {d.grounding.asOf}</span>
        </div>
      </div>
    </main>
  );
}
