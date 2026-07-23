# Edge Engine — Visual Redesign · Complete Handoff (single file)

> Everything needed to port the redesign: the handoff spec, then the full HTML source of every screen. Each screen is a standalone, browser-viewable reference file. Only external dependency is the Google Fonts CDN (Saira Condensed + Archivo).

## Contents
1. Handoff specification (tokens, chrome, per-screen breakdown, interactions)
2. Source — `home.html` (Home — /)
3. Source — `matchup-v2.html` (Matchup / Prediction (FLAGSHIP, Option B) — /event/[id]/[compId])
4. Source — `event.html` (Event detail — /event/[id])
5. Source — `fighter.html` (Fighter profile — /fighter/[id])
6. Source — `rankings.html` (Rankings — /rankings)
7. Source — `odds.html` (Live Odds — /odds)
8. Source — `events.html` (Events — /events)
9. Source — `predict.html` (Predictions board — /predict)
10. Source — `predict-dev.html` (Dev cards — /predict/dev)

---

# 1. Handoff specification

# Handoff: Edge Engine — Visual Redesign

## Overview
A ground-up **visual redesign** of Edge Engine, a calibrated UFC fight-forecasting web app. Every screen, feature, and data point from the existing app is preserved; only the look and feel changes. The target aesthetic is a **premium, broadcast-grade sports-analytics product**: dark, editorial, data-dense but legible, with restrained use of crimson + championship gold.

The engine, live data, and API already work in the production app — this handoff covers **the styling/presentation layer only**. Do not rebuild data fetching or the prediction engine; re-skin the existing screens to match these references.

## About the Design Files
The files in this bundle are **design references authored in plain HTML/CSS** — prototypes showing the intended look and behavior. They are **not** production code to copy verbatim. The task is to **recreate these designs in the real app's environment** (the existing Next.js + React app under `web/`), using its established components, routing, and data. Each HTML file maps to one route/screen; port the markup structure and the exact CSS values into the app's component styling.

Because the reference files are self-contained HTML, each one repeats the same base CSS (tokens, nav, footer). In the real app, lift those shared pieces into: a global stylesheet / CSS variables for the tokens, a `TopNav` component, and a `Footer` component. Everything else is per-screen.

## Fidelity
**High-fidelity (hifi).** These are pixel-level mockups with final colors, typography, spacing, radii, and interactions. Recreate the UI faithfully using the codebase's patterns. Exact values are documented under **Design Tokens** and per component below.

---

## Global Chrome (every screen)

### Top navigation (`TopNav`)
- Sticky, `z-index:50`, background `rgba(12,10,11,.82)` with `backdrop-filter: blur(16px)`, bottom border `1px solid var(--line)`.
- Inner row: `max-width:1160px`, centered, `padding:14px 22px`, `min-height:60px`, `display:flex; align-items:center; gap:22px`.
- **Logo:** `EDGEENGINE` — Saira Condensed 700, `22px`, `letter-spacing:.06em`, uppercase. "ENGINE" is `var(--red)`.
- **Links:** Home · Events · Rankings · Odds · **Predictions**. Archivo 600, `13px`, color `var(--muted)`; hover → `var(--ink)` + `rgba(255,255,255,.04)` bg, `border-radius:7px`, `padding:8px 12px`. Active link is `var(--ink)` with a `2px` `var(--red)` underline bar (`::after`, `margin-top:5px`). "Predictions" points to `/predict` (the board); the board's own header links out to Dev cards. In the real app Predictions can be a dropdown ("Current events" / "Dev cards").
- **Search:** right-aligned (`margin-left:auto`), `min-width:210px`, surface bg, `1px solid var(--line)`, `border-radius:9px`, `padding:8px 13px`. Magnifier icon `16px`. On focus-within: border `var(--line-2)` + `box-shadow:0 0 0 3px rgba(229,20,42,.14)`. Live results with headshots (per existing app).
- **Mobile (<900px):** links + search hide; show a burger button (`40×40`, surface bg, `1px solid var(--line)`, `border-radius:9px`). Wire the existing mobile menu.

### Footer
- `max-width:1160px`, `border-top:1px solid var(--line)`, `padding:~24px`, centered, Archivo `11.5px`, color `var(--faint)`, `line-height:1.7`.
- Exact copy: *"Probabilities, not locks — a single punch can end any fight. If you bet, bet only what you can afford to lose. **21+.** Not affiliated with the UFC or ESPN."* ("21+." in `var(--muted)`.)

### Shared page shell
- `main{max-width:1160px; margin:0 auto; padding:20–34px 16–22px 60–80px}`.
- Section headers: Saira Condensed 700, uppercase, `letter-spacing:.04–.05em`, often paired with a `1px` `var(--line)` rule filling remaining width.

---

## Screens / Views

### 1. Home — `home.html` → `/`
- **Purpose:** landing / tone-setter; pitch + entry points.
- **Layout:** hero card (`border-radius:20px`, gradient `linear-gradient(150deg,#1d1015,#161215 52%,#110f11)`, red radial glow top-right). Desktop grid `1.5fr .9fr` (copy | next-event card); single column under 900px.
  - **Kicker:** Saira Condensed `13px`, `letter-spacing:.28em`, uppercase, `var(--gold)` — "CALIBRATED UFC FORECASTING".
  - **Wordmark H1:** Saira Condensed 700, `clamp(52px,10vw,104px)`, `line-height:.86`, uppercase; "ENGINE" in `var(--red)`.
  - **Lede:** Archivo `15.5px`, `line-height:1.7`, `var(--muted)`, `max-width:52ch`. Emphasized "A pick is not a bet." in `var(--ink)`.
  - **CTAs:** primary "Run the engine" (`bg var(--red)`, white, hover `var(--red-soft)`) and ghost "Browse events" (transparent, `1px var(--line-2)`). Saira Condensed 700 `15px`, uppercase, `padding:14px 22px`, `border-radius:11px`, `:active{transform:scale(.97)}`, `white-space:nowrap`.
  - **Next-event card:** `rgba(0,0,0,.32)`, `1px var(--line-2)`, `border-radius:16px`. Pulsing red dot ("NEXT EVENT · LIVE"), event name (Saira 700 `26px`), meta line, 4-cell countdown (Days/Hrs/Min/Sec, tabular), "View full card →" with arrow that slides on hover.
- **"Inside the app" grid:** 4 feature cards (1 / 2 / 4 columns at 640/980px). Each: icon tile `42×42` `border-radius:12px` (`rgba(229,20,42,.1)` red, or `rgba(216,180,90,.12)` gold for Rankings), title (Saira 700 `20px`), one-line description (Archivo `13px` muted), "Open →" link. Hover: `translateY(-3px)`, border `var(--line-2)`, bg `var(--surface-2)`.
- **"Upcoming" list:** rows with a date chip (month in `var(--red-soft)`, day Saira 700 `28px`), title + venue sub, event-type tag (FIGHT NIGHT red / PPV gold), chevron. Row hover `var(--surface-2)`.

### 2. Matchup / Prediction — **FLAGSHIP** — `matchup-v2.html` → `/event/[id]/[compId]`
**This is the canonical, chosen flagship layout ("Option B — tug-of-war").** `matchup.html` (A, broadcast dashboard) and `matchup-v3.html` (C, data terminal) are alternate explorations kept for reference — do not build those; build B.

- **Purpose:** the engine's full calibrated read for one bout.
- **Context strip:** breadcrumb "‹ Predictions", event name (`var(--ink)`), bordered pills "Light Heavyweight" / "5 Rounds" (Saira `12px`, `letter-spacing:.14em`, `1px var(--line)`, `white-space:nowrap`), date/time (tabular, muted).
- **Tug-of-war hero (`.tug`)** — the signature element:
  - Top row grid `1fr auto 1fr`: two fighter sides + center VS. Each side has a `96×120` dashed image slot (drop headshot), corner label ("RED CORNER"/"BLUE CORNER", `var(--faint)`), name (Saira 700 `clamp(26px,4.4vw,44px)`, uppercase), record + stance/country. Right side is `flex-direction:row-reverse`, right-aligned. Background `linear-gradient(100deg,#231318,#171216 42%,#141013 58%,#181013)`.
  - Center VS: Saira 800 `clamp(24px,3.5vw,34px)`, "S" in `var(--red)`; "5 Rounds" beneath in `var(--gold)`.
  - **The tug bar (`.tug-bar-wrap`):** big split numbers — loser `40` (`var(--ink)`) left, winner `60` (`#fff`) right, each Saira 700 `40px` with a small uppercase label ("Ankalaev" / "Guskov · Favored"). Below: a `20px`-tall track (`var(--surface-2)`, `1px var(--line)`, `border-radius:10px`) with a red fill `linear-gradient(90deg,var(--oxblood),var(--red))` to the win %, a faint center line at 50%, and a **gold "knot"** marker (`3px`, `var(--gold)`, glow) at the win %. Animate fill+knot from 50% → 60% on load (`1.1s cubic-bezier(.22,1,.36,1)`; respect `prefers-reduced-motion`).
  - **Verdict line:** tier badge "Pick · Guskov · Solid" (gold pill), then "Model reads **60%** · Vegas (de-vigged) **58%** · nudge **+2**" (nudge in `var(--up)`), and a right-aligned shield-icon caption "Capped at 85% by design".
  - Mobile (<640px): sides stack `a | b`, VS moves to a full-width row beneath with a top border.
- **Market anchor + Method matrix** (`.grid2`, `1fr 1fr` ≥820px):
  - **Market anchor:** 3-cell split grid (`1px var(--line)` dividers) — "Vegas (de-vigged) **58%** · Guskov −150", "Model reads **60%** · Market-anchored", "Engine nudge **▲ +2** · points vs market" (edge value in `var(--up)`). Values Saira 700 `26px`.
  - **Method matrix:** table, rows = fighters, cols = KO/TKO · Sub · Dec. Values tabular `16px`. Guskov KO/TKO **39%** is the "peak" cell (red gradient chip behind, `#fff` text); secondary highlights (`.hot`) in `var(--ink)`. Footer row: "Goes the distance **25%**" (Saira 700 `18px`).
- **Round projection** (`.round`): headline "Finish likely — **early**" (em in `var(--red)`) + a "Veteran read / Standard read" toggle (segmented, Saira `11px`; active = `var(--surface)` + shadow). Histogram: 6 equal columns R1/R2/R3/R4/R5/Dist, `height:140px`, bars grow from 0 on load. R1 **43%** is `.peak` (red gradient, white value); R2 17%, R3 15%; R4/R5 are `.empty` (dashed, "—"); Dist **25%** is `.dist` (gold-bordered, gold value). Values float above each bar (Saira 700 `14px`). Note beneath (`1px var(--line)` top): gold "Veteran read" chip + gate-reason text about R2+ confidence below display threshold.
- **Why — the drivers** (`.drivers`): ranked list, each row = direction icon tile (`26×26`, up = green `rgba(53,194,129,.12)`, down = red `rgba(255,84,112,.1)`), body (statement with gold highlight span + muted sub-line), and right-aligned "favors **X**" tag (Saira `11px`). Row hover `var(--surface-2)`, `1px var(--line)` dividers. Four drivers documented (KO path, career record, knockdown power, grappling — see copy in file).
- **Grounding bar:** green-dot "Swept 20 fights each" · "Feeds: ESPN scoreboard · ESPN core · ESPN BET odds" · right-aligned tabular stamp "As of Jul 22, 9:12 AM ET".

### 3. Event detail — `event.html` → `/event/[id]`
- **Header (`.evhead`):** gradient card, red radial glow. Type kicker (`UFC FIGHT NIGHT`, `var(--red-soft)`), big title (Saira 700 `clamp(30px,6vw,52px)`), meta row with red icons — 📅 date · 📍 venue (Etihad Arena · Abu Dhabi · UAE) · 📺 ESPN+ (icons are inline SVG, `17px`).
- **Segmented tabs:** Main Card / Prelims / Early Prelims (Saira 700 `13px`, active = `var(--surface-2)` + shadow inside a `var(--surface)` container with `5px` padding).
- **Bout rows (`.bout`):** grid `1fr 96px 1fr` — left fighter (name Saira 600 `19px` uppercase, record tabular, moneyline; favorite ML in `var(--gold)`), center (weight class, red "VS", "5 Rounds" in gold), right fighter (right-aligned). Final bouts: center shows result (`var(--up)`), winner gets a green "W" badge, loser dimmed to `var(--faint)`, VS greys out. Row hover `var(--surface-2)`.

### 4. Fighter profile — `fighter.html` → `/fighter/[id]`
- **Hero (`.fp-hero`):** grid `auto 1fr` — `150×190` dashed headshot slot + identity block: nickname (gold, `"The Trailblazer"`), name (Saira 700 `clamp(34px,6.5vw,60px)`), record (Saira 700 `24px` + "PRO RECORD" caption), weight-class chip (gold-bordered, `white-space:nowrap`) + country/stance line. Stacks to one column <560px.
- **Bio grid (`.biogrid`):** 3 cols mobile / 6 cols ≥640px, `1px var(--line)` gap on `var(--surface)` cells: Age · Height · Reach · Stance · Last 5 · Team. Values Saira 700 `19px`, keys `9.5px` `letter-spacing:.14em` faint.
- **Two columns (`.cols`, `1fr 1.1fr` ≥860px):**
  - **Career stats:** rows with label + value (Saira 700 `17px`) + a `6px` progress bar (`linear-gradient(90deg,var(--oxblood),var(--red))`; the Finish-rate row uses a gold gradient). Bars animate width from 0 on load. Stats: Sig. strikes/min, Striking accuracy, Takedowns/15min, TD accuracy, Control time, Knockdowns/15min, Finish rate.
  - **Fight history:** rows = result badge (`34×34`, W green / L red / D gold), opponent (Saira 600 `17px`) + method·round·time sub, right-aligned event + date (tabular). Row hover `var(--surface-2)`.

### 5. Rankings — `rankings.html` → `/rankings`
- **Division chip strip:** horizontal-scroll, edge fade mask, hidden scrollbar. Chips Saira 700 `13px`, `border-radius:9px`; active chip = solid `var(--red)`, white. P4P · Flyweight … Heavyweight · Women's divisions.
- **Champion card (`.champ`):** gold-tinted (`border rgba(216,180,90,.32)`, gold radial wash). `66×66` round avatar (gold ring), belt-icon label "CHAMPION · LIGHT HEAVYWEIGHT" (gold), name (Saira 700 `clamp(26px,4vw,38px)`), record + title defenses, big gold "C" badge on the right (hidden <520px).
- **Ranked list (1–15):** grid `34px 46px 1fr auto` — rank number (Saira 700 `18px` faint, tabular), `46px` round avatar, name (Saira 600 `19px`) with record sub-line, and movement indicator (▲ green / ▼ red / — faint, with count). Row hover `var(--surface-2)`. Caption below: "Official UFC rankings · live from ufc.com · movement shown vs. previous update."

### 6. Live Odds — `odds.html` → `/odds`
- **Header:** "LIVE ODDS" (Saira 700), event + date, right-aligned green-dot "ESPN BET". Caption about ESPN BET moneylines refreshed at most every 15 min, favorite highlighted gold, arrows = movement, Pending until posted. Legend row (favorite swatch, ▲ shortened / ▼ drifted, "American odds").
- **Desktop table (`table.odds`):** columns Bout / Class / Moneyline · Movement. Header row Saira `11px` on `var(--surface-2)`. Each row: bout (two names Saira 600 `18px` + records, "vs" between), weight class + rounds, then the moneyline cell = two `.ml` chips (favorite chip gold-bordered `rgba(216,180,90,.08)`, value in `var(--gold)`) with movement arrows (`▲` green / `▼` red) between/after. One bout shows a dashed "Pending — line not posted" chip.
- **Mobile (<700px):** table reflows to stacked cards (`display:block`), header hidden, moneyline chips go full-width with the fighter label above the price.

