# Edge Engine — Visual Redesign Brief

**For: a fresh, from-scratch aesthetic mockup (to be built in claude.ai, then ported back into the real app).**

---

## The ask, in one line

Do a **ground-up aesthetic overhaul** of an existing, fully-working UFC fight-forecasting web app. **Keep every screen, every feature, and the exact color palette below. Reinvent everything about how it looks and feels** — layout, typography treatment, component design, spacing, hierarchy, data-viz, motion.

This is a **visual redesign only**. The app already works (live data, a prediction engine, an API). I just don't like how it looks. Make it look like a premium, broadcast-grade sports-analytics product.

---

## What the product is

**Edge Engine** — calibrated UFC fight forecasting. It shows live UFC schedules, full fight cards, fighter profiles with real career stats + full fight history, official divisional rankings, live Las Vegas betting lines, and a **market-anchored prediction engine** that reports honest win / method / round probabilities.

**Brand philosophy (must survive the redesign):** honest and calibrated, *"a pick is not a bet,"* **never sells "locks."** Confident but responsible. Dark, editorial, data-dense, sports-broadcast energy. Not a cutesy consumer app; not a generic SaaS dashboard.

---

## 🔒 Non-negotiable — DO NOT change

1. **The color palette** — use the exact hex values below.
2. **The set of screens and their features/content** (listed further down). Nothing gets removed.
3. **Dark theme.**
4. **The honest/calibrated tone** — keep the "probabilities, not locks," the visible confidence caps, and responsible-gambling / 21+ language.
5. **Accessibility** — keyboard operable, visible focus rings, tap targets ≥ 44px, `prefers-reduced-motion` respected, real semantic elements.
6. **Tabular numerics** on every stat, percentage, and betting price (numbers must align in columns).

## 🎨 Free to reinvent — DO overhaul

- Overall layout, grid, and page composition
- Typography pairing and treatment (see current fonts below — you may evolve them)
- Every component: nav, cards, tables, bars, modals, chips, buttons
- Spacing rhythm, borders, corner rounding, shadows, texture, depth
- Data-visualization style (win-probability bars, method matrix, round histogram, odds movement)
- Motion and micro-interactions
- The hero / landing treatment

---

## The color palette — KEEP THESE EXACT VALUES

```css
--bg:        #0c0a0b;  /* near-black, faintly oxblood-tinted — app background */
--surface:   #161315;  /* elevated cards / panels */
--surface-2: #1d191b;  /* higher elevation (modals, popovers) */
--line:      #2b2528;  /* hairline borders */
--line-2:    #3a3033;  /* stronger borders */
--ink:       #f4f1f2;  /* primary text (off-white, not pure white) */
--muted:     #a49aa0;  /* secondary text */
--faint:     #6d646a;  /* tertiary / captions */
--oxblood:   #b11226;  /* deep primary red */
--red:       #e5142a;  /* bright primary crimson — CTAs, accents, focus */
--red-soft:  #ff5061;  /* hover / lighter red */
--gold:      #d8b45a;  /* championship gold — highlights, champ treatment, key numbers */
--up:        #35c281;  /* green — market/line UP, positive edge */
--down:      #ff5470;  /* red — market/line DOWN, negative edge */
```

**Signature background wash (keep the spirit — subtle, not loud):**
```css
background:
  radial-gradient(60% 40% at 82% -5%, rgba(177, 18, 38, 0.12), transparent 70%),
  radial-gradient(50% 40% at 8% 4%,  rgba(216, 180, 90, 0.05), transparent 70%),
  #0c0a0b;
```

Color usage rules: **crimson** = primary action / brand / live. **Gold** = championship, headline stats, "the number that matters." **Green/red (up/down)** are reserved for market movement and edge — don't use them for generic UI.

---

## Typography (current — you may evolve the faces, keep the *contrast* idea)

- **Display:** Bebas Neue — condensed, all-caps, high-impact (fighter names, the "VS" spine, section headers, hero).
- **Text:** Inter — clean grotesque for body and all numerics, with `font-variant-numeric: tabular-nums`.
- The pairing principle to keep: **an impactful condensed display face against a clean, legible text face.** You may swap either face for something with more character, as long as the display feels athletic/editorial and the text stays highly legible at data-dense sizes.

---

## Screen inventory — redesign ALL of these (keep their content & features)

> Real content examples included so you design around actual data, not lorem ipsum.

### 1. Global chrome (every page)
- **Top nav:** logo "EDGE**ENGINE**", links — Home · Events · Rankings · Odds · **Predictions** (dropdown → "Current events", "Dev cards") — a persistent **fighter search** box (live results with headshots), and a mobile burger menu.
- **Footer:** "Probabilities, not locks — a single punch can end any fight. If you bet, bet only what you can afford to lose. 21+. Not affiliated with the UFC or ESPN."

### 2. Home (`/`)
- Hero: kicker "CALIBRATED UFC FORECASTING", wordmark, one-paragraph pitch, two CTAs: **Run the engine**, **Browse events**.
- A next-event strip (e.g. "UFC Fight Night: Ankalaev vs. Guskov — Saturday, July 25, 2026 · 12:00 PM ET").
- "Inside the app" feature grid: Events, Rankings, Live Odds, Predictions — each a card with a one-line description and a link.
- "Upcoming" list preview with date chips (AUG 1, AUG 8, …).

