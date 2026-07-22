# Edge Engine — UFC Forecasting

A dark, mobile-first web app for UFC fans: live event schedules and full fight
cards, fighter profiles with real career stats and complete fight history,
official divisional rankings, live Las Vegas betting lines, and a
market-anchored prediction engine that reports honest win/method/round
probabilities — never locks.

The entire app is a single self-contained file — no build step, no dependencies.

## Run it

Open `app/index.html` directly in a browser, or serve it with live reload
during development:

```bash
npx live-server app --port=8765
```

Then visit http://localhost:8765/.

## Structure

- `app/index.html` — the whole standalone application (HTML + CSS + JS in one file).
- `web/` — a Next.js rebuild of the same app (API routes, engine logic, components).
- `docs/` — project documentation:
  - `edge-engine-PROJECT-HANDOFF.md` — the prediction engine's design spec and
    product philosophy (calibration over confidence, "pick ≠ bet").
  - `EDGE-ENGINE-APP.md` — app overview / handoff notes.
  - `EDGE-ENGINE-APP-SOURCE.md` — annotated source reference.
  - `REBUILD-PLAN.md` — plan for the `web/` rebuild.
  - `CHANGELOG-REBUILD.md` — what changed during the rebuild.
- `skills-lock.json` — records the design/review skills used during development.

## Data

Fight schedules, fighter stats, results, and betting lines are fetched live
from ESPN's public MMA feeds and cached in the browser. Official rankings are an
embedded snapshot of ufc.com (dated in-app), because UFC.com blocks cross-site
requests. Fighter imagery comes from ESPN's CDN.

## Views

Home · Next event · Events · Rankings · Live odds · Predictions — a six-tab
mobile app shell that centers into a framed phone-app layout on larger screens.

## Disclaimer

Predictions are probabilistic forecasts, not guarantees — a single punch can end
any fight. If you bet, bet only what you can afford to lose. Not affiliated with,
endorsed by, or sponsored by the UFC or ESPN; all data belongs to its
respective owners.