### 7. Events — `events.html` → `/events`
- Two sections, "Upcoming Events" and "Recent Results", each a card of date-chip rows (same row pattern as Home's Upcoming). Upcoming rows tagged FIGHT NIGHT / PPV; Recent rows tagged FINAL (green), month label greyed, sub = "Results available".

### 8. Predictions board — `predict.html` → `/predict`
- **Purpose:** the engine's read on the next/current card, bout by bout, plus a whole-card run.
- **Forecast hero (`.hero`):** gradient card (same wash as Home), pulsing green-dot kicker "EDGE ENGINE · CURRENT CARD FORECAST", event name (Saira 700 `clamp(30px,5.4vw,50px)`), meta line (date · venue · "market-anchored, lines posted", the "market-anchored" phrase in `var(--gold)`). A 4-stat strip (Saira 700 `30px`): Bouts read · Strong picks (gold) · Finishes projected · Confidence cap `85%` (muted). CTAs: primary "Run full card" (opens the full-card reasoning modal in production) + ghost "Full schedule".
- **Bout board (`.board`):** one `.bout` card per fight (link → the flagship matchup route). Each card:
  - **Top:** slot tags (Saira `10.5px`, `1px var(--line-2)`) — order ("Main event" / "Co-main" in gold), weight class, rounds — and a right-aligned "Run"/"View" affordance with chevron (hover → `var(--ink)` + border).
  - **Names:** Saira 700 `clamp(18px,3vw,24px)` uppercase, faint "vs".
  - **Mini tug bar (`.tug`, grid `auto 1fr auto`):** each end = name (Saira 600 `13px`; favorite in `var(--ink)`) + big % (Saira 700 `26px`; favorite `#fff`). Center `14px` track (`var(--surface-2)`, `1px var(--line)`) with a red fill toward the favorite, faint 50% mid-line, and gold knot. Fill/knot animate from 0 on load (`1s cubic-bezier(.22,1,.36,1)`, respect reduced-motion); use `.rightfav` when the favorite is on the right (fill anchors right, gradient reversed).
  - **Read row (`.bout-read`, `1px var(--line)` top):** tier chip (color-keyed — Strong green / Solid gold / Lean red / Coin-flip muted), method chip, round chip, optional gold "VET" chip, and a right-aligned Vegas anchor + nudge (`+`/`−` in up/down).
  - Entrance: cards rise/fade in staggered (`animation-delay`).
- **Other upcoming cards (`.uplist`):** date-chip rows (same pattern as Events), sub = "Lines not yet posted".

### 9. Dev cards — `predict-dev.html` → `/predict/dev`
- **Purpose:** the honest, locked-before / graded-after track record.
- **Intro:** page title "DEV CARDS" (Saira 700) + lede — picks locked before each event, scored against results, posted the day after; "locked before the event" emphasized in `var(--ink)`.
- **Aggregate record band (`.record`):** gradient card, header "TRACK RECORD" + right-aligned "N cards graded · N bouts". 3-cell split grid (Winners / Methods / Rounds): big `count/total` (Saira 700 `34px`, denominator faint), a `%` rate line (rate in `var(--up)`), and a thin red mini-bar of that rate.
- **Graded cards (`.devcard`, newest first):** for each event —
  - **Head:** event name (Saira 700), gold **"Locked"** badge with lock icon, right-aligned date (tabular).
  - **Scorecard (`table.sc`, horizontally scrollable ≥520px):** columns Fight / Our pick (name + faint %) / Result (tabular) / **W?** / **Method** / **Round**. The three grade columns render a `.mk` mark tile — `ok` = green ✓ (`rgba(53,194,129,.13)`), `no` = red ✗ (`rgba(255,84,112,.1)`). Winner, method, round graded independently (a right method on a wrong winner still scores). Row hover `var(--surface-2)`.
  - **Tallies bar:** Winners / Methods / Rounds `count/total` (Saira, count `20px`, denominator faint) on `var(--surface-2)`.
  - **Summary (`.summary-box`):** ghost "Summary" button (toggles to "Hide summary", chevron rotates) reveals a bulleted, computed recap (gold dot markers) — totals line, confident-picks (68%+) line, coin-flip-misses (<59%) line, method/round line. Height-animated expand.
- **Method note (`.method-note`):** dashed info panel — cards grade automatically once results are final, never re-run after the fact; grade columns independent; confident = 68%+, coin-flips < 59%.
- **Empty state (when no graded cards):** a single `.card` reading "No graded cards yet. The next locked card posts the day after it runs." (documented; not shown in the populated mock).
- **Data note:** the first card in the mock ("UFC OKC — Du Plessis vs. Usman") uses the app's real seed `graded` JSON verbatim; the second is illustrative. Both narrower `main` (max-width `900px`) than the other screens.

---

## Interactions & Behavior
- **Entrance animations** (all respect `@media (prefers-reduced-motion: reduce)`, which forces durations to ~0):
  - Matchup B: tug-bar fill + gold knot animate from 50% → final % on load, `1.1s cubic-bezier(.22,1,.36,1)`.
  - Fighter: career-stat bars animate width from 0 on load, `.9s cubic-bezier(.22,1,.36,1)`.
  - Matchup A: probability bar animates width from 0; Matchup C: round rows animate width from 0.
- **Hover:** list rows → `var(--surface-2)`; feature cards → lift `translateY(-3px)`; nav links → subtle bg; buttons → `:active{transform:scale(.97)}`; next-event arrow slides `translateX(4px)`.
- **Toggles/tabs** (Veteran/Standard read, event card segments, division chips): click swaps the `.on` class. In production wire these to real state.
- **Navigation:** all cards/rows link to their detail routes (rows → event/fighter, feature cards → section pages, Run → flagship prediction).
- **Responsive:** mobile-first; desktop expands via `min-width` media queries (chrome links appear ≥900px; multi-column grids at 640/820/860/980px; odds table reflows to cards <700px; hero/matchup sides restack <560–640px).

## State Management
Re-skin only — reuse the existing app's state and data layer. State the UI needs (already present in the app):
- Selected event / competition (matchup id), fighter id, division.
- Prediction payload: win %s, tier (STRONG/SOLID/LEAN), de-vigged market %, model %, nudge, method matrix, round distribution + headline + gate reason, drivers list, grounding metadata, and the 85% humility cap flag ("Display capped at 85%. Model reads X%.") shown when it applies.
- Live odds with movement deltas + pending state; rankings snapshot with movement vs. previous; countdown timer on Home.

## Design Tokens

### Colors (exact — do not alter)
```css
--bg:        #0c0a0b;  /* app background (near-black, oxblood-tinted) */
--surface:   #161315;  /* cards / panels */
--surface-2: #1d191b;  /* higher elevation (inputs, insets, active tabs) */
--line:      #2b2528;  /* hairline borders */
--line-2:    #3a3033;  /* stronger borders */
--ink:       #f4f1f2;  /* primary text */
--muted:     #a49aa0;  /* secondary text */
--faint:     #6d646a;  /* tertiary / captions */
--oxblood:   #b11226;  /* deep primary red (gradient starts) */
--red:       #e5142a;  /* bright crimson — CTAs, accents, live, focus */
--red-soft:  #ff5061;  /* hover / lighter red, links */
--gold:      #d8b45a;  /* championship / headline stats / "the number that matters" */
--up:        #35c281;  /* market/line UP, positive edge (reserved) */
--down:      #ff5470;  /* market/line DOWN, negative edge (reserved) */
```
**Usage rules:** crimson = action/brand/live; gold = championship + headline numbers; green/red (up/down) **only** for market movement and edge, never generic UI.

### Signature background wash (on `body`, `background-attachment:fixed`)
```css
background:
  radial-gradient(60% 40% at 82% -5%, rgba(177,18,38,.12), transparent 70%),
  radial-gradient(50% 40% at 8% 4%,  rgba(216,180,90,.05), transparent 70%),
  #0c0a0b;
```

### Typography
- **Display:** `"Saira Condensed"`, weights 500/600/700/800 — fighter names, VS, section headers, hero, all headline numbers. Condensed, uppercase, athletic.
- **Text/numerics:** `"Archivo"`, weights 400/500/600/700 — body, labels, all data. `font-feature-settings:"tnum" 1` globally; `.num{font-variant-numeric:tabular-nums}` on every stat, %, price, record, and date so numbers align in columns.
- Google Fonts link: `https://fonts.googleapis.com/css2?family=Saira+Condensed:wght@500;600;700;800&family=Archivo:wght@400;500;600;700&display=swap` (self-host in production if preferred).
- These evolve the original Bebas Neue + Inter pairing; keep the **condensed-display-vs-clean-text contrast** if you swap faces.

### Radius / spacing / misc
- Radii: pills/inputs `5–9px`, panels/cards `14–16px`, hero `18–20px`, bars `10px`.
- Card grid gaps `14–16px`; panel header padding `13–15px 16–18px`; row padding `~12–16px 18px`.
- Focus ring (accessibility — required): `:focus-visible{outline:2px solid var(--red); outline-offset:2px; border-radius:4px}`. Tap targets ≥ 44px. Use real semantic elements (`<table>`, `<nav>`, `<button>`, `<a>`).
- `::selection{background:rgba(229,20,42,.35)}`.

## Assets
- **Fighter headshots:** intentionally left as **dashed drop-in slots** labeled "Drop headshot". In production, wire the existing ESPN CDN source (`https://a.espncdn.com/i/headshots/mma/players/full/<id>.png`) with the app's silhouette fallback chain.
- **Icons:** all inline SVG (stroke-based, `stroke-width:1.8–2.6`), drawn in-file — search, calendar, pin, TV, trophy/belt, target, trend, chevrons, up/down arrows, shield. Replace with the app's icon set or keep as-is.
- **Flags:** emoji placeholders (🇷🇺 🇺🇿) — swap for the app's flag assets.
- No raster images or external assets are required for the styling.

## Files
Design-reference HTML in this bundle (each is a standalone, viewable file):
- `home.html` — Home `/`
- `matchup-v2.html` — **FLAGSHIP** Matchup/Prediction (Option B, tug-of-war) — build this one
- `matchup.html` — Matchup Option A (broadcast dashboard) — alternate, reference only
- `matchup-v3.html` — Matchup Option C (data terminal) — alternate, reference only
- `event.html` — Event detail `/event/[id]`
- `fighter.html` — Fighter profile `/fighter/[id]`
- `rankings.html` — Rankings `/rankings`
- `odds.html` — Live Odds `/odds`
- `events.html` — Events `/events`
- `predict.html` — Predictions board `/predict`
- `predict-dev.html` — Dev cards `/predict/dev`

Open any file in a browser to inspect exact markup, CSS, and the entrance animations. The three matchup files share a bottom-right A/B/C switcher for comparison — remove it when porting; B is the chosen design.


---

# Screen source files

## `home.html`
**Home — /**

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Edge Engine — Calibrated UFC Forecasting</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Saira+Condensed:wght@500;600;700;800&family=Archivo:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
:root{
  --bg:#0c0a0b;--surface:#161315;--surface-2:#1d191b;--line:#2b2528;--line-2:#3a3033;
  --ink:#f4f1f2;--muted:#a49aa0;--faint:#6d646a;--oxblood:#b11226;--red:#e5142a;--red-soft:#ff5061;
  --gold:#d8b45a;--up:#35c281;--down:#ff5470;
  --disp:"Saira Condensed",system-ui,sans-serif;--text:"Archivo",system-ui,sans-serif;--maxw:1160px;
}
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
html{color-scheme:dark}
body{font-family:var(--text);color:var(--ink);min-height:100vh;line-height:1.5;font-feature-settings:"tnum" 1;-webkit-font-smoothing:antialiased;
  background:radial-gradient(60% 40% at 82% -5%,rgba(177,18,38,.12),transparent 70%),radial-gradient(50% 40% at 8% 4%,rgba(216,180,90,.05),transparent 70%),var(--bg);background-attachment:fixed}
.num{font-variant-numeric:tabular-nums}
a{color:var(--red-soft);text-decoration:none}a:hover{color:var(--red)}
:focus-visible{outline:2px solid var(--red);outline-offset:2px;border-radius:4px}
::selection{background:rgba(229,20,42,.35)}
button{font-family:inherit;cursor:pointer;color:inherit}

.nav{position:sticky;top:0;z-index:50;background:rgba(12,10,11,.82);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-bottom:1px solid var(--line)}
.nav-in{max-width:var(--maxw);margin:0 auto;display:flex;align-items:center;gap:22px;padding:14px 22px;min-height:60px}
.logo{font-family:var(--disp);font-weight:700;font-size:22px;letter-spacing:.06em;text-transform:uppercase;white-space:nowrap;line-height:1}
.logo b{color:var(--red)}
.nav-links{display:none;gap:4px;margin-left:6px}
.nav-links a{color:var(--muted);font-size:13px;font-weight:600;padding:8px 12px;border-radius:7px;transition:color .16s,background .16s}
.nav-links a:hover{color:var(--ink);background:rgba(255,255,255,.04)}
.nav-links a.active{color:var(--ink)}.nav-links a.active::after{content:"";display:block;height:2px;margin-top:5px;border-radius:2px;background:var(--red)}
.search{margin-left:auto;display:none;align-items:center;gap:9px;background:var(--surface);border:1px solid var(--line);border-radius:9px;padding:8px 13px;min-width:210px;color:var(--faint);transition:border-color .16s,box-shadow .16s}
.search:focus-within{border-color:var(--line-2);box-shadow:0 0 0 3px rgba(229,20,42,.14)}
.search input{flex:1;background:none;border:none;outline:none;color:var(--ink);font-size:13.5px;font-family:inherit}
.search input::placeholder{color:var(--faint)}.search svg{width:16px;height:16px;flex:none}
.burger{margin-left:auto;width:40px;height:40px;display:flex;align-items:center;justify-content:center;border:1px solid var(--line);border-radius:9px;background:var(--surface)}
@media(min-width:900px){.nav-links{display:flex}.search{display:flex}.burger{display:none}}

main{max-width:var(--maxw);margin:0 auto;padding:24px 16px 60px}
@media(min-width:700px){main{padding:34px 22px 80px}}

/* ===== HERO ===== */
.hero{display:grid;grid-template-columns:1fr;gap:26px;align-items:center;
  border:1px solid var(--line);border-radius:20px;overflow:hidden;padding:34px 26px;
  background:linear-gradient(150deg,#1d1015 0%,#161215 52%,#110f11 100%);position:relative}
.hero::before{content:"";position:absolute;inset:0;pointer-events:none;background:radial-gradient(60% 80% at 88% -10%,rgba(177,18,38,.16),transparent 62%)}
.hero-copy{position:relative}
.kicker{font-family:var(--disp);font-size:13px;letter-spacing:.28em;text-transform:uppercase;color:var(--gold);margin-bottom:16px}
.hero h1{font-family:var(--disp);font-weight:700;font-size:clamp(52px,10vw,104px);line-height:.86;text-transform:uppercase;letter-spacing:.005em}
.hero h1 b{color:var(--red)}
.hero .lede{max-width:52ch;margin-top:20px;font-size:15.5px;line-height:1.7;color:var(--muted);text-wrap:pretty}
.hero .lede b{color:var(--ink)}
.cta{display:flex;flex-wrap:wrap;gap:12px;margin-top:26px}
.btn{display:inline-flex;align-items:center;gap:9px;font-family:var(--disp);font-weight:700;font-size:15px;letter-spacing:.06em;
  text-transform:uppercase;padding:14px 22px;border-radius:11px;border:1px solid transparent;white-space:nowrap;transition:transform .12s,background .16s,border-color .16s}
.btn:active{transform:scale(.97)}
.btn.primary{background:var(--red);color:#fff}.btn.primary:hover{background:var(--red-soft);color:#fff}
.btn.ghost{background:transparent;border-color:var(--line-2);color:var(--ink)}.btn.ghost:hover{border-color:var(--muted);background:rgba(255,255,255,.03)}
.btn svg{width:17px;height:17px}
@media(min-width:900px){.hero{grid-template-columns:1.5fr .9fr;padding:48px 44px}}

/* next event card in hero */
.nextcard{position:relative;background:rgba(0,0,0,.32);border:1px solid var(--line-2);border-radius:16px;padding:20px;
  backdrop-filter:blur(2px)}
.nextcard .top{display:flex;align-items:center;gap:9px;font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--red-soft)}
.nextcard .top .live{width:9px;height:9px;border-radius:50%;background:var(--red);box-shadow:0 0 0 0 rgba(229,20,42,.5);animation:pulse 2s infinite}
@keyframes pulse{70%{box-shadow:0 0 0 8px rgba(229,20,42,0)}100%{box-shadow:0 0 0 0 rgba(229,20,42,0)}}
.nextcard .en{font-family:var(--disp);font-weight:700;font-size:26px;line-height:1;text-transform:uppercase;margin:12px 0 4px}
.nextcard .meta{font-size:13px;color:var(--muted);font-variant-numeric:tabular-nums}
.nextcard .cd{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:16px}
.nextcard .cd .u{background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:10px 0;text-align:center}
.nextcard .cd .n{font-family:var(--disp);font-weight:700;font-size:24px;line-height:1;font-variant-numeric:tabular-nums}
.nextcard .cd .l{font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:var(--faint);margin-top:5px}
.nextcard .go{display:flex;align-items:center;gap:7px;margin-top:16px;font-family:var(--disp);font-weight:700;font-size:13px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink)}
.nextcard .go svg{width:15px;height:15px;transition:transform .16s}
.nextcard:hover .go svg{transform:translateX(4px)}

/* ===== section head ===== */
.sec-h{display:flex;align-items:baseline;gap:12px;margin:44px 2px 18px}
.sec-h h2{font-family:var(--disp);font-weight:700;font-size:22px;letter-spacing:.05em;text-transform:uppercase}
.sec-h .rule{flex:1;height:1px;background:var(--line)}
.sec-h a{font-size:12px;font-weight:600;color:var(--muted)}.sec-h a:hover{color:var(--ink)}

/* feature grid */
.features{display:grid;grid-template-columns:1fr;gap:14px}
@media(min-width:640px){.features{grid-template-columns:1fr 1fr}}
@media(min-width:980px){.features{grid-template-columns:repeat(4,1fr)}}
.fcard{display:flex;flex-direction:column;background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:22px 20px;
  transition:border-color .18s,transform .18s,background .18s}
.fcard:hover{border-color:var(--line-2);transform:translateY(-3px);background:var(--surface-2)}
.fcard .ic{width:42px;height:42px;border-radius:12px;display:flex;align-items:center;justify-content:center;background:rgba(229,20,42,.1);color:var(--red);margin-bottom:16px}
.fcard .ic svg{width:22px;height:22px}
.fcard.gold .ic{background:rgba(216,180,90,.12);color:var(--gold)}
.fcard h3{font-family:var(--disp);font-weight:700;font-size:20px;letter-spacing:.03em;text-transform:uppercase}
.fcard p{font-size:13px;color:var(--muted);line-height:1.6;margin-top:8px;flex:1;text-wrap:pretty}
.fcard .link{margin-top:16px;display:flex;align-items:center;gap:7px;font-family:var(--disp);font-weight:700;font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:var(--faint);transition:color .16s}
.fcard:hover .link{color:var(--red)}
.fcard .link svg{width:13px;height:13px}

/* upcoming list */
.uplist{border:1px solid var(--line);border-radius:16px;overflow:hidden;background:var(--surface)}
.ev{display:flex;align-items:center;gap:16px;padding:16px 18px;border-bottom:1px solid var(--line);transition:background .14s}
.ev:last-child{border-bottom:none}.ev:hover{background:var(--surface-2)}
.ev .date{flex:none;width:56px;text-align:center;border-right:1px solid var(--line);padding-right:16px}
.ev .date .m{font-family:var(--disp);font-weight:700;font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:var(--red-soft)}
.ev .date .d{font-family:var(--disp);font-weight:700;font-size:28px;line-height:1;font-variant-numeric:tabular-nums}
.ev .info{flex:1;min-width:0}
.ev .info .t{font-weight:600;font-size:15px;line-height:1.3}
.ev .info .s{font-size:12.5px;color:var(--muted);margin-top:3px;font-variant-numeric:tabular-nums}
.ev .tag{font-family:var(--disp);font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;padding:3px 9px 2px;border-radius:5px;flex:none}
.ev .tag.ppv{background:rgba(216,180,90,.12);color:var(--gold);border:1px solid rgba(216,180,90,.28)}
.ev .tag.fn{background:rgba(229,20,42,.1);color:var(--red-soft);border:1px solid rgba(229,20,42,.25)}
.ev .chev{color:var(--faint)}
@media(max-width:520px){.ev .tag{display:none}}

footer{max-width:var(--maxw);margin:48px auto 0;padding:24px 22px;border-top:1px solid var(--line);font-size:11.5px;color:var(--faint);line-height:1.7;text-align:center}
footer b{color:var(--muted)}
</style>
</head>
<body>

<header class="nav">
  <div class="nav-in">
    <div class="logo">EDGE<b>ENGINE</b></div>
    <nav class="nav-links"><a href="#" class="active">Home</a><a href="events.html">Events</a><a href="rankings.html">Rankings</a><a href="odds.html">Odds</a><a href="predict.html">Predictions</a></nav>
    <label class="search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.5-4.5"/></svg><input type="text" placeholder="Search fighters…" aria-label="Search fighters"></label>
    <button class="burger" aria-label="Menu"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>
  </div>
</header>

<main>
  <!-- HERO -->
  <section class="hero">
    <div class="hero-copy">
      <div class="kicker">Calibrated UFC Forecasting</div>
      <h1>EDGE<br><b>ENGINE</b></h1>
      <p class="lede">Honest win, method, and round probabilities — anchored to the Vegas market, never sold as locks. <b>A pick is not a bet.</b> Every read is calibrated, capped at 85% confidence, and shows its work.</p>
      <div class="cta">
        <a class="btn primary" href="matchup.html"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="3.5"/></svg> Run the engine</a>
        <a class="btn ghost" href="events.html"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M3 10h18M8 3v4M16 3v4"/></svg> Browse events</a>
      </div>
    </div>
    <a class="nextcard" href="event.html">
      <div class="top"><span class="live"></span> Next event · Live</div>
      <div class="en">Ankalaev vs. Guskov</div>
      <div class="meta">UFC Fight Night · Sat, Jul 25, 2026 · 12:00 PM ET</div>
      <div class="cd">
        <div class="u"><div class="n num">02</div><div class="l">Days</div></div>
        <div class="u"><div class="n num">18</div><div class="l">Hrs</div></div>
        <div class="u"><div class="n num">42</div><div class="l">Min</div></div>
        <div class="u"><div class="n num">09</div><div class="l">Sec</div></div>
      </div>
      <div class="go">View full card <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></div>
    </a>
  </section>

  <!-- INSIDE THE APP -->
  <div class="sec-h"><h2>Inside the app</h2><span class="rule"></span></div>
  <section class="features">
    <a class="fcard" href="events.html">
      <div class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M3 10h18M8 3v4M16 3v4"/></svg></div>
      <h3>Events</h3><p>Full fight cards, main to early prelims, with live schedules and results.</p>
      <span class="link">Open <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>
    </a>
    <a class="fcard gold" href="rankings.html">
      <div class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4h10v5.5a5 5 0 0 1-10 0Z"/><path d="M12 14.5V18M8.5 21h7"/></svg></div>
      <h3>Rankings</h3><p>Official divisional rankings and pound-for-pound, live from ufc.com.</p>
      <span class="link">Open <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>
    </a>
    <a class="fcard" href="odds.html">
      <div class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17.5 9 11.5l4 4L21 7"/><path d="M15.5 7H21v5.5"/></svg></div>
      <h3>Live Odds</h3><p>ESPN BET moneylines with favorite highlights and line-movement arrows.</p>
      <span class="link">Open <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>
    </a>
    <a class="fcard" href="predict.html">
      <div class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.6"/><circle cx="12" cy="12" r="1" fill="currentColor"/></svg></div>
      <h3>Predictions</h3><p>The engine's calibrated read: pick, market anchor, method matrix, round call.</p>
      <span class="link">Open <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>
    </a>
  </section>

  <!-- UPCOMING -->
  <div class="sec-h"><h2>Upcoming</h2><span class="rule"></span><a href="events.html">All events</a></div>
  <section class="uplist">
    <a class="ev" href="event.html">
      <div class="date"><div class="m">Jul</div><div class="d num">25</div></div>
      <div class="info"><div class="t">UFC Fight Night: Ankalaev vs. Guskov</div><div class="s">Sat · 12:00 PM ET · Etihad Arena, Abu Dhabi</div></div>
      <span class="tag fn">Fight Night</span>
      <svg class="chev" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>
    </a>
    <a class="ev" href="event.html">
      <div class="date"><div class="m">Aug</div><div class="d num">01</div></div>
      <div class="info"><div class="t">UFC 320: Pereira vs. Ankalaev 2</div><div class="s">Sat · 10:00 PM ET · T-Mobile Arena, Las Vegas</div></div>
      <span class="tag ppv">PPV</span>
      <svg class="chev" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>
    </a>
    <a class="ev" href="event.html">
      <div class="date"><div class="m">Aug</div><div class="d num">08</div></div>
      <div class="info"><div class="t">UFC Fight Night: Dolidze vs. Hernandez</div><div class="s">Sat · 7:00 PM ET · UFC APEX, Las Vegas</div></div>
      <span class="tag fn">Fight Night</span>
      <svg class="chev" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>
    </a>
    <a class="ev" href="event.html">
      <div class="date"><div class="m">Aug</div><div class="d num">15</div></div>
      <div class="info"><div class="t">UFC Fight Night: Whittaker vs. de Ridder</div><div class="s">Sat · 1:00 PM ET · Etihad Arena, Abu Dhabi</div></div>
      <span class="tag fn">Fight Night</span>
      <svg class="chev" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>
    </a>
  </section>
</main>

<footer>Probabilities, not locks — a single punch can end any fight. If you bet, bet only what you can afford to lose. <b>21+.</b> Not affiliated with the UFC or ESPN.</footer>
</body>
</html>

```

---

## `matchup-v2.html`
**Matchup / Prediction (FLAGSHIP, Option B) — /event/[id]/[compId]**

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Edge Engine — Matchup v2 · Ankalaev vs. Guskov</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Saira+Condensed:wght@500;600;700;800&family=Archivo:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
:root{
  --bg:#0c0a0b; --surface:#161315; --surface-2:#1d191b;
  --line:#2b2528; --line-2:#3a3033;
  --ink:#f4f1f2; --muted:#a49aa0; --faint:#6d646a;
  --oxblood:#b11226; --red:#e5142a; --red-soft:#ff5061;
  --gold:#d8b45a; --up:#35c281; --down:#ff5470;
  --disp:"Saira Condensed",system-ui,sans-serif;
  --text:"Archivo",system-ui,sans-serif;
  --maxw:1160px;
}
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
html{color-scheme:dark}
body{font-family:var(--text);color:var(--ink);min-height:100vh;line-height:1.5;
  font-feature-settings:"tnum" 1;-webkit-font-smoothing:antialiased;
  background:radial-gradient(60% 40% at 82% -5%,rgba(177,18,38,.12),transparent 70%),
    radial-gradient(50% 40% at 8% 4%,rgba(216,180,90,.05),transparent 70%),var(--bg);
  background-attachment:fixed}
.num{font-variant-numeric:tabular-nums}
a{color:var(--red-soft);text-decoration:none}a:hover{color:var(--red)}
:focus-visible{outline:2px solid var(--red);outline-offset:2px;border-radius:4px}
::selection{background:rgba(229,20,42,.35)}
button{font-family:inherit;cursor:pointer;color:inherit}

.nav{position:sticky;top:0;z-index:50;background:rgba(12,10,11,.82);
  backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-bottom:1px solid var(--line)}
.nav-in{max-width:var(--maxw);margin:0 auto;display:flex;align-items:center;gap:22px;padding:14px 22px;min-height:60px}
.logo{font-family:var(--disp);font-weight:700;font-size:22px;letter-spacing:.06em;text-transform:uppercase;white-space:nowrap;line-height:1}
.logo b{color:var(--red)}
.nav-links{display:none;gap:4px;margin-left:6px}
.nav-links a{color:var(--muted);font-size:13px;font-weight:600;padding:8px 12px;border-radius:7px;transition:color .16s,background .16s}
.nav-links a:hover{color:var(--ink);background:rgba(255,255,255,.04)}
.nav-links a.active{color:var(--ink)}
.nav-links a.active::after{content:"";display:block;height:2px;margin-top:5px;border-radius:2px;background:var(--red)}
.search{margin-left:auto;display:none;align-items:center;gap:9px;background:var(--surface);border:1px solid var(--line);
  border-radius:9px;padding:8px 13px;min-width:210px;color:var(--faint);transition:border-color .16s,box-shadow .16s}
.search:focus-within{border-color:var(--line-2);box-shadow:0 0 0 3px rgba(229,20,42,.14)}
.search input{flex:1;background:none;border:none;outline:none;color:var(--ink);font-size:13.5px;font-family:inherit}
.search input::placeholder{color:var(--faint)}
.search svg{width:16px;height:16px;flex:none}
.burger{margin-left:auto;width:40px;height:40px;display:flex;align-items:center;justify-content:center;border:1px solid var(--line);border-radius:9px;background:var(--surface)}
@media(min-width:900px){.nav-links{display:flex}.search{display:flex}.burger{display:none}}

main{max-width:var(--maxw);margin:0 auto;padding:20px 16px 60px}
@media(min-width:700px){main{padding:26px 22px 72px}}
.ctx{display:flex;flex-wrap:wrap;align-items:center;gap:10px 14px;font-size:12px;color:var(--muted);margin-bottom:20px}
.ctx .back{display:inline-flex;align-items:center;gap:6px;color:var(--muted);font-weight:600}
.ctx .back:hover{color:var(--ink)}
.ctx .sep{color:var(--line-2)}.ctx .ev{color:var(--ink);font-weight:600}
.ctx .tag{font-family:var(--disp);font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);border:1px solid var(--line);border-radius:5px;padding:2px 8px 1px;white-space:nowrap}

/* ===== TUG-OF-WAR HERO ===== */
.tug{position:relative;border:1px solid var(--line);border-radius:16px;overflow:hidden;background:var(--surface)}
.tug-top{position:relative;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;
  background:linear-gradient(100deg,#231318 0%,#171216 42%,#141013 58%,#181013 100%)}
.tug-side{display:flex;align-items:center;gap:16px;padding:26px 22px}
.tug-side.b{flex-direction:row-reverse;text-align:right}
.tug-slot{position:relative;width:96px;height:120px;flex:none;border-radius:11px;overflow:hidden;
  background:repeating-linear-gradient(135deg,rgba(255,255,255,.02) 0 9px,transparent 9px 18px),linear-gradient(180deg,#211519,#141013);
  border:1px dashed var(--line-2);display:flex;align-items:flex-end;justify-content:center}
.tug-slot svg{width:64%;opacity:.5;margin-bottom:-2px;color:var(--faint)}
.tug-slot .drop{position:absolute;top:8px;left:0;right:0;text-align:center;font-size:8px;letter-spacing:.12em;text-transform:uppercase;color:var(--faint);font-weight:600}
.tug-name{min-width:0}
.tug-name .cor{font-family:var(--disp);font-size:10.5px;letter-spacing:.18em;text-transform:uppercase;color:var(--faint)}
.tug-name .nm{font-family:var(--disp);font-weight:700;font-size:clamp(26px,4.4vw,44px);line-height:.92;text-transform:uppercase;margin:5px 0}
.tug-name .rec{font-size:14px;font-weight:600;color:var(--muted)}
.tug-name .rec .wc{color:var(--faint);font-size:11px;letter-spacing:.1em;text-transform:uppercase;margin-left:6px}
.tug-vs{padding:0 8px;text-align:center}
.tug-vs .vs{font-family:var(--disp);font-weight:800;font-size:clamp(24px,3.5vw,34px);color:var(--ink);line-height:1}
.tug-vs .vs b{color:var(--red)}
.tug-vs .rd{font-family:var(--disp);font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--gold);margin-top:4px}

/* the tug bar */
.tug-bar-wrap{padding:20px 22px 22px;border-top:1px solid var(--line)}
.tug-scale{display:flex;justify-content:space-between;font-family:var(--disp);font-weight:700;text-transform:uppercase;
  letter-spacing:.02em;color:var(--muted);align-items:flex-end;margin-bottom:10px}
.tug-scale .pct{font-size:40px;line-height:.8;color:var(--ink)}
.tug-scale .win{font-size:40px;line-height:.8;color:#fff}
.tug-scale .lbl{font-size:12px;color:var(--faint);display:block;margin-top:6px;letter-spacing:.14em}
.tug-track{position:relative;height:20px;border-radius:10px;background:var(--surface-2);border:1px solid var(--line);overflow:hidden}
.tug-track .fill{position:absolute;left:0;top:0;bottom:0;width:60%;background:linear-gradient(90deg,var(--oxblood),var(--red));transition:width 1.1s cubic-bezier(.22,1,.36,1)}
.tug-track .knot{position:absolute;top:-5px;bottom:-5px;left:60%;width:3px;background:var(--gold);transform:translateX(-50%);box-shadow:0 0 12px rgba(216,180,90,.6);transition:left 1.1s cubic-bezier(.22,1,.36,1)}
.tug-mid{position:absolute;left:50%;top:0;bottom:0;width:1px;background:rgba(244,241,242,.14)}
.tug-verdict{display:flex;flex-wrap:wrap;align-items:center;gap:12px;margin-top:16px}
.tier{font-family:var(--disp);font-size:14px;letter-spacing:.12em;text-transform:uppercase;font-weight:700;
  padding:5px 13px 4px;border-radius:6px;display:inline-flex;align-items:center;gap:8px}
.tier.solid{background:rgba(216,180,90,.12);color:var(--gold);border:1px solid rgba(216,180,90,.3)}
.tug-verdict .say{font-size:13.5px;color:var(--muted)}
.tug-verdict .say b{color:var(--ink)}
.tug-verdict .cap{margin-left:auto;font-size:11.5px;color:var(--faint);display:inline-flex;align-items:center;gap:7px}
.tug-verdict .cap svg{width:14px;height:14px;color:var(--gold)}
@media(max-width:640px){
  .tug-top{grid-template-columns:1fr 1fr;grid-template-areas:"a b" "vs vs"}
  .tug-side{grid-area:a;padding:18px 14px}.tug-side.b{grid-area:b}
  .tug-vs{grid-area:vs;padding:12px;border-top:1px solid var(--line);display:flex;justify-content:center;gap:14px;align-items:center}
  .tug-slot{width:74px;height:92px}
  .tug-name .nm{font-size:26px}
  .tug-scale .pct,.tug-scale .win{font-size:30px}
  .tug-verdict .cap{margin-left:0}
}

/* ===== shared panels ===== */
.grid2{display:grid;gap:16px;margin-top:16px;grid-template-columns:1fr}
@media(min-width:820px){.grid2{grid-template-columns:1fr 1fr}}
.panel{background:var(--surface);border:1px solid var(--line);border-radius:14px;overflow:hidden}
.panel-h{display:flex;align-items:center;gap:9px;padding:15px 18px;border-bottom:1px solid var(--line)}
.panel-h .k{font-family:var(--disp);font-size:13px;letter-spacing:.16em;text-transform:uppercase;color:var(--ink)}
.panel-h .r{margin-left:auto;font-size:11px;color:var(--faint);font-variant-numeric:tabular-nums}

/* market anchor inline */
.market{display:grid;grid-template-columns:1fr 1fr 1fr;gap:1px;background:var(--line)}
.market .m{background:var(--surface);padding:16px 18px}
.market .m .k{font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--faint);font-weight:600}
.market .m .v{font-family:var(--disp);font-weight:700;font-size:26px;margin-top:6px}
.market .m .s{font-size:11.5px;color:var(--muted);margin-top:3px}
.market .m.edge .v{color:var(--up)}

/* method matrix */
.matrix{padding:16px 18px 18px}
table.mtx{width:100%;border-collapse:collapse}
table.mtx th,table.mtx td{padding:11px 8px;text-align:center;font-variant-numeric:tabular-nums}
table.mtx thead th{font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--faint);font-weight:700;border-bottom:1px solid var(--line)}
table.mtx tbody th{text-align:left;font-family:var(--disp);font-weight:600;font-size:16px;text-transform:uppercase;color:var(--ink);white-space:nowrap}
table.mtx td{font-size:16px;font-weight:600;color:var(--muted);border-bottom:1px solid var(--line)}
table.mtx td.hot{color:var(--ink)}
table.mtx td.peak{color:#fff;position:relative}
table.mtx td.peak::before{content:"";position:absolute;inset:5px 3px;border-radius:6px;background:linear-gradient(135deg,rgba(177,18,38,.35),rgba(229,20,42,.22));z-index:-1;border:1px solid rgba(229,20,42,.4)}
table.mtx tbody tr:last-child td,table.mtx tbody tr:last-child th{border-bottom:none}
.mtx-foot{margin-top:12px;display:flex;align-items:center;justify-content:space-between;padding-top:12px;border-top:1px solid var(--line);font-size:12.5px;color:var(--muted)}
.mtx-foot b{font-family:var(--disp);font-weight:700;font-size:18px;color:var(--ink)}

/* round */
.round{padding:16px 18px 18px}
.round-head{display:flex;align-items:center;gap:12px;margin-bottom:16px}
.round-head .call{font-family:var(--disp);font-weight:700;font-size:19px;letter-spacing:.03em;text-transform:uppercase}
.round-head .call .em{color:var(--red)}
.round-head .toggle{margin-left:auto;display:flex;background:var(--surface-2);border:1px solid var(--line);border-radius:8px;padding:3px}
.round-head .toggle button{border:none;background:none;font-family:var(--disp);font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);padding:6px 11px;border-radius:6px;font-weight:600}
.round-head .toggle button.on{background:var(--surface);color:var(--ink);box-shadow:0 1px 3px rgba(0,0,0,.4)}
.histo{display:grid;grid-template-columns:repeat(6,1fr);gap:8px;align-items:end;height:140px}
.hbar{display:flex;flex-direction:column;justify-content:flex-end;align-items:center;height:100%;gap:7px}
.hbar .fill{width:100%;border-radius:6px 6px 3px 3px;background:linear-gradient(180deg,#3a2126,#251519);border:1px solid var(--line-2);transition:height 1s cubic-bezier(.22,1,.36,1);display:flex;align-items:flex-start;justify-content:center}
.hbar .fill .v{font-family:var(--disp);font-weight:700;font-size:14px;margin-top:-21px;color:var(--muted)}
.hbar.peak .fill{background:linear-gradient(180deg,var(--red),var(--oxblood));border-color:var(--red)}
.hbar.peak .fill .v{color:#fff}
.hbar.dist .fill{background:linear-gradient(180deg,#2a2620,#1d1a15);border-color:rgba(216,180,90,.35)}
.hbar.dist .fill .v{color:var(--gold)}
.hbar.empty .fill{background:transparent;border-style:dashed}
.hbar.empty .fill .v{color:var(--faint)}
.hbar .lb{font-family:var(--disp);font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--faint);font-weight:600}
.round-note{margin-top:14px;padding-top:13px;border-top:1px solid var(--line);font-size:12.5px;color:var(--muted);line-height:1.6}
.round-note .vet{font-family:var(--disp);font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--gold);border:1px solid rgba(216,180,90,.3);border-radius:4px;padding:1px 6px;font-weight:700}

/* drivers */
.drivers{padding:6px 6px 10px}
.dr{display:grid;grid-template-columns:26px 1fr auto;align-items:start;gap:12px;padding:13px 12px;border-radius:10px;transition:background .16s}
.dr:hover{background:var(--surface-2)}.dr+.dr{border-top:1px solid var(--line)}
.dr .dir{width:26px;height:26px;border-radius:7px;display:flex;align-items:center;justify-content:center}
.dr .dir.up{background:rgba(53,194,129,.12);color:var(--up)}
.dr .dir.dn{background:rgba(255,84,112,.1);color:var(--down)}
.dr .dir svg{width:14px;height:14px}
.dr .body{min-width:0}
.dr .body .t{font-size:14px;font-weight:600;line-height:1.4;color:var(--ink)}
.dr .body .t .hl{color:var(--gold)}
.dr .body .sub{font-size:12px;color:var(--muted);margin-top:3px}
.dr .fav{font-family:var(--disp);font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--faint);font-weight:700;white-space:nowrap;padding-top:2px}
.dr .fav b{color:var(--ink)}

.ground{margin-top:16px;display:flex;flex-wrap:wrap;align-items:center;gap:8px 16px;padding:14px 18px;border:1px solid var(--line);border-radius:12px;background:var(--surface);font-size:12px;color:var(--faint)}
.ground .feed{display:inline-flex;align-items:center;gap:7px;color:var(--muted)}
.ground .feed .d{width:6px;height:6px;border-radius:50%;background:var(--up)}
.ground .stamp{margin-left:auto;font-variant-numeric:tabular-nums}
footer{max-width:var(--maxw);margin:34px auto 0;padding:22px;border-top:1px solid var(--line);font-size:11.5px;color:var(--faint);line-height:1.7;text-align:center}
footer b{color:var(--muted)}

/* variation switcher */
.vswitch{position:fixed;right:16px;bottom:16px;z-index:80;display:flex;gap:4px;padding:5px;border-radius:11px;
  background:rgba(29,25,27,.9);backdrop-filter:blur(12px);border:1px solid var(--line-2);box-shadow:0 8px 30px rgba(0,0,0,.5)}
.vswitch a{font-family:var(--disp);font-size:12px;letter-spacing:.1em;text-transform:uppercase;font-weight:700;
  color:var(--muted);padding:8px 12px;border-radius:7px}
.vswitch a:hover{color:var(--ink);background:rgba(255,255,255,.05)}
.vswitch a.on{background:var(--red);color:#fff}
</style>
</head>
<body>

<header class="nav">
  <div class="nav-in">
    <div class="logo">EDGE<b>ENGINE</b></div>
    <nav class="nav-links"><a href="#">Home</a><a href="#">Events</a><a href="#">Rankings</a><a href="#">Odds</a><a href="#" class="active">Predictions</a></nav>
    <label class="search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.5-4.5"/></svg><input type="text" placeholder="Search fighters…" aria-label="Search fighters"></label>
    <button class="burger" aria-label="Menu"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>
  </div>
</header>

<main>
  <div class="ctx">
    <a class="back" href="#"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg> Predictions</a>
    <span class="sep">/</span><span class="ev">UFC Fight Night: Ankalaev vs. Guskov</span>
    <span class="tag">Light Heavyweight</span><span class="tag">5 Rounds</span>
    <span class="num" style="color:var(--muted)">Sat, Jul 25 · 12:00 PM ET</span>
  </div>

  <!-- TUG OF WAR HERO -->
  <section class="tug" aria-label="Matchup and win probability">
    <div class="tug-top">
      <div class="tug-side a">
        <div class="tug-slot"><span class="drop">Drop</span><svg viewBox="0 0 100 120" fill="currentColor"><circle cx="50" cy="38" r="20"/><path d="M12 120c3-30 18-44 38-44s35 14 38 44z"/></svg></div>
        <div class="tug-name"><div class="cor">Red Corner</div><div class="nm">Magomed<br>Ankalaev</div><div class="rec num">21–2–1 <span class="wc">Southpaw · RUS</span></div></div>
      </div>
      <div class="tug-vs"><div class="vs">V<b>S</b></div><div class="rd">5 Rounds</div></div>
      <div class="tug-side b">
        <div class="tug-slot"><span class="drop">Drop</span><svg viewBox="0 0 100 120" fill="currentColor"><circle cx="50" cy="38" r="20"/><path d="M12 120c3-30 18-44 38-44s35 14 38 44z"/></svg></div>
        <div class="tug-name"><div class="cor">Blue Corner</div><div class="nm">Bogdan<br>Guskov</div><div class="rec num">18–3–1 <span class="wc">Orthodox · UZB</span></div></div>
      </div>
    </div>

    <div class="tug-bar-wrap">
      <div class="tug-scale">
        <div><span class="pct num">40</span><span class="lbl">Ankalaev</span></div>
        <div style="text-align:right"><span class="win num">60</span><span class="lbl">Guskov · Favored</span></div>
      </div>
      <div class="tug-track"><div class="fill" style="width:60%"></div><div class="tug-mid"></div><div class="knot" style="left:60%"></div></div>
      <div class="tug-verdict">
        <span class="tier solid">Pick · Guskov · Solid</span>
        <span class="say">Model reads <b class="num">60%</b> · Vegas (de-vigged) <b class="num">58%</b> · nudge <b style="color:var(--up)">+2</b></span>
        <span class="cap"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/></svg> Capped at 85% by design</span>
      </div>
    </div>
  </section>

  <!-- MARKET + METHOD -->
  <div class="grid2">
    <section class="panel">
      <div class="panel-h"><span class="k">Market anchor</span></div>
      <div class="market">
        <div class="m"><div class="k">Vegas (de-vigged)</div><div class="v num">58%</div><div class="s">Guskov −150</div></div>
        <div class="m"><div class="k">Model reads</div><div class="v num">60%</div><div class="s">Market-anchored</div></div>
        <div class="m edge"><div class="k">Engine nudge</div><div class="v num">▲ +2</div><div class="s">points vs market</div></div>
      </div>
    </section>
    <section class="panel">
      <div class="panel-h"><span class="k">How it likely ends</span></div>
      <div class="matrix">
        <table class="mtx">
          <thead><tr><th style="text-align:left"></th><th>KO / TKO</th><th>Sub</th><th>Dec</th></tr></thead>
          <tbody>
            <tr><th>Guskov</th><td class="peak num">39%</td><td class="num">4%</td><td class="hot num">17%</td></tr>
            <tr><th>Ankalaev</th><td class="hot num">20%</td><td class="num">12%</td><td class="num">8%</td></tr>
          </tbody>
        </table>
        <div class="mtx-foot"><span>Goes the distance</span><b class="num">25%</b></div>
      </div>
    </section>
  </div>

  <!-- ROUND -->
  <section class="panel" style="margin-top:16px">
    <div class="panel-h"><span class="k">Round projection</span></div>
    <div class="round">
      <div class="round-head">
        <div class="call">Finish likely — <span class="em">early</span></div>
        <div class="toggle" role="group" aria-label="Read model"><button class="on">Veteran read</button><button>Standard read</button></div>
      </div>
      <div class="histo">
        <div class="hbar peak"><div class="fill" style="height:100%"><span class="v num">43%</span></div><span class="lb">R1</span></div>
        <div class="hbar"><div class="fill" style="height:40%"><span class="v num">17%</span></div><span class="lb">R2</span></div>
        <div class="hbar"><div class="fill" style="height:35%"><span class="v num">15%</span></div><span class="lb">R3</span></div>
        <div class="hbar empty"><div class="fill" style="height:8%"><span class="v">—</span></div><span class="lb">R4</span></div>
        <div class="hbar empty"><div class="fill" style="height:8%"><span class="v">—</span></div><span class="lb">R5</span></div>
        <div class="hbar dist"><div class="fill" style="height:58%"><span class="v num">25%</span></div><span class="lb">Dist</span></div>
      </div>
      <div class="round-note"><span class="vet">Veteran read</span> weights championship-round conditioning. Exact round beyond R1 is withheld — model confidence for R2+ sits below the display threshold.</div>
    </div>
  </section>

  <!-- DRIVERS -->
  <section class="panel" style="margin-top:16px">
    <div class="panel-h"><span class="k">Why — the drivers</span></div>
    <div class="drivers">
      <div class="dr"><span class="dir up"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 15l6-6 6 6"/></svg></span><div class="body"><div class="t">Most likely path: <span class="hl">Guskov by KO/TKO (39%)</span>. 75% chance of a finish.</div><div class="sub">Highest single-outcome probability on the board.</div></div><div class="fav">favors <b>Guskov</b></div></div>
      <div class="dr"><span class="dir dn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg></span><div class="body"><div class="t">Career record: <span class="num">21–2–1</span> vs <span class="num">18–3–1</span></div><div class="sub">Deeper elite-level résumé and title experience.</div></div><div class="fav">favors <b>Ankalaev</b></div></div>
      <div class="dr"><span class="dir up"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 15l6-6 6 6"/></svg></span><div class="body"><div class="t">Knockdown power: <span class="num">0.47</span> vs <span class="num">1.38</span> <span style="color:var(--faint)">/15min</span></div><div class="sub">Nearly 3× the knockdown rate — the swing factor.</div></div><div class="fav">favors <b>Guskov</b></div></div>
      <div class="dr"><span class="dir dn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg></span><div class="body"><div class="t">Grappling: <span class="num">1.9</span> vs <span class="num">0.4</span> takedowns <span style="color:var(--faint)">/15min</span></div><div class="sub">Path to control time and neutralize the power.</div></div><div class="fav">favors <b>Ankalaev</b></div></div>
    </div>
  </section>

  <div class="ground">
    <span class="feed"><span class="d"></span> Swept 20 fights each</span>
    <span class="feed">Feeds: ESPN scoreboard · ESPN core · ESPN BET odds</span>
    <span class="stamp">As of Jul 22, 9:12 AM ET</span>
  </div>
</main>

<footer>Probabilities, not locks — a single punch can end any fight. If you bet, bet only what you can afford to lose. <b>21+.</b> Not affiliated with the UFC or ESPN.</footer>

<div class="vswitch" role="group" aria-label="Layout variation">
  <a href="matchup.html">A</a><a href="matchup-v2.html" class="on">B</a><a href="matchup-v3.html">C</a>
</div>

<script>
window.addEventListener("load",()=>{
  if(matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const f=document.querySelector(".tug-track .fill"),k=document.querySelector(".tug-track .knot");
  f.style.width="50%";k.style.left="50%";
  requestAnimationFrame(()=>requestAnimationFrame(()=>{f.style.width="60%";k.style.left="60%";}));
});
document.querySelectorAll(".toggle button").forEach(b=>b.addEventListener("click",()=>{
  b.parentElement.querySelectorAll("button").forEach(x=>x.classList.remove("on"));b.classList.add("on");
}));
</script>
</body>
</html>

```

---

## `event.html`
**Event detail — /event/[id]**

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Edge Engine — UFC Fight Night: Ankalaev vs. Guskov</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Saira+Condensed:wght@500;600;700;800&family=Archivo:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
:root{
  --bg:#0c0a0b;--surface:#161315;--surface-2:#1d191b;--line:#2b2528;--line-2:#3a3033;
  --ink:#f4f1f2;--muted:#a49aa0;--faint:#6d646a;--oxblood:#b11226;--red:#e5142a;--red-soft:#ff5061;
  --gold:#d8b45a;--up:#35c281;--down:#ff5470;
  --disp:"Saira Condensed",system-ui,sans-serif;--text:"Archivo",system-ui,sans-serif;--maxw:1160px;
}
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
html{color-scheme:dark}
body{font-family:var(--text);color:var(--ink);min-height:100vh;line-height:1.5;font-feature-settings:"tnum" 1;-webkit-font-smoothing:antialiased;
  background:radial-gradient(60% 40% at 82% -5%,rgba(177,18,38,.12),transparent 70%),radial-gradient(50% 40% at 8% 4%,rgba(216,180,90,.05),transparent 70%),var(--bg);background-attachment:fixed}
.num{font-variant-numeric:tabular-nums}
a{color:var(--red-soft);text-decoration:none}a:hover{color:var(--red)}
:focus-visible{outline:2px solid var(--red);outline-offset:2px;border-radius:4px}
::selection{background:rgba(229,20,42,.35)}
button{font-family:inherit;cursor:pointer;color:inherit}

.nav{position:sticky;top:0;z-index:50;background:rgba(12,10,11,.82);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-bottom:1px solid var(--line)}
.nav-in{max-width:var(--maxw);margin:0 auto;display:flex;align-items:center;gap:22px;padding:14px 22px;min-height:60px}
.logo{font-family:var(--disp);font-weight:700;font-size:22px;letter-spacing:.06em;text-transform:uppercase;white-space:nowrap;line-height:1}
.logo b{color:var(--red)}
.nav-links{display:none;gap:4px;margin-left:6px}
.nav-links a{color:var(--muted);font-size:13px;font-weight:600;padding:8px 12px;border-radius:7px;transition:color .16s,background .16s}
.nav-links a:hover{color:var(--ink);background:rgba(255,255,255,.04)}
.nav-links a.active{color:var(--ink)}.nav-links a.active::after{content:"";display:block;height:2px;margin-top:5px;border-radius:2px;background:var(--red)}
.search{margin-left:auto;display:none;align-items:center;gap:9px;background:var(--surface);border:1px solid var(--line);border-radius:9px;padding:8px 13px;min-width:210px;color:var(--faint);transition:border-color .16s,box-shadow .16s}
.search:focus-within{border-color:var(--line-2);box-shadow:0 0 0 3px rgba(229,20,42,.14)}
.search input{flex:1;background:none;border:none;outline:none;color:var(--ink);font-size:13.5px;font-family:inherit}
.search input::placeholder{color:var(--faint)}.search svg{width:16px;height:16px;flex:none}
.burger{margin-left:auto;width:40px;height:40px;display:flex;align-items:center;justify-content:center;border:1px solid var(--line);border-radius:9px;background:var(--surface)}
@media(min-width:900px){.nav-links{display:flex}.search{display:flex}.burger{display:none}}

main{max-width:var(--maxw);margin:0 auto;padding:20px 16px 60px}
@media(min-width:700px){main{padding:26px 22px 72px}}
.ctx{display:flex;align-items:center;gap:8px;font-size:12px;color:var(--muted);margin-bottom:18px}
.ctx a{display:inline-flex;align-items:center;gap:6px;color:var(--muted);font-weight:600}.ctx a:hover{color:var(--ink)}

/* event header */
.evhead{position:relative;border:1px solid var(--line);border-radius:18px;overflow:hidden;padding:30px 26px;
  background:linear-gradient(150deg,#1d1015,#161215 55%,#110f11);}
.evhead::before{content:"";position:absolute;inset:0;pointer-events:none;background:radial-gradient(55% 90% at 90% -20%,rgba(177,18,38,.15),transparent 60%)}
.evhead .type{position:relative;font-family:var(--disp);font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:var(--red-soft)}
.evhead h1{position:relative;font-family:var(--disp);font-weight:700;font-size:clamp(30px,6vw,52px);line-height:.92;text-transform:uppercase;margin:12px 0 18px;letter-spacing:.005em}
.evhead .metas{position:relative;display:flex;flex-wrap:wrap;gap:12px 26px}
.evhead .metas .m{display:flex;align-items:center;gap:9px;font-size:13.5px;color:var(--muted)}
.evhead .metas .m b{color:var(--ink);font-weight:600}
.evhead .metas .m svg{width:17px;height:17px;flex:none;color:var(--red)}

/* segmented tabs */
.seg{display:flex;gap:6px;margin:24px 0 6px;background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:5px}
.seg button{flex:1;border:none;background:none;font-family:var(--disp);font-weight:700;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);padding:11px 6px;border-radius:8px;transition:color .16s,background .16s}
.seg button.on{background:var(--surface-2);color:var(--ink);box-shadow:0 1px 4px rgba(0,0,0,.4)}
.seg button:hover:not(.on){color:var(--ink)}
.seg-cap{font-family:var(--disp);font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:var(--faint);margin:22px 4px 10px}

/* bout rows */
.card{border:1px solid var(--line);border-radius:16px;overflow:hidden;background:var(--surface)}
.bout{display:grid;grid-template-columns:1fr 96px 1fr;align-items:center;border-bottom:1px solid var(--line);transition:background .14s}
.bout:last-child{border-bottom:none}.bout:hover{background:var(--surface-2)}
.bout .f{display:flex;flex-direction:column;gap:5px;padding:16px 14px;min-width:0}
.bout .f.right{align-items:flex-end;text-align:right}
.bout .f .nm{font-family:var(--disp);font-weight:600;font-size:19px;line-height:1;text-transform:uppercase}
.bout .f .rec{font-size:12px;color:var(--faint);font-variant-numeric:tabular-nums}
.bout .f .ml{margin-top:4px;font-size:12px;font-weight:600;font-variant-numeric:tabular-nums;color:var(--muted)}
.bout .f .ml.fav{color:var(--gold)}
.bout .f.win .nm{color:var(--ink)}
.bout .f.loss .nm,.bout .f.loss .rec{color:var(--faint)}
.bout .mid{display:flex;flex-direction:column;align-items:center;gap:5px;padding:12px 4px}
.bout .mid .wc{font-family:var(--disp);font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--faint);text-align:center;line-height:1.3}
.bout .mid .vs{font-family:var(--disp);font-weight:800;font-size:15px;color:var(--red);line-height:1}
.bout .mid .rds{font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--gold);font-weight:700}
.bout .mid .res{font-family:var(--disp);font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:var(--up);text-align:center;line-height:1.3;font-weight:700}
.bout.final .mid .vs{color:var(--faint)}
.wbadge{display:inline-block;font-family:var(--disp);font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--up);background:rgba(53,194,129,.12);border:1px solid rgba(53,194,129,.28);border-radius:4px;padding:1px 6px}

