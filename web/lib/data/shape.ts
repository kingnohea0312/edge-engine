/* eslint-disable @typescript-eslint/no-explicit-any */
import { methodText } from "./espn";

export interface ShapedCorner {
  id: string;
  name: string;
  short: string;
  last: string;
  rec: string;
  winner: boolean;
}
export interface ShapedFight {
  compId: string;
  type: string;
  rounds: number;
  done: boolean;
  f1: ShapedCorner;
  f2: ShapedCorner;
  method: string;
  round: number | null;
  clock: string;
}
export interface ShapedSegment {
  name: string;
  fights: ShapedFight[];
}
export interface ShapedEvent {
  id: string;
  name: string;
  date: string;
  dateStr: string;
  venue: string;
  city: string;
  country: string;
  broadcast: string;
  segments: ShapedSegment[];
  done: boolean;
}

const last = (name: string) => name.split(" ").pop() || name;

function corner(c: any): ShapedCorner {
  const a = c.athlete || {};
  return {
    id: String(c.id),
    name: a.displayName || a.fullName || "TBA",
    short: a.shortName || a.displayName || "TBA",
    last: last(a.displayName || ""),
    rec: (c.records && c.records[0] && c.records[0].summary) || "",
    winner: !!c.winner,
  };
}

export function shapeEvent(ev: any, dateStr: string): ShapedEvent {
  const comps: any[] = ev.competitions || [];
  const done = comps.some((c) => c.status && c.status.type && c.status.type.completed);
  const v = (comps[0] || {}).venue || {};
  const bcast = (() => {
    const names = new Set<string>();
    comps.forEach((c) =>
      (c.broadcasts || []).forEach((b: any) => (b.names || []).forEach((n: string) => names.add(n))),
    );
    return [...names].slice(0, 2).join(" / ");
  })();

  const groups = new Map<string, any[]>();
  comps.forEach((c) => {
    const k = c.date || "x";
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(c);
  });
  const ordered = [...groups.entries()].sort((a, b) => +new Date(b[0]) - +new Date(a[0]));
  const segNames =
    ordered.length >= 3
      ? ["Main Card", "Prelims", "Early Prelims"]
      : ordered.length === 2
        ? ["Main Card", "Prelims"]
        : ["Fight Card"];

  const segments: ShapedSegment[] = ordered.map((g, i) => ({
    name: segNames[i] || "Card",
    fights: g[1]
      .slice()
      .reverse()
      .map((c: any): ShapedFight | null => {
        const [a, b] = c.competitors || [];
        if (!a || !b) return null;
        const st = c.status || {};
        const fin = !!(st.type && st.type.completed);
        return {
          compId: String(c.id),
          type: (c.type && (c.type.text || c.type.abbreviation)) || "",
          rounds: (c.format && c.format.regulation && c.format.regulation.periods) || 3,
          done: fin,
          f1: corner(a),
          f2: corner(b),
          method: fin && st.result ? methodText(st.result) : "",
          round: fin ? st.period || null : null,
          clock: fin ? st.displayClock || "" : "",
        };
      })
      .filter((x): x is ShapedFight => Boolean(x)),
  }));

  return {
    id: String(ev.id),
    name: ev.name || "UFC Event",
    date: ev.date,
    dateStr,
    venue: v.fullName || "",
    city: (v.address && v.address.city) || "",
    country: (v.address && v.address.country) || "",
    broadcast: bcast,
    segments,
    done,
  };
}
