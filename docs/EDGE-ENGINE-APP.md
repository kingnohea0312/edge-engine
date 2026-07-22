# EDGE ENGINE — App Overview & Handoff

A transferable description of the application built in `app/index.html`. Pair this
with `edge-engine-PROJECT-HANDOFF.md` (the prediction engine's design philosophy and
full spec). This document covers the **app itself** — what it is, how it's built, and
how to continue it.

---

## 1. What it is

A dark, mobile-first web app for UFC fans. In one screen it shows:

- **Live event schedules** — every upcoming card with date, venue, start times, broadcast, and the full fight lineup; plus recent results.
- **Fighter profiles** — official-style full-body render, bio, career stats aggregated from real fight data, and complete UFC fight history (how each win/loss came and against whom).
- **Official rankings** — all divisions + pound-for-pound, champion and top 15, with photos; tap any fighter to open their profile.
- **Live betting odds** — real-time Las Vegas moneylines and line movement across the card.
- **Predictions** — a market-anchored engine ("Edge Engine Lite") that gives honest win / method / round probabilities, including a "Veteran Gate" exact-round call when the data supports it.

**Guiding principle** (from the engine spec): honest, calibrated probability — never
"locks." The product's whole pitch is trust: show the receipts, never overclaim.

## 2. Tech & how to run

- **One self-contained file:** `app/index.html` — HTML + CSS + vanilla JS, no build step, no dependencies, no framework.
- **Run in dev (live reload):**
  ```bash
  npx live-server app --port=8765
  ```
  then open http://localhost:8765/. Edits to `index.html` auto-refresh the browser.
- **Or just open** `app/index.html` in any modern browser.
- **Data is fetched live** from public APIs (below) and cached in `localStorage`; the app is a static file with no server of its own.

## 3. Architecture

- **Single-page app** with a hash router (`#/home`, `#/events`, `#/event/{id}/{date}`, `#/fight/{date}/{ev}/{comp}`, `#/fighter/{id}`, `#/ranks`, `#/odds`, `#/predict`). `route()` dispatches to `viewX()` functions that render into `<main id="app">`.
- **Two-tier cache** (`MEM` Map in front of `localStorage`, keys prefixed `ee:`). Hot data (the ~65 KB scoreboard, read by every view) is parsed once per session. Eviction is parse-free. `jget(url, ttl, force)` is the fetch layer; a `limiter(10)` caps concurrency.
- **App shell:** full-bleed on phones; on screens ≥700 px the whole app (header, content, bottom nav) centers into a 480 px framed "phone-app" via the `--shell` CSS variable + a fixed `#frame` element.
- **Icons:** one inline SVG sprite in `<body>` (`<use href="#i-*">`, helper `ic(name,cls)`). No emoji anywhere.
- **Accessibility:** `:focus-visible` rings; every `[onclick]` row gets `role="button"` + `tabindex` via `enhanceA11y()` after each render, with a delegated Enter/Space handler; Esc closes the install sheet; search input has `aria-label`; `color-scheme: dark`.
- **Motion:** staggered row entrances (30–50 ms/item), ease-out curves, animated bars, all gated behind `@media (prefers-reduced-motion: reduce)`.

## 4. Data sources (all fetched client-side, CORS-open)

| Need | Endpoint |
|---|---|
| Events / calendar / fight cards | `https://site.api.espn.com/apis/site/v2/sports/mma/ufc/scoreboard?dates=YYYYMMDD` (query a ±1-day range — ESPN buckets by US-Eastern date) |
| Athlete bio | `https://sports.core.api.espn.com/v2/sports/mma/athletes/{id}` |
| Athlete UFC record | `.../v2/sports/mma/leagues/ufc/athletes/{id}/records` |
| Fight history | `.../v2/sports/mma/athletes/{id}/eventlog` → per-fight competition + `/status` + `/competitors/{id}/statistics` |
| Finish method/round | competition `/status` endpoint (the scoreboard omits the method) |
| Betting odds | `.../v2/sports/mma/leagues/ufc/events/{ev}/competitions/{comp}/odds` (ESPN BET, provider id `58`; open/current/close moneylines + victory-method prices) |
| Fighter search | `https://site.web.api.espn.com/apis/search/v2?query=` (players have uid `s:3301~a:{id}`) |
| Fighter images | `https://a.espncdn.com/i/headshots/mma/players/full/{id}.png` and `.../stance/left\|right/{id}.png` (full-body render) |
| Rankings | **Embedded snapshot** of ufc.com/rankings, dated in-app (see caveats) |