footer{max-width:var(--maxw);margin:40px auto 0;padding:24px 22px;border-top:1px solid var(--line);font-size:11.5px;color:var(--faint);line-height:1.7;text-align:center}
footer b{color:var(--muted)}
</style>
</head>
<body>

<header class="nav">
  <div class="nav-in">
    <div class="logo">EDGE<b>ENGINE</b></div>
    <nav class="nav-links"><a href="home.html">Home</a><a href="events.html" class="active">Events</a><a href="rankings.html">Rankings</a><a href="odds.html">Odds</a><a href="predict.html">Predictions</a></nav>
    <label class="search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.5-4.5"/></svg><input type="text" placeholder="Search fighters…" aria-label="Search fighters"></label>
    <button class="burger" aria-label="Menu"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>
  </div>
</header>

<main>
  <div class="ctx"><a href="events.html"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg> Events</a></div>

  <section class="evhead">
    <div class="type">UFC Fight Night</div>
    <h1>Ankalaev<br>vs. Guskov</h1>
    <div class="metas">
      <span class="m"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M3 10h18M8 3v4M16 3v4"/></svg> <b>Sat, Jul 25, 2026</b> · 12:00 PM ET</span>
      <span class="m"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21S5.5 15 5.5 10.2a6.5 6.5 0 0 1 13 0C18.5 15 12 21 12 21Z"/><circle cx="12" cy="10" r="2.3"/></svg> <b>Etihad Arena</b> · Abu Dhabi · UAE</span>
      <span class="m"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="7" width="19" height="13" rx="2.2"/><path d="M8.5 2.5 12 6l3.5-3.5"/></svg> <b>ESPN+</b></span>
    </div>
  </section>

  <div class="seg" role="tablist">
    <button class="on" role="tab">Main Card</button>
    <button role="tab">Prelims</button>
    <button role="tab">Early Prelims</button>
  </div>

  <div class="seg-cap">Main Card · 12:00 PM ET</div>
  <section class="card">
    <div class="bout">
      <div class="f"><div class="nm">Magomed Ankalaev</div><div class="rec num">21–2–1</div><div class="ml num">+130</div></div>
      <div class="mid"><div class="wc">Light Heavy</div><div class="vs">VS</div><div class="rds">5 Rounds</div></div>
      <div class="f right"><div class="nm">Bogdan Guskov</div><div class="rec num">18–3–1</div><div class="ml fav num">−150</div></div>
    </div>
    <div class="bout">
      <div class="f"><div class="nm">Shara Magomedov</div><div class="rec num">15–1–0</div><div class="ml fav num">−190</div></div>
      <div class="mid"><div class="wc">Middleweight</div><div class="vs">VS</div><div class="rds">3 Rounds</div></div>
      <div class="f right"><div class="nm">Marc-André Barriault</div><div class="rec num">17–9–0</div><div class="ml num">+160</div></div>
    </div>
    <div class="bout">
      <div class="f"><div class="nm">Nasrat Haqparast</div><div class="rec num">17–5–0</div><div class="ml num">+105</div></div>
      <div class="mid"><div class="wc">Lightweight</div><div class="vs">VS</div><div class="rds">3 Rounds</div></div>
      <div class="f right"><div class="nm">Esteban Ribovics</div><div class="rec num">13–1–0</div><div class="ml fav num">−125</div></div>
    </div>
    <div class="bout">
      <div class="f"><div class="nm">Ikram Aliskerov</div><div class="rec num">16–2–0</div><div class="ml fav num">−260</div></div>
      <div class="mid"><div class="wc">Middleweight</div><div class="vs">VS</div><div class="rds">3 Rounds</div></div>
      <div class="f right"><div class="nm">Jun Yong Park</div><div class="rec num">18–6–0</div><div class="ml num">+215</div></div>
    </div>
    <div class="bout final">
      <div class="f win"><div class="nm">Muhammad Naimov <span class="wbadge">W</span></div><div class="rec num">12–3–0</div></div>
      <div class="mid"><div class="wc">Featherweight</div><div class="res">Naimov · KO/TKO · R2 3:41</div></div>
      <div class="f right loss"><div class="nm">Bogdan Grad</div><div class="rec num">16–3–0</div></div>
    </div>
  </section>
