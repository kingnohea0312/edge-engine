"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SILHOUETTE } from "@/lib/images";

interface Division {
  categoryName: string;
  champion: { championName: string } | null;
  fighters: string[];
}

const Belt = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 4h10v5.5a5 5 0 0 1-10 0Z" />
    <path d="M12 14.5V18M8.5 21h7" />
  </svg>
);

export default function RankingsClient() {
  const router = useRouter();
  const [divs, setDivs] = useState<Division[]>([]);
  const [live, setLive] = useState(false);
  const [asOf, setAsOf] = useState("");
  const [cur, setCur] = useState(0);
  const [err, setErr] = useState(false);
  const [imgs, setImgs] = useState<Record<string, { id: string; img: string }>>({});
  const resolving = useRef<Set<string>>(new Set());

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/rankings");
        const d = await r.json();
        if (!d.divisions) throw new Error();
        setDivs(d.divisions);
        setLive(d.live);
        setAsOf(d.asOf);
      } catch {
        setErr(true);
      }
    })();
  }, []);

  const division = divs[cur];

  useEffect(() => {
    if (!division) return;
    const names = [division.champion?.championName, ...division.fighters].filter(Boolean) as string[];
    names.forEach(async (name) => {
      if (imgs[name] || resolving.current.has(name)) return;
      resolving.current.add(name);
      try {
        const r = await fetch("/api/search?q=" + encodeURIComponent(name));
        const d = await r.json();
        const hit = (d.results || [])[0];
        if (hit) setImgs((m) => ({ ...m, [name]: { id: hit.id, img: hit.image || `https://a.espncdn.com/i/headshots/mma/players/full/${hit.id}.png` } }));
      } catch {}
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cur, divs]);

  const open = async (name: string) => {
    const hit = imgs[name];
    if (hit) return router.push("/fighter/" + hit.id);
    try {
      const r = await fetch("/api/search?q=" + encodeURIComponent(name));
      const d = await r.json();
      const first = (d.results || [])[0];
      if (first) router.push("/fighter/" + first.id);
    } catch {}
  };

  if (err) return <div className="card err">Rankings unavailable right now.</div>;

  return (
    <div className="rk">
      <div className="page-h">
        <h1>Rankings</h1>
        {asOf && <span className="cap">{live ? "Live from ufc.com" : `Updated ${asOf}`}</span>}
      </div>

      {!division ? (
        <div className="skeleton" style={{ height: 480, marginTop: 16 }} />
      ) : (
        <>
          <div className="divs" role="tablist">
            {divs.map((d, i) => (
              <button key={d.categoryName} className={`d${i === cur ? " on" : ""}`} onClick={() => setCur(i)}>
                {d.categoryName}
              </button>
            ))}
          </div>

          {division.champion && (
            <button className="champ" onClick={() => open(division.champion!.championName)}>
              <span className="av">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imgs[division.champion.championName]?.img || SILHOUETTE} alt="" loading="lazy" decoding="async" />
              </span>
              <span className="who">
                <span className="belt"><Belt /> Champion · {division.categoryName}</span>
                <span className="nm" style={{ display: "block" }}>{division.champion.championName}</span>
              </span>
              <span className="cbadge">C</span>
            </button>
          )}

          <div className="ranks">
            {division.fighters.map((f, i) => (
              <button key={f + i} className="r" onClick={() => open(f)}>
                <span className="no">{i + 1}</span>
                <span className="av">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imgs[f]?.img || SILHOUETTE} alt="" loading="lazy" decoding="async" />
                </span>
                <span className="nm">{f}</span>
                <span className="chev">›</span>
              </button>
            ))}
          </div>

          <div className="footcap">
            {live ? "Official UFC rankings · live from ufc.com" : `Official UFC rankings (snapshot, updated ${asOf})`} · tap a fighter for stats &amp; history.
          </div>
        </>
      )}
    </div>
  );
}
