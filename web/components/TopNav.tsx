"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const LINKS: [string, string][] = [
  ["/", "Home"],
  ["/events", "Events"],
  ["/rankings", "Rankings"],
  ["/odds", "Odds"],
];
const PRED_SUB: [string, string, string][] = [
  ["/predict", "Current events", "Pick a card and run the engine"],
  ["/predict/dev", "Dev cards", "Locked picks, graded after each event"],
];

type Hit = { id: string; name: string; subtitle: string; image: string | null };

export default function TopNav() {
  const path = usePathname();
  const [menu, setMenu] = useState(false);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [dd, setDd] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const ddRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMenu(false);
    setDd(false);
  }, [path]);

  useEffect(() => {
    if (q.trim().length < 2) {
      setHits([]);
      return;
    }
    const id = setTimeout(async () => {
      try {
        const r = await fetch("/api/search?q=" + encodeURIComponent(q));
        const d = await r.json();
        setHits((d.results || []).slice(0, 6));
      } catch {
        setHits([]);
      }
    }, 250);
    return () => clearTimeout(id);
  }, [q]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setHits([]);
      if (ddRef.current && !ddRef.current.contains(e.target as Node)) setDd(false);
    };
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDd(false);
    };
    document.addEventListener("mousedown", h);
    document.addEventListener("keydown", k);
    return () => {
      document.removeEventListener("mousedown", h);
      document.removeEventListener("keydown", k);
    };
  }, []);

  const isOn = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));
  const predOn = path.startsWith("/predict");

  return (
    <>
      <nav className="nav">
        <div className="nav-in">
          <Link href="/" className="logo" aria-label="Edge Engine home">
            EDGE<b>ENGINE</b>
          </Link>
          <div className="links">
            {LINKS.map(([href, label]) => (
              <Link key={href} href={href} className={isOn(href) ? "on" : ""}>
                {label}
              </Link>
            ))}
            <div className="nav-dd" ref={ddRef}>
              <button
                className={predOn ? "on" : ""}
                aria-haspopup="menu"
                aria-expanded={dd}
                onClick={() => setDd((v) => !v)}
              >
                Predictions <span className="car">▾</span>
              </button>
              {dd && (
                <div className="nav-dd-menu" role="menu">
                  {PRED_SUB.map(([href, label, desc]) => (
                    <Link key={href} href={href} role="menuitem" onClick={() => setDd(false)}>
                      {label}
                      <span className="d">{desc}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="nav-search" ref={box}>
            <input
              type="search"
              aria-label="Search UFC fighters by name"
              placeholder="Search fighters…"
              autoComplete="off"
              spellCheck={false}
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            {hits.length > 0 && (
              <div className="results" role="listbox" aria-live="polite">
                {hits.map((h) => (
                  <Link
                    key={h.id}
                    href={`/fighter/${h.id}`}
                    onClick={() => {
                      setQ("");
                      setHits([]);
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={h.image || `https://a.espncdn.com/i/headshots/mma/players/full/${h.id}.png`} alt="" />
                    <div>
                      <div>{h.name}</div>
                      <div style={{ color: "var(--faint)", fontSize: 11 }}>{h.subtitle}</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
          <button className="burger" aria-label="Menu" aria-expanded={menu} onClick={() => setMenu((m) => !m)}>
            ≡
          </button>
        </div>
      </nav>
      <div className={"mobile-menu" + (menu ? " open" : "")}>
        {LINKS.map(([href, label]) => (
          <Link key={href} href={href}>
            {label}
          </Link>
        ))}
        <Link href="/predict">Predictions · Current events</Link>
        <Link href="/predict/dev">Predictions · Dev cards</Link>
      </div>
    </>
  );
}
