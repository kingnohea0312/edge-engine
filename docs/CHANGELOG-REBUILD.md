# Edge Engine — Rebuild Changelog (single-file PWA → Next.js)

The Next.js app lives in `web/`. The original single-file app (`app/index.html`)
is untouched and still works. This maps every original view to its new route and
confirms behavior is preserved.

## View → route map

| Original (hash route) | New route (App Router) | Rendering |
|---|---|---|
| `#/home` | `/` | SSR hero + feature **grid** (was a mobile scroll-snap rail) + next-event strip + upcoming preview |
| `#/next` | `/` next-event strip → `/event/[id]` | SSR |
| `#/events` | `/events` | SSR upcoming + recent results |
| `#/event/{id}/{date}` | `/event/[id]` | SSR + OG meta; segments (main/prelims/early), live moneylines per row, results when final |
| `#/fighter/{id}` | `/fighter/[id]` | SSR + OG meta; **multi-column** (hero + bio grid \| stat bars + fight history) |
| `#/fight/{date}/{ev}/{comp}` | `/event/[id]/[compId]` | SSR + OG meta; **flagship** — VS spine, prediction panel, method matrix, enlarged Veteran-Gate round viz, tale-of-the-tape comparison, driver factors |
| `#/ranks` | `/rankings` | Division tabs + ranked rows w/ portraits + champion treatment; **live from ufc.com** |
| `#/odds` | `/odds` | Responsive **table** on desktop (favorite highlight, movement arrows) → stacked cards on mobile |
| `#/predict` | `/predict` (+ per-matchup engine on the matchup page) | SSR shell + client "run" via `/api/predict` |
| install sheet | installable PWA (`app/manifest.ts` + `theme-color`) | — |

## Internal API (browser → this app only; never ESPN)

`/api/events` · `/api/event/[id]` · `/api/fighter/[id]` · `/api/odds/[evId]` ·
`/api/search` · `/api/rankings` · `/api/predict/[evId]/[compId]`

## What changed (app → website)

- **Phone frame removed.** The 480px pinned mobile frame is gone; layouts use
  desktop width and reflow to mobile.
- **Bottom tab bar → responsive top nav** (logo, horizontal links, persistent
  search, mobile burger menu).
- **Hash routing → App-Router routes** with real, shareable URLs + OpenGraph
  meta on event / fighter / matchup pages.
- **All ESPN fetching + the engine moved to the server** (Node), shared cache.
- **Rankings upgraded to live** from ufc.com server-side (no browser CORS wall),
  with the dated embedded snapshot kept as a fallback.

## What was preserved — verified

- **Engine outputs unchanged.** `predict / statsScore / roundProjection /
  aggregate / market` were ported behavior-faithfully. Runtime check on
  *Ankalaev vs Guskov*: the Next.js server returns **Guskov 60%, SOLID, stats-only,
  standard round mode, gate reason "needs 9+ UFC fights each — have 16 and 6"**,
  top path *Guskov by KO/TKO (39%)* — identical to the source app.
  - *Deliberate fidelity quirk:* the source keys the control-time nudge off
    `agg.ctrl` while the aggregate emits `ctrlPct`, so that factor no-ops. Kept
    verbatim (documented in `lib/engine/predict.ts`) so numbers match; not "fixed".
- **Data behavior unchanged.** Same TTLs, stale-on-error fallback, ±1-day
  scoreboard range (US-Eastern bucketing), and the stance→headshot→silhouette
  image fallback chain.
- **Trust mechanics elevated, not hidden:** honest win % with the visible 85%
  humility cap, the de-vigged market line + implied % + exact model nudge shown
  side by side, line-movement indicators, low-data cautions, the veteran-vs-
  standard round split with the gate reason, and "probabilities, not locks" +
  responsible-gambling language in the global footer and on the matchup page.
- **PWA installability, keyboard a11y, and `prefers-reduced-motion`** carried over.

## Verification performed

`npm run build` passes (TypeScript clean, all 17 routes). Runtime smoke test
against live ESPN/UFC data: `/api/events` (19 upcoming), `/api/rankings`
(live=true, 24 divisions), `/api/predict` (engine output matches original), and
SSR of `/`, `/event/[id]/[compId]`, `/rankings`, `/predict` all return 200 with
expected content.