### 3. Events (`/events`)
- "Upcoming Events" — date-chip rows: e.g. `JUL 25 · UFC Fight Night: Ankalaev vs. Guskov · Sat · 12:00 PM ET · FIGHT NIGHT`. Event-type tags: FIGHT NIGHT / PPV.
- "Recent Results" — same rows tagged FINAL with "results available".

### 4. Event detail (`/event/[id]`)
- Header: event name, 📅 date, 📍 venue (e.g. "Etihad Arena · Abu Dhabi · UAE"), 📺 broadcaster.
- Segments: **MAIN CARD / PRELIMS / EARLY PRELIMS**. Each bout row: two fighters with records (e.g. "Magomed Ankalaev 21-2-1" vs "Bogdan Guskov 18-3-1"), weight class, "5 ROUNDS", live moneylines when posted, result when final.

### 5. Fighter profile (`/fighter/[id]`)
- Hero: name, record (e.g. "21-2-1"), weight class · country, headshot.
- Stat grid: Age, Height, Reach, Stance, Last 5, Team.
- "Career Stats": Sig. strikes/min, Striking accuracy, Takedowns/15min, TD accuracy, Control time, Knockdowns/15min, Finish rate.
- "Fight History": full list of bouts — result (W/L/D badge), opponent, method + round + time, event, date.

### 6. Matchup / Prediction — **FLAGSHIP screen** (`/event/[id]/[compId]`, and as a modal from Predictions)
This is the most important screen. Sections:
- **Pick:** winner name, tier badge (STRONG / SOLID / LEAN) + win % (e.g. "SOLID · 60%"), a two-sided probability bar ("40% Ankalaev / Guskov").
- **Market anchor:** the de-vigged Vegas line, implied %, and the model's nudge in points — shown side by side. When no line: "No line posted — stats-only read, confidence tier capped."
- **Why — the drivers:** a ranked list with ▲/▼ direction icons: e.g. "Most likely path: Guskov by KO/TKO (39%). 75% chance of a finish." · "Career record: 21-2-1 vs 18-3-1 · favors Ankalaev" · "Knockdown power: 0.47 vs 1.38 /15min · favors Guskov".
- **How it likely ends — method matrix:** a small table, fighters × {KO/TKO, Submission, Decision} with % in each cell; "Goes the distance: 25%."
- **Round projection:** a horizontal histogram across R1–R5 + DIST (e.g. 43% / 17% / 15% / — / — / 25%), with a headline read ("FINISH LIKELY — EARLY") and a "Veteran read vs Standard read" toggle. Include the gate-reason caption when the exact round is withheld.
- **Grounding:** "Swept 20 fights each. Feeds: ESPN scoreboard, ESPN core, ESPN BET odds. As of Jul 22, 9:12 AM ET."
- The 85% **humility cap** must be visible when it applies ("Display capped at 85%. Model reads X%.").

### 7. Rankings (`/rankings`)
- A horizontally-scrolling division tab strip: P4P, Flyweight … Heavyweight, Women's divisions.
- Champion treatment ("C") then ranked rows 1–15 with name + headshot, tappable to the profile. Caption: "Official UFC rankings · live from ufc.com."

### 8. Live Odds (`/odds`)
- Header: event name + date. Caption about ESPN BET moneylines, "refreshed at most every 15 minutes," pending when unlined.
- **Desktop:** a table — Bout / Class / Moneyline (with favorite highlight + line-movement arrows). **Mobile:** the same data as stacked cards.

### 9. Predictions board (`/predict`)
- Header for the current card. A list of bouts each with a **Run** button that opens the flagship prediction (inline/modal). A **Run full card** action that produces a recap + "suggestion parlays" (each parlay labeled a *suggestion*, never a lock, with a small-stake caveat).
- "Other upcoming cards" list below.

### 10. Dev cards (`/predict/dev`)
- "Graded track record" — picks locked *before* an event, then scored against results. A per-card scorecard table: Fight / Our pick / Result / W? / Method / Round with ✓/✗, plus tallies ("Winners 7/10, Methods 9/10, Rounds 7/10") and a short honest summary. Empty state: "No graded cards yet."

---

## What I need handed back

- **Self-contained HTML mockup(s)** — inline `<style>`, minimal inline JS only if needed. Google Fonts via `<link>` is fine; no other external dependencies, no build step.
- **Mobile-first and responsive** up to wide desktop.
- **Dark theme only**, using the palette above.
- Prefer **one screen per HTML file** (easiest for me to port), or a single multi-screen file with clear section anchors. At minimum, please mock: **Home, Matchup/Prediction (flagship), Event detail, Fighter profile, Rankings, Odds.**
- Use the **sample data above** so the mockups look real.

## Anti-slop guardrails (please avoid)

- No generic SaaS / AI-startup aesthetic; **no purple**; no glassmorphism-as-default; no gradient text; no "eyebrow label on every section" cliché; no over-rounded ghost cards; no centered-everything hero.
- Do lean into: editorial sports-broadcast confidence, strong typographic hierarchy, data density that stays legible, tasteful use of the crimson + gold, and precise numerics.

## What happens next

The returned HTML comes back to the engineer, who re-implements it as the **styling layer of the real Next.js app** — preserving all the working data, engine, and API. So: make it beautiful and specific; don't worry about wiring up real data or backends.