</main>

<footer>Probabilities, not locks — a single punch can end any fight. If you bet, bet only what you can afford to lose. <b>21+.</b> Not affiliated with the UFC or ESPN.</footer>

<script>
document.querySelectorAll(".seg button").forEach(b=>b.addEventListener("click",()=>{
  document.querySelectorAll(".seg button").forEach(x=>x.classList.remove("on"));b.classList.add("on");
}));
</script>
</body>
</html>

```

---

## `fighter.html`
**Fighter profile — /fighter/[id]**

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Edge Engine — Magomed Ankalaev</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Saira+Condensed:wght@500;600;700;800&family=Archivo:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
:root{
  --bg:#0c0a0b;--surface:#161315;--surface-2:#1d191b;--line:#2b2528;--line-2:#3a3033;
  --ink:#f4f1f2;--muted:#a49aa0;--faint:#6d646a;--oxblood:#b11226;--red:#e5142a;--red-soft:#ff5061;
  --gold:#d8b45a;--up:#35c281;--down:#ff5470;
  --disp:"Saira Condensed",system-ui,sans-serif;--text:"Archivo",system-ui,sans-serif;--maxw:1160px;
}
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
html{color-scheme:dark}
body{font-family:var(--text);color:var(--ink);min-height:100vh;line-height:1.5;font-feature-settings:"tnum" 1;-webkit-font-smoothing:antialiased;
  background:radial-gradient(60% 40% at 82% -5%,rgba(177,18,38,.12),transparent 70%),radial-gradient(50% 40% at 8% 4%,rgba(216,180,90,.05),transparent 70%),var(--bg);background-attachment:fixed}
.num{font-variant-numeric:tabular-nums}
a{color:var(--red-soft);text-decoration:none}a:hover{color:var(--red)}
:focus-visible{outline:2px solid var(--red);outline-offset:2px;border-radius:4px}
::selection{background:rgba(229,20,42,.35)}
button{font-family:inherit;cursor:pointer;color:inherit}

.nav{position:sticky;top:0;z-index:50;background:rgba(12,10,11,.82);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-bottom:1px solid var(--line)}
.nav-in{max-width:var(--maxw);margin:0 auto;display:flex;align-items:center;gap:22px;padding:14px 22px;min-height:60px}
.logo{font-family:var(--disp);font-weight:700;font-size:22px;letter-spacing:.06em;text-transform:uppercase;white-space:nowrap;line-height:1}
.logo b{color:var(--red)}
.nav-links{display:none;gap:4px;margin-left:6px}
.nav-links a{color:var(--muted);font-size:13px;font-weight:600;padding:8px 12px;border-radius:7px;transition:color .16s,background .16s}
.nav-links a:hover{color:var(--ink);background:rgba(255,255,255,.04)}
.nav-links a.active{color:var(--ink)}.nav-links a.active::after{content:"";display:block;height:2px;margin-top:5px;border-radius:2px;background:var(--red)}
.search{margin-left:auto;display:none;align-items:center;gap:9px;background:var(--surface);border:1px solid var(--line);border-radius:9px;padding:8px 13px;min-width:210px;color:var(--faint);transition:border-color .16s,box-shadow .16s}
.search:focus-within{border-color:var(--line-2);box-shadow:0 0 0 3px rgba(229,20,42,.14)}
.search input{flex:1;background:none;border:none;outline:none;color:var(--ink);font-size:13.5px;font-family:inherit}
.search input::placeholder{color:var(--faint)}.search svg{width:16px;height:16px;flex:none}
.burger{margin-left:auto;width:40px;height:40px;display:flex;align-items:center;justify-content:center;border:1px solid var(--line);border-radius:9px;background:var(--surface)}
@media(min-width:900px){.nav-links{display:flex}.search{display:flex}.burger{display:none}}

main{max-width:var(--maxw);margin:0 auto;padding:20px 16px 60px}
@media(min-width:700px){main{padding:26px 22px 72px}}
.ctx{display:flex;align-items:center;gap:8px;font-size:12px;color:var(--muted);margin-bottom:18px}
.ctx a{display:inline-flex;align-items:center;gap:6px;color:var(--muted);font-weight:600}.ctx a:hover{color:var(--ink)}

/* ===== profile hero ===== */
.fp{display:grid;grid-template-columns:1fr;gap:0;border:1px solid var(--line);border-radius:18px;overflow:hidden;
  background:linear-gradient(150deg,#1d1015,#161215 55%,#110f11)}
.fp-hero{position:relative;display:grid;grid-template-columns:auto 1fr;gap:22px;align-items:end;padding:26px 26px 24px}
.fp-hero::before{content:"";position:absolute;inset:0;pointer-events:none;background:radial-gradient(50% 90% at 20% -10%,rgba(177,18,38,.16),transparent 60%)}
.fp-slot{position:relative;width:150px;height:190px;flex:none;border-radius:14px;overflow:hidden;
  background:repeating-linear-gradient(135deg,rgba(255,255,255,.02) 0 10px,transparent 10px 20px),linear-gradient(180deg,#211519,#141013);
  border:1px dashed var(--line-2);display:flex;align-items:flex-end;justify-content:center}
.fp-slot svg{width:70%;opacity:.5;margin-bottom:-2px;color:var(--faint)}
.fp-slot .drop{position:absolute;top:10px;left:0;right:0;text-align:center;font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:var(--faint);font-weight:600}
.fp-id{position:relative;min-width:0;padding-bottom:4px}
.fp-id .nick{font-family:var(--disp);font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:var(--gold)}
.fp-id h1{font-family:var(--disp);font-weight:700;font-size:clamp(34px,6.5vw,60px);line-height:.9;text-transform:uppercase;margin:6px 0 8px}
.fp-id .rec{font-family:var(--disp);font-weight:700;font-size:24px;color:var(--ink);font-variant-numeric:tabular-nums}
.fp-id .rec .w{color:var(--faint);font-size:12px;letter-spacing:.1em;text-transform:uppercase;margin-left:10px}
.fp-id .wc{margin-top:8px;display:flex;flex-wrap:wrap;gap:8px;align-items:center;font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);font-weight:600}
.fp-id .chip{border:1px solid rgba(216,180,90,.3);color:var(--gold);border-radius:5px;padding:2px 9px;font-family:var(--disp);letter-spacing:.1em;white-space:nowrap}
@media(max-width:560px){.fp-hero{grid-template-columns:1fr;gap:16px}.fp-slot{width:120px;height:150px}}

/* bio grid */
.biogrid{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--line);border-top:1px solid var(--line)}
@media(min-width:640px){.biogrid{grid-template-columns:repeat(6,1fr)}}
.biogrid .cell{background:var(--surface);padding:16px 14px;text-align:center}
.biogrid .v{font-family:var(--disp);font-weight:700;font-size:19px;font-variant-numeric:tabular-nums}
.biogrid .k{font-size:9.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--faint);margin-top:5px;font-weight:600}

/* two column layout */
.cols{display:grid;grid-template-columns:1fr;gap:16px;margin-top:16px}
@media(min-width:860px){.cols{grid-template-columns:1fr 1.1fr}}
.panel{background:var(--surface);border:1px solid var(--line);border-radius:16px;overflow:hidden}
.panel-h{display:flex;align-items:center;padding:15px 18px;border-bottom:1px solid var(--line)}
.panel-h .k{font-family:var(--disp);font-size:13px;letter-spacing:.16em;text-transform:uppercase;color:var(--ink)}
.panel-h .n{margin-left:auto;font-size:10.5px;color:var(--faint);letter-spacing:.04em}

/* career stats bars */
.stat{padding:14px 18px;border-bottom:1px solid var(--line)}
.stat:last-child{border-bottom:none}
.stat .top{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px}
.stat .top .k{font-size:11px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
.stat .top .v{font-family:var(--disp);font-weight:700;font-size:17px;font-variant-numeric:tabular-nums}
.stat .bar{height:6px;border-radius:4px;background:var(--surface-2);border:1px solid var(--line);overflow:hidden}
.stat .bar i{display:block;height:100%;border-radius:4px;background:linear-gradient(90deg,var(--oxblood),var(--red));transition:width .9s cubic-bezier(.22,1,.36,1)}
.stat.gold .bar i{background:linear-gradient(90deg,#a5842f,var(--gold))}

/* fight history */
.hist .h{display:grid;grid-template-columns:34px 1fr auto;align-items:center;gap:13px;padding:13px 18px;border-bottom:1px solid var(--line);transition:background .14s}
.hist .h:last-child{border-bottom:none}.hist .h:hover{background:var(--surface-2)}
.hist .res{width:34px;height:34px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-family:var(--disp);font-weight:700;font-size:16px}
.hist .res.W{background:rgba(53,194,129,.12);color:var(--up);border:1px solid rgba(53,194,129,.28)}
.hist .res.L{background:rgba(255,84,112,.1);color:var(--down);border:1px solid rgba(255,84,112,.24)}
.hist .res.D{background:rgba(216,180,90,.12);color:var(--gold);border:1px solid rgba(216,180,90,.28)}
.hist .mid{min-width:0}
.hist .mid .o{font-family:var(--disp);font-weight:600;font-size:17px;text-transform:uppercase;line-height:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hist .mid .m{font-size:12px;color:var(--muted);margin-top:4px}
.hist .rt{text-align:right;flex:none}
.hist .rt .e{font-size:11.5px;color:var(--muted);white-space:nowrap}
.hist .rt .d{font-size:11px;color:var(--faint);margin-top:2px;font-variant-numeric:tabular-nums}

footer{max-width:var(--maxw);margin:40px auto 0;padding:24px 22px;border-top:1px solid var(--line);font-size:11.5px;color:var(--faint);line-height:1.7;text-align:center}
footer b{color:var(--muted)}
</style>
</head>
<body>

<header class="nav">
  <div class="nav-in">
    <div class="logo">EDGE<b>ENGINE</b></div>
    <nav class="nav-links"><a href="home.html">Home</a><a href="events.html">Events</a><a href="rankings.html">Rankings</a><a href="odds.html">Odds</a><a href="predict.html">Predictions</a></nav>
    <label class="search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.5-4.5"/></svg><input type="text" placeholder="Search fighters…" aria-label="Search fighters"></label>
    <button class="burger" aria-label="Menu"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>
  </div>
</header>

<main>
  <div class="ctx"><a href="rankings.html"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg> Rankings</a></div>

  <section class="fp">
    <div class="fp-hero">
      <div class="fp-slot"><span class="drop">Drop headshot</span><svg viewBox="0 0 100 120" fill="currentColor"><circle cx="50" cy="38" r="20"/><path d="M12 120c3-30 18-44 38-44s35 14 38 44z"/></svg></div>
      <div class="fp-id">
        <div class="nick">"The Trailblazer"</div>
        <h1>Magomed<br>Ankalaev</h1>
        <div class="rec num">21–2–1 <span class="w">Pro record</span></div>
        <div class="wc"><span class="chip">Light Heavyweight</span> 🇷🇺 Russia · Southpaw</div>
      </div>
    </div>
    <div class="biogrid">
      <div class="cell"><div class="v num">33</div><div class="k">Age</div></div>
      <div class="cell"><div class="v num">6′3″</div><div class="k">Height</div></div>
      <div class="cell"><div class="v num">75″</div><div class="k">Reach</div></div>
      <div class="cell"><div class="v">Southpaw</div><div class="k">Stance</div></div>
      <div class="cell"><div class="v">4–0–1</div><div class="k">Last 5</div></div>
      <div class="cell"><div class="v">Fighter's&nbsp;Spirit</div><div class="k">Team</div></div>
    </div>
  </section>

  <div class="cols">
    <!-- CAREER STATS -->
    <section class="panel">
      <div class="panel-h"><span class="k">Career stats</span><span class="n">Per-fight averages</span></div>
      <div class="stat"><div class="top"><span class="k">Sig. strikes / min</span><span class="v num">3.82</span></div><div class="bar"><i style="width:64%"></i></div></div>
      <div class="stat"><div class="top"><span class="k">Striking accuracy</span><span class="v num">52%</span></div><div class="bar"><i style="width:52%"></i></div></div>
      <div class="stat"><div class="top"><span class="k">Takedowns / 15 min</span><span class="v num">1.90</span></div><div class="bar"><i style="width:48%"></i></div></div>
      <div class="stat"><div class="top"><span class="k">Takedown accuracy</span><span class="v num">45%</span></div><div class="bar"><i style="width:45%"></i></div></div>
      <div class="stat"><div class="top"><span class="k">Control time / fight</span><span class="v num">4:20</span></div><div class="bar"><i style="width:58%"></i></div></div>
      <div class="stat"><div class="top"><span class="k">Knockdowns / 15 min</span><span class="v num">0.47</span></div><div class="bar"><i style="width:24%"></i></div></div>
      <div class="stat gold"><div class="top"><span class="k">Finish rate</span><span class="v num">57%</span></div><div class="bar"><i style="width:57%"></i></div></div>
    </section>

    <!-- FIGHT HISTORY -->
    <section class="panel">
      <div class="panel-h"><span class="k">Fight history</span><span class="n">24 pro bouts</span></div>
      <div class="hist">
        <div class="h"><span class="res W">W</span><div class="mid"><div class="o">Aleksandar Rakić</div><div class="m">Decision (unanimous) · R3 5:00</div></div><div class="rt"><div class="e">UFC 308</div><div class="d num">Oct 2025</div></div></div>
        <div class="h"><span class="res W">W</span><div class="mid"><div class="o">Johnny Walker</div><div class="m">KO/TKO (punches) · R2 3:44</div></div><div class="rt"><div class="e">UFC Fight Night</div><div class="d num">Jan 2025</div></div></div>
        <div class="h"><span class="res D">D</span><div class="mid"><div class="o">Jan Błachowicz</div><div class="m">Draw (split) · R5 5:00</div></div><div class="rt"><div class="e">UFC 282</div><div class="d num">Dec 2024</div></div></div>
        <div class="h"><span class="res W">W</span><div class="mid"><div class="o">Anthony Smith</div><div class="m">KO/TKO (punches) · R1 3:23</div></div><div class="rt"><div class="e">UFC 277</div><div class="d num">Jul 2024</div></div></div>
        <div class="h"><span class="res W">W</span><div class="mid"><div class="o">Thiago Santos</div><div class="m">Decision (unanimous) · R3 5:00</div></div><div class="rt"><div class="e">UFC Fight Night</div><div class="d num">Mar 2024</div></div></div>
        <div class="h"><span class="res L">L</span><div class="mid"><div class="o">Paul Craig</div><div class="m">Submission (triangle) · R3 4:58</div></div><div class="rt"><div class="e">UFC 263</div><div class="d num">Jun 2021</div></div></div>
      </div>
    </section>
  </div>
</main>

<footer>Probabilities, not locks — a single punch can end any fight. If you bet, bet only what you can afford to lose. <b>21+.</b> Not affiliated with the UFC or ESPN.</footer>

<script>
window.addEventListener("load",()=>{
  if(matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  document.querySelectorAll(".stat .bar i").forEach(i=>{const w=i.style.width;i.style.width="0";requestAnimationFrame(()=>requestAnimationFrame(()=>i.style.width=w));});
});
</script>
</body>
</html>

```

