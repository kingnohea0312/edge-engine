# Edge Engine → Next.js Rebuild — Audit, Architecture & Design Plan

*Deliverable 1. Written before code, per the brief. Drives the full-stack rebuild
of the single-file PWA (`app/index.html`, documented in `EDGE-ENGINE-APP.md`) into
a server-rendered Next.js site.*

---

## Part A — Audit of the source (what exists today)

### Views (all preserved; re-homed as real routes)
Home · Next event · Events list · Event detail (card segments) · Fighter profile ·
Matchup/Prediction (flagship) · Rankings · Live Odds · Prediction board ·
install/PWA sheet.

### Data layer (client-side today → moves to server)
- **ESPN public MMA feeds:** scoreboard (`?dates=` range), core API athlete/records/eventlog/per-fight statistics/competition status/odds, and the search API. `$ref` URLs need `http→https` + `.pvt→.com` rewrite (`fixRef`).
- **Two-tier cache:** in-memory `Map` in front of `localStorage`, keys `ee:`, parse-free eviction.
- **Concurrency limiter** (`limiter(10)`), and **stale-while-error** fallback (`jget` returns cached data on fetch failure).
- **US-Eastern bucketing gotcha:** scoreboard groups by ET date, so queries hit a ±1-day range.

### Engine (the IP — relocated, never altered)
`amToProb` (de-vig), `loadMarket` (ESPN BET provider 58 moneylines + victory-method
prices + open/close for line movement), `loadProfile`/`loadHistory`/`loadBio`/`aggregate`
(per-fighter archive sweep → career rate stats), `statsScore` (bounded itemized nudges +
Bayesian shrinkage toward league means on thin samples), `predict` (market-anchored win %,
data-quality damping, method matrix reconciling to win %, two-layer Model/Display %),
`roundProjection` (the **Veteran Gate**: 9+ UFC bouts each + no poison flags → exact modal
round from finish-timing histograms, else the soft standard read).

### Trust mechanics (elevated to first-class UI)
85% Display-% humility cap (shown when it bites), tier-capping when no line is posted,
low-data/thin-sample cautions, de-vigged market anchor + implied % + itemized model nudge
disclosed side by side, line-movement indicators, Veteran-read vs Standard-read split with
the gate reason stated, and "probabilities, not locks / responsible gambling" language.

**Confirmed:** the plan relocates these unchanged. No engine constant, threshold, formula,
or output is modified — only its execution environment (browser → Node).

---

## Part B — Architecture (the heart of the rebuild)

### Backend (Node via Next Route Handlers)
- **`lib/cache`** — TTL cache behind an interface. Default in-memory LRU; optional Redis
  adapter selected by env (`CACHE_DRIVER`). Ports parse-free eviction + **stale-on-error**
  (`get`/`set`/`getStale`). TTLs mirror the original:
  | Data | TTL |
  |---|---|
  | scoreboard / events | 5 min |
  | odds | 15 min |
  | rankings | 6 h (live fetch) |
  | athlete bio / records | 12–24 h |
  | fight history / per-fight stats / past events | 30 d |
- **`lib/data`** — `jget` (typed, cache-aware, `fixRef`, limiter, stale fallback) + typed
  loaders (`getScoreboard`, `getEvent`, `getFighter`, `getOdds`, `search`, `getRankings`).
  **All ESPN calls run here, server-side only.**
- **`lib/engine`** — `predict/statsScore/roundProjection/aggregate/amToProb/loadMarket`
  ported to TypeScript **byte-faithful in behavior**. Server-side profile cache so the
  ≤20-fights-per-fighter sweep runs once and is shared across all visitors.
- **Internal API** — the browser talks only to these, never ESPN:
  `/api/events`, `/api/event/[id]`, `/api/fighter/[id]`, `/api/odds/[evId]`,
  `/api/search`, `/api/predict/[evId]/[compId]`, `/api/rankings`.
- **Live rankings upgrade** — no browser CORS wall on the server, so fetch + parse
  `ufc.com/rankings` server-side (6 h cache); keep the dated embedded snapshot as fallback
  if the fetch/parse fails.
- **Freshness** — Route Handlers use `next: { revalidate }` / `cache` with the TTLs above,
  so freshness matches today.

### Frontend (responsive React, App Router)
- **SSR** event / fighter / matchup pages with real shareable URLs + `<title>`/OpenGraph
  meta (replaces hash routing).
