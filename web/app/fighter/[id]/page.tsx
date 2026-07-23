import Link from "next/link";
import type { Metadata } from "next";
import { getProfile } from "@/lib/data/profile";
import { fmtDateShort, pct } from "@/lib/format";
import FighterImg from "@/components/FighterImg";
import StatBars, { type StatItem } from "@/components/StatBars";

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

const clamp = (v: number) => Math.max(2, Math.min(100, v));

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

  const stats: StatItem[] = agg.nStats
    ? [
        { label: "Sig. strikes / min", widthPct: clamp((agg.slpm / 8) * 100), disp: agg.slpm.toFixed(1) },
        { label: "Striking accuracy", widthPct: pct(agg.acc), disp: pct(agg.acc) + "%" },
        { label: "Takedowns / 15 min", widthPct: clamp((agg.td15 / 6) * 100), disp: agg.td15.toFixed(1) },
        { label: "Takedown accuracy", widthPct: pct(agg.tdAcc), disp: pct(agg.tdAcc) + "%" },
        { label: "Control time", widthPct: pct(agg.ctrlPct), disp: pct(agg.ctrlPct) + "%" },
        { label: "Knockdowns / 15 min", widthPct: clamp((agg.kd15 / 1.5) * 100), disp: agg.kd15.toFixed(2) },
        { label: "Finish rate", widthPct: pct(agg.finishRate), disp: pct(agg.finishRate) + "%", gold: true },
      ]
    : [];

  return (
    <main>
      <div className="wrap wrap-narrow fp2">
        <div className="ctx">
          <Link href="/rankings">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7" /></svg>
            Rankings
          </Link>
        </div>

        <section className="fp">
          <div className="fp-hero">
            <div className="fp-slot">
              <FighterImg id={id} variant="stance" side="left" alt={bio.name} />
            </div>
            <div className="fp-id">
              {bio.nickname && <div className="nick">&ldquo;{bio.nickname}&rdquo;</div>}
              <h1>{bio.name}</h1>
              <div className="rec">{bio.record}<span className="w">Pro record</span></div>
              <div className="wc">
                {bio.wc && <span className="chip">{bio.wc}</span>}
                {[bio.country, bio.stance].filter(Boolean).join(" · ")}
              </div>
            </div>
          </div>
          <div className="biogrid">
            {[
              [String(bio.age ?? "—"), "Age"],
              [bio.height, "Height"],
              [bio.reach, "Reach"],
              [bio.stance, "Stance"],
              [agg.form5txt, "Last 5"],
              [bio.gym, "Team"],
            ].map(([v, k]) => (
              <div className="cell" key={k}>
                <div className="v" style={{ fontSize: k === "Team" ? 13 : undefined }}>{v}</div>
                <div className="k">{k}</div>
              </div>
            ))}
          </div>
        </section>

        <div className="cols">
          {agg.nStats ? (
            <section className="panel">
              <div className="panel-h"><span className="k">Career stats</span><span className="n">{agg.nStats} tracked · {Math.round(agg.minutes)} min</span></div>
              <StatBars stats={stats} />
            </section>
          ) : (
            <div />
          )}

          <section className="panel">
            <div className="panel-h"><span className="k">Fight history</span><span className="n">{hist.fights.length} UFC bouts</span></div>
            <div className="hist">
              {hist.fights.length ? (
                hist.fights.map((f, i) => {
                  const inner = (
                    <>
                      <span className={`res ${f.res}`}>{f.res}</span>
                      <div className="mid">
                        <div className="o">{f.oppName}</div>
                        <div className="m">{f.method}{f.round ? ` · R${f.round}${f.clock ? " " + f.clock : ""}` : ""}</div>
                      </div>
                      <div className="rt">
                        <div className="e">{f.evName}</div>
                        <div className="d">{fmtDateShort(f.date)}</div>
                      </div>
                    </>
                  );
                  return f.oppId ? (
                    <Link key={i} href={`/fighter/${f.oppId}`} className="h">{inner}</Link>
                  ) : (
                    <div key={i} className="h">{inner}</div>
                  );
                })
              ) : (
                <div className="err">No UFC fights tracked.</div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