---

## `rankings.html`
**Rankings — /rankings**

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Edge Engine — Rankings</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Saira+Condensed:wght@500;600;700;800&family=Archivo:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
:root{
  --bg:#0c0a0b;--surface:#161315;--surface-2:#1d191b;--line:#2b2528;--line-2:#3a3033;
  --ink:#f4f1f2;--muted:#a49aa0;--faint:#6d646a;--oxblood:#b11226;--red:#e5142a;--red-soft:#ff5061;
  --gold:#d8b45a;--up:#35c281;--down:#ff5470;
  --disp:"Saira Condensed",system-ui,sans-serif;--text:"Archivo",system-ui,sans-serif;--maxw:1160px;
}
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
html{color-scheme:dark}
body{font-family:var(--text);color:var(--ink);min-height:100vh;line-height:1.5;font-feature-settings:"tnum" 1;-webkit-font-smoothing:antialiased;
  background:radial-gradient(60% 40% at 82% -5%,rgba(177,18,38,.12),transparent 70%),radial-gradient(50% 40% at 8% 4%,rgba(216,180,90,.05),transparent 70%),var(--bg);background-attachment:fixed}
.num{font-variant-numeric:tabular-nums}
a{color:inherit;text-decoration:none}
:focus-visible{outline:2px solid var(--red);outline-offset:2px;border-radius:4px}
::selection{background:rgba(229,20,42,.35)}
button{font-family:inherit;cursor:pointer;color:inherit}

.nav{position:sticky;top:0;z-index:50;background:rgba(12,10,11,.82);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-bottom:1px solid var(--line)}
.nav-in{max-width:var(--maxw);margin:0 auto;display:flex;align-items:center;gap:22px;padding:14px 22px;min-height:60px}
.logo{font-family:var(--disp);font-weight:700;font-size:22px;letter-spacing:.06em;text-transform:uppercase;white-space:nowrap;line-height:1}
.logo b{color:var(--red)}
.nav-links{display:none;gap:4px;margin-left:6px}
.nav-links a{color:var(--muted);font-size:13px;font-weight:600;padding:8px 12px;border-radius:7px;transition:color .16s,background .16s}
.nav-links a:hover{color:var(--ink);background:rgba(255,255,255,.04)}
.nav-links a.active{color:var(--ink)}.nav-links a.active::after{content:"";display:block;height:2px;margin-top:5px;border-radius:2px;background:var(--red)}
.search{margin-left:auto;display:none;align-items:center;gap:9px;background:var(--surface);border:1px solid var(--line);border-radius:9px;padding:8px 13px;min-width:210px;color:var(--faint);transition:border-color .16s,box-shadow .16s}
.search:focus-within{border-color:var(--line-2);box-shadow:0 0 0 3px rgba(229,20,42,.14)}
.search input{flex:1;background:none;border:none;outline:none;color:var(--ink);font-size:13.5px;font-family:inherit}
.search input::placeholder{color:var(--faint)}.search svg{width:16px;height:16px;flex:none}
.burger{margin-left:auto;width:40px;height:40px;display:flex;align-items:center;justify-content:center;border:1px solid var(--line);border-radius:9px;background:var(--surface)}
@media(min-width:900px){.nav-links{display:flex}.search{display:flex}.burger{display:none}}

main{max-width:var(--maxw);margin:0 auto;padding:22px 16px 60px}
@media(min-width:700px){main{padding:30px 22px 72px}}
.page-h{display:flex;align-items:baseline;gap:14px;margin-bottom:6px}
.page-h h1{font-family:var(--disp);font-weight:700;font-size:clamp(30px,5vw,44px);letter-spacing:.04em;text-transform:uppercase}
.page-h .cap{font-size:12px;color:var(--faint)}

