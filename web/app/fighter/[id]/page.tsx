import Link from "next/link";
import type { Metadata } from "next";
import { getProfile } from "@/lib/data/profile";
import { fmtDateShort, pct } from "@/lib/format";
import { headshotUrl, SILHOUETTE } from "@/lib/images";
import FighterImg from "@/components/FighterImg";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const p = await getProfile(id);
    return { title: p.bio.name, description: `${p.bio.name} — UFC record, career stats, and full fight history.`, openGraph: { title: p.bio.name } };
  } catch {
    return { title: "Fighter" };
  }
}

function StatBar({ k, v, max, disp }: { k: string; v: number; max: number; disp: string }) {
  return (
    <div className="statrow">
      <div className="top">
        <span className="k">{k}</span>
        <span className="v tnum">{disp}</span>
      </div>
      <div className="bar">
        <i style={{ width: `${Math.max(2, Math.min(100, (v / max) * 100))}%` }} />
      </div>
    </div>
  );
}

export default async function FighterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let prof;
  try {
    prof = await getProfile(id);
  } catch {
    return (
      <main>
        <div className="wrap wrap-narrow err card">Couldn&apos;t load this fighter.</div>
      </main>
    );
  }
  const { bio, hist, agg } = prof;

  return (
    <main>
      <div className="wrap">
        <div className="fp">
          <div>
            <div className="fp-hero">
              <FighterImg id={id} variant="stance" side="left" alt={bio.name} />
              {bio.nickname ? <div className="nick">&ldquo;{bio.nickname}&rdquo;</div> : null}
              <h1>{bio.name}</h1>
              <div className="rec tnum">{bio.record}</div>
              <div className="wcl">{[bio.wc, bio.country].filter(Boolean).join(" · ")}</div>
            </div>
            <div className="biogrid" style={{ marginTop: 14 }}>
              {[
                [String(bio.age ?? "—"), "Age"],
                [bio.height, "Height"],
                [bio.reach, "Reach"],
                [bio.stance, "Stance"],
                [agg.form5txt, "Last 5"],
                [bio.gym, "Team"],
              ].map(([v, k]) => (
                <div className="cell" key={k}>
                  <div className="v" style={{ fontSize: k === "Team" ? 11.5 : undefined, lineHeight: 1.25 }}>{v}</div>
                  <div className="k">{k}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            {agg.nStats ? (
              <>
                <div className="section-head" style={{ marginTop: 0 }}>
                  <h2 style={{ fontSize: 20 }}>Career stats</h2>
                  <span className="rule" />
                  <span className="meta">{agg.nStats} tracked · {Math.round(agg.minutes)} min</span>
                </div>
                <div className="card" style={{ padding: "6px 18px" }}>
                  <StatBar k="Sig. strikes / min" v={agg.slpm} max={8} disp={agg.slpm.toFixed(1)} />
                  <StatBar k="Striking accuracy" v={agg.acc} max={1} disp={pct(agg.acc) + "%"} />
                  <StatBar k="Takedowns / 15 min" v={agg.td15} max={6} disp={agg.td15.toFixed(1)} />
                  <StatBar k="Takedown accuracy" v={agg.tdAcc} max={1} disp={pct(agg.tdAcc) + "%"} />
                  <StatBar k="Control time" v={agg.ctrlPct} max={1} disp={pct(agg.ctrlPct) + "%"} />
                  <StatBar k="Knockdowns / 15 min" v={agg.kd15} max={1.5} disp={agg.kd15.toFixed(2)} />
                  <StatBar k="Finish rate" v={agg.finishRate} max={1} disp={pct(agg.finishRate) + "% of wins"} />
                </div>
              </>
            ) : null}

            <div className="section-head">
              <h2 style={{ fontSize: 20 }}>Fight history</h2>
              <span className="rule" />
              <span className="meta">UFC</span>
            </div>
            <div className="card">
              {hist.fights.length ? (
                hist.fights.map((f, i) => {
                  const inner = (
                    <>
                      <span className={`res ${f.res}`}>{f.res}</span>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        className=""
                        src={f.oppId ? headshotUrl(f.oppId) : SILHOUETTE}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        style={{ width: 38, height: 38, borderRadius: "50%", objectFit: "cover", objectPosition: "top", background: "var(--surface)", border: "1px solid var(--line)" }}
                      />
                      <div className="inf">
                        <div className="o">vs {f.oppName}</div>
                        <div className="m">{f.method}{f.round ? ` · R${f.round} ${f.clock}` : ""}</div>
                      </div>
                      <div className="d tnum">
                        {f.evName}
                        <br />
                        {fmtDateShort(f.date)}
                      </div>
                    </>
                  );
                  return f.oppId ? (
                    <Link key={i} href={`/fighter/${f.oppId}`} className="hrow">
                      {inner}
                    </Link>
                  ) : (
                    <div key={i} className="hrow">
                      {inner}
                    </div>
                  );
                })
              ) : (
                <div className="err">No UFC fights tracked.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
