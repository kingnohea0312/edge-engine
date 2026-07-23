/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Metadata } from "next";
import { getEventById, getOddsRaw, getResult, methodText } from "@/lib/data/espn";
import { getProfile } from "@/lib/data/profile";
import { parseMarket, fmtMl } from "@/lib/engine/market";
import { predict, tierOf } from "@/lib/engine/predict";
import { pct } from "@/lib/format";
import MatchupView, { type MatchupData, type DriverSeg } from "@/components/MatchupView";

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
  return {
    A, B, P, market, rds, fin, result, wcType, id1, id2,
    winner: c1.winner ? A : c2.winner ? B : null,
    evName: res.ev.name || "UFC Event",
    evDate: res.ev.date || res.dateStr || null,
  };
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

const methodKey = (how: string): "ko" | "sub" | "dec" => (how === "KO/TKO" ? "ko" : how === "Submission" ? "sub" : "dec");
const firstName = (name: string, last: string) => {
  const i = name.lastIndexOf(last);
  return i > 0 ? name.slice(0, i).trim() : name;
};

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
  const { A, B, P, market, rds, fin, result, wcType, id1, id2, winner, evName, evDate } = d;

  const favIsA = P.pA >= 0.5;
  const favLast = favIsA ? A.bio.last : B.bio.last;
  const dispFav = Math.min(P.favP, 0.85);
  const favPct = pct(dispFav);
  const pctA = favIsA ? favPct : 100 - favPct;
  const pctB = 100 - pctA;

  const [tierText] = tierOf(P.favP, P.anchored);
  const tierClass: "solid" | "strong" | "lean" = /strong/i.test(tierText) ? "strong" : /lean|coin|flip/i.test(tierText) ? "lean" : "solid";

  const vegasPct = P.anchored && market ? pct(favIsA ? market.pA : 1 - market.pA) : null;
  const nudge = P.anchored && market ? Math.round(P.nudge * 100) : null;
  const favMl = P.anchored && market ? fmtMl(favIsA ? market.mlA : market.mlB) : null;

  // method matrix rows (favored first)
  const topKey = methodKey(P.top.how);
  const mkRow = (last: string, m: { ko: number; sub: number; dec: number }) => {
    const vals = { ko: pct(m.ko), sub: pct(m.sub), dec: pct(m.dec) };
    const peak = P.top.who === last ? topKey : null;
    const maxKey = (["ko", "sub", "dec"] as const).reduce((a, b) => (vals[b] > vals[a] ? b : a), "ko" as "ko" | "sub" | "dec");
    return { who: last, ...vals, peak, hot: peak === maxKey ? [] : [maxKey] };
  };
  const rows = favIsA
    ? [mkRow(A.bio.last, P.matrix.a), mkRow(B.bio.last, P.matrix.b)]
    : [mkRow(B.bio.last, P.matrix.b), mkRow(A.bio.last, P.matrix.a)];
  const distancePct = pct(P.matrix.a.dec + P.matrix.b.dec);

  // round histogram cells
  const rp = P.round;
  const raw: { lab: string; pct: number; kind: "round" | "dist" | "empty" }[] = [];
  for (let r = 1; r <= 5; r++) {
    const p = r <= rds ? pct(rp.dist[r] || 0) : 0;
    raw.push({ lab: "R" + r, pct: p, kind: r > rds || p === 0 ? "empty" : "round" });
  }
  raw.push({ lab: "Dist", pct: pct(rp.dist.distance || 0), kind: "dist" });
  const maxPct = Math.max(1, ...raw.map((c) => c.pct));
  const cells = raw.map((c) => ({ ...c, height: c.pct > 0 ? Math.max(Math.round((c.pct / maxPct) * 100), 6) : 8 }));

  let headPre = "", headEm = "";
  if (rp.mode === "veteran") {
    if (rp.modal === "distance") { headPre = "Goes the "; headEm = "distance"; }
    else { headPre = "Finish — Round "; headEm = String(rp.modal); }
  } else if (rp.finishLikely) { headPre = "Finish likely — "; headEm = rp.lean === "early" ? "early" : "late"; }
  else { headPre = "Likely goes the "; headEm = "distance"; }
  const noteText = rp.mode === "veteran"
    ? (rp.reason || "Finish-timing histogram weighted for championship-round conditioning.")
    : `Exact round is withheld — ${rp.gateReason || "insufficient veteran finish-timing sample"}. The engine only commits a round when the sample earns it.`;

  // drivers
  const drivers: MatchupData["drivers"] = [];
  drivers.push({
    dir: "up",
    segs: [
      { text: "Most likely path: " },
      { text: `${P.top.who} by ${P.top.how} (${pct(P.top.v)}%)`, hl: true },
      { text: `. ${pct(P.finishP)}% chance of a finish.` },
    ] as DriverSeg[],
    sub: "Highest single-outcome probability on the board.",
    fav: P.top.who,
  });
  for (const f of P.factors) {
    const favorsLast = f.w > 0 ? A.bio.last : B.bio.last;
    drivers.push({
      dir: favorsLast === favLast ? "up" : "dn",
      segs: [{ text: `${f.label}: ` }, { text: f.detail, num: true }] as DriverSeg[],
      sub: "",
      fav: favorsLast,
    });
  }
  if (P.lowData) {
    drivers.push({
      dir: "dn",
      segs: [{ text: "Low data — thin UFC sample on at least one side; the model regresses toward the market line." }] as DriverSeg[],
      sub: "",
      fav: "",
    });
  }

  const asOf = new Date().toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/New_York" }) + " ET";
  const dateText = evDate
    ? `${new Date(evDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "America/New_York" })}`
    : "";
  const resultText = fin
    ? `${winner ? winner.bio.name + " wins" : "Draw / No Contest"} · ${methodText(result.result)} · R${result.period || "-"}`
    : null;

  const espnImg = (fid: string) => `https://a.espncdn.com/i/headshots/mma/players/full/${fid}.png`;

  const data: MatchupData = {
    eventId: id,
    evName,
    wc: wcType,
    roundsLabel: `${rds} Rounds`,
    dateText,
    a: { id: id1, first: firstName(A.bio.name, A.bio.last), last: A.bio.last, record: A.bio.record, sub: [A.bio.stance, A.bio.country].filter(Boolean).join(" · "), img: espnImg(id1) },
    b: { id: id2, first: firstName(B.bio.name, B.bio.last), last: B.bio.last, record: B.bio.record, sub: [B.bio.stance, B.bio.country].filter(Boolean).join(" · "), img: espnImg(id2) },
    favIsA,
    pctA,
    pctB,
    favName: P.favName,
    tierText,
    tierClass,
    anchored: P.anchored,
    modelPct: favPct,
    vegasPct,
    nudge,
    favMl,
    method: { rows, distancePct },
    round: { mode: rp.mode, headPre, headEm, cells, noteVet: rp.mode === "veteran", noteText },
    drivers,
    finishPct: pct(P.finishP),
    grounding: { sweptA: A.hist.fights.length, sweptB: B.hist.fights.length, asOf },
    fin,
    resultText,
  };

  return <MatchupView d={data} />;
}
