"use client";
import { useEffect, useState } from "react";

export interface StatItem {
  label: string;
  widthPct: number;
  disp: string;
  gold?: boolean;
}

export default function StatBars({ stats }: { stats: StatItem[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <>
      {stats.map((s) => (
        <div className={`stat${s.gold ? " gold" : ""}`} key={s.label}>
          <div className="top">
            <span className="k">{s.label}</span>
            <span className="v">{s.disp}</span>
          </div>
          <div className="bar">
            <i style={{ width: `${mounted ? Math.max(2, Math.min(100, s.widthPct)) : 0}%` }} />
          </div>
        </div>
      ))}
    </>
  );
}