- **Streaming + Suspense** with skeletons; lazy images preserving the stance→headshot→
  silhouette fallback chain; honest error/retry states; `aria-live` async regions.

---

## Part C — Design decisions (cited from ui-ux-pro-max data + impeccable rules)

*ui-max-pro's Python search engine can't run in this environment (no Python 3), so
selections were pulled directly from the skill's data CSVs and reference files and are
cited by row.*

- **Product type / style** — synthesis of `products.csv` **#75 Sports Team/Club** (team red
  + championship gold) with **#6 Financial Dashboard** and **#7 Analytics Dashboard**
  (Dark-Mode-OLED + Data-Dense, "real-time, accuracy paramount, color-coded data") and
  **#46 Video/OTT** (cinema-dark). Edge Engine is a live-data sports-analytics product, so
  it takes the sports palette DNA over a data-dense dark structure. Avoids the SaaS-cream
  and AI-purple defaults (impeccable slop test, first + second order).
- **Palette (dark editorial sports, OKLCH-composed, WCAG-checked)** — near-black oxblood-
  tinted bg, elevated surfaces (not pure black, per `color-dark-mode` = desaturated tonal
  variants), **oxblood/crimson** primary, **championship gold** accent (Sports Team/Club
  accent, adjusted for ≥3:1 like the CSV notes), and **green/red** reserved for market
  up/down (Financial Dashboard convention). Off-white ink (#F2F2F5), muted `#94A3B8`-class.
- **Type pairing (contrast axis, both cited)** — **Bebas Neue** display for fighter names /
  VS spine / hero (`typography.csv` #7 "Bold Statement", tagged *sports*) + **Inter** text
  for everything and all numerics (`#5 Minimal Swiss`, dashboards) using
  `font-variant-numeric: tabular-nums` so every stat and price aligns. Condensed all-caps
  display against a neutral grotesque satisfies impeccable's contrast-axis pairing rule.
- **Motion presets (restrained)** — from `quick-reference.md §7`: ease-out on enter, exits
  ~60–70% shorter, **stagger 30–50 ms/item**, spring feel; reveals + bar fills + count-ups +
  hover confirms only, never decoration; full `prefers-reduced-motion` alternative. No
  bounce/elastic (impeccable).
- **Charts** — win probability + method matrix + round distribution render as **horizontal
  bar comparisons** with tabular value labels (precise values in text, not pie); odds show
  favorite highlighting + line-movement arrows/sparkline. No heavy chart lib — SSR-friendly,
  fast.
- **impeccable pre-flight** (run before "done"): no gradient text, no glassmorphism-as-
  default, no eyebrow-on-every-section, no over-rounded ghost cards, display tracking
  ≥ -0.04em, body contrast ≥ 4.5:1, tabular numerics, reduced-motion, keyboard/focus.

---

## Part D — Preserve vs. change

**Preserve:** all engine math + outputs; every trust/transparency mechanic (elevated, not
hidden); PWA installability; keyboard a11y; reduced-motion; the data behaviors (TTLs,
stale-fallback, ±1-day scoreboard range, image fallback chain).

**Change:** kill the 480 px phone-frame → genuinely responsive site; bottom tab bar →
responsive **top nav** (logo, horizontal nav, persistent search, live-refresh) collapsing to
a mobile nav; hash routes → App-Router routes with SSR + OG meta; mobile scroll-snap rail →
real feature grid; all ESPN fetching + engine → server.

---

## Part E — Changelog (original view → new route)

| Original (hash) | New route | Rendering |
|---|---|---|
| `#/home` | `/` | SSR + client feature grid |
| `#/next` | `/` next-event module + `/event/[id]` | SSR |
| `#/events` | `/events` | SSR list |
| `#/event/{id}/{date}` | `/event/[id]` | SSR + OG |
| `#/fighter/{id}` | `/fighter/[id]` | SSR + OG |
| `#/fight/{date}/{ev}/{comp}` | `/event/[id]/[compId]` (matchup) | SSR + OG, flagship |
| `#/ranks` | `/rankings` | SSR (live ufc.com) |
| `#/odds` | `/odds` | SSR + client refresh |
| `#/predict` | `/predict` (+ per-matchup engine on the matchup page) | SSR shell + `/api/predict` |
| install sheet | global installable PWA (manifest + prompt) | — |

Engine outputs and data freshness are unchanged by this mapping — only the transport
(server API) and the URLs (real, shareable) change.
