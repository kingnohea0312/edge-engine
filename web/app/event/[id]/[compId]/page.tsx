/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import type { Metadata } from "next";
import { getEventById, getOddsRaw, getResult } from "@/lib/data/espn";
import { getProfile } from "@/lib/data/profile";
import { parseMarket, amToProb, fmtMl } from "@/lib/engine/market";
import { predict, tierOf } from "@/lib/engine/predict";
import { methodText } from "@/lib/data/espn";
import { pct } from "@/lib/format";
import FighterImg from "@/components/FighterImg";
import { ReasoningButton } from "@/components/ReasoningModal";

export const dynamic = "force-dynamic";

async function load(evId: string, compId: string) {
  const res = await getEventById(evId);
  if (!res) return null;
  const comp = (res.ev.competitions || []).find((c: any) => String(c.id) === String(compId));
  if (!comp) return null;
  const [c1, c2] = comp.competitors || [];
  const id1 = String(c1.id),
    id2 = String(c2.id);
  const rds = (comp.format && comp.format.regulation && comp.format.regulation.periods) || 3;
  const st = comp.status || {};
  const fin = !!(st.type && st.type.completed);
  const [A, B, oddsRaw] = await Promise.all([
    getProfile(id1),
    getProfile(id2),
    getOddsRaw(evId, compId).catch(() => null),
  ]);
  const market = oddsRaw ? parseMarket(oddsRaw, id1, id2) : null;
  const P = predict(A, B, market, rds);
  let result: any = st;
  if (fin && !st.result) {
    try {
      result = (await getResult(evId, compId)) || st;
    } catch {}
  }
  const wcType = (comp.type && (comp.type.text || comp.type.abbreviation)) || "";
  return { A, B, P, market, rds, fin, result, wcType, id1, id2, winner: c1.winner ? A : c2.winner ? B : null };
}

export async function generateMetadata({ params }: { params: Promise<{ id: string; compId: string }> }): Promise<Metadata> {
  const { id, compId } = await params;
  try {
    const d = await load(id, compId);
    if (d) {
      const t = `${d.A.bio.name} vs ${d.B.bio.name}`;
      return { title: t, description: `Edge Engine prediction, tale of the tape, and round call for ${t}.`, openGraph: { title: t } };
    }
  } catch {}
  return { title: "Matchup" };
}

function Cmp({ label, a, b, av, bv }: { label: string; a: string; b: string; av: number; bv: number }) {
  const t = av + bv || 1;
  const aAdv = av > bv,
    bAdv = bv > av;
  return (
    <div className="cmp">
      <div className="lbl">{label}</div>
      <div className="vals tnum">
        <span className={aAdv ? "adv" : ""}>{a}</span>
        <span className={bAdv ? "adv" : ""}>{b}</span>
      </div>
      <div className="dbar">
        <span className="a" style={{ width: `${(av / t) * 100}%` }} />
        <span className="b" />
      </div>
    </div>
  );
}

const reach = (s: string) => parseFloat(String(s).replace(/[^\d.]/g, "")) || 0;
const num = (v: number, d = 1) => Number(v || 0).toFixed(d);

