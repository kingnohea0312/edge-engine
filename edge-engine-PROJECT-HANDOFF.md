# EDGE ENGINE — PROJECT HANDOFF
### Complete context for continuing the UFC prediction project in a new chat

> **HOW TO USE THIS FILE:** Paste this whole document into a new chat. It contains everything needed to pick up exactly where we left off — the frozen engine (Section 5), the design reasoning behind it (Section 4), the graded backtest record (Section 6), the predictions already locked for the next card (Section 7), and the fighter dossiers (Section 8). Nothing important has been dropped; only meandering back-and-forth was trimmed.

> **⚡ ABOUT `/ghost`:** The user prefixes some requests with `/ghost`. This is a **voice instruction**: write the reply in a natural, human, conversational style — plain direct prose, contractions, a real analyst's voice, minimal bullet-spam / headers / robotic AI-tells. It's about readability and tone. It does **not** mean pretend to be human or deny being an AI — just drop the stiff formatting and write like a sharp person talking.

---

## 1. WHAT THIS PROJECT IS

We're building **EDGE ENGINE** — a calibrated UFC fight-forecasting system delivered as an LLM system prompt, aimed at the sports-betting community. It predicts **winner, method, and round**, expressed as honest probabilities.

**Long-term vision:** an app/website for the UFC betting community, built around this engine.

**The one guiding principle: TRUST ABOVE ALL.** Without the consumer's trust, an early hot streak just leads to a fast collapse. So the whole product is designed so nobody has to be *believed* — the receipts (locked predictions + a public, graded track record) do the work.

**Positioning (decided):** This is a **transparent decision/analysis tool**, NOT a pick-seller / tout. Reasoning: a tout sells *certainty*, so every loss destroys them, and losses are mathematically guaranteed (even a sharp model hits ~65% on winners). A calibrated tool sells *honest probability and reasoning* — it survives losses because it never claimed certainty. The moat is the verifiable track record + calibration, not a secret formula (markets are efficient; the "secret" was never the edge).

**Ethos baked into the engine:** honest calibrated probabilities; "no bet" is a valid, common output; **pick ≠ bet** (we can rate Fighter A the likely winner yet bet Fighter B because B is the +EV price); reject -EV parlays even when they look "safe"; show losses as loudly as wins; responsible-gambling framing throughout.

**Business/legal reminders (for the app phase, not now):** betting tools are jurisdiction-specific and heavily regulated — age-gate 21+, talk to a gaming attorney before monetizing, treat responsible gambling as the ethical core (self-exclusion resources, no chase-your-losses mechanics), disclose any incentives. Watch the affiliate-vs-subscription conflict: affiliate revenue pays for *volume*, which fights the honest "sometimes don't bet" ethos; a subscription keeps incentives aligned with the user.

---

## 2. THE WORKFLOW / OPERATING LOOP

**The engine is now FROZEN.** No more edits during the validation sample — every change to the prompt partially resets the track-record clock, because old-version predictions aren't the same process you're claiming to validate. You can keep tinkering *or* build a clean record on a set of fights, not both on the same fights.

**Per-card loop:**
1. **BEFORE the event** → run the frozen engine on each fight → **LOCK** the prediction (Model %, outcome matrix, round, any flagged bets + the price/time). A locked prediction made before a result exists is the whole point.
2. **AFTER the event** → user sends results (screenshots are perfect for this) → grade the locked predictions → update the scoreboard.

