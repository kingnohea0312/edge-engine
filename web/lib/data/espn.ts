/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Server-side ESPN proxy + loaders. All ESPN fetching happens here — the browser
 * never touches ESPN directly. Ports `jget`, `fixRef`, the concurrency limiter,
 * TTL tiers, and the stale-on-error fallback from the original single-file app.
 */
import { cached, TTL } from "@/lib/cache";
import type { Bio, Fight, FightRecord, FightStat, MethodKind } from "@/lib/engine/types";

const SB = "https://site.api.espn.com/apis/site/v2/sports/mma/ufc/scoreboard";
const CORE = "https://sports.core.api.espn.com/v2/sports/mma";
const SRCH = "https://site.web.api.espn.com/apis/search/v2";

export const headshotUrl = (id: string | number) =>
  `https://a.espncdn.com/i/headshots/mma/players/full/${id}.png`;
export const stanceUrl = (id: string | number, side: "left" | "right") =>
  `https://a.espncdn.com/i/headshots/mma/players/stance/${side}/${id}.png`;

const fixRef = (u: string) =>
  String(u).replace(/^http:\/\//, "https://").replace(/\.pvt\//, ".com/");

/** Concurrency limiter (ports `limiter(10)`). */
function limiter(n: number) {
  let active = 0;
  const q: (() => void)[] = [];
  const next = () => {
    if (active >= n || q.length === 0) return;
    active++;
    q.shift()!();
  };
  return <T>(fn: () => Promise<T>): Promise<T> =>
    new Promise<T>((res, rej) => {
      q.push(() =>
        fn()
          .then(res, rej)
          .finally(() => {
            active--;
            next();
          }),
      );
      next();
    });
}
const lim = limiter(10);

/** Cache-aware JSON GET with the stale-on-error fallback. */
async function jget<T = any>(url: string, ttlMs: number, force = false): Promise<T> {
  const u = fixRef(url);
  return cached<T>(
    u,
    ttlMs,
    async () => {
      const r = await fetch(u, { headers: { "user-agent": "EdgeEngine/1.0" } });
      if (!r.ok) throw new Error("HTTP " + r.status + " " + u);
      return (await r.json()) as T;
    },
    { force },
  );
}

/* ---------- date helpers (US-Eastern bucketing → ±1-day range) ---------- */
export const yyyymmdd = (d: string | number | Date) => {
  const x = new Date(d);
  return (
    x.getUTCFullYear() +
    String(x.getUTCMonth() + 1).padStart(2, "0") +
    String(x.getUTCDate()).padStart(2, "0")
  );
};
const DAY_MS = 86_400_000;
function dateRange(dateStr: string) {
  const y = +dateStr.slice(0, 4),
    m = +dateStr.slice(4, 6) - 1,
    d = +dateStr.slice(6, 8);
  const t = Date.UTC(y, m, d);
  return yyyymmdd(new Date(t - DAY_MS)) + "-" + yyyymmdd(new Date(t + DAY_MS));
}
export function isPastDate(dateStr: string) {
  const y = +dateStr.slice(0, 4),
    m = +dateStr.slice(4, 6) - 1,
    d = +dateStr.slice(6, 8);
  return new Date(Date.UTC(y, m, d)).getTime() < Date.now() - 36 * 3_600_000;
}

/* ---------- domain helpers ---------- */
function parseRecord(s: string): FightRecord | null {
  const m = String(s || "").match(/(\d+)-(\d+)(?:-(\d+))?/);
  if (!m) return null;
  return { w: +m[1], l: +m[2], d: +(m[3] || 0), text: s };
}
export function methodText(result: any): string {
  if (!result) return "Decision";
  let t = result.displayName || result.shortDisplayName || result.name || "";
  const desc = result.displayDescription || result.description || "";
  if (desc && desc.toLowerCase() !== t.toLowerCase()) t += " — " + desc;
  return t;
}
function methodKind(result: any): MethodKind {
  const n = String((result && (result.name || result.displayName)) || "").toLowerCase();
  if (n.includes("ko")) return "ko";
  if (n.includes("sub")) return "sub";
  if (n.includes("draw")) return "draw";
  if (n.includes("nc") || n.includes("nocontest") || n.includes("no contest")) return "nc";
  return "dec";
}
const parseClock = (s: string) => {
  const m = String(s || "").match(/(\d+):(\d+)/);
  return m ? +m[1] * 60 + +m[2] : 0;
};

/* ---------- loaders ---------- */
export interface CalEntry {
  label: string;
  start: string;
  id: string;
}
export async function getScoreboardRoot(force = false): Promise<any> {
  return jget(SB, TTL.scoreboard, force);
}
export async function getScoreboardFor(dateStr: string, force = false): Promise<any> {
  const ttl = isPastDate(dateStr) ? TTL.pastScoreboard : TTL.scoreboard;
  return jget(SB + "?dates=" + dateRange(dateStr), ttl, force);
}
export async function getCalendar(force = false): Promise<{ sb: any; cal: CalEntry[] }> {
  const sb = await getScoreboardRoot(force);
  const cal: CalEntry[] = (((sb.leagues || [])[0] || {}).calendar || [])
    .map((c: any) => ({
      label: c.label,
      start: c.startDate,
      id: (String((c.event && c.event.$ref) || "").match(/events\/(\d+)/) || [])[1] || "",
    }))
    .filter((c: CalEntry) => c.id);
  cal.sort((a, b) => +new Date(a.start) - +new Date(b.start));
  return { sb, cal };
}

export async function getBio(id: string): Promise<Bio> {
  const a: any = await jget(`${CORE}/athletes/${id}`, TTL.bio);
  let recText = "";
  try {
    const r: any = await jget(`${CORE}/leagues/ufc/athletes/${id}/records`, TTL.records);
    const items = r.items || [];
    const tot = items.find((x: any) => x.type === "total" || x.name === "overall") || items[0];
    recText = tot ? tot.summary : "";
  } catch {}
  return {
    id: String(id),
    name: a.displayName || a.fullName || "Unknown",
    first: a.firstName || "",
    last: a.lastName || a.displayName || "",
    nickname: a.nickname || "",
    age: a.age ?? null,
    dob: a.dateOfBirth || null,
    height: a.displayHeight || "—",
    reach: a.displayReach || "—",
    weight: a.displayWeight || "—",
    stance: (a.stance && a.stance.text) || "—",
    wc: (a.weightClass && a.weightClass.text) || "",
    gym: (a.association && a.association.name) || "—",
    country: a.citizenship || "",
    flag: (a.flag && a.flag.href) || "",
    headshot: (a.headshot && a.headshot.href) || headshotUrl(id),
    record: recText,
    rec: parseRecord(recText),
  };
}

export async function getHistory(
  id: string,
): Promise<{ fights: Fight[]; upcomingCount: number; totalPlayed: number }> {
  const log: any = await jget(`${CORE}/athletes/${id}/eventlog?limit=50`, TTL.history);
  const items = ((log.events && log.events.items) || []).filter((x: any) => x.competition);
  const played = items.filter((x: any) => x.played);
  const upcoming = items.filter((x: any) => !x.played);
  const take = played.slice(0, 20);
  const fights = await Promise.all(
    take.map((it: any) =>
      lim(async (): Promise<Fight | null> => {
        try {
          const compUrl = fixRef(it.competition.$ref);
          const comp: any = await jget(compUrl, TTL.event);
          const me = (comp.competitors || []).find((c: any) => String(c.id) === String(id));
          const opp = (comp.competitors || []).find((c: any) => String(c.id) !== String(id));
          let status: any = null;
          try {
            status = await jget(compUrl.split("?")[0] + "/status", TTL.event);
          } catch {}
          let oppName = "Unknown";
          const oppId = opp ? String(opp.id) : null;
          if (oppId) {
            try {
              const oa: any = await jget(`${CORE}/athletes/${oppId}`, 7 * 86_400_000);
              oppName = oa.displayName || oa.fullName || "Unknown";
            } catch {}
          }
          let evName = "";
          const evm = compUrl.match(/events\/(\d+)/);
          if (evm) {
            try {
              const ev: any = await jget(`${CORE}/leagues/ufc/events/${evm[1]}`, TTL.event);
              evName = ev.shortName || ev.name || "";
            } catch {}
          }
          let st: FightStat | null = null;
          try {
            const raw: any = await jget(
              compUrl.split("?")[0] + `/competitors/${id}/statistics`,
              TTL.event,
            );
            const stats: Record<string, any> = {};
            ((raw.splits && raw.splits.categories) || []).forEach((cat: any) =>
              (cat.stats || []).forEach((s: any) => (stats[s.name] = s)),
            );
            const num = (n: string) =>
              stats[n] ? parseFloat(stats[n].value ?? stats[n].displayValue) || 0 : 0;
            st = {
              sigL: num("sigStrikesLanded"),
              sigA: num("sigStrikesAttempted"),
              totL: num("totalStrikesLanded"),
              tdL: num("takedownsLanded"),
              tdA: num("takedownsAttempted"),
              kd: num("knockDowns"),
              sub: num("submissions"),
              ctrl: parseClock(stats.timeInControl && stats.timeInControl.displayValue),
            };
          } catch {}
          const kind = methodKind(status && status.result);
          const res =
            kind === "draw" || kind === "nc"
              ? "D"
              : me && me.winner
                ? "W"
                : opp && opp.winner
                  ? "L"
                  : "D";
          const secs = status
            ? (Math.max(1, status.period || 1) - 1) * 300 +
              Math.min(300, Math.round(status.clock || 300))
            : 900;
          return {
            date: comp.date,
            wc: (comp.type && comp.type.text) || "",
            evName,
            oppId,
            oppName,
            res,
            method: methodText(status && status.result),
            kind,
            round: status ? status.period || 0 : 0,
            clock: status ? status.displayClock || "" : "",
            secs,
            st,
          };
        } catch {
          return null;
        }
      }),
    ),
  );
  const list = fights
    .filter((f): f is Fight => Boolean(f))
    .sort((a, b) => +new Date(b.date) - +new Date(a.date));
  return { fights: list, upcomingCount: upcoming.length, totalPlayed: played.length };
}

export async function getResult(evId: string, compId: string): Promise<any> {
  return jget(
    `${CORE}/leagues/ufc/events/${evId}/competitions/${compId}/status`,
    TTL.event,
  );
}

export async function getOddsRaw(evId: string, compId: string): Promise<any> {
  return jget(
    `${CORE}/leagues/ufc/events/${evId}/competitions/${compId}/odds`,
    TTL.odds,
  );
}

export async function search(query: string): Promise<any> {
  return jget(`${SRCH}?limit=20&query=${encodeURIComponent(query.trim())}`, TTL.search);
}

/** Resolve an event id to its ESPN event object (+ its yyyymmdd date). */
export async function getEventById(
  id: string,
  force = false,
): Promise<{ ev: any; dateStr: string } | null> {
  const { cal } = await getCalendar(force);
  const entry = cal.find((c) => String(c.id) === String(id));
  if (!entry) return null;
  const dateStr = yyyymmdd(entry.start);
  const sb = await getScoreboardFor(dateStr, force);
  const ev = (sb.events || []).find((e: any) => String(e.id) === String(id)) || null;
  return ev ? { ev, dateStr } : null;
}

/** Resolve a fighter name to an ESPN athlete id via the search API. */
export async function resolveFighterId(name: string): Promise<string | null> {
  if (!name) return null;
  try {
    const clean = name
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[’']/g, " ")
      .replace(/ł/g, "l")
      .replace(/\s+/g, " ")
      .trim();
    const d: any = await search(clean);
    let players: any[] = [];
    (d.results || []).forEach((r: any) => {
      if (r.type === "player" || r.type === "players") players = players.concat(r.contents || []);
    });
    for (const p of players) {
      const m = String(p.uid || "").match(/a:(\d+)/);
      if (m) return m[1];
    }
    return null;
  } catch {
    return null;
  }
}
