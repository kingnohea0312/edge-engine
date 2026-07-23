import Link from "next/link";
import type { Metadata } from "next";
import { getCalendar } from "@/lib/data/espn";
import { fmtTime, monShort, dayNum, weekday, eventPill } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "UFC Events & Schedule" };

function Row({ id, label, start, done }: { id: string; label: string; start: string; done: boolean }) {
  const p = eventPill(label, done);
  return (
    <Link href={`/event/${id}`} className={`ev-row${done ? " final" : ""}`}>
      <div className="date">
        <div className="m">{monShort(start)}</div>
        <div className="d">{dayNum(start)}</div>
      </div>
      <div className="info">
        <div className="t">{label}</div>
        <div className="s tnum">
          {weekday(start)} · {fmtTime(start)}
          {done ? " · results available" : ""}
        </div>
      </div>
      <span className={`pill ${done ? "done" : p.cls}`}>{done ? "Final" : p.txt}</span>
      <svg className="chev" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5l7 7-7 7" /></svg>
    </Link>
  );
}

export default async function Events() {
  let cal: Awaited<ReturnType<typeof getCalendar>>["cal"] = [];
  let failed = false;
  try {
    ({ cal } = await getCalendar());
  } catch {
    failed = true;
  }
  const now = Date.now();
  const upcoming = cal.filter((c) => +new Date(c.start) > now - 18 * 3_600_000);
  const past = cal.filter((c) => +new Date(c.start) <= now - 18 * 3_600_000).reverse();

  return (
    <main>
      <div className="wrap wrap-narrow">
        <div className="page-h">
          <h1>Events</h1>
        </div>
        <div className="section-head">
          <h2>Upcoming events</h2>
          <span className="rule" />
        </div>
        {failed ? (
          <div className="card err">Couldn&apos;t reach live data. Try again shortly.</div>
        ) : (
          <div className="card">
            {upcoming.length ? (
              upcoming.slice(0, 16).map((c) => <Row key={c.id} id={c.id} label={c.label} start={c.start} done={false} />)
            ) : (
              <div className="err">Nothing scheduled.</div>
            )}
          </div>
        )}

        <div className="section-head">
          <h2>Recent results</h2>
          <span className="rule" />
        </div>
        <div className="card">
          {past.slice(0, 12).map((c) => (
            <Row key={c.id} id={c.id} label={c.label} start={c.start} done={true} />
          ))}
        </div>
      </div>
    </main>
  );
}