export default async function Matchup({ params }: { params: Promise<{ id: string; compId: string }> }) {
  const { id, compId } = await params;
  let d: Awaited<ReturnType<typeof load>> = null;
  try {
    d = await load(id, compId);
  } catch {}
  if (!d) {
    return (
      <main>
        <div className="wrap wrap-narrow err card">Bout not found or live data unavailable.</div>
      </main>
    );
  }
  const { A, B, P, market, rds, fin, result, wcType, id1, id2, winner } = d;
  const [tierTxt, tierCls] = tierOf(P.favP, P.anchored);
  const pctA = pct(P.pA);
  const dispFav = Math.min(P.favP, 0.85);
  const capped = P.favP > 0.855;
  const rp = P.round;

  // round distribution cells
  const cells: { lab: string; p: number; peak: boolean; kind: string }[] = [];
  for (let r = 1; r <= rds; r++)
    cells.push({ lab: "R" + r, p: rp.dist[r] || 0, peak: rp.mode === "veteran" && rp.modal === r, kind: "round" });
  cells.push({ lab: "DIST", p: rp.dist.distance || 0, peak: rp.mode === "veteran" && rp.modal === "distance", kind: "dist" });

  const careerRow = (label: string, av: number, bv: number, fmt: (v: number) => string) => (
    <Cmp key={label} label={label} a={fmt(av)} b={fmt(bv)} av={av} bv={bv} />
  );

  return (
    <main>
      <div className="wrap wrap-narrow">
        <div className="mu">
          {/* spine */}
          <div className="mu-spine full">
            <div className="col">
              <FighterImg id={id1} variant="stance" side="left" alt={A.bio.name} />
            </div>
            <div className="vs">VS</div>
            <div className="col">
              <FighterImg id={id2} variant="stance" side="right" alt={B.bio.name} />
            </div>
            <div className="mu-names" style={{ gridColumn: "1 / -1" }}>
              <Link href={`/fighter/${id1}`} className="n">
                <div className="nm">{A.bio.name}</div>
                <div className="rc tnum">{A.bio.record} · {A.bio.country}</div>
              </Link>
              <Link href={`/fighter/${id2}`} className="n">
                <div className="nm">{B.bio.name}</div>
                <div className="rc tnum">{B.bio.record} · {B.bio.country}</div>
              </Link>
            </div>
          </div>

          {fin && (
            <div className="card full" style={{ padding: 16, textAlign: "center", borderColor: "#1d3a28" }}>
              <div className="kicker" style={{ color: "var(--up)" }}>Final result</div>
              <div className="display" style={{ fontSize: 24, textTransform: "uppercase", marginTop: 6 }}>
                {winner ? `${winner.bio.name} wins` : "Draw / No Contest"}
              </div>
              <div style={{ color: "var(--muted)", marginTop: 3 }}>
                {methodText(result.result)} · Round {result.period || "-"} ({result.displayClock || ""})
              </div>
            </div>
          )}

          {/* prediction panel */}
          <div className="pred full">
            <div className="ph">
              <span className="dot" />
              <b>Edge Engine</b>
              <span>{P.anchored ? "market-anchored" : "stats-only · no line posted"}</span>
            </div>
            <div className="pick">
              <div className="who">{P.favName}</div>
              <div className={`tier ${tierCls}`}>
                {tierTxt} · {pct(dispFav)}%{capped ? "+" : ""}
              </div>
              {capped && (
                <div style={{ fontSize: 11, color: "var(--faint)", marginTop: 6 }}>
                  display capped at 85% for humility — model reads {pct(P.favP)}%
                </div>
              )}
              <div style={{ marginTop: 12 }}>
                <ReasoningButton evId={id} compId={compId} label="Open full reasoning" />
              </div>
            </div>
            <div className="probbar">
              <span className="pa tnum" style={{ width: `${Math.max(8, Math.min(92, pctA))}%` }}>{pctA}%</span>
              <span className="pb tnum">{100 - pctA}%</span>
            </div>
            <div className="probnames">
              <span>{A.bio.last}</span>
              <span>{B.bio.last}</span>
            </div>

            {P.anchored && market && (
              <div className="anchor-line">
                <div className="cell">
                  <div className="k">Market line</div>
                  <div className="v gold tnum">{fmtMl(market.mlA)} / {fmtMl(market.mlB)}</div>
                </div>
                <div className="cell">
                  <div className="k">Implied (de-vig)</div>
                  <div className="v tnum">{pct(market.pA)}% {A.bio.last}</div>
                </div>
                <div className="cell">
                  <div className="k">Model nudge</div>
                  <div className={`v tnum ${P.nudge >= 0 ? "up" : "down"}`}>
                    {P.nudge >= 0 ? "+" : ""}{(P.nudge * 100).toFixed(1)} pts
                  </div>
                </div>
              </div>
            )}

            <table className="mtx">
              <tbody>
                <tr>
                  <th />
                  <th>{A.bio.last}</th>
                  <th>{B.bio.last}</th>
                </tr>
                {(["KO/TKO", "Submission", "Decision"] as const).map((how, i) => {
                  const key = (["ko", "sub", "dec"] as const)[i];
                  const av = P.matrix.a[key],
                    bv = P.matrix.b[key];
                  return (
                    <tr key={how}>
                      <td>{how}</td>
                      <td className={P.top.who === A.bio.last && P.top.how === how ? "hot tnum" : "tnum"}>{pct(av)}%</td>
                      <td className={P.top.who === B.bio.last && P.top.how === how ? "hot tnum" : "tnum"}>{pct(bv)}%</td>
                    </tr>
                  );
                })}
                <tr>
                  <td>Win prob.</td>
                  <td className="tnum">{pctA}%</td>
                  <td className="tnum">{100 - pctA}%</td>
                </tr>
              </tbody>
            </table>

            {/* round projection */}
            <div className="roundcall">
              <div className="rh">
                <span className="lbl">Round projection</span>
                <span className={`badge ${rp.mode === "veteran" ? "" : "std"}`}>
                  {rp.mode === "veteran" ? "Veteran read" : "Standard read"}
                </span>
              </div>
              <div className="rr display">
                {rp.mode === "veteran"
                  ? rp.modal === "distance"
                    ? <>Goes the distance <span className="p tnum">{pct(rp.modalP || 0)}%</span></>
                    : <>Finish — Round {rp.modal} <span className="p tnum">{pct(rp.modalP || 0)}%</span></>
                  : rp.finishLikely
                    ? rp.lean === "early" ? "Finish likely — early" : "Finish likely — late"
                    : "Likely goes the distance"}
              </div>
              <div className="rbar">
                {cells.map((c) => (
                  <div
                    key={c.lab}
                    className={`seg ${c.peak ? "peak" : c.kind === "dist" ? "dist" : "dim"}`}
                    style={{ flex: Math.max(c.p * 100, 3) }}
                  >
                    {c.p >= 0.13 ? pct(c.p) + "%" : ""}
                  </div>
                ))}
              </div>
              <div className="rlabels">
                {cells.map((c) => (
                  <span key={c.lab} style={{ flex: Math.max(c.p * 100, 3) }}>{c.lab}</span>
                ))}
              </div>
              <div className="reason">
                {rp.mode === "veteran"
                  ? rp.reason
                  : `No veteran finish-timing sample (${rp.gateReason}). The engine holds back an exact round on purpose — that restraint is the point.`}
              </div>
            </div>

            <div className="drivers">
              <div className="dr">
                <span className="s">★</span>
                <span>
                  Most likely path: <b>{P.top.who} by {P.top.how}</b> ({pct(P.top.v)}%) · {pct(P.finishP)}% chance of a finish
                </span>
              </div>
              {market && market.openA != null && Math.abs(amToProb(market.mlA) - amToProb(market.openA)) > 0.02 && (
                <div className="dr">
                  <span className="s" style={{ color: "var(--gold)" }}>↔</span>
                  <span>
                    <b>Line movement</b> — {A.bio.last} opened {fmtMl(market.openA)}, now {fmtMl(market.mlA)} (
                    {amToProb(market.mlA) > amToProb(market.openA) ? "market moving toward" : "moving away from"} {A.bio.last}).
                  </span>
                </div>
              )}
              {P.factors.map((x) => (
                <div className="dr" key={x.label}>
                  <span className={`s ${x.w > 0 ? "plus" : "minus"}`}>{x.w > 0 ? "▲" : "▼"}</span>
                  <span>
                    <b>{x.label}</b> — {x.detail}{" "}
                    <i style={{ color: "var(--faint)" }}>(favors {x.w > 0 ? A.bio.last : B.bio.last})</i>
                  </span>
                </div>
              ))}
              {P.lowData && (
                <div className="dr">
                  <span className="s">◐</span>
                  <span>
                    <b>Low data.</b> Thin UFC sample on at least one side — the model regresses toward the market line. Treat with caution.
                  </span>
                </div>
              )}
            </div>
            <div className="note">
              {P.anchored
                ? "Anchored to the de-vigged market line with bounded statistical nudges — the Edge Engine method, minus film study and fight-week intel."
                : "No betting line posted yet for this bout — a stats-only read with wider uncertainty (tier capped accordingly)."}{" "}
              Probabilities, not locks: a single punch can end any fight. If you bet, bet only what you can afford to lose.
            </div>
          </div>

          {/* tale of the tape */}
          <div className="card" style={{ padding: "6px 18px" }}>
            <div className="section-head" style={{ marginTop: 14 }}>
              <h2 style={{ fontSize: 18 }}>Tale of the tape</h2>
              <span className="rule" />
            </div>
            <Cmp label="Age" a={String(A.bio.age ?? "—")} b={String(B.bio.age ?? "—")} av={-(A.bio.age || 0)} bv={-(B.bio.age || 0)} />
            <Cmp label="Height" a={A.bio.height} b={B.bio.height} av={parseFloat(A.bio.height) || 0} bv={parseFloat(B.bio.height) || 0} />
            <Cmp label="Reach" a={A.bio.reach} b={B.bio.reach} av={reach(A.bio.reach)} bv={reach(B.bio.reach)} />
            <Cmp label="Stance" a={A.bio.stance} b={B.bio.stance} av={1} bv={1} />
            <Cmp label="Gym" a={A.bio.gym} b={B.bio.gym} av={1} bv={1} />
          </div>

          {/* career stats */}
          <div className="card" style={{ padding: "6px 18px" }}>
            <div className="section-head" style={{ marginTop: 14 }}>
              <h2 style={{ fontSize: 18 }}>UFC career stats</h2>
              <span className="rule" />
              <span className="meta">{A.agg.nStats}+{B.agg.nStats} tracked</span>
            </div>
            {careerRow("Sig. strikes / min", A.agg.slpm, B.agg.slpm, (v) => num(v))}
            {careerRow("Striking accuracy", A.agg.acc, B.agg.acc, (v) => pct(v) + "%")}
            {careerRow("Takedowns / 15", A.agg.td15, B.agg.td15, (v) => num(v))}
            {careerRow("Control time", A.agg.ctrlPct, B.agg.ctrlPct, (v) => pct(v) + "%")}
            {careerRow("Knockdowns / 15", A.agg.kd15, B.agg.kd15, (v) => num(v, 2))}
            {careerRow("Finish rate", A.agg.finishRate, B.agg.finishRate, (v) => pct(v) + "%")}
          </div>
        </div>
      </div>
    </main>
  );
}
