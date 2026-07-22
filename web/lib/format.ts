/** Deterministic date/time formatting (fixed ET) — identical on server + client,
 *  so SSR never mismatches hydration. UFC scheduling is US-Eastern anyway. */
const ET = "America/New_York";
export const fmtDateLong = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric", timeZone: ET });
export const fmtDateShort = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: ET });
export const fmtTime = (d: string) =>
  new Date(d).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: ET }) + " ET";
export const monShort = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", timeZone: ET }).toUpperCase();
export const dayNum = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { day: "numeric", timeZone: ET });
export const weekday = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { weekday: "short", timeZone: ET });
export const pct = (v: number) => Math.round(v * 100);
export const eventPill = (name: string, done: boolean) =>
  done ? { cls: "done", txt: "Final" } : /UFC \d/.test(name) ? { cls: "ppv", txt: "PPV" } : { cls: "fn", txt: "Fight Night" };
