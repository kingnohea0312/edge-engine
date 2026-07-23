"use client";
import { useEffect, useState } from "react";

const pad = (n: number) => String(Math.max(0, n)).padStart(2, "0");

function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}

/** Live Days/Hrs/Min/Sec countdown to an ISO target. SSR-safe (mounts, then ticks). */
export default function Countdown({ target }: { target: string }) {
  const t = new Date(target).getTime();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const p = parts(t - now);
  const cells: [string, string][] = [
    [pad(p.d), "Days"],
    [pad(p.h), "Hrs"],
    [pad(p.m), "Min"],
    [pad(p.s), "Sec"],
  ];
  return (
    <div className="cd">
      {cells.map(([n, l]) => (
        <div className="u" key={l}>
          <div className="n num" suppressHydrationWarning>
            {n}
          </div>
          <div className="l">{l}</div>
        </div>
      ))}
    </div>
  );
}