/* division chips */
.divs{display:flex;gap:8px;overflow-x:auto;padding:16px 2px 6px;scrollbar-width:none;-webkit-overflow-scrolling:touch;
  -webkit-mask-image:linear-gradient(90deg,transparent,#000 14px,#000 calc(100% - 14px),transparent);mask-image:linear-gradient(90deg,transparent,#000 14px,#000 calc(100% - 14px),transparent)}
.divs::-webkit-scrollbar{display:none}
.divs .d{flex:none;font-family:var(--disp);font-weight:700;font-size:13px;letter-spacing:.06em;text-transform:uppercase;
  color:var(--muted);background:var(--surface);border:1px solid var(--line);border-radius:9px;padding:9px 15px;white-space:nowrap;transition:all .16s}
.divs .d:hover{color:var(--ink);border-color:var(--line-2)}
.divs .d.on{background:var(--red);border-color:var(--red);color:#fff}

/* champion card */
.champ{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:18px;margin-top:18px;
  border:1px solid rgba(216,180,90,.32);border-radius:16px;overflow:hidden;padding:20px 22px;
  background:linear-gradient(120deg,rgba(216,180,90,.09),transparent 55%),var(--surface)}
.champ .av{width:66px;height:66px;flex:none;border-radius:50%;overflow:hidden;border:2px solid rgba(216,180,90,.5);
  background:linear-gradient(180deg,#211519,#141013);display:flex;align-items:flex-end;justify-content:center}
.champ .av svg{width:76%;opacity:.55;margin-bottom:-2px;color:var(--faint)}
.champ .who .belt{font-family:var(--disp);font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--gold);display:flex;align-items:center;gap:7px}
.champ .who .belt svg{width:15px;height:15px}
.champ .who .nm{font-family:var(--disp);font-weight:700;font-size:clamp(26px,4vw,38px);line-height:1;text-transform:uppercase;margin-top:5px}
.champ .who .rec{font-size:12.5px;color:var(--muted);margin-top:4px;font-variant-numeric:tabular-nums}
.champ .cbadge{font-family:var(--disp);font-weight:800;font-size:34px;color:var(--gold);line-height:1}
@media(max-width:520px){.champ{grid-template-columns:auto 1fr}.champ .cbadge{display:none}}

/* ranked list */
.ranks{border:1px solid var(--line);border-radius:16px;overflow:hidden;background:var(--surface);margin-top:14px}
.r{display:grid;grid-template-columns:34px 46px 1fr auto;align-items:center;gap:14px;padding:11px 18px;border-bottom:1px solid var(--line);transition:background .14s}
.r:last-child{border-bottom:none}.r:hover{background:var(--surface-2)}
.r .no{font-family:var(--disp);font-weight:700;font-size:18px;color:var(--faint);text-align:center;font-variant-numeric:tabular-nums}
.r .av{width:46px;height:46px;border-radius:50%;overflow:hidden;border:1px solid var(--line);background:linear-gradient(180deg,#211519,#141013);display:flex;align-items:flex-end;justify-content:center}
.r .av svg{width:74%;opacity:.5;margin-bottom:-1px;color:var(--faint)}
.r .nm{font-family:var(--disp);font-weight:600;font-size:19px;text-transform:uppercase;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.r .nm .rec{display:block;font-family:var(--text);font-weight:500;font-size:11.5px;letter-spacing:0;text-transform:none;color:var(--faint);font-variant-numeric:tabular-nums;margin-top:2px}
.r .mv{display:inline-flex;align-items:center;gap:5px;font-family:var(--disp);font-size:12px;font-weight:700;letter-spacing:.04em;color:var(--faint)}
.r .mv svg{width:12px;height:12px}
.r .mv.up{color:var(--up)}.r .mv.dn{color:var(--down)}
.r .mv.same{color:var(--faint)}

.footcap{margin-top:16px;font-size:11.5px;color:var(--faint);text-align:center}
footer{max-width:var(--maxw);margin:34px auto 0;padding:24px 22px;border-top:1px solid var(--line);font-size:11.5px;color:var(--faint);line-height:1.7;text-align:center}
footer b{color:var(--muted)}
</style>
</head>
<body>

<header class="nav">
  <div class="nav-in">
    <div class="logo">EDGE<b>ENGINE</b></div>
    <nav class="nav-links"><a href="home.html">Home</a><a href="events.html">Events</a><a href="#" class="active">Rankings</a><a href="odds.html">Odds</a><a href="predict.html">Predictions</a></nav>
    <label class="search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.5-4.5"/></svg><input type="text" placeholder="Search fighters…" aria-label="Search fighters"></label>
    <button class="burger" aria-label="Menu"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>
  </div>
</header>

<main>
  <div class="page-h"><h1>Rankings</h1><span class="cap">Updated Jul 22, 2026</span></div>

  <div class="divs" role="tablist">
    <button class="d">P4P</button>
    <button class="d">Flyweight</button>
    <button class="d">Bantamweight</button>
    <button class="d">Featherweight</button>
    <button class="d">Lightweight</button>
    <button class="d">Welterweight</button>
    <button class="d">Middleweight</button>
    <button class="d on">Light Heavy</button>
    <button class="d">Heavyweight</button>
    <button class="d">W. Strawweight</button>
    <button class="d">W. Flyweight</button>
    <button class="d">W. Bantamweight</button>
  </div>

  <a class="champ" href="fighter.html">
    <div class="av"><svg viewBox="0 0 100 120" fill="currentColor"><circle cx="50" cy="38" r="20"/><path d="M12 120c3-30 18-44 38-44s35 14 38 44z"/></svg></div>
    <div class="who">
      <div class="belt"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4h10v5.5a5 5 0 0 1-10 0Z"/><path d="M12 14.5V18M8.5 21h7"/></svg> Champion · Light Heavyweight</div>
      <div class="nm">Alex Pereira</div>
      <div class="rec num">12–2–0 · Title defenses: 3</div>
    </div>
    <div class="cbadge">C</div>
  </a>

  <div class="ranks">
    <a class="r" href="fighter.html"><span class="no num">1</span><span class="av"><svg viewBox="0 0 100 120" fill="currentColor"><circle cx="50" cy="38" r="20"/><path d="M12 120c3-30 18-44 38-44s35 14 38 44z"/></svg></span><span class="nm">Magomed Ankalaev<span class="rec">21–2–1</span></span><span class="mv up"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 15l6-6 6 6"/></svg>1</span></a>
    <a class="r" href="fighter.html"><span class="no num">2</span><span class="av"><svg viewBox="0 0 100 120" fill="currentColor"><circle cx="50" cy="38" r="20"/><path d="M12 120c3-30 18-44 38-44s35 14 38 44z"/></svg></span><span class="nm">Jiří Procházka<span class="rec">30–5–1</span></span><span class="mv dn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>1</span></a>
    <a class="r" href="fighter.html"><span class="no num">3</span><span class="av"><svg viewBox="0 0 100 120" fill="currentColor"><circle cx="50" cy="38" r="20"/><path d="M12 120c3-30 18-44 38-44s35 14 38 44z"/></svg></span><span class="nm">Jan Błachowicz<span class="rec">29–11–1</span></span><span class="mv same">—</span></a>
    <a class="r" href="fighter.html"><span class="no num">4</span><span class="av"><svg viewBox="0 0 100 120" fill="currentColor"><circle cx="50" cy="38" r="20"/><path d="M12 120c3-30 18-44 38-44s35 14 38 44z"/></svg></span><span class="nm">Carlos Ulberg<span class="rec">12–1–0</span></span><span class="mv up"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 15l6-6 6 6"/></svg>2</span></a>
    <a class="r" href="fighter.html"><span class="no num">5</span><span class="av"><svg viewBox="0 0 100 120" fill="currentColor"><circle cx="50" cy="38" r="20"/><path d="M12 120c3-30 18-44 38-44s35 14 38 44z"/></svg></span><span class="nm">Aleksandar Rakić<span class="rec">14–4–0</span></span><span class="mv same">—</span></a>
    <a class="r" href="fighter.html"><span class="no num">6</span><span class="av"><svg viewBox="0 0 100 120" fill="currentColor"><circle cx="50" cy="38" r="20"/><path d="M12 120c3-30 18-44 38-44s35 14 38 44z"/></svg></span><span class="nm">Khalil Rountree Jr.<span class="rec">14–6–0</span></span><span class="mv dn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>2</span></a>
    <a class="r" href="fighter.html"><span class="no num">7</span><span class="av"><svg viewBox="0 0 100 120" fill="currentColor"><circle cx="50" cy="38" r="20"/><path d="M12 120c3-30 18-44 38-44s35 14 38 44z"/></svg></span><span class="nm">Bogdan Guskov<span class="rec">18–3–1</span></span><span class="mv up"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 15l6-6 6 6"/></svg>3</span></a>
    <a class="r" href="fighter.html"><span class="no num">8</span><span class="av"><svg viewBox="0 0 100 120" fill="currentColor"><circle cx="50" cy="38" r="20"/><path d="M12 120c3-30 18-44 38-44s35 14 38 44z"/></svg></span><span class="nm">Volkan Oezdemir<span class="rec">20–8–0</span></span><span class="mv same">—</span></a>
    <a class="r" href="fighter.html"><span class="no num">9</span><span class="av"><svg viewBox="0 0 100 120" fill="currentColor"><circle cx="50" cy="38" r="20"/><path d="M12 120c3-30 18-44 38-44s35 14 38 44z"/></svg></span><span class="nm">Nikita Krylov<span class="rec">30–9–0</span></span><span class="mv dn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>1</span></a>
    <a class="r" href="fighter.html"><span class="no num">10</span><span class="av"><svg viewBox="0 0 100 120" fill="currentColor"><circle cx="50" cy="38" r="20"/><path d="M12 120c3-30 18-44 38-44s35 14 38 44z"/></svg></span><span class="nm">Dominick Reyes<span class="rec">15–4–0</span></span><span class="mv up"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 15l6-6 6 6"/></svg>1</span></a>
  </div>

  <div class="footcap">Official UFC rankings · live from ufc.com · movement shown vs. previous update.</div>
</main>

<footer>Probabilities, not locks — a single punch can end any fight. If you bet, bet only what you can afford to lose. <b>21+.</b> Not affiliated with the UFC or ESPN.</footer>

<script>
document.querySelectorAll(".divs .d").forEach(b=>b.addEventListener("click",()=>{
  document.querySelectorAll(".divs .d").forEach(x=>x.classList.remove("on"));b.classList.add("on");
}));
</script>
</body>
</html>

```

---

## `odds.html`
**Live Odds — /odds**

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Edge Engine — Live Odds</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Saira+Condensed:wght@500;600;700;800&family=Archivo:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
:root{
  --bg:#0c0a0b;--surface:#161315;--surface-2:#1d191b;--line:#2b2528;--line-2:#3a3033;
  --ink:#f4f1f2;--muted:#a49aa0;--faint:#6d646a;--oxblood:#b11226;--red:#e5142a;--red-soft:#ff5061;
  --gold:#d8b45a;--up:#35c281;--down:#ff5470;
  --disp:"Saira Condensed",system-ui,sans-serif;--text:"Archivo",system-ui,sans-serif;--maxw:1160px;
}
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
html{color-scheme:dark}
body{font-family:var(--text);color:var(--ink);min-height:100vh;line-height:1.5;font-feature-settings:"tnum" 1;-webkit-font-smoothing:antialiased;
  background:radial-gradient(60% 40% at 82% -5%,rgba(177,18,38,.12),transparent 70%),radial-gradient(50% 40% at 8% 4%,rgba(216,180,90,.05),transparent 70%),var(--bg);background-attachment:fixed}
.num{font-variant-numeric:tabular-nums}
a{color:var(--red-soft);text-decoration:none}a:hover{color:var(--red)}
:focus-visible{outline:2px solid var(--red);outline-offset:2px;border-radius:4px}
::selection{background:rgba(229,20,42,.35)}
button{font-family:inherit;cursor:pointer;color:inherit}

.nav{position:sticky;top:0;z-index:50;background:rgba(12,10,11,.82);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-bottom:1px solid var(--line)}
.nav-in{max-width:var(--maxw);margin:0 auto;display:flex;align-items:center;gap:22px;padding:14px 22px;min-height:60px}
.logo{font-family:var(--disp);font-weight:700;font-size:22px;letter-spacing:.06em;text-transform:uppercase;white-space:nowrap;line-height:1}
.logo b{color:var(--red)}
.nav-links{display:none;gap:4px;margin-left:6px}
.nav-links a{color:var(--muted);font-size:13px;font-weight:600;padding:8px 12px;border-radius:7px;transition:color .16s,background .16s}
.nav-links a:hover{color:var(--ink);background:rgba(255,255,255,.04)}
.nav-links a.active{color:var(--ink)}.nav-links a.active::after{content:"";display:block;height:2px;margin-top:5px;border-radius:2px;background:var(--red)}
.search{margin-left:auto;display:none;align-items:center;gap:9px;background:var(--surface);border:1px solid var(--line);border-radius:9px;padding:8px 13px;min-width:210px;color:var(--faint);transition:border-color .16s,box-shadow .16s}
.search:focus-within{border-color:var(--line-2);box-shadow:0 0 0 3px rgba(229,20,42,.14)}
.search input{flex:1;background:none;border:none;outline:none;color:var(--ink);font-size:13.5px;font-family:inherit}
.search input::placeholder{color:var(--faint)}.search svg{width:16px;height:16px;flex:none}
.burger{margin-left:auto;width:40px;height:40px;display:flex;align-items:center;justify-content:center;border:1px solid var(--line);border-radius:9px;background:var(--surface)}
@media(min-width:900px){.nav-links{display:flex}.search{display:flex}.burger{display:none}}

main{max-width:var(--maxw);margin:0 auto;padding:22px 16px 60px}
@media(min-width:700px){main{padding:30px 22px 72px}}
.page-h{display:flex;flex-wrap:wrap;align-items:flex-end;gap:10px 16px}
.page-h h1{font-family:var(--disp);font-weight:700;font-size:clamp(28px,5vw,42px);letter-spacing:.04em;text-transform:uppercase;line-height:1}
.page-h .ev{font-size:14px;color:var(--muted);font-weight:600}
.page-h .live{margin-left:auto;display:inline-flex;align-items:center;gap:7px;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--faint);font-weight:700}
.page-h .live .dot{width:8px;height:8px;border-radius:50%;background:var(--up)}
.cap{margin:12px 0 4px;font-size:12.5px;color:var(--faint);line-height:1.6;max-width:70ch}
.cap b{color:var(--muted)}

/* legend */
.legend{display:flex;flex-wrap:wrap;gap:8px 18px;margin:16px 0 6px;font-size:11.5px;color:var(--muted)}
.legend .l{display:inline-flex;align-items:center;gap:7px}
.legend .sw{width:11px;height:11px;border-radius:3px}
.legend .sw.fav{background:var(--gold)}
.legend .up{color:var(--up);font-weight:700}.legend .dn{color:var(--down);font-weight:700}

/* table (desktop) */
.oddscard{border:1px solid var(--line);border-radius:16px;overflow:hidden;background:var(--surface);margin-top:12px}
table.odds{width:100%;border-collapse:collapse}
table.odds thead th{font-family:var(--disp);font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--faint);
  font-weight:700;text-align:left;padding:14px 18px;border-bottom:1px solid var(--line);background:var(--surface-2)}
table.odds thead th.r{text-align:right}
table.odds tbody td{padding:14px 18px;border-bottom:1px solid var(--line);vertical-align:middle}
table.odds tbody tr:last-child td{border-bottom:none}
table.odds tbody tr{transition:background .14s}
table.odds tbody tr:hover{background:var(--surface-2)}
.bout .f{font-family:var(--disp);font-weight:600;font-size:18px;text-transform:uppercase;line-height:1.1}
.bout .f .rec{font-family:var(--text);font-weight:500;font-size:11.5px;text-transform:none;color:var(--faint);margin-left:8px;font-variant-numeric:tabular-nums}
.bout .vs{color:var(--faint);font-size:12px;margin:2px 0}
.wc{font-family:var(--disp);font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
.wc .rd{display:block;font-family:var(--text);font-weight:500;font-size:11px;letter-spacing:0;text-transform:none;color:var(--faint);margin-top:3px}
.ml-cell{text-align:right}
.ml-line{display:flex;justify-content:flex-end;align-items:center;gap:10px}
.ml{display:inline-flex;flex-direction:column;align-items:flex-end;min-width:66px;padding:8px 12px;border-radius:9px;background:var(--surface-2);border:1px solid var(--line)}
.ml .v{font-family:var(--disp);font-weight:700;font-size:17px;font-variant-numeric:tabular-nums}
.ml .who{font-size:10px;color:var(--faint);letter-spacing:.04em;margin-top:1px;white-space:nowrap}
.ml.fav{border-color:rgba(216,180,90,.4);background:rgba(216,180,90,.08)}
.ml.fav .v{color:var(--gold)}
.mv{display:inline-flex;align-items:center;gap:3px;font-family:var(--disp);font-weight:700;font-size:12px;font-variant-numeric:tabular-nums}
.mv svg{width:11px;height:11px}
.mv.up{color:var(--up)}.mv.dn{color:var(--down)}
.pending{font-family:var(--disp);font-size:13px;letter-spacing:.1em;text-transform:uppercase;color:var(--faint);
  border:1px dashed var(--line-2);border-radius:8px;padding:8px 14px;display:inline-block}

/* mobile reflow to cards */
@media(max-width:700px){
  table.odds,table.odds tbody,table.odds tr,table.odds td{display:block;width:100%}
  table.odds thead{display:none}
  table.odds tbody tr{padding:16px 16px 14px;border-bottom:1px solid var(--line)}
  table.odds tbody td{border:none;padding:0}
  .bout{margin-bottom:10px}
  .wc{margin-bottom:12px;display:block}
  .ml-line{justify-content:space-between}
  .ml{flex:1;align-items:flex-start}
  .ml .who{order:-1;margin:0 0 2px}
  .ml-cell{text-align:left}
}

footer{max-width:var(--maxw);margin:34px auto 0;padding:24px 22px;border-top:1px solid var(--line);font-size:11.5px;color:var(--faint);line-height:1.7;text-align:center}
footer b{color:var(--muted)}
</style>
</head>
<body>

<header class="nav">
  <div class="nav-in">
    <div class="logo">EDGE<b>ENGINE</b></div>
    <nav class="nav-links"><a href="home.html">Home</a><a href="events.html">Events</a><a href="rankings.html">Rankings</a><a href="#" class="active">Odds</a><a href="predict.html">Predictions</a></nav>
    <label class="search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.5-4.5"/></svg><input type="text" placeholder="Search fighters…" aria-label="Search fighters"></label>
    <button class="burger" aria-label="Menu"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>
  </div>
</header>

<main>
  <div class="page-h">
    <h1>Live Odds</h1>
    <span class="ev">UFC Fight Night: Ankalaev vs. Guskov · Sat, Jul 25, 2026</span>
    <span class="live"><span class="dot"></span> ESPN BET</span>
  </div>
  <p class="cap">ESPN BET moneylines, refreshed at most every 15 minutes. <b>Favorite highlighted in gold; arrows show line movement since open.</b> Bouts show <b>Pending</b> until a line is posted.</p>

  <div class="legend">
    <span class="l"><span class="sw fav"></span> Favorite</span>
    <span class="l"><span class="up">▲</span> Line shortened</span>
    <span class="l"><span class="dn">▼</span> Line drifted</span>
    <span class="l">Prices are American odds.</span>
  </div>

  <div class="oddscard">
    <table class="odds">
      <thead>
        <tr><th>Bout</th><th>Class</th><th class="r">Moneyline · Movement</th></tr>
      </thead>
      <tbody>
        <tr>
          <td><div class="bout"><div class="f">Ankalaev <span class="rec">21–2–1</span></div><div class="vs">vs</div><div class="f">Guskov <span class="rec">18–3–1</span></div></div></td>
          <td class="wc">Light Heavy<span class="rd">5 Rounds</span></td>
          <td class="ml-cell"><div class="ml-line">
            <span class="ml"><span class="who">Ankalaev</span><span class="v num">+130</span></span>
            <span class="mv dn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>15</span>
            <span class="ml fav"><span class="who">Guskov</span><span class="v num">−150</span></span>
            <span class="mv up"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 15l6-6 6 6"/></svg>20</span>
          </div></td>
        </tr>
        <tr>
          <td><div class="bout"><div class="f">Magomedov <span class="rec">15–1–0</span></div><div class="vs">vs</div><div class="f">Barriault <span class="rec">17–9–0</span></div></div></td>
          <td class="wc">Middleweight<span class="rd">3 Rounds</span></td>
          <td class="ml-cell"><div class="ml-line">
            <span class="ml fav"><span class="who">Magomedov</span><span class="v num">−190</span></span>
            <span class="mv up"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 15l6-6 6 6"/></svg>10</span>
            <span class="ml"><span class="who">Barriault</span><span class="v num">+160</span></span>
            <span class="mv dn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>10</span>
          </div></td>
        </tr>
        <tr>
          <td><div class="bout"><div class="f">Haqparast <span class="rec">17–5–0</span></div><div class="vs">vs</div><div class="f">Ribovics <span class="rec">13–1–0</span></div></div></td>
          <td class="wc">Lightweight<span class="rd">3 Rounds</span></td>
          <td class="ml-cell"><div class="ml-line">
            <span class="ml"><span class="who">Haqparast</span><span class="v num">+105</span></span>
            <span class="mv up"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 15l6-6 6 6"/></svg>25</span>
            <span class="ml fav"><span class="who">Ribovics</span><span class="v num">−125</span></span>
            <span class="mv dn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>25</span>
          </div></td>
        </tr>
        <tr>
          <td><div class="bout"><div class="f">Aliskerov <span class="rec">16–2–0</span></div><div class="vs">vs</div><div class="f">Park <span class="rec">18–6–0</span></div></div></td>
          <td class="wc">Middleweight<span class="rd">3 Rounds</span></td>
          <td class="ml-cell"><div class="ml-line">
            <span class="ml fav"><span class="who">Aliskerov</span><span class="v num">−260</span></span>
            <span class="mv up"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 15l6-6 6 6"/></svg>30</span>
            <span class="ml"><span class="who">Park</span><span class="v num">+215</span></span>
            <span class="mv dn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>30</span>
          </div></td>
        </tr>
        <tr>
          <td><div class="bout"><div class="f">Nurmagomedov <span class="rec">18–1–0</span></div><div class="vs">vs</div><div class="f">Kutateladze <span class="rec">13–3–0</span></div></div></td>
          <td class="wc">Bantamweight<span class="rd">3 Rounds</span></td>
          <td class="ml-cell"><div class="ml-line"><span class="pending">Pending — line not posted</span></div></td>
        </tr>
      </tbody>
    </table>
  </div>
</main>

<footer>Probabilities, not locks — a single punch can end any fight. If you bet, bet only what you can afford to lose. <b>21+.</b> Not affiliated with the UFC or ESPN.</footer>
</body>
</html>

```

---

## `events.html`
**Events — /events**

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Edge Engine — Events</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Saira+Condensed:wght@500;600;700;800&family=Archivo:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
:root{
  --bg:#0c0a0b;--surface:#161315;--surface-2:#1d191b;--line:#2b2528;--line-2:#3a3033;
  --ink:#f4f1f2;--muted:#a49aa0;--faint:#6d646a;--oxblood:#b11226;--red:#e5142a;--red-soft:#ff5061;
  --gold:#d8b45a;--up:#35c281;--down:#ff5470;
  --disp:"Saira Condensed",system-ui,sans-serif;--text:"Archivo",system-ui,sans-serif;--maxw:1160px;
}
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
html{color-scheme:dark}
body{font-family:var(--text);color:var(--ink);min-height:100vh;line-height:1.5;font-feature-settings:"tnum" 1;-webkit-font-smoothing:antialiased;
  background:radial-gradient(60% 40% at 82% -5%,rgba(177,18,38,.12),transparent 70%),radial-gradient(50% 40% at 8% 4%,rgba(216,180,90,.05),transparent 70%),var(--bg);background-attachment:fixed}
.num{font-variant-numeric:tabular-nums}
a{color:inherit;text-decoration:none}
:focus-visible{outline:2px solid var(--red);outline-offset:2px;border-radius:4px}
::selection{background:rgba(229,20,42,.35)}
button{font-family:inherit;cursor:pointer;color:inherit}

.nav{position:sticky;top:0;z-index:50;background:rgba(12,10,11,.82);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-bottom:1px solid var(--line)}
.nav-in{max-width:var(--maxw);margin:0 auto;display:flex;align-items:center;gap:22px;padding:14px 22px;min-height:60px}
.logo{font-family:var(--disp);font-weight:700;font-size:22px;letter-spacing:.06em;text-transform:uppercase;white-space:nowrap;line-height:1}
.logo b{color:var(--red)}
.nav-links{display:none;gap:4px;margin-left:6px}
.nav-links a{color:var(--muted);font-size:13px;font-weight:600;padding:8px 12px;border-radius:7px;transition:color .16s,background .16s}
.nav-links a:hover{color:var(--ink);background:rgba(255,255,255,.04)}
.nav-links a.active{color:var(--ink)}.nav-links a.active::after{content:"";display:block;height:2px;margin-top:5px;border-radius:2px;background:var(--red)}
.search{margin-left:auto;display:none;align-items:center;gap:9px;background:var(--surface);border:1px solid var(--line);border-radius:9px;padding:8px 13px;min-width:210px;color:var(--faint);transition:border-color .16s,box-shadow .16s}
.search:focus-within{border-color:var(--line-2);box-shadow:0 0 0 3px rgba(229,20,42,.14)}
.search input{flex:1;background:none;border:none;outline:none;color:var(--ink);font-size:13.5px;font-family:inherit}
.search input::placeholder{color:var(--faint)}.search svg{width:16px;height:16px;flex:none}
.burger{margin-left:auto;width:40px;height:40px;display:flex;align-items:center;justify-content:center;border:1px solid var(--line);border-radius:9px;background:var(--surface)}
@media(min-width:900px){.nav-links{display:flex}.search{display:flex}.burger{display:none}}

main{max-width:var(--maxw);margin:0 auto;padding:22px 16px 60px}
@media(min-width:700px){main{padding:30px 22px 72px}}
.page-h h1{font-family:var(--disp);font-weight:700;font-size:clamp(30px,5vw,44px);letter-spacing:.04em;text-transform:uppercase}
.sec-h{display:flex;align-items:baseline;gap:12px;margin:26px 2px 14px}
.sec-h h2{font-family:var(--disp);font-weight:700;font-size:20px;letter-spacing:.05em;text-transform:uppercase}
.sec-h .rule{flex:1;height:1px;background:var(--line)}

.uplist{border:1px solid var(--line);border-radius:16px;overflow:hidden;background:var(--surface)}
.ev{display:flex;align-items:center;gap:16px;padding:16px 18px;border-bottom:1px solid var(--line);transition:background .14s}
.ev:last-child{border-bottom:none}.ev:hover{background:var(--surface-2)}
.ev .date{flex:none;width:56px;text-align:center;border-right:1px solid var(--line);padding-right:16px}
.ev .date .m{font-family:var(--disp);font-weight:700;font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:var(--red-soft)}
.ev.final .date .m{color:var(--faint)}
.ev .date .d{font-family:var(--disp);font-weight:700;font-size:28px;line-height:1;font-variant-numeric:tabular-nums}
.ev .info{flex:1;min-width:0}
.ev .info .t{font-weight:600;font-size:15px;line-height:1.3}
.ev .info .s{font-size:12.5px;color:var(--muted);margin-top:3px;font-variant-numeric:tabular-nums}
.ev .tag{font-family:var(--disp);font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;padding:3px 9px 2px;border-radius:5px;flex:none}
.ev .tag.ppv{background:rgba(216,180,90,.12);color:var(--gold);border:1px solid rgba(216,180,90,.28)}
.ev .tag.fn{background:rgba(229,20,42,.1);color:var(--red-soft);border:1px solid rgba(229,20,42,.25)}
.ev .tag.done{background:rgba(53,194,129,.12);color:var(--up);border:1px solid rgba(53,194,129,.26)}
.ev .chev{color:var(--faint)}
@media(max-width:540px){.ev .tag{display:none}}
footer{max-width:var(--maxw);margin:40px auto 0;padding:24px 22px;border-top:1px solid var(--line);font-size:11.5px;color:var(--faint);line-height:1.7;text-align:center}
footer b{color:var(--muted)}
</style>
</head>
<body>

<header class="nav">
  <div class="nav-in">
    <div class="logo">EDGE<b>ENGINE</b></div>
    <nav class="nav-links"><a href="home.html">Home</a><a href="#" class="active">Events</a><a href="rankings.html">Rankings</a><a href="odds.html">Odds</a><a href="matchup.html">Predictions</a></nav>
    <label class="search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.5-4.5"/></svg><input type="text" placeholder="Search fighters…" aria-label="Search fighters"></label>
    <button class="burger" aria-label="Menu"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>
  </div>
</header>

<main>
  <div class="page-h"><h1>Events</h1></div>

  <div class="sec-h"><h2>Upcoming Events</h2><span class="rule"></span></div>
  <section class="uplist">
    <a class="ev" href="event.html"><div class="date"><div class="m">Jul</div><div class="d num">25</div></div><div class="info"><div class="t">UFC Fight Night: Ankalaev vs. Guskov</div><div class="s">Sat · 12:00 PM ET · Etihad Arena, Abu Dhabi</div></div><span class="tag fn">Fight Night</span><svg class="chev" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg></a>
    <a class="ev" href="event.html"><div class="date"><div class="m">Aug</div><div class="d num">01</div></div><div class="info"><div class="t">UFC 320: Pereira vs. Ankalaev 2</div><div class="s">Sat · 10:00 PM ET · T-Mobile Arena, Las Vegas</div></div><span class="tag ppv">PPV</span><svg class="chev" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg></a>
    <a class="ev" href="event.html"><div class="date"><div class="m">Aug</div><div class="d num">08</div></div><div class="info"><div class="t">UFC Fight Night: Dolidze vs. Hernandez</div><div class="s">Sat · 7:00 PM ET · UFC APEX, Las Vegas</div></div><span class="tag fn">Fight Night</span><svg class="chev" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg></a>
    <a class="ev" href="event.html"><div class="date"><div class="m">Aug</div><div class="d num">15</div></div><div class="info"><div class="t">UFC Fight Night: Whittaker vs. de Ridder</div><div class="s">Sat · 1:00 PM ET · Etihad Arena, Abu Dhabi</div></div><span class="tag fn">Fight Night</span><svg class="chev" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg></a>
  </section>

  <div class="sec-h"><h2>Recent Results</h2><span class="rule"></span></div>
  <section class="uplist">
    <a class="ev final" href="event.html"><div class="date"><div class="m">Jul</div><div class="d num">18</div></div><div class="info"><div class="t">UFC Fight Night: Taira vs. Park</div><div class="s">Oklahoma City · Results available</div></div><span class="tag done">Final</span><svg class="chev" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg></a>
    <a class="ev final" href="event.html"><div class="date"><div class="m">Jul</div><div class="d num">12</div></div><div class="info"><div class="t">UFC 319: du Plessis vs. Chimaev</div><div class="s">Chicago · Results available</div></div><span class="tag done">Final</span><svg class="chev" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg></a>
    <a class="ev final" href="event.html"><div class="date"><div class="m">Jun</div><div class="d num">28</div></div><div class="info"><div class="t">UFC Fight Night: Lewis vs. Teixeira</div><div class="s">Nashville · Results available</div></div><span class="tag done">Final</span><svg class="chev" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg></a>
  </section>
</main>

<footer>Probabilities, not locks — a single punch can end any fight. If you bet, bet only what you can afford to lose. <b>21+.</b> Not affiliated with the UFC or ESPN.</footer>
</body>
</html>

```

---

## `predict.html`
**Predictions board — /predict**

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Edge Engine — Predictions</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Saira+Condensed:wght@500;600;700;800&family=Archivo:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
:root{
  --bg:#0c0a0b;--surface:#161315;--surface-2:#1d191b;--line:#2b2528;--line-2:#3a3033;
  --ink:#f4f1f2;--muted:#a49aa0;--faint:#6d646a;--oxblood:#b11226;--red:#e5142a;--red-soft:#ff5061;
  --gold:#d8b45a;--up:#35c281;--down:#ff5470;
  --disp:"Saira Condensed",system-ui,sans-serif;--text:"Archivo",system-ui,sans-serif;--maxw:1160px;
}
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
html{color-scheme:dark}
body{font-family:var(--text);color:var(--ink);min-height:100vh;line-height:1.5;font-feature-settings:"tnum" 1;-webkit-font-smoothing:antialiased;
  background:radial-gradient(60% 40% at 82% -5%,rgba(177,18,38,.12),transparent 70%),radial-gradient(50% 40% at 8% 4%,rgba(216,180,90,.05),transparent 70%),var(--bg);background-attachment:fixed}
.num{font-variant-numeric:tabular-nums}
a{color:inherit;text-decoration:none}
:focus-visible{outline:2px solid var(--red);outline-offset:2px;border-radius:4px}
::selection{background:rgba(229,20,42,.35)}
button{font-family:inherit;cursor:pointer;color:inherit}

.nav{position:sticky;top:0;z-index:50;background:rgba(12,10,11,.82);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-bottom:1px solid var(--line)}
.nav-in{max-width:var(--maxw);margin:0 auto;display:flex;align-items:center;gap:22px;padding:14px 22px;min-height:60px}
.logo{font-family:var(--disp);font-weight:700;font-size:22px;letter-spacing:.06em;text-transform:uppercase;white-space:nowrap;line-height:1}
.logo b{color:var(--red)}
.nav-links{display:none;gap:4px;margin-left:6px}
.nav-links a{color:var(--muted);font-size:13px;font-weight:600;padding:8px 12px;border-radius:7px;transition:color .16s,background .16s}
.nav-links a:hover{color:var(--ink);background:rgba(255,255,255,.04)}
.nav-links a.active{color:var(--ink)}.nav-links a.active::after{content:"";display:block;height:2px;margin-top:5px;border-radius:2px;background:var(--red)}
.search{margin-left:auto;display:none;align-items:center;gap:9px;background:var(--surface);border:1px solid var(--line);border-radius:9px;padding:8px 13px;min-width:210px;color:var(--faint);transition:border-color .16s,box-shadow .16s}
.search:focus-within{border-color:var(--line-2);box-shadow:0 0 0 3px rgba(229,20,42,.14)}
.search input{flex:1;background:none;border:none;outline:none;color:var(--ink);font-size:13.5px;font-family:inherit}
.search input::placeholder{color:var(--faint)}.search svg{width:16px;height:16px;flex:none}
.burger{margin-left:auto;width:40px;height:40px;display:flex;align-items:center;justify-content:center;border:1px solid var(--line);border-radius:9px;background:var(--surface)}
@media(min-width:900px){.nav-links{display:flex}.search{display:flex}.burger{display:none}}

main{max-width:var(--maxw);margin:0 auto;padding:22px 16px 60px}
@media(min-width:700px){main{padding:28px 22px 72px}}

/* ===== forecast hero ===== */
.hero{position:relative;border:1px solid var(--line);border-radius:16px;overflow:hidden;background:var(--surface);
  background-image:linear-gradient(105deg,#221319 0%,#171216 46%,#141013 100%)}
.hero-in{padding:24px 22px}
.hero .kick{display:inline-flex;align-items:center;gap:8px;font-family:var(--disp);font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:var(--muted)}
.hero .kick .dot{width:7px;height:7px;border-radius:50%;background:var(--up);box-shadow:0 0 8px rgba(53,194,129,.7);animation:pulse 2.4s ease-in-out infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
.hero h1{font-family:var(--disp);font-weight:700;font-size:clamp(30px,5.4vw,50px);line-height:.94;text-transform:uppercase;margin:12px 0 8px}
.hero .meta{font-size:13px;color:var(--muted);font-variant-numeric:tabular-nums}
.hero .meta b{color:var(--gold);font-weight:600}
.hero .stats{display:flex;flex-wrap:wrap;gap:26px;margin-top:20px}
.hero .stat .n{font-family:var(--disp);font-weight:700;font-size:30px;line-height:1}
.hero .stat .l{font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--faint);font-weight:600;margin-top:4px}
.hero .cta{display:flex;flex-wrap:wrap;gap:10px;margin-top:22px}
.btn{font-family:var(--disp);font-weight:700;font-size:14px;letter-spacing:.08em;text-transform:uppercase;
  padding:12px 20px;border-radius:9px;border:1px solid transparent;display:inline-flex;align-items:center;gap:9px;transition:transform .14s,background .16s,border-color .16s}
.btn svg{width:16px;height:16px}
.btn:active{transform:translateY(1px)}
.btn.primary{background:var(--red);color:#fff}.btn.primary:hover{background:#f01b32}
.btn.ghost{background:transparent;border-color:var(--line-2);color:var(--ink)}.btn.ghost:hover{border-color:var(--muted);background:rgba(255,255,255,.03)}

.sec-h{display:flex;align-items:baseline;gap:12px;margin:30px 2px 16px}
.sec-h h2{font-family:var(--disp);font-weight:700;font-size:20px;letter-spacing:.05em;text-transform:uppercase}
.sec-h .rule{flex:1;height:1px;background:var(--line)}
.sec-h .meta{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--faint);font-weight:600}

/* ===== bout board ===== */
.board{display:grid;gap:14px}
.bout{border:1px solid var(--line);border-radius:14px;background:var(--surface);padding:16px 18px 18px;transition:border-color .16s,transform .16s;
  opacity:0;transform:translateY(10px);animation:rise .5s cubic-bezier(.22,1,.36,1) forwards}
@keyframes rise{to{opacity:1;transform:none}}
.bout:hover{border-color:var(--line-2)}
.bout-top{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:15px}
.bout-slot{display:flex;gap:5px;flex-wrap:wrap}
.tg{font-family:var(--disp);font-size:10.5px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;padding:3px 8px 2px;border-radius:5px;border:1px solid var(--line-2);color:var(--faint)}
.tg.main{background:rgba(216,180,90,.12);color:var(--gold);border-color:rgba(216,180,90,.3)}
.bout-names{flex:1;min-width:200px;font-family:var(--disp);font-weight:700;font-size:clamp(18px,3vw,24px);text-transform:uppercase;line-height:1}
.bout-names .vs{color:var(--faint);font-weight:600;margin:0 8px}
.bout-run{margin-left:auto;display:inline-flex;align-items:center;gap:7px;font-family:var(--disp);font-size:12px;letter-spacing:.08em;text-transform:uppercase;font-weight:700;
  color:var(--muted);border:1px solid var(--line-2);border-radius:8px;padding:8px 13px;transition:color .16s,border-color .16s,background .16s;white-space:nowrap}
.bout-run:hover{color:var(--ink);border-color:var(--muted);background:rgba(255,255,255,.03)}
.bout-run svg{width:14px;height:14px}

.tug{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:14px}
.tug .end{min-width:0}
.tug .end.r{text-align:right}
.tug .end .nm{font-family:var(--disp);font-weight:600;font-size:13px;text-transform:uppercase;color:var(--muted);white-space:nowrap}
.tug .end .nm.fav{color:var(--ink)}
.tug .end .p{font-family:var(--disp);font-weight:700;font-size:26px;line-height:.9;color:var(--muted)}
.tug .end .p.fav{color:#fff}
.track{position:relative;height:14px;border-radius:8px;background:var(--surface-2);border:1px solid var(--line);overflow:hidden}
.track .fill{position:absolute;left:0;top:0;bottom:0;background:linear-gradient(90deg,var(--oxblood),var(--red));border-radius:0;width:0;transition:width 1s cubic-bezier(.22,1,.36,1)}
.track.rightfav .fill{left:auto;right:0;background:linear-gradient(270deg,var(--oxblood),var(--red))}
.track .mid{position:absolute;left:50%;top:0;bottom:0;width:1px;background:rgba(244,241,242,.14)}
.track .knot{position:absolute;top:-4px;bottom:-4px;width:3px;background:var(--gold);transform:translateX(-50%);box-shadow:0 0 10px rgba(216,180,90,.6);transition:left 1s cubic-bezier(.22,1,.36,1)}

.bout-read{display:flex;flex-wrap:wrap;align-items:center;gap:8px 10px;margin-top:15px;padding-top:14px;border-top:1px solid var(--line)}
.chip{font-family:var(--disp);font-size:12px;letter-spacing:.06em;text-transform:uppercase;font-weight:700;padding:4px 11px 3px;border-radius:6px;display:inline-flex;align-items:center;gap:6px}
.chip.tier-strong{background:rgba(53,194,129,.12);color:var(--up);border:1px solid rgba(53,194,129,.28)}
.chip.tier-solid{background:rgba(216,180,90,.12);color:var(--gold);border:1px solid rgba(216,180,90,.3)}
.chip.tier-lean{background:rgba(229,20,42,.1);color:var(--red-soft);border:1px solid rgba(229,20,42,.25)}
.chip.tier-flip{background:rgba(164,154,160,.1);color:var(--muted);border:1px solid var(--line-2)}
.chip.method{background:var(--surface-2);color:var(--ink);border:1px solid var(--line-2)}
.chip.round{background:transparent;color:var(--muted);border:1px solid var(--line)}
.chip.vet{background:transparent;color:var(--gold);border:1px solid rgba(216,180,90,.3)}
.bout-read .anchor{margin-left:auto;font-size:11.5px;color:var(--faint);font-variant-numeric:tabular-nums}
.bout-read .anchor b{color:var(--muted);font-weight:600}

/* other cards list */
.uplist{border:1px solid var(--line);border-radius:16px;overflow:hidden;background:var(--surface)}
.ev{display:flex;align-items:center;gap:16px;padding:16px 18px;border-bottom:1px solid var(--line);transition:background .14s}
.ev:last-child{border-bottom:none}.ev:hover{background:var(--surface-2)}
.ev .date{flex:none;width:56px;text-align:center;border-right:1px solid var(--line);padding-right:16px}
.ev .date .m{font-family:var(--disp);font-weight:700;font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:var(--red-soft)}
.ev .date .d{font-family:var(--disp);font-weight:700;font-size:28px;line-height:1;font-variant-numeric:tabular-nums}
.ev .info{flex:1;min-width:0}
.ev .info .t{font-weight:600;font-size:15px;line-height:1.3}
.ev .info .s{font-size:12.5px;color:var(--muted);margin-top:3px}
.ev .chev{color:var(--faint)}

footer{max-width:var(--maxw);margin:40px auto 0;padding:24px 22px;border-top:1px solid var(--line);font-size:11.5px;color:var(--faint);line-height:1.7;text-align:center}
footer b{color:var(--muted)}
@media(prefers-reduced-motion:reduce){.bout{animation:none;opacity:1;transform:none}.track .fill,.track .knot{transition:none}}
</style>
</head>
<body>

<header class="nav">
  <div class="nav-in">
    <div class="logo">EDGE<b>ENGINE</b></div>
    <nav class="nav-links"><a href="home.html">Home</a><a href="events.html">Events</a><a href="rankings.html">Rankings</a><a href="odds.html">Odds</a><a href="#" class="active">Predictions</a></nav>
    <label class="search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.5-4.5"/></svg><input type="text" placeholder="Search fighters…" aria-label="Search fighters"></label>
    <button class="burger" aria-label="Menu"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>
  </div>
</header>

<main>
  <!-- FORECAST HERO -->
  <section class="hero">
    <div class="hero-in">
      <span class="kick"><span class="dot"></span> Edge Engine · current card forecast</span>
      <h1>UFC Fight Night<br>Ankalaev vs. Guskov</h1>
      <div class="meta">Sat, Jul 25 · 12:00 PM ET · Etihad Arena, Abu Dhabi — <b>market-anchored</b>, lines posted</div>
      <div class="stats">
        <div class="stat"><div class="n num">6</div><div class="l">Bouts read</div></div>
        <div class="stat"><div class="n num" style="color:var(--gold)">2</div><div class="l">Strong picks</div></div>
        <div class="stat"><div class="n num">3</div><div class="l">Finishes projected</div></div>
        <div class="stat"><div class="n num" style="color:var(--muted)">85%</div><div class="l">Confidence cap</div></div>
      </div>
      <div class="cta">
        <button class="btn primary"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3l14 9-14 9z"/></svg> Run full card</button>
        <a class="btn ghost" href="events.html"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v3M16 2v3M3 8h18M5 5h14a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z"/></svg> Full schedule</a>
      </div>
    </div>
  </section>

  <div class="sec-h"><h2>The read, bout by bout</h2><span class="rule"></span><span class="meta">tap a bout for full reasoning</span></div>

  <!-- BOUT BOARD -->
  <section class="board" id="board">
    <a class="bout" href="matchup-v2.html" style="animation-delay:.02s">
      <div class="bout-top">
        <div class="bout-slot"><span class="tg main">Main event</span><span class="tg">LHW</span><span class="tg">5 Rds</span></div>
        <div class="bout-run">View <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg></div>
      </div>
      <div class="bout-names">Ankalaev<span class="vs">vs</span>Guskov</div>
      <div class="tug" style="margin-top:14px">
        <div class="end"><div class="nm">Ankalaev</div><div class="p num">40</div></div>
        <div class="track rightfav" data-fav="60"><div class="fill"></div><div class="mid"></div><div class="knot"></div></div>
        <div class="end r"><div class="nm fav">Guskov</div><div class="p num fav">60</div></div>
      </div>
      <div class="bout-read">
        <span class="chip tier-solid">Guskov · Solid</span>
        <span class="chip method">KO / TKO</span>
        <span class="chip round">R1</span>
        <span class="anchor">Vegas <b class="num">58%</b> · nudge <b style="color:var(--up)">+2</b></span>
      </div>
    </a>

    <a class="bout" href="matchup-v2.html" style="animation-delay:.08s">
      <div class="bout-top">
        <div class="bout-slot"><span class="tg">Co-main</span><span class="tg">LW</span><span class="tg">3 Rds</span></div>
        <div class="bout-run">Run <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg></div>
      </div>
      <div class="bout-names">Hooker<span class="vs">vs</span>Fiziev</div>
      <div class="tug" style="margin-top:14px">
        <div class="end"><div class="nm">Hooker</div><div class="p num">43</div></div>
        <div class="track rightfav" data-fav="57"><div class="fill"></div><div class="mid"></div><div class="knot"></div></div>
        <div class="end r"><div class="nm fav">Fiziev</div><div class="p num fav">57</div></div>
      </div>
      <div class="bout-read">
        <span class="chip tier-lean">Fiziev · Lean</span>
        <span class="chip method">KO / TKO</span>
        <span class="chip round">R2</span>
        <span class="anchor">Vegas <b class="num">56%</b> · nudge <b style="color:var(--up)">+1</b></span>
      </div>
    </a>

    <a class="bout" href="matchup-v2.html" style="animation-delay:.14s">
      <div class="bout-top">
        <div class="bout-slot"><span class="tg">Women's FLW</span><span class="tg">3 Rds</span></div>
        <div class="bout-run">Run <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg></div>
      </div>
      <div class="bout-names">Ribas<span class="vs">vs</span>Fiorot</div>
      <div class="tug" style="margin-top:14px">
        <div class="end"><div class="nm">Ribas</div><div class="p num">36</div></div>
        <div class="track rightfav" data-fav="64"><div class="fill"></div><div class="mid"></div><div class="knot"></div></div>
        <div class="end r"><div class="nm fav">Fiorot</div><div class="p num fav">64</div></div>
      </div>
      <div class="bout-read">
        <span class="chip tier-solid">Fiorot · Solid</span>
        <span class="chip method">Decision</span>
        <span class="chip round">Distance</span>
        <span class="chip vet">VET</span>
        <span class="anchor">Vegas <b class="num">66%</b> · nudge <b style="color:var(--down)">−2</b></span>
      </div>
    </a>

    <a class="bout" href="matchup-v2.html" style="animation-delay:.20s">
      <div class="bout-top">
        <div class="bout-slot"><span class="tg">MW</span><span class="tg">3 Rds</span></div>
        <div class="bout-run">Run <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg></div>
      </div>
      <div class="bout-names">Aliskerov<span class="vs">vs</span>Hernandez</div>
      <div class="tug" style="margin-top:14px">
        <div class="end"><div class="nm fav">Aliskerov</div><div class="p num fav">69</div></div>
        <div class="track" data-fav="69"><div class="fill"></div><div class="mid"></div><div class="knot"></div></div>
        <div class="end r"><div class="nm">Hernandez</div><div class="p num">31</div></div>
      </div>
      <div class="bout-read">
        <span class="chip tier-strong">Aliskerov · Strong</span>
        <span class="chip method">KO / TKO</span>
        <span class="chip round">R1</span>
        <span class="anchor">Vegas <b class="num">70%</b> · nudge <b style="color:var(--down)">−1</b></span>
      </div>
    </a>

    <a class="bout" href="matchup-v2.html" style="animation-delay:.26s">
      <div class="bout-top">
        <div class="bout-slot"><span class="tg">HW</span><span class="tg">3 Rds</span></div>
        <div class="bout-run">Run <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg></div>
      </div>
      <div class="bout-names">Nasrat<span class="vs">vs</span>Buday</div>
      <div class="tug" style="margin-top:14px">
        <div class="end"><div class="nm">Nasrat</div><div class="p num">38</div></div>
        <div class="track rightfav" data-fav="62"><div class="fill"></div><div class="mid"></div><div class="knot"></div></div>
        <div class="end r"><div class="nm fav">Buday</div><div class="p num fav">62</div></div>
      </div>
      <div class="bout-read">
        <span class="chip tier-solid">Buday · Solid</span>
        <span class="chip method">KO / TKO</span>
        <span class="chip round">R2</span>
        <span class="anchor">Vegas <b class="num">61%</b> · nudge <b style="color:var(--up)">+1</b></span>
      </div>
    </a>

    <a class="bout" href="matchup-v2.html" style="animation-delay:.32s">
      <div class="bout-top">
        <div class="bout-slot"><span class="tg">FLW</span><span class="tg">3 Rds</span></div>
        <div class="bout-run">Run <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg></div>
      </div>
      <div class="bout-names">Fahmy<span class="vs">vs</span>Elliott</div>
      <div class="tug" style="margin-top:14px">
        <div class="end"><div class="nm">Fahmy</div><div class="p num">47</div></div>
        <div class="track rightfav" data-fav="53"><div class="fill"></div><div class="mid"></div><div class="knot"></div></div>
        <div class="end r"><div class="nm fav">Elliott</div><div class="p num fav">53</div></div>
      </div>
      <div class="bout-read">
        <span class="chip tier-flip">Elliott · Coin-flip</span>
        <span class="chip method">Decision</span>
        <span class="chip round">Distance</span>
        <span class="anchor">Vegas <b class="num">52%</b> · nudge <b style="color:var(--up)">+1</b></span>
      </div>
    </a>
  </section>

  <div class="sec-h"><h2>Other upcoming cards</h2><span class="rule"></span><span class="meta">pick a matchup to run</span></div>
  <section class="uplist">
    <a class="ev" href="events.html"><div class="date"><div class="m">Aug</div><div class="d num">01</div></div><div class="info"><div class="t">UFC 320: Pereira vs. Ankalaev 2</div><div class="s">Lines not yet posted</div></div><svg class="chev" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg></a>
    <a class="ev" href="events.html"><div class="date"><div class="m">Aug</div><div class="d num">08</div></div><div class="info"><div class="t">UFC Fight Night: Dolidze vs. Hernandez</div><div class="s">Lines not yet posted</div></div><svg class="chev" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg></a>
    <a class="ev" href="events.html"><div class="date"><div class="m">Aug</div><div class="d num">15</div></div><div class="info"><div class="t">UFC Fight Night: Whittaker vs. de Ridder</div><div class="s">Lines not yet posted</div></div><svg class="chev" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg></a>
  </section>
</main>

<footer>Probabilities, not locks — a single punch can end any fight. Model reads are market-anchored and capped at 85% by design. If you bet, bet only what you can afford to lose. <b>21+.</b> Not affiliated with the UFC or ESPN.</footer>

<script>
window.addEventListener("load",()=>{
  const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll(".track").forEach(t=>{
    const fav=+t.dataset.fav, right=t.classList.contains("rightfav");
    const set=()=>{t.querySelector(".fill").style.width=fav+"%";t.querySelector(".knot").style[right?"right":"left"]=fav+"%";};
    if(reduce){set();return;}
    setTimeout(set,120);
  });
});
</script>
</body>
</html>

```

---

## `predict-dev.html`
**Dev cards — /predict/dev**

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Edge Engine — Dev Cards</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Saira+Condensed:wght@500;600;700;800&family=Archivo:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
:root{
  --bg:#0c0a0b;--surface:#161315;--surface-2:#1d191b;--line:#2b2528;--line-2:#3a3033;
  --ink:#f4f1f2;--muted:#a49aa0;--faint:#6d646a;--oxblood:#b11226;--red:#e5142a;--red-soft:#ff5061;
  --gold:#d8b45a;--up:#35c281;--down:#ff5470;
  --disp:"Saira Condensed",system-ui,sans-serif;--text:"Archivo",system-ui,sans-serif;--maxw:1160px;
}
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
html{color-scheme:dark}
body{font-family:var(--text);color:var(--ink);min-height:100vh;line-height:1.5;font-feature-settings:"tnum" 1;-webkit-font-smoothing:antialiased;
  background:radial-gradient(60% 40% at 82% -5%,rgba(177,18,38,.12),transparent 70%),radial-gradient(50% 40% at 8% 4%,rgba(216,180,90,.05),transparent 70%),var(--bg);background-attachment:fixed}
.num,.tnum{font-variant-numeric:tabular-nums}
a{color:inherit;text-decoration:none}
:focus-visible{outline:2px solid var(--red);outline-offset:2px;border-radius:4px}
::selection{background:rgba(229,20,42,.35)}
button{font-family:inherit;cursor:pointer;color:inherit}

.nav{position:sticky;top:0;z-index:50;background:rgba(12,10,11,.82);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-bottom:1px solid var(--line)}
.nav-in{max-width:var(--maxw);margin:0 auto;display:flex;align-items:center;gap:22px;padding:14px 22px;min-height:60px}
.logo{font-family:var(--disp);font-weight:700;font-size:22px;letter-spacing:.06em;text-transform:uppercase;white-space:nowrap;line-height:1}
.logo b{color:var(--red)}
.nav-links{display:none;gap:4px;margin-left:6px}
.nav-links a{color:var(--muted);font-size:13px;font-weight:600;padding:8px 12px;border-radius:7px;transition:color .16s,background .16s}
.nav-links a:hover{color:var(--ink);background:rgba(255,255,255,.04)}
.nav-links a.active{color:var(--ink)}.nav-links a.active::after{content:"";display:block;height:2px;margin-top:5px;border-radius:2px;background:var(--red)}
.search{margin-left:auto;display:none;align-items:center;gap:9px;background:var(--surface);border:1px solid var(--line);border-radius:9px;padding:8px 13px;min-width:210px;color:var(--faint);transition:border-color .16s,box-shadow .16s}
.search:focus-within{border-color:var(--line-2);box-shadow:0 0 0 3px rgba(229,20,42,.14)}
.search input{flex:1;background:none;border:none;outline:none;color:var(--ink);font-size:13.5px;font-family:inherit}
.search input::placeholder{color:var(--faint)}.search svg{width:16px;height:16px;flex:none}
.burger{margin-left:auto;width:40px;height:40px;display:flex;align-items:center;justify-content:center;border:1px solid var(--line);border-radius:9px;background:var(--surface)}
@media(min-width:900px){.nav-links{display:flex}.search{display:flex}.burger{display:none}}

main{max-width:900px;margin:0 auto;padding:22px 16px 60px}
@media(min-width:700px){main{padding:28px 22px 72px}}
.page-h h1{font-family:var(--disp);font-weight:700;font-size:clamp(30px,5vw,44px);letter-spacing:.04em;text-transform:uppercase}
.page-h .lede{color:var(--muted);font-size:14px;margin-top:10px;max-width:60ch;line-height:1.6}
.page-h .lede b{color:var(--ink);font-weight:600}

/* aggregate track-record band */
.record{margin-top:22px;border:1px solid var(--line);border-radius:16px;overflow:hidden;background:var(--surface);
  background-image:linear-gradient(105deg,#201319 0%,#161215 55%,#141013 100%)}
.record-h{display:flex;align-items:center;gap:9px;padding:14px 18px;border-bottom:1px solid var(--line)}
.record-h .k{font-family:var(--disp);font-size:13px;letter-spacing:.16em;text-transform:uppercase}
.record-h .over{margin-left:auto;font-size:11px;color:var(--faint);text-transform:uppercase;letter-spacing:.1em}
.record-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--line)}
.rc{background:var(--surface);padding:18px}
.rc .lbl{font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--faint);font-weight:600}
.rc .big{font-family:var(--disp);font-weight:700;font-size:34px;line-height:1;margin-top:8px}
.rc .big .den{color:var(--faint);font-size:20px}
.rc .rate{font-size:12px;color:var(--muted);margin-top:5px}
.rc .rate b{color:var(--up);font-weight:600}
.rc .minibar{height:5px;border-radius:3px;background:var(--surface-2);margin-top:11px;overflow:hidden}
.rc .minibar i{display:block;height:100%;border-radius:3px;background:linear-gradient(90deg,var(--oxblood),var(--red))}

.sec-h{display:flex;align-items:baseline;gap:12px;margin:30px 2px 16px}
.sec-h h2{font-family:var(--disp);font-weight:700;font-size:20px;letter-spacing:.05em;text-transform:uppercase}
.sec-h .rule{flex:1;height:1px;background:var(--line)}
.sec-h .meta{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--faint);font-weight:600}

/* dev card */
.devcard{border:1px solid var(--line);border-radius:16px;background:var(--surface);overflow:hidden;margin-bottom:18px}
.dc-head{display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:16px 18px;border-bottom:1px solid var(--line)}
.dc-head h3{font-family:var(--disp);font-weight:700;font-size:clamp(18px,2.6vw,23px);text-transform:uppercase;letter-spacing:.02em;line-height:1}
.badge{font-family:var(--disp);font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;padding:3px 10px 2px;border-radius:5px;
  background:rgba(216,180,90,.12);color:var(--gold);border:1px solid rgba(216,180,90,.3);display:inline-flex;align-items:center;gap:6px}
.badge svg{width:12px;height:12px}
.dc-head .date{margin-left:auto;font-size:12.5px;color:var(--faint);font-variant-numeric:tabular-nums}

.sc-wrap{overflow-x:auto}
table.sc{width:100%;border-collapse:collapse;min-width:520px}
table.sc thead th{font-family:var(--disp);font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--faint);font-weight:700;
  text-align:left;padding:11px 14px;border-bottom:1px solid var(--line);white-space:nowrap}
table.sc thead th.c{text-align:center}
table.sc td{padding:12px 14px;font-size:14px;border-bottom:1px solid var(--line);vertical-align:middle}
table.sc tbody tr:last-child td{border-bottom:none}
table.sc tbody tr:hover td{background:var(--surface-2)}
.f-fight{font-weight:600;color:var(--ink);white-space:nowrap}
.f-pick{white-space:nowrap}
.f-pick .nm{font-weight:600}
.f-pick .pc{color:var(--faint);font-weight:400;margin-left:4px;font-variant-numeric:tabular-nums}
.f-res{color:var(--muted);font-variant-numeric:tabular-nums;white-space:nowrap}
td.c{text-align:center}
.mk{display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:6px;font-weight:700;font-size:13px}
.mk.ok{background:rgba(53,194,129,.13);color:var(--up)}
.mk.no{background:rgba(255,84,112,.1);color:var(--down)}

.tallies{display:flex;flex-wrap:wrap;gap:8px 22px;padding:14px 18px;border-top:1px solid var(--line);background:var(--surface-2)}
.tallies .t{display:inline-flex;align-items:baseline;gap:8px;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);font-family:var(--disp);font-weight:600}
.tallies .t b{font-size:20px;color:var(--ink);font-variant-numeric:tabular-nums}
.tallies .t b .den{color:var(--faint);font-size:14px}
.dc-foot{padding:12px 18px}
.summary-btn{font-family:var(--disp);font-weight:700;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);
  background:transparent;border:1px solid var(--line-2);border-radius:8px;padding:9px 15px;display:inline-flex;align-items:center;gap:8px;transition:color .16s,border-color .16s}
.summary-btn:hover{color:var(--ink);border-color:var(--muted)}
.summary-btn svg{width:13px;height:13px;transition:transform .2s}
.summary-btn[aria-expanded="true"] svg{transform:rotate(180deg)}
.summary-box{overflow:hidden;max-height:0;transition:max-height .3s ease}
.summary-box.open{max-height:320px}
.summary-box ul{list-style:none;padding:6px 4px 4px}
.summary-box li{position:relative;padding:7px 0 7px 20px;font-size:13px;color:var(--muted);line-height:1.5;border-top:1px solid var(--line)}
.summary-box li:first-child{border-top:none}
.summary-box li::before{content:"";position:absolute;left:3px;top:14px;width:6px;height:6px;border-radius:50%;background:var(--gold)}
.summary-box li b{color:var(--ink);font-weight:600}

.method-note{margin-top:6px;padding:16px 18px;border:1px dashed var(--line-2);border-radius:12px;font-size:12px;color:var(--faint);line-height:1.6;display:flex;gap:11px;align-items:flex-start}
.method-note svg{width:18px;height:18px;flex:none;color:var(--gold);margin-top:1px}
.method-note b{color:var(--muted);font-weight:600}
footer{max-width:900px;margin:40px auto 0;padding:24px 22px;border-top:1px solid var(--line);font-size:11.5px;color:var(--faint);line-height:1.7;text-align:center}
footer b{color:var(--muted)}
</style>
</head>
<body>

<header class="nav">
  <div class="nav-in">
    <div class="logo">EDGE<b>ENGINE</b></div>
    <nav class="nav-links"><a href="home.html">Home</a><a href="events.html">Events</a><a href="rankings.html">Rankings</a><a href="odds.html">Odds</a><a href="predict.html" class="active">Predictions</a></nav>
    <label class="search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.5-4.5"/></svg><input type="text" placeholder="Search fighters…" aria-label="Search fighters"></label>
    <button class="burger" aria-label="Menu"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>
  </div>
</header>

<main>
  <div class="page-h">
    <h1>Dev Cards</h1>
    <p class="lede">Every pick here was <b>locked before the event</b>, then scored against what actually happened. New cards post the day after each event once the results are in. No hindsight, no edits.</p>
  </div>

  <!-- AGGREGATE RECORD -->
  <section class="record">
    <div class="record-h"><span class="k">Track record</span><span class="over">2 cards graded · 16 bouts</span></div>
    <div class="record-grid">
      <div class="rc"><div class="lbl">Winners</div><div class="big num">11<span class="den">/16</span></div><div class="rate"><b>69%</b> called correctly</div><div class="minibar"><i style="width:69%"></i></div></div>
      <div class="rc"><div class="lbl">Methods</div><div class="big num">13<span class="den">/16</span></div><div class="rate"><b>81%</b> KO / Sub / Dec</div><div class="minibar"><i style="width:81%"></i></div></div>
      <div class="rc"><div class="lbl">Rounds</div><div class="big num">11<span class="den">/16</span></div><div class="rate"><b>69%</b> round call landed</div><div class="minibar"><i style="width:69%"></i></div></div>
    </div>
  </section>

  <div class="sec-h"><h2>Graded cards</h2><span class="rule"></span><span class="meta">newest first</span></div>

  <!-- CARD 1 — OKC (real seed data) -->
  <article class="devcard">
    <div class="dc-head">
      <h3>UFC OKC — Du Plessis vs. Usman</h3>
      <span class="badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></svg> Locked</span>
      <span class="date">Jul 18, 2026</span>
    </div>
    <div class="sc-wrap">
      <table class="sc">
        <thead><tr><th>Fight</th><th>Our pick</th><th>Result</th><th class="c">W?</th><th class="c">Method</th><th class="c">Round</th></tr></thead>
        <tbody>
          <tr><td class="f-fight">Anderson/Elliott</td><td class="f-pick"><span class="nm">Anderson</span><span class="pc">53%</span></td><td class="f-res">Elliott, UD R3</td><td class="c"><span class="mk no">✗</span></td><td class="c"><span class="mk no">✗</span></td><td class="c"><span class="mk no">✗</span></td></tr>
          <tr><td class="f-fight">Barbosa/Melisano</td><td class="f-pick"><span class="nm">Barbosa</span><span class="pc">83%</span></td><td class="f-res">Barbosa, Sub R1</td><td class="c"><span class="mk ok">✓</span></td><td class="c"><span class="mk ok">✓</span></td><td class="c"><span class="mk no">✗</span></td></tr>
          <tr><td class="f-fight">Hines/Harris</td><td class="f-pick"><span class="nm">Harris</span><span class="pc">53%</span></td><td class="f-res">Harris, TKO R1</td><td class="c"><span class="mk ok">✓</span></td><td class="c"><span class="mk ok">✓</span></td><td class="c"><span class="mk no">✗</span></td></tr>
          <tr><td class="f-fight">Coria/Nicoll</td><td class="f-pick"><span class="nm">Coria</span><span class="pc">85%</span></td><td class="f-res">Coria, UD R3</td><td class="c"><span class="mk ok">✓</span></td><td class="c"><span class="mk ok">✓</span></td><td class="c"><span class="mk ok">✓</span></td></tr>
          <tr><td class="f-fight">Franco/Rodrigues</td><td class="f-pick"><span class="nm">Rodrigues</span><span class="pc">53%</span></td><td class="f-res">Franco, TKO R2</td><td class="c"><span class="mk no">✗</span></td><td class="c"><span class="mk ok">✓</span></td><td class="c"><span class="mk ok">✓</span></td></tr>
          <tr><td class="f-fight">Lebosnoyani/Ko</td><td class="f-pick"><span class="nm">Ko</span><span class="pc">60%</span></td><td class="f-res">Lebosnoyani, UD R3</td><td class="c"><span class="mk no">✗</span></td><td class="c"><span class="mk ok">✓</span></td><td class="c"><span class="mk ok">✓</span></td></tr>
          <tr><td class="f-fight">Delgado/Bashi</td><td class="f-pick"><span class="nm">Delgado</span><span class="pc">54%</span></td><td class="f-res">Delgado, UD R3</td><td class="c"><span class="mk ok">✓</span></td><td class="c"><span class="mk ok">✓</span></td><td class="c"><span class="mk ok">✓</span></td></tr>
          <tr><td class="f-fight">Du Plessis/Usman</td><td class="f-pick"><span class="nm">Du Plessis</span><span class="pc">68%</span></td><td class="f-res">Du Plessis, UD R5</td><td class="c"><span class="mk ok">✓</span></td><td class="c"><span class="mk ok">✓</span></td><td class="c"><span class="mk ok">✓</span></td></tr>
          <tr><td class="f-fight">Cannonier/Duncan</td><td class="f-pick"><span class="nm">Duncan</span><span class="pc">70%</span></td><td class="f-res">Duncan, UD R3</td><td class="c"><span class="mk ok">✓</span></td><td class="c"><span class="mk ok">✓</span></td><td class="c"><span class="mk ok">✓</span></td></tr>
          <tr><td class="f-fight">Hooper/Ramirez</td><td class="f-pick"><span class="nm">Hooper</span><span class="pc">78%</span></td><td class="f-res">Hooper, Sub R1</td><td class="c"><span class="mk ok">✓</span></td><td class="c"><span class="mk ok">✓</span></td><td class="c"><span class="mk ok">✓</span></td></tr>
        </tbody>
      </table>
    </div>
    <div class="tallies">
      <span class="t">Winners <b>7<span class="den">/10</span></b></span>
      <span class="t">Methods <b>9<span class="den">/10</span></b></span>
      <span class="t">Rounds <b>7<span class="den">/10</span></b></span>
    </div>
    <div class="dc-foot">
      <button class="summary-btn" aria-expanded="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg> Summary</button>
      <div class="summary-box">
        <ul>
          <li>Winners <b>7 of 10</b>, methods <b>9 of 10</b>, rounds <b>7 of 10</b>.</li>
          <li>Every confident pick (68%+) landed: <b>5 of 5</b>.</li>
          <li><b>3 winner misses</b>, 2 of them coin-flips under 59% — calibrated, not broken.</li>
          <li>Method read hit <b>9 of 10</b>; round call hit <b>7 of 10</b>.</li>
        </ul>
      </div>
    </div>
  </article>

  <!-- CARD 2 -->
  <article class="devcard">
    <div class="dc-head">
      <h3>UFC Fight Night — Lewis vs. Teixeira</h3>
      <span class="badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></svg> Locked</span>
      <span class="date">Jun 28, 2026</span>
    </div>
    <div class="sc-wrap">
      <table class="sc">
        <thead><tr><th>Fight</th><th>Our pick</th><th>Result</th><th class="c">W?</th><th class="c">Method</th><th class="c">Round</th></tr></thead>
        <tbody>
          <tr><td class="f-fight">Lewis/Teixeira</td><td class="f-pick"><span class="nm">Teixeira</span><span class="pc">62%</span></td><td class="f-res">Teixeira, UD R3</td><td class="c"><span class="mk ok">✓</span></td><td class="c"><span class="mk ok">✓</span></td><td class="c"><span class="mk ok">✓</span></td></tr>
          <tr><td class="f-fight">Onama/Nchukwi</td><td class="f-pick"><span class="nm">Onama</span><span class="pc">71%</span></td><td class="f-res">Onama, TKO R2</td><td class="c"><span class="mk ok">✓</span></td><td class="c"><span class="mk ok">✓</span></td><td class="c"><span class="mk no">✗</span></td></tr>
          <tr><td class="f-fight">Barber/Ricci</td><td class="f-pick"><span class="nm">Barber</span><span class="pc">55%</span></td><td class="f-res">Ricci, UD R3</td><td class="c"><span class="mk no">✗</span></td><td class="c"><span class="mk ok">✓</span></td><td class="c"><span class="mk ok">✓</span></td></tr>
          <tr><td class="f-fight">Silva/Prachnio</td><td class="f-pick"><span class="nm">Silva</span><span class="pc">66%</span></td><td class="f-res">Silva, Sub R1</td><td class="c"><span class="mk ok">✓</span></td><td class="c"><span class="mk no">✗</span></td><td class="c"><span class="mk ok">✓</span></td></tr>
          <tr><td class="f-fight">Mokaev/Elliott</td><td class="f-pick"><span class="nm">Mokaev</span><span class="pc">74%</span></td><td class="f-res">Mokaev, UD R3</td><td class="c"><span class="mk ok">✓</span></td><td class="c"><span class="mk ok">✓</span></td><td class="c"><span class="mk ok">✓</span></td></tr>
          <tr><td class="f-fight">Fremd/Craig</td><td class="f-pick"><span class="nm">Craig</span><span class="pc">57%</span></td><td class="f-res">Fremd, TKO R1</td><td class="c"><span class="mk no">✗</span></td><td class="c"><span class="mk no">✗</span></td><td class="c"><span class="mk no">✗</span></td></tr>
        </tbody>
      </table>
    </div>
    <div class="tallies">
      <span class="t">Winners <b>4<span class="den">/6</span></b></span>
      <span class="t">Methods <b>4<span class="den">/6</span></b></span>
      <span class="t">Rounds <b>4<span class="den">/6</span></b></span>
    </div>
    <div class="dc-foot">
      <button class="summary-btn" aria-expanded="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg> Summary</button>
      <div class="summary-box">
        <ul>
          <li>Winners <b>4 of 6</b>, methods <b>4 of 6</b>, rounds <b>4 of 6</b>.</li>
          <li>Every confident pick (68%+) landed: <b>2 of 2</b>.</li>
          <li>All <b>2 winner misses</b> were coin-flips under 59% — calibrated, not broken.</li>
          <li>Method read hit <b>4 of 6</b>; round call hit <b>4 of 6</b>.</li>
        </ul>
      </div>
    </div>
  </article>

  <div class="method-note">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/></svg>
    <span>Cards grade automatically once results are final — <b>never re-run after the fact</b>. Winner, method, and round are scored independently, so a correct method on a wrong winner still counts. Confident picks are 68%+; coin-flips fall under 59%.</span>
  </div>
</main>

<footer>Probabilities, not locks — a single punch can end any fight. Picks are locked pre-event and graded honestly against results. If you bet, bet only what you can afford to lose. <b>21+.</b> Not affiliated with the UFC or ESPN.</footer>

<script>
document.querySelectorAll(".summary-btn").forEach(b=>b.addEventListener("click",()=>{
  const box=b.nextElementSibling,open=b.getAttribute("aria-expanded")==="true";
  b.setAttribute("aria-expanded",String(!open));
  box.classList.toggle("open",!open);
  b.firstChild&&(b.childNodes[b.childNodes.length-1].textContent=open?" Summary":" Hide summary");
}));
</script>
</body>
</html>

```

---

