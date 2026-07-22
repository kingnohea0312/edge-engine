# Edge Engine — Web (Next.js)

A full-stack rebuild of the single-file Edge Engine PWA into a server-rendered
Next.js site. All ESPN fetching and the prediction engine run **on the server**;
the browser only ever calls this app's own `/api/*` routes. First-class on
desktop and mobile.

## Stack

- **Next.js 16 (App Router) · React 19 · TypeScript**, Node runtime.
- No CSS framework — a hand-authored dark editorial sports design system
  (CSS variables in `app/globals.css`), fonts via `next/font` (Bebas Neue + Inter).
- No database and **no secret keys** — all data comes from public ESPN feeds.

## Setup

```bash
npm install
npm run dev      # http://localhost:3000
# production
npm run build
npm start        # set PORT to change the port, e.g. PORT=3100 npm start
```

Requires Node 18+ (developed on Node 24). No environment variables are required.

### Optional environment variables

| Var | Purpose |
|---|---|
| `CACHE_DRIVER=redis` + `REDIS_URL` | Use Redis for the server cache instead of the default in-memory LRU. `ioredis` must be installed (`npm i ioredis`); otherwise it silently falls back to memory. |

## Architecture

```
app/
  api/                 internal API (the browser's only backend)
    events, event/[id], fighter/[id], odds/[evId],
    search, rankings, predict/[evId]/[compId]
  page.tsx             home        /event/[id]          event detail
  events/              schedule    /event/[id]/[compId] matchup (flagship)
  fighter/[id]/        profile     rankings/ odds/ predict/
  layout.tsx           nav + fonts + metadata + PWA manifest
components/            TopNav, FighterImg, RankingsClient, PredictBoard
lib/
  cache.ts             TTL cache (memory LRU default, Redis adapter optional) + stale-on-error
  data/espn.ts         server-side ESPN proxy: jget, fixRef, limiter, typed loaders
  data/profile.ts      server profile cache (per-fighter archive sweep, shared)
  data/rankings.ts     live ufc.com scrape + dated embedded fallback
  data/shape.ts        raw ESPN event → clean typed structure
  engine/              predict, statsScore, roundProjection (Veteran Gate),
                       aggregate, market — ported byte-faithful from the source app
```

### Data & caching

Every ESPN endpoint is fetched server-side and cached with the original app's
TTLs (scoreboard ~5 min, odds ~15 min, rankings ~6 h, bios ~12–24 h, history/past
events ~30 d) via `lib/cache`. Requests de-dupe in-flight, and on a fetch error
the last cached value is served (stale-on-error), matching the source `jget`.
One server sweep is shared across all visitors instead of every client
re-sweeping. Route Handlers are `force-dynamic`; freshness is governed by the
cache TTLs.

### The engine is the IP — unchanged

`lib/engine` is a behavior-faithful TypeScript port. Outputs (win %, method
matrix, Veteran-Gate round call, driver factors, Bayesian shrinkage, tier logic,
the 85% display cap) match the original. See `../CHANGELOG-REBUILD.md` for the
view→route map and the fidelity confirmation, including one deliberately
preserved quirk (the control-time nudge no-ops in the source; kept verbatim).

## Deployment

Any Node host (`npm run build && npm start`). No secrets, no database. Behind a
CDN, the server cache means a handful of ESPN calls serve all traffic. For
serverless, set `CACHE_DRIVER=redis` so the cache survives across invocations.

## Accessibility & quality

Keyboard-operable throughout, visible `:focus-visible` rings, semantic
`<Link>`/`<button>`, `aria-live` on the search results, `prefers-reduced-motion`
honored, responsive ~320px→wide desktop, skeleton/retry states, tabular numerics
on every stat and price.
