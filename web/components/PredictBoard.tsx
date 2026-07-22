"use client";
import Link from "next/link";
import { useState } from "react";

interface Bout {
  compId: string;
  a: string;
  b: string;
  type: string;
}
interface Res {
  favName: string;
  favP: number;
  capped: boolean;
  tierTxt: string;
  tierCls: string;
  topWho: string;
  topHow: string;
  topV: number;
  roundLabel: string;
  veteran: boolean;
  anchored: boolean;
}

const pct = (v: number) => Math.round(v * 100);

export default function PredictBoard({ evId, bouts }: { evId: string; bouts: Bout[] }) {
  const [res, setRes] = useState<Record<string, Res | "loading" | "error">>({});
  const [allRunning, setAllRunning] = useState(false);

  const run = async (compId: string) => {
    setRes((r) => ({ ...r, [compId]: "loading" }));
    try {
      const r = await fetch(`/api/predict/${evId}/${compId}`);
      if (!r.ok) throw new Error();
      const d = await r.json();
      const P = d.prediction;
      const rp = P.round;
      const label =
        rp.mode === "veteran"
          ? rp.modal === "distance"
            ? "Distance"
            : "R" + rp.modal
          : rp.finishLikely
            ? rp.lean === "early"
              ? "Finish — early"
              : "Finish — late"
            : "Distance";
      setRes((s) => ({
        ...s,
        [compId]: {
          favName: P.favName,
          favP: P.favP,
          capped: P.favP > 0.855,
          tierTxt: d.tier.text,
          tierCls: d.tier.cls,
          topWho: P.top.who,
          topHow: P.top.how,
          topV: P.top.v,
          roundLabel: label,
          veteran: rp.mode === "veteran",
          anchored: P.anchored,
        },
      }));
    } catch {
      setRes((s) => ({ ...s, [compId]: "error" }));
    }
  };

  const runAll = async () => {
    setAllRunning(true);
    for (const b of bouts) await run(b.compId);
    setAllRunning(false);
  };

  return (
    <>
      <button className="btn primary" onClick={runAll} disabled={allRunning} style={{ marginBottom: 16 }}>
        {allRunning ? "Running…" : "Run full card"}
      </button>
      <div className="fights">
        {bouts.map((b) => {
          const r = res[b.compId];
          return (
            <div key={b.compId} className="card" style={{ padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <Link href={`/event/${evId}/${b.compId}`} style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ fontWeight: 700 }}>
                    {b.a} <span style={{ color: "var(--red)" }}>vs</span> {b.b}
                  </div>
                  <div style={{ color: "var(--faint)", fontSize: 11, textTransform: "uppercase", letterSpacing: ".06em", marginTop: 2 }}>
                    {b.type}
                  </div>
                </Link>
                <button className="btn ghost" onClick={() => run(b.compId)} disabled={r === "loading"}>
                  {r === "loading" ? "…" : r && r !== "error" ? "Re-run" : "Run"}
                </button>
              </div>
              {r && r !== "loading" && r !== "error" && (
                <div className="reveal" style={{ marginTop: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <b style={{ fontSize: 15 }}>{r.favName}</b>
                    <span className="tnum" style={{ fontWeight: 800, color: "var(--red-soft)" }}>
                      {pct(Math.min(r.favP, 0.85))}%{r.capped ? "+" : ""}
                    </span>
                    <span style={{ fontSize: 10.5, letterSpacing: ".08em", color: "var(--faint)", textTransform: "uppercase" }}>
                      {r.tierTxt} · {r.anchored ? "market-anchored" : "stats-only"}
                    </span>
                  </div>
                  <div style={{ color: "var(--muted)", fontSize: 12.5, marginTop: 5 }}>
                    ★ {r.topWho} by {r.topHow} ({pct(r.topV)}%) · Round: <b style={{ color: "var(--ink)" }}>{r.roundLabel}</b>
                    {r.veteran && (
                      <span style={{ marginLeft: 6, fontSize: 8.5, fontWeight: 800, letterSpacing: ".1em", padding: "1px 5px", borderRadius: 4, background: "#2a2110", color: "var(--gold)" }}>
                        VET
                      </span>
                    )}
                  </div>
                  <div className="bar" style={{ marginTop: 8 }}>
                    <i style={{ width: `${pct(r.favP)}%` }} />
                  </div>
                </div>
              )}
              {r === "error" && <div className="muted" style={{ marginTop: 10 }}>Couldn&apos;t run this bout. Try again.</div>}
            </div>
          );
        })}
      </div>
    </>
  );
}
