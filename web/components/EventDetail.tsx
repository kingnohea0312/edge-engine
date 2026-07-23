"use client";
import Link from "next/link";
import { useState } from "react";

export interface EBout {
  compId: string;
  aName: string;
  aRec: string;
  aWinner: boolean;
  bName: string;
  bRec: string;
  bWinner: boolean;
  wc: string;
  rounds: number;
  done: boolean;
  resText: string;
  mlA: string | null;
  mlB: string | null;
  favA: boolean;
}
export interface ESegment {
  name: string;
  bouts: EBout[];
}
interface Props {
  evId: string;
  name: string;
  typeKicker: string;
  dateText: string;
  place: string;
  broadcast: string;
  segments: ESegment[];
}

const Cal = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="16" rx="2.5" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>
);
const Pin = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21S5.5 15 5.5 10.2a6.5 6.5 0 0 1 13 0C18.5 15 12 21 12 21Z" /><circle cx="12" cy="10" r="2.3" /></svg>
);
const Tv = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2.5" y="7" width="19" height="13" rx="2.2" /><path d="M8.5 2.5 12 6l3.5-3.5" /></svg>
);

export default function EventDetail({ evId, name, typeKicker, dateText, place, broadcast, segments }: Props) {
  const [cur, setCur] = useState(0);
  const seg = segments[cur] || segments[0];

  return (
    <div className="ev2">
      <div className="ctx">
        <Link href="/events">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7" /></svg>
          Events
        </Link>
      </div>

      <section className="evhead">
        {typeKicker && <div className="type">{typeKicker}</div>}
        <h1>{name}</h1>
        <div className="metas">
          {dateText && <span className="m"><Cal /> <b>{dateText}</b></span>}
          {place && <span className="m"><Pin /> <b>{place}</b></span>}
          {broadcast && <span className="m"><Tv /> <b>{broadcast}</b></span>}
        </div>
      </section>

      {segments.length > 1 && (
        <div className="seg" role="tablist">
          {segments.map((s, i) => (
            <button key={s.name} className={i === cur ? "on" : ""} role="tab" onClick={() => setCur(i)}>
              {s.name}
            </button>
          ))}
        </div>
      )}

      <div className="seg-cap">{seg.name}</div>
      <div className="card">
        {seg.bouts.map((b) => (
          <Link key={b.compId} href={`/event/${evId}/${b.compId}`} className={`bout${b.done ? " final" : ""}`}>
            <div className={`f${b.done ? (b.aWinner ? " win" : " loss") : ""}`}>
              <div className="nm">{b.aName}{b.done && b.aWinner && <> <span className="wbadge">W</span></>}</div>
              <div className="rec">{b.aRec}</div>
              {!b.done && b.mlA && <div className={`ml${b.favA ? " fav" : ""}`}>{b.mlA}</div>}
            </div>
            <div className="mid">
              <div className="wc">{b.wc}</div>
              {b.done ? (
                <div className="res">{b.resText}</div>
              ) : (
                <>
                  <div className="vs">VS</div>
                  <div className="rds">{b.rounds} Rounds</div>
                </>
              )}
            </div>
            <div className={`f right${b.done ? (b.bWinner ? " win" : " loss") : ""}`}>
              <div className="nm">{b.done && b.bWinner && <><span className="wbadge">W</span> </>}{b.bName}</div>
              <div className="rec">{b.bRec}</div>
              {!b.done && b.mlB && <div className={`ml${!b.favA ? " fav" : ""}`}>{b.mlB}</div>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
