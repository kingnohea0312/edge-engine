"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SILHOUETTE } from "@/lib/images";

interface Division {
  categoryName: string;
  champion: { championName: string } | null;
  fighters: string[];
}

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
        if (hit)
          setImgs((m) => ({
            ...m,
            [name]: { id: hit.id, img: hit.image || `https://a.espncdn.com/i/headshots/mma/players/full/${hit.id}.png` },
          }));
      } catch {}
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cur, divs]);

  const open = async (name: string) => {
    const hit = imgs[name];
    if (hit) {
      router.push("/fighter/" + hit.id);
      return;
    }
    try {
      const r = await fetch("/api/search?q=" + encodeURIComponent(name));
      const d = await r.json();
      const first = (d.results || [])[0];
      if (first) router.push("/fighter/" + first.id);
    } catch {}
  };

  if (err) return <div className="card err">Rankings unavailable right now.</div>;
  if (!division) return <div className="skeleton" style={{ height: 480 }} />;

  const Row = ({ name, label, champ }: { name: string; label: string; champ?: boolean }) => (
    <button className={`rankrow ${champ ? "champ" : ""}`} onClick={() => open(name)}>
      <span className={`no ${champ ? "champ" : ""}`}>{champ ? "C" : label}</span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imgs[name]?.img || SILHOUETTE} alt="" loading="lazy" decoding="async" />
      <span className="rn">{name}</span>
      <span style={{ color: "var(--faint)" }}>›</span>
    </button>
  );

  return (
    <>
      <div className="divtabs">
        {divs.map((d, i) => (
          <button key={d.categoryName} className={i === cur ? "on" : ""} onClick={() => setCur(i)}>
            {d.categoryName}
          </button>
        ))}
      </div>
      <div className="card">
        {division.champion && <Row name={division.champion.championName} label="C" champ />}
        {division.fighters.map((f, i) => (
          <Row key={f + i} name={f} label={String(i + 1)} />
        ))}
      </div>
      <p className="muted" style={{ textAlign: "center", marginTop: 14 }}>
        {live ? "Official UFC rankings · live from ufc.com" : `Official UFC rankings (snapshot, updated ${asOf})`} · tap a
        fighter for stats & history.
      </p>
    </>
  );
}