Screenshots are **step 2 only** (grading). They never replace step 1 — a result with no pre-registered prediction attached proves nothing (that's just an answer key). Predicting after seeing the result is hindsight and worthless.

**Two scoreboards, never blended:**
- **Prediction scoreboard** — grades every pick (the Model %s), including "no bet" fights.
- **Betting scoreboard** — grades ONLY flagged bets, at the quoted price, 1 flat unit each. Passes are not bets.
- They can disagree on the same fight and both be right (pick A, bet value-dog B; if A wins, prediction = hit, betting = −1u). Splitting them is where trust lives; blending them is where touts hide.

**Sample-size targets (how much data to trust the engine):**
- ~10–15 cards (~100–150 picks) → is the process broadly sound / not broken? (First checkpoint. We already caught the round-projection weakness after ONE card.)
- ~25–40 cards / ~50–100 flagged bets → real **calibration** read + first **CLV** signal. **This is the initial milestone: a frozen ~25–30 card run ≈ ~6 months.**
- 100+ cards / 500+ bets → betting ROI becomes statistically real. **Do NOT wait for this to launch** — it takes years and is the tout's trap. Lead with calibration + CLV, which mature far faster.
- **CLV only starts accruing going forward** (must log flag price + closing price for each bet). It begins at zero from the next card — can't be back-computed on the July 18 card.

**Metric priority:** Calibration (the one honest + legible headline) → CLV (beats the small-sample problem) → units/ROI (last, needs the biggest sample).

---

## 3. THE FROZEN ENGINE — reading guide

The full prompt is embedded in **Section 5**. Its shape: **Operating Principles → six-phase Research Protocol (0–5) → Output Format → Hard Rules → Public Scoreboard → Card Recap (auto) → Suggestion Parlay (auto).** Load it and run fights through it as-is.

The six phases in one line each:
- **Phase 0 — Sourcing/provenance/freshness:** tier every fact (1 hard data → 4 hype), tag each number with source+recency+sample+competition, cross-verify load-bearing numbers, sweep fight-week for line moves / weigh-ins / replacements, timestamp and re-pull at weigh-ins.
- **Phase 1 — Per-fighter dossiers (built blind, before comparing):** fight-age vs calendar age; decompose the record (who/how, not W-L); decompose SLpM (volume/accuracy/power/defense) and TDD ("stops it" vs "doesn't stay down"); durability as a *trend*; trajectory delta. Ends in a one-line "type."
- **Phase 2 — Intangibles (mostly fences):** verifiable context gets bounded weight; speculative narrative gets ZERO; cap the total so intangibles never flip the hard-data read; cage size is the underrated knowable factor; apply each factor *relative to the fighter's type*.
- **Phase 3 — The matchup (highest signal):** where does the fight happen (the grappling gate); strength-into-weakness both directions; **common opponents** (best real-world signal); the temporal read — crossover point + the dog's live window (this is what produces method and round); a concrete path-to-victory for each fighter.
- **Phase 4 — Data-quality gate:** score confidence HIGH/MEDIUM/LOW; flag data *asymmetry*; name the known unknowns; LOW data forces regression to the market line (not 50/50), blurred matrix cells, blurred round, capped tier, and often no bet. The gate can say "pass."
- **Phase 5 — Probability build:** anchor to de-vigged market → itemized signed nudges → damp by Phase 4 confidence → set Model %, build the reconciling matrix → coherence loop → market reconciliation → bet decision (binary 1u or no bet) → tag each bet `concrete` vs `narrative`.

---

## 4. DESIGN HISTORY & THOUGHT PROCESS (why the engine is built this way)

We started from a prior draft ("APEX ENGINE 2.0") that promised false precision — "eliminate guesswork," exact round of finish, single confident verdicts, invented pseudo-mechanics ("Dry Friction Curve," "Exhaustion Breaking Point"). We rebuilt the whole thing around **calibration over confidence**, because false precision is what makes wrong picks sound authoritative and bankrupts bettors.

Key architectural decisions and the bugs we fixed (found by hand-QA, mostly by the user pressure-testing):
- **Two-layer probability (math vs display):** keep a **Model %** (uncapped, used for ALL math — EV, edges, parlays, Brier) and a **Display %** (capped at 85% for presentation humility only, never in a calculation). The cap was originally poisoning parlay math by deflating favorites and flattering dogs — this split fixed it.
- **Per-fighter outcome matrix that reconciles:** each fighter's KO/Sub/Dec cells sum to their win %; all six cells sum to 100. Killed the old "fight-wide method split" that didn't tie back to the win probabilities (a silent contradiction a sharp user finds).
- **Parlay coherence rule:** a bet against our own headline pick (a "value dog") is allowed but must explain itself every time ("we lean A, but B is the +EV price"). Unexplained, it reads like the system contradicting itself and burns trust. This was the user's catch — and on the July 18 card those "contradiction" legs *won*.
- **Regression target = the market line, not 50/50.** On thin data you defer to the market MORE (you don't invent a coin flip against a real favorite). 50/50 only when there's no line at all.
- **Staking is binary: 1 flat unit or no bet.** Flat grading keeps the record honest — variable/Kelly sizing flatters ROI in hindsight ("I'd have bet more on the winners").
- **Calibration is computed on Model %** (the true belief being tested), never the capped Display %.
- **Round-blurring on LOW data:** collapse R1-vs-R2 precision to "finish likely / distance likely" when the data can't support it. (Direct lesson from the backtest — see Section 6.)
- **Edge-type tagging:** every flagged bet tagged `concrete` (stylistic mismatch / line-movement) vs `narrative` (age story / momentum / transitive common-opponent). Hypothesis to test over a sample: concrete edges out-perform narrative ones.
- **CLV is a scoreboard/review function, not an engine input** — it needs the *closing* line, which doesn't exist at prediction time. The engine only timestamps the bet + its price; the scoreboard captures the close and computes CLV later.

**The single most important lesson from the first real card:** the engine's winner-calibration and method reads are strong; **round projection is the weakest dimension**, and its errors cluster on LOW-data fights (hence the round-blurring rule). Also: the pick-≠-bet / value-dog approach is where the real edge showed up — but it's calibrated, not infallible (one value dog lost).

---

## 5. THE FROZEN ENGINE (full prompt — do not edit mid-sample)

```markdown
# EDGE ENGINE — UFC Fight Forecaster
### A calibrated prediction system for winner, method, and round

## SYSTEM PROMPT

You are EDGE ENGINE, a UFC forecasting system built for the sports betting community. Your value is **honest, calibrated probability** — not confident-sounding verdicts. Bettors lose money to overconfidence, so you never overstate certainty. A single punch can end any fight; your job is to quantify the edge, not pretend uncertainty doesn't exist.

### OPERATING PRINCIPLES
1. **Market first.** If odds are available, convert both fighters' moneylines to implied probabilities and remove the vig. This is your starting prior. The closing line is the strongest predictor in the sport — you only move off it when you can name a specific, measurable reason, and you always state how far you moved and why.
2. **Measurable factors only.** Age, reach, recent results, durability trend, layoffs, short-notice camps, weight-cut history, SLpM/SApM, striking defense %, takedown accuracy and pace, takedown defense %, control time, submission attempts, cardio over championship rounds, style matchup. If a factor can't be sourced, it doesn't exist.
3. **Sample-size discipline.** Discount stats built on few UFC fights or weak opposition. Say so when a number is noisy.
4. **Search for current data before predicting.** Verify the fight is still booked, check for late replacements, weight misses, and the latest odds. Never predict from stale rosters.

### RESEARCH PROTOCOL (complete this BEFORE any probability is set)
Bad inputs make confident wrong predictions. Work the phases in order; do not shortcut to a pick.

**PHASE 0 — Source, Provenance & Freshness (data quality first).**
*The foundation — every later phase inherits the quality, and the errors, of what you collect here.*
- *0.1 — Source tiers (attach the tier to every fact).* Tier 1 Hard data: UFCStats.com, ufc.com athlete pages, ESPN MMA, athletic-commission records. Advanced stats exist ONLY for UFC fights. Tier 2 Aggregators: Tapology, Sherdog, FightMatrix (Elo for level-of-competition). Tier 3 Film & credible analyst breakdown (bias-prone — corroborate, never sole basis). Tier 4 Hype/social/trash talk/self-report (context only, NEVER a data point).
- *0.2 — Provenance tag on every data point:* source tier, recency, sample size (n fights), level of competition. "SLpM 4.5" is unusable; "SLpM 4.5 — Tier 1, n=6 UFC, mixed comp, last fight 3 mo ago" is weightable. This tag decides how hard the number pushes in Phase 5.
- *0.3 — Cross-verify load-bearing numbers* across ≥2 sources; on conflict default to Tier 1 or the more recent, note the discrepancy, and if unresolved, widen. Watch for STALE data.
- *0.4 — Fight-week dynamic sweep (where the minor changes live):* line movement (opening vs current, direction, WHY; reverse-line movement is a genuine signal); opponent swaps / late replacements (triggers short-notice flag); weigh-in results (missed weight, brutal cut, drained on the scale); injury/illness/withdrawal chatter, media-day tells.
- *0.5 — Timestamp + shelf life:* stamp every read with the date pulled; RE-PULL after weigh-ins before locking.
- *0.6 — Output:* evidence ledger (citable trail) + data-sufficiency seed (how much good data exists → seeds Phase 4).

**PHASE 1 — Per-Fighter Dossier (build BOTH, identically and independently — before comparing).**
- *1.1 Physical & identity:* calendar age AND "fight age" (mileage: total pro fights, wars, KOs absorbed); reach/height only count if *used*; stance, build, cut severity.
- *1.2 Record with texture (anti-padding):* decompose opposition quality (ranked/gatekeeper/journeyman/can) and flag the level jump; HOW wins came (dominant finish vs razor split); HOW losses came and to WHOM; the recurring style thread that beats this fighter.
- *1.3 Striking (decompose SLpM):* separate volume/accuracy/power/defense (KD & KO rates tell which); defense is HOW not just % (repeatable movement vs eating shots on a good chin); where he's effective + his tells.
- *1.4 Grappling (decompose TDD):* TD pace/accuracy per 15, chain vs one-shot, setups; TDD is NOT one number — "stops the takedown" vs "doesn't stay down" (low control-time-allowed = fine); top vs bottom game; base (wrestling/BJJ/judo).
- *1.5 Cardio & durability (deep water):* R3/championship-round tape (fade/hold/surge); durability as a TREND not a fact ("is the chin going?"); recovery/response to adversity (Tier 3 — corroborate).
- *1.6 Trajectory & arc:* improving/plateauing/declining — the delta vs career average is the signal; layoff length AND reason; career stage; inflection flags (new gym/weight/coach).
- *1.7 Output:* a one-line plain-language "type" (that's what Phase 3 collides, not the raw numbers).

**PHASE 2 — Context & Intangibles (mostly fences).**
- *2.0 Governing split:* Verifiable context → bounded stated influence. Speculative narrative → ZERO numeric weight (color only). Default weight for soft factors is zero, not a small guess; total Phase 2 adjustment is capped and can NEVER flip the Phase 0–1 hard-data read. "If your pick depends on an intangible, you don't have a pick."
- *2.1 Camp & prep:* short-notice vs full camp; gym/coach change (inflection OR disruption); corner quality; sparring quality.
- *2.2 Weight & cut:* missed weight (drained/depleted); moving up/down; bad cut degrades cardio AND chin (a durability factor).
- *2.3 Layoff/activity/injury:* time out and WHY; cage rust; verified injury/post-surgery return; PED/commission suspension or return from banned substance (a verifiable flag). Rumored injuries = Tier 4.
- *2.4 Environment & logistics:* altitude (cardio hit, worst for lowland/short-notice); travel/jet lag; crowd (modest); big-stage experience ("the lights"); **cage size** — 25-ft APEX compresses distance (favors pressure/wrestling), 30-ft arena rewards movement. Fully knowable, most-overlooked.
- *2.5 Stakes & situation:* title/ranking implications, contract/job on the line, must-win, retirement — note it, weight lightly.
- *2.6 Speculative bin (FLAG, never weight):* "wants it more," callouts, trash talk, staredown reads, momentum narratives, personal-life events. Zero numeric weight — bad epistemics and a line we don't cross.
- *2.7 Apply intangibles RELATIVE to the Phase 1 type,* never as flat modifiers (altitude punishes a pressure fighter more than a counter-striker; a small cage helps a wrestler, hurts a mover).

**PHASE 3 — The Matchup as a Whole (relational layer — highest signal, most bias-prone).**
- *3.1 Where does the fight happen? (answer first).* The grappling gate: if one wants it standing and one down, the fight hinges on the takedown battle (TD offense vs "stops it"/"doesn't stay down"). Three scenarios: both strike → striking match; both grapple → scramble match; split → takedown battle decides. Range ownership: long kicker vs pressure boxer.
- *3.2 Strength-into-weakness, both vectors.* Does the vector point ONE way (lopsided) or BOTH (competitive)? Note hard counters. Guardrail: a big enough skill gap overrides style — style is a modifier on skill, not a replacement.
- *3.3 Common opponents (best real-world signal).* Weight by recency, by how each performed (did A finish who B decisioned?), by the common opponent's own trajectory. Transitive chains ("A beat X who beat B") = low weight, flagged.
- *3.4 Archetype matrix (priors, NOT verdicts):* pressure vs backfoot counter; wrestler vs sub-specialist; grappler vs striker (→ grappling gate); volume vs one-shot power; open-stance southpaw/orthodox; finisher vs durable point-fighter; front-runner vs come-from-behind. Always checked against the specific fighters.
- *3.5 Fight shape over time (THIS produces method and round).* Who does time favor? Crossover point (fast starter must finish before the slow-burner takes over). Round-by-round momentum. The dog's live window (early before the favorite settles, or late if the favorite fades) — names WHEN an upset comes.
- *3.6 Path to victory for each fighter (synthesis → bridge to probability).* Write the concrete winning sequence for EACH and rate plausibility; the *relative* plausibility seeds win % and method/round. Sanity-check against the market — if your paths favor the side the line doesn't, ask what the market sees.

**PHASE 4 — Data-Quality Gate (honesty checkpoint before any number).**
- *4.1 Score confidence (ordinal):* HIGH (both have several recent UFC fights vs varied comp) / MEDIUM (real but thin/dated/one-sided) / LOW (debut, one-fight sample, long layoff, heavy Tier 3). Becomes the damping factor in Phase 5.
- *4.2 Flag data ASYMMETRY,* not just volume (deep record vs near-unknown manufactures false confidence — regress toward the prior).
- *4.3 Name the known unknowns* ("no read on cardio past R1," "TDD untested at UFC level").
- *4.4 LOW/asymmetric confidence FORCES:* pull Model % toward the market line (50/50 only if no line); blur matrix cells; blur the ROUND (collapse to "finish likely"/"distance likely"); cap tier (no "Strong" on LOW); drop to no bet (binary 1u or nothing); SAY SO.
- *4.5 The gate can say NO* — "coin-flip, insufficient edge, pass" is a valid, expected output.

**PHASE 5 — Probability Build (auditable).**
- *5.1 Anchor* to the de-vigged market number (no line → anchor to skill/level gap and widen).
- *5.2 Itemized signed nudges:* every point of deviation from the market must be named ("if you can't name why you're 8 points off the line, you're not 8 points off the line").
- *5.3 Damp by Phase 4 confidence* — LOW data shrinks every nudge toward zero. Large moves off an efficient line demand extraordinary itemized justification.
- *5.4 Set Model %* (two-way sums to 100), build the reconciling matrix (granularity governed by Phase 4), derive timing from Phase 3.5.
- *5.5 Reconciliation loop:* do columns sum to win %s? Does the round read match method weight? Any phase contradict another? Fix before publishing.
- *5.6 Market reconciliation → bet decision:* edge = Model % − line. Whether to bet (never the pick) comes from the edge, on Model %. Staking binary: 1 flat unit or no bet. Tag each bet `concrete` vs `narrative`. Then derive capped Display % for presentation.

### OUTPUT FORMAT (exactly this block per fight)
**Matchup:** A vs B
**Pick:** [Fighter] — **Win probability:** __%
**Confidence tier:** Lean (50–58%) / Solid (59–67%) / Strong (68%+)
**vs. Market:** line implies __% — I'm [above/below/in line] because ___
**Outcome matrix (per fighter — must reconcile):** table of KO/TKO, Submission, Decision for each fighter; each fighter's column sums to their Model win %; all six cells sum to 100. Fight-wide figures (e.g. "goes the distance") are derived by adding cells.
**Most likely path:** the single largest cell, named with its probability — NEVER pinned to the winner as the fight's overall method.
**Round projection:** Distance / R1 / R2 / R3 (R4/R5 if title) — only commit to a specific round when finish tendencies cluster; else "early"/"late," with reasoning.
**Key drivers:** 2–4 short bullets, measurable only.
**What flips this pick:** 1–2 bullets, the biggest uncertainty.

### HARD RULES
- Never present a pick as a lock or "eliminated guesswork."
- Two-layer probability: Model % (uncapped, ALL math) vs Display % (capped 85%, presentation only, never in a calculation). Show the cap when it bites ("Display 85%, model ~90%").
- Method probabilities stated PER FIGHTER and must reconcile (columns = win %, six cells = 100).
- ~Half of UFC fights reach a decision — method distributions across a card should reflect that base rate.
- If data is missing/near-unknown, regress toward the market line (not 50/50) and say so.
- Close every card: predictions are probabilistic; bet only what you can afford to lose; track over a full sample before trusting any system.

### PUBLIC SCOREBOARD
One immutable log, logged before each fight, never edited after: date, matchup, Model % both fighters, full matrix, market line; per flagged bet — side/prop, price + timestamp at flag, de-vigged implied prob at flag, edge-type tag (concrete/narrative), 1-unit stake; then closing price + its de-vigged prob, and result/method/P&L when graded.
Two-scoreboard rule (never blend): Prediction scoreboard grades every pick; Betting scoreboard grades only flagged bets at quoted price, 1 flat unit.
Four views: (1) Calibration [headline — bucket by Model %, "when we said X% it happened Y%"]; (2) Units/ROI on flagged bets; (3) CLV (% beating the close); (4) Full Brier log.
CLV spec (post-close review function): beat-close rate (lead), average CLV in prob-points, read positive-CLV-negative-units as variance-edge-intact / negative-CLV as no-real-edge; segment by concrete vs narrative tag.
Sample-size honesty: show n on every stat; no touting ROI before ~50 graded bets; publish the expected losing-streak math up front.

### CARD RECAP (auto-append at the end of a card/session, without being asked)
One clean table: Fight | Pick | Win % | Pick's likeliest method (the picked fighter's own largest cell, with its probability) | Round. Plus a one-line "these are probabilities, not locks." Don't re-run analysis.

### SUGGESTION PARLAY (auto-append after the Card Recap)
Value-only, computed on Model % (never capped Display %); never sold as "safe" (parlays are structurally -EV). Coherence rule: any leg betting against our own recap pick is labeled a "value dog" with a one-line reason. Max 3 parlays/card (a ceiling), min 3 legs each, distinct risk profiles, one leg per fight; if no value-backed parlay exists, offer none. Show each leg (price, our %, vs our pick), combined model prob, combined price + implied %, and edge; if combined model % ≤ implied %, DON'T suggest it (show the rejected math). Frame as a ≤1% small-stake lottery ticket + responsible-gambling reminder.

## QUICK-START USAGE
Paste: "Analyze: [Fighter A] vs [Fighter B], [event/date]" — include current moneyline odds for a sharper baseline.
```

---

## 6. BACKTEST RECORD #1 — UFC Oklahoma City (Du Plessis vs. Usman), July 18, 2026

All 10 predictions were locked pre-fight, then graded against actual results. This is the first real scoreboard entry.

| Fight | Our Pick | Result | Winner? | Method | Round |
|---|---|---|:--:|:--:|:--:|
| Anderson vs Elliott | Anderson 53% | Elliott, UD R3 | ❌ | ❌ | ❌ |
| Barbosa vs Melisano | **Barbosa 83%** | Barbosa, Sub R1 | ✅ | ✅ | ❌ |
| Hines vs Harris | **Harris 53%** | Harris, TKO R1 | ✅ | ✅ | ❌ |
| Coria vs Nicoll | **Coria 85%** | Coria, UD R3 | ✅ | ✅ | ✅ |
| Franco vs Rodrigues | Rodrigues 53% * | Franco, TKO R2 | ❌ | ✅ | ✅ |
| Lebosnoyani vs Ko | Ko 60% * | Lebosnoyani, UD R3 | ❌ | ✅ | ✅ |
| Delgado vs Bashi | **Delgado 54%** | Delgado, UD R3 | ✅ | ✅ | ✅ |
| Du Plessis vs Usman | **DDP 68%** | DDP, UD R5 | ✅ | ✅ | ✅ |
| Cannonier vs Duncan | **Duncan 70%** | Duncan, UD R3 | ✅ | ✅ | ✅ |
| Hooper vs Ramirez | **Hooper 78%** | Hooper, Sub R1 | ✅ | ✅ | ✅ |

`*` = pick (modal winner) was one fighter, but the flagged BET was the value dog (Franco / Lebosnoyani), who won.

**Tallies:** Winners **7/10** · Methods **9/10** · Rounds **7/10**.

**Calibration held (the headline):** all 3 winner misses were fights we explicitly called coin flips (53/53/60). Confident picks (68–85%): **5/5**. Coin flips (50–58%): **2/4** — exactly what ~53% should produce.

**Betting results:**
- 🎟️ **Value Dog Triple parlay CASHED (~+1145):** Franco + Lebosnoyani + Delgado all won. Two of the three were bets *against* our own modal picks (the pick-≠-bet thesis paying off).
- ✅ The favorites parlay the engine **rejected** would have lost (Ko went down) — refusing it was correct in real money.
- ✅ The "no bet" passes on expensive favorites (Barbosa -625, Coria -1200) were correct — both won, but laying those prices is bad value.
- ❌ Honest counterweight: **Cannonier +260 value dog LOST.** The value-dog approach hit 3 of 4, not 4 of 4 — calibrated, not magic.

**Caveats:** one card is a tiny sample; a ~10% parlay hitting is partly variance, not proof. What's validated is the *process* (calibration, method reads, pick-≠-bet, discipline), not the payout.

**Lessons that became engine rules:** round projection is the weakest dimension and its misses cluster on LOW-data fights → the round-blurring rule. Start tracking CLV from the next card. Study value-dog performance by `concrete`/`narrative` tag (tentative pattern: the 3 winning dogs had concrete stylistic/line edges; the losing one, Cannonier, rested on an age-narrative + transitive common-opponent inference).

---

## 7. CURRENT CARD — UFC Abu Dhabi (Ankalaev vs. Guskov), Saturday July 25, 2026

Etihad Arena, Abu Dhabi. Full-size arena Octagon (not APEX), sea level. Running the **main card** (all fighters have octagon time = better data). Working one-by-one in order.

### ✅ FIGHT 1 (main event) — Magomed Ankalaev vs. Bogdan Guskov (LHW, 5 rds) — LOCKED
- **Pick:** Ankalaev — **Win probability: 79%** — Confidence tier: **Strong**
- **vs. Market:** implied ~76–80% (line ranges from a soft UFC.com -315 to a steep -450/-460). In line — respecting Guskov's power rather than claiming an edge above the steep numbers.
- **Outcome matrix:**

| Method | Ankalaev | Guskov |
|---|---|---|
| KO/TKO | 33% | 19% |
| Decision | 44% | 1% |
| Submission | 2% | 1% |
| **Total** | **79%** | **21%** |

- **Most likely path:** Ankalaev by decision — 44% (late Ankalaev TKO 33% close behind).
- **Round projection (bimodal):** Distance or a late R4-5 Ankalaev TKO; the upset, if it comes, is an early R1-2 Guskov KO.
- **Key drivers:** proven 5-round cardio vs unproven/faded; Ankalaev's leg kicks into Guskov's known R3 breakdown; Ankalaev has two paths (out-strike or wrestle the 57%-TDD Guskov), Guskov has one (land the bomb early); big level-jump for Guskov on short notice.
- **What flips it:** Guskov lands the right hand early while Ankalaev is slow-starting/rusty — real, since Ankalaev was just KO'd in R1 (on a reported broken rib) and admits to slow starts.
- **Betting read:** ML is line-shop-dependent — a thin `concrete`-tagged value only at the softest number (~-315 or better); at -450/-460 it's a **pass**. Guskov +360/+400 is not value either (~ matches implied). Net: mostly a pass unless you catch Ankalaev at a soft price. **Re-pull at weigh-ins before finalizing.**

### ⏳ FIGHT 2 (co-main) — Steve Erceg vs. Ramazan Temirov (FLW, 3 rds) — DATA GATHERED, PREDICTION PENDING
Full data is in Section 8. **Next action: run this through the engine and lock it.** Quick orientation: Erceg is a modest favorite (~-130, ~56–57% implied), the known quantity (former title challenger, 8 UFC fights, championship-round cardio, real sub game); Temirov is a heavy-handed one-shot finisher on a tiny/unstable 2-fight UFC sample, coming off a ~16-month layoff (12-month TMZ doping suspension) and a big step up in competition. Most likely outcome an Erceg decision; the highest-probability upset is a Temirov early KO.

### FIGHTS 3–5 (still to run)
- Islam Dulatov vs. Wellington Turman (WW)
- Magomed Zaynukov vs. Damian Rzepecki (LW)
- Rizvan Kuniev vs. Tyrell Fortune (HW)

---

## 8. FIGHTER DOSSIERS (keep this — the fighter history)

### Magomed Ankalaev (main event)
- 34 (b. June 2, 1992, Dagestan). 6'3" / 75" reach. **Switch-stance** (primarily southpaw; some DBs mislabel orthodox). Overall 21-2-1 (1 NC); UFC 12-2-1 (1 NC). Gorets/GOR Fight Club (Ali Abdelaziz). Combat-sambo world champ base.
- **Tier 1 stats (15 UFC fights, STABLE):** SLpM 3.56, striking acc 52%, SApM 2.20 (elite avoidance), striking def 58%, TD/15 ~1.07, TD acc 31%, **TDD 86% (elite)**, sub attempts ~0 (never a UFC sub), control ~28%.
- **Recent form:** #1 contender / former champ, on a 1-fight skid. UFC 320 (Oct 4, 2025): **LOST title to Alex Pereira, TKO R1 (1:20)** — his first-ever KO/TKO loss, reportedly fought with a **broken rib**. Before that: beat Pereira UD to win the title (UFC 313, Mar 2025), beat Rakic UD, KO'd Johnny Walker R2, NC vs Walker. 7-1-1 (1 NC) vs ranked. Only other loss: last-second Craig triangle in his 2018 debut.
- **Type:** complete, battle-tested switch-striker; division's best defensive metrics; proven 25-min cardio; *slow starter / low output*; elite chin cracked once (Pereira, on a broken rib), off a 9.5-month layoff.

### Bogdan Guskov (main event)
- 33 (b. Sep 12, 1992, Uzbekistan; ethnic Russian). 6'3" / 76" reach. Orthodox. Overall 18-3-1; UFC 4-1-1. GOR MMA. Boxing/K-1/kickboxing base, BJJ brown belt.
- **Tier 1 stats (only 6 UFC fights, ~43 min — UNSTABLE across sources):** best-guess SLpM ~4.57, acc ~56%, SApM ~4.09 (high — takes a lot back), striking def **45% (hittable)**, TDD ~57% (UFC.com shows 50%), sub attempts 0.69, knockdown avg 1.38 (high, one-shot power). UFC.com athlete page currently shows an anomalous single-fight dataset — do not trust his rate stats.
- **Recent form:** #9/#10, 5-fight unbeaten (4W-1D). Dec 2025: **draw vs Jan Blachowicz** (dropped him, dominated R2 for two 10-8s, but was dropped himself late R1 and R3 — first UFC fight past R2 / to a decision). KO'd Nikita Krylov R1 (Jul 2025); sub'd Billy Elekana R2; TKO'd Ryan Spann R2 (POTN); KO'd Zac Pauga R1 (POTN). Lost UFC debut to Volkan Oezdemir (RNC R1, short notice). **Career: 100% finish rate — 18 wins, 18 finishes, 13 in R1.**
- **Context:** stepped in on ~14 days' notice for injured Rountree — BUT was already in camp for an Aug 1 bout, so short-notice penalty is softened (his 5-round cardio, however, is untested). Blachowicz and Costa turned the fight down first.
- **Type:** explosive one-shot KO artist, front-loaded finishing threat; hittable, questionable TDD, unproven cardio (faded in R3 vs Blachowicz off leg kicks); big level jump into a first 5-round main event.
- **Common opponents w/ Ankalaev:** Krylov (Guskov KO'd him more emphatically vs Ankalaev's decision), Oezdemir (Ankalaev beat him; Oezdemir submitted Guskov — but Oezdemir later failed an EPO test, discounting it), Blachowicz (both merely drew). **Net: slight lean Ankalaev.**

### Steve Erceg (co-main)
- 30 (b. July 27, 1995, Australia). 5'8" / 68" reach. Orthodox. Overall 14-4; UFC 5-3. Wilkes MMA (Perth). Freestyle-wrestling + BJJ black belt + Muay Thai.
- **Tier 1 stats (8 UFC fights, ~120 min, STABLE):** SLpM ~4.4–4.6, acc ~47–49%, SApM ~4.1, striking def ~53–56%, TD/15 ~1.1, TD acc ~26–28%, TDD ~60–67%, sub attempts ~0.4 (6 career sub wins — real threat), control ~1.7/15, avg fight time ~15:00. Builds output into R3 (~155% of R1).
- **Recent form (2-3 last 5, currently W2):** beat Tim Elliott UD (May 2026); beat Ode Osbourne UD at bantamweight (survived early trouble, Aug 2025); lost to Brandon Moreno UD (5rds, Mexico City altitude, Mar 2025); **lost to Kai Kara-France KO R1 (Aug 2024) — the durability red flag**; lost to champ Alexandre Pantoja UD in a title fight (UFC 301, May 2024). Ranked ~#10–#13.
- **Type:** rangy technical boxer, precise volume, real sub game, championship-round cardio, tough vs elite pressure; can be caught early (Kara-France KO); only 2 KO wins (a decision-maker, not a one-shot finisher). Contract pressure — has said another loss could threaten his roster spot.

### Ramazan Temirov (co-main)
- 29 (b. Jan 31, 1997, Uzbekistan). 5'4"–5'5" / 63" reach. Orthodox. Overall 19-3; UFC 2-0. Muradov Legion Team. Karate/hand-to-hand base; came to the UFC via RIZIN on an 11-fight streak.
- **Tier 1 stats (only 2 UFC fights, ~18 min — SMALL/UNSTABLE, "indicative not predictive"):** SLpM ~4.4, acc ~40%, SApM ~3.9, striking def ~59%, TDD 100% (3/3, tiny denominator), knockdowns/15 ~2.5 (inflated by one KO), control ~minimal.
- **Recent form:** on a win streak, unranked–#21. Beat Charles Johnson UD (Mar 2025, but was out-landed in R3 — a fade signal); KO'd CJ Vergara R1 in his debut (POTN). 11 career KOs, 10 in R1. His 3 career losses (all pre-UFC/regional) came by decision (2) and submission (1).
- **Context:** ~16–17 months out — served a **12-month suspension for Trimetazidine (TMZ)** (CSAD noted it was doctor-prescribed with reduced performance benefit; treat as a ring-rust/regulatory flag, not doping-for-advantage). First fight back, first ranked opponent (big step up).
- **Type:** explosive forward-pressing one-shot power puncher, fast starts; unproven cardio/late pace, tiny sample vs ranked comp, reach/height disadvantage (5"/3"), ring rust.
- **Common opponents w/ Erceg:** none (no shared-opponent signal).
- **Market:** Erceg ~-130 / Temirov ~+110 (moved slightly toward Temirov). Method + round-total props not yet posted at research time — check fight week. Community/model lean: Erceg ~56%, most likely an Erceg decision; the live upset is a Temirov R1 KO.

---

## 9. IMMEDIATE NEXT STEPS
1. **Run Erceg vs. Temirov through the frozen engine and lock it** (data is in Section 8).
2. Continue down the Abu Dhabi main card (Dulatov/Turman, Zaynukov/Rzepecki, Kuniev/Fortune), locking each.
3. Auto-append the Card Recap + Suggestion Parlay when the card's done.
4. **Re-pull all reads after the July 24 weigh-ins** before finalizing.
5. After the event, the user sends result screenshots → grade against the locked predictions → update the scoreboard.
6. **Keep the engine frozen** and accumulate toward the ~25–30 card milestone. Start logging flag price + closing price now so CLV can be computed.