Notes: `$ref` URLs from the core API sometimes come back as `http://` / `.pvt` hosts — rewrite to `https://` / `.com` (`fixRef()`). Career stats are aggregated client-side from per-fight statistics (there's no career-aggregate endpoint) and closely match official numbers.

## 5. Views / features

- **Home** — landing: logo + description, next-event live countdown, a horizontal scroll-snap **feature rail** (4 cards, each with a description + CTA, progress dots), and a "Get the app on your phone" install flow.
- **Next** — the next event's full card (reuses the event view).
- **Events** — upcoming + recent events; event detail groups bouts into Main Card / Prelims / Early Prelims with venue, broadcast, and per-segment start times. Upcoming rows show live moneylines; finished rows show winner + finish method.
- **Rankings** — division chips (P4P, each weight class, women's divisions); champion + top 15 with resolved ESPN photos; tap → profile. Includes fighter search.
- **Odds** — live moneyline board for upcoming cards, with line-movement arrows.
- **Predict** — run the engine on any bout or the whole card; each result shows pick, probability, most-likely method, and the round call.
- **Fighter profile** — full-body render, bio grid (age/height/reach/stance/team/last-5), career stat bars, full UFC fight history (tap an opponent to jump to them).
- **Matchup (fight) card** — tale of the tape, the Edge Engine read (win-probability bar, per-fighter method matrix, round projection, itemized drivers, market anchor + line movement), and — for finished fights — the actual result.

## 6. The prediction engine ("Edge Engine Lite")

Client-side implementation of the measurable-data half of the full spec:

- **Market-first:** de-vig the moneyline into a prior, then apply **bounded, itemized nudges** from stats (career record, recent form, striking volume/accuracy, takedown pace, control time, knockdown power, submission threat, durability = KO losses, age, reach, layoff, finish rate). Rate stats are **Bayesian-shrunk** toward league means for thin samples.
- **Data-quality gate:** thin UFC samples damp every nudge toward the market line and cap the confidence tier. No line posted → stats-only logistic read with a capped tier.
- **Two-layer probability:** an uncapped **Model %** (used for all math) and a **Display %** capped at 85% (presentation humility).
- **Method matrix:** uses the market's victory-method prices when posted, else stat-based KO/Sub/Decision shares; each fighter's column reconciles to their win %.
- **Round projection — the Veteran Gate:** opens only when **both** fighters have 9+ UFC bouts, neither is on a 24+ month layoff, and neither had a KO loss in their last two fights. When open, it builds finish-timing histograms (when each fighter finishes / gets finished) and commits to **one exact modal round + a distribution**, shown with a "VETERAN READ" badge and a distribution bar. Otherwise it falls back to the honest soft read ("finish likely — late" / "goes the distance") and states why the gate stayed shut.

## 7. Performance

Two-tier cache (memory + localStorage, parse-free eviction); `content-visibility: auto` on long fight lists; images are `loading="lazy"` + `decoding="async"`; backdrop-blur limited to the header/nav/sheet only. First data load measured well under the 5-second target.

## 8. Known limitations & caveats

- **Client-side only** — needs an internet connection; there's no backend.
- **Rankings are a dated manual snapshot.** UFC.com blocks cross-site browser requests, so rankings can't be swept live; they're embedded with a visible "updated" date and refreshed by editing the `EMBEDDED_RANKS` array. (ESPN's own rankings feed is years stale, so it's not usable.)
- **Odds appear during fight week** — sportsbooks post lines a few days out; before that, bouts read "not posted" and predictions run stats-only.
- **The deep-research phases** of the full engine spec (film study, fight-week intel, common-opponent film) need the LLM engine and are not computable in client-side JS.
- **Not yet mobile-hosted** — runs on `localhost` during development. To use on a phone it must be hosted (see next steps). Fighter imagery is heavy PNGs (lazy-loaded + browser-cached).

## 9. Not yet built (natural next steps)

- **Host for mobile** — publish `app/index.html` via GitHub Pages (repo already on GitHub) for a public URL + home-screen install.
- **Prediction track record** — the two-scoreboard system (predictions vs. bets), calibration/CLV, and the "receipt strip" from the spec (needs a persisted, graded log).
- **Card Recap table** and **Suggestion Parlay** modules from the spec.
- **Automated rankings refresh** helper.

## 10. Project layout & repo

```
edge-engine/
├─ app/index.html                    # the entire application
├─ README.md                         # short project readme
├─ EDGE-ENGINE-APP.md                # this document
├─ edge-engine-PROJECT-HANDOFF.md    # prediction engine spec & philosophy
├─ skills-lock.json                  # design/review skills used in development
└─ .gitignore
```

- **Git:** initialized on `main`, identity set repo-local only.
- **Remote:** https://github.com/kingnohea0312/edge-engine (pushed).

## 11. Disclaimer

Predictions are probabilistic forecasts, not guarantees — a single punch can end any
fight. If you bet, bet only what you can afford to lose. Not affiliated with, endorsed
by, or sponsored by the UFC or ESPN; all data and imagery belong to their respective
owners.
