# Website Upgrade Plan

This document has two parts:

- **Part 1** catalogs known issues and technical debt on the existing (pre-NeuroLearn)
  site. Documentation only — nothing here is fixed by this plan.
- **Part 2** is the concrete implementation plan for the new NeuroLearn "Learn" page,
  the first real screen of the pivot described in `PRODUCT_PLAN.md`.

---

## Part 1: Known Issues / Technical Debt

### Navigation & Layout

- `src/app/page.tsx` (the landing page) imports the real `Navbar` component
  (`src/components/ui/navbar.tsx`) but never renders it. Instead it hand-rolls a second,
  duplicate header inline that:
  - Has a typo in its root class: `min-h-scrren` (should be `min-h-screen`).
  - Has a mobile menu toggle button with no `onClick` — it renders but does nothing.
  - Is missing the "Assistant" link that the real `Navbar` already has (added when
    `src/app/assistant/page.tsx` was built).
  - Has no auth-awareness — the real `Navbar` checks Supabase session state
    (`supabase.auth.getSession()` / `onAuthStateChange`) to show Dashboard vs.
    Login/Signup; the landing page's inline header always shows a static "Contact Us"
    button regardless of session.
  - Net effect: two competing header implementations exist, and the one users actually
    see on `/` is the broken one.

### Broken Links

- `src/app/autism/page.tsx` links to two sub-routes that don't exist as pages:
  - `/autism/sensory-regulation`
  - `/autism/voice-pronunciation`
- `src/app/dyslexia/page.tsx` links to six module sub-routes, none of which exist:
  - `/dyslexia/phonological-awareness`
  - `/dyslexia/reading-fluency`
  - `/dyslexia/comprehension-strategies`
  - `/dyslexia/spelling-writing`
  - `/dyslexia/memory-processing`
  - `/dyslexia/assistive-technology`

### Non-Functional Interactions

- `src/components/ui/cognitivecards.tsx` (rendered by
  `src/app/autism/cognitive-skills/page.tsx`): "Start Activity" button has no `onClick`
  at all.
- `src/app/autism/language-literacy/page.tsx`: `handleStartActivity` just calls
  `alert(\`Starting ${activityName} - This feature is coming soon!\`)` — every card's
  "Start" button routes through this same stub.
- `src/app/autism/social-skills/page.tsx`: "Start Activity" button has no `onClick`,
  same pattern as cognitive-skills.
- `src/app/detection/page.tsx`: "Start Autism Detection Test" and "Start Dyslexia
  Detection Test" buttons have no `onClick` — zero real assessment logic exists behind
  either CTA.

### Design System / Theming

- `tailwind.config.js` is nearly dead weight under Tailwind v4's CSS-first config model
  (theme now lives in `src/app/globals.css` via `@theme`/`:root` custom properties). The
  file's `content` globs also don't match this project's actual layout (everything
  lives under `src/`), so even if v4 did consult this file, it would miss real source
  files.
- `src/app/globals.css` defines a full shadcn neutral/grayscale theme via `oklch()`
  custom properties (`--primary`, `--card`, `--accent`, etc. — all achromatic, 0 chroma)
  that is disconnected from reality: almost every page/component instead hardcodes
  utility classes like `bg-green-600`, `text-purple-600`, `border-green-500`,
  `bg-gradient-to-b from-green-100 via-white to-green-50`. Two competing palettes exist
  side by side — the shadcn tokens nothing currently consumes, and the ad-hoc
  green/purple "gamified therapy" palette that's actually rendered.
- `src/components/ui/card.tsx`: the base shadcn `Card` primitive itself (not a
  per-usage className) bakes in a purple border and hover state —
  `border-2 border-purple-200 dark:border-purple-700 ... hover:bg-purple-100
  dark:hover:bg-purple-800/20 hover:shadow-xl` — confirmed on line 10. Every consumer of
  `<Card>` inherits this unless it explicitly overrides it via `className`, which makes
  `Card` unsuitable as a neutral primitive for anything outside the old therapy-hub
  aesthetic.

### Mock Data

- `src/app/dashboard/page.tsx`: the progress/stats section is fully mocked — a
  hardcoded array (explicitly commented as mock data to replace) with `progress: 0`,
  `sessions: 0` for every module, a static "No activities yet" recent-activity entry,
  and zeroed summary stats (`sessionsCompleted: 0`, `avgScore: 0`, `streakDays: 0`,
  `totalMinutes: 0`). No real tracking backend exists behind any of it.

### Dependency notes (for context, not issues to fix)

- `framer-motion` is already used in 6 pages (`assistant`, `dashboard`,
  `complete-profile`, `auth/reset-password`, `about`, `AuthPage`) — a real, active
  dependency.
- `tsparticles` and `lottie-react` have zero usage anywhere under `src/` — installed but
  unused.
- `src/components/ui/progress.tsx` is used once (the flashcard progress bar in
  `src/app/autism/communication-skills/page.tsx`).
- `src/components/ui/tabs.tsx` is used once (`src/app/detection/page.tsx`).
- No slider/range primitive exists in the project (`package.json` has no
  `@radix-ui/react-slider`).

---

## Part 2: NeuroLearn "Learn" Page — Implementation Plan

### Scope for this pass

Build the **Learn** page first — it's the hero experience from `PRODUCT_PLAN.md`'s Core
Architecture and the only page that proves out the sensory-load-adaptive concept.
Onboarding, Calm, and Profile are **not** built as real pages in this pass:

- **Onboarding** — deferred. Ship the Learn page with sensible in-memory defaults (load
  level defaults to 5, no learning-difference/hyperfocus/sand-mode selection persisted)
  rather than building a 30-second setup flow.
- **Calm** — in scope, but as a component, not a route. Level 10 is handled as a
  full-screen overlay *inside* the Learn page rather than a separate `/calm` route. A
  dedicated route can be split out later if deep-linking to it becomes a requirement.
- **Profile** — deferred entirely. No settings persistence (Deaf Mode, Colour Blind
  Mode, Sand Mode toggles) in this pass; all controlled by local component state with
  reasonable defaults.

### Routes / Pages

- **New:** `src/app/learn/page.tsx` — the only new route in this pass. Client component
  (`"use client"`, following the pattern already used in `src/app/assistant/page.tsx`
  and `src/components/GeminiChat.tsx`), rendering the real `Navbar`
  (`src/components/ui/navbar.tsx`) at the top — do **not** repeat the landing page's
  mistake of hand-rolling a duplicate header (see Part 1).
- No changes to `middleware.ts` needed — its matcher is scoped to `/dashboard/:path*`
  only, so `/learn` is public by default, which is correct for this pass.

### Sensory Load Meter component

- **New:** `src/components/learn/SensorySlider.tsx`.
- No slider primitive currently exists in the project. Recommended for v1 (lower lift,
  zero new dependency): a native `<input type="range" min={1} max={10} step={1} />`,
  styled with Tailwind (`accent-*` utility for thumb/track color). Fully accessible out
  of the box (arrow-key stepping, native ARIA), no install required. Only add
  `@radix-ui/react-slider` later (genuinely new dependency) if the native element's
  styling ceiling becomes a real blocker.
- State: plain `useState<number>` local to the Learn page (or lifted one level to a
  `LearnScreen` client component if `SensorySlider` and `ContentRenderer` are siblings).
  No global state library needed for v1.
- Emoji/label mapping, straight from `PRODUCT_PLAN.md`'s table — implement as a small
  pure function:
  ```ts
  function loadBand(level: number): "low" | "mid" | "high" | "max" {
    if (level <= 3) return "low";
    if (level <= 6) return "mid";
    if (level <= 9) return "high";
    return "max";
  }
  const LOAD_EMOJI = { low: "😊", mid: "😐", high: "😰", max: "🌊" } as const;
  ```
  Drive both the emoji/label display and `ContentRenderer`'s layout branch off the same
  `loadBand()` function so the "what changes per level" table stays a single source of
  truth instead of being reimplemented in two places.

### Content generation flow

- **New:** `src/app/api/learn/route.ts` — deliberately separate from
  `src/app/api/chat/route.ts`. The chat route's shape (fixed `SYSTEM_PROMPT`, accepts
  `{ prompt } | { messages }`) doesn't fit the Learn page's request, which needs
  `{ topic, loadLevel, learningDifference?, hyperfocusInterest?, sandMode }` and a
  prompt that's rebuilt per request from those fields rather than a static system
  string.
- Reuse `getGeminiModel()` from `src/lib/gemini.ts` unchanged — no changes needed to
  that file for this pass.
- Use `streamText` (same as `src/app/api/chat/route.ts`), not `generateObject` — Learn
  page content is prose/narrative, matching `PRODUCT_PLAN.md`'s "conversational /
  narrative content" path. `generateObject` is out of scope here (that's for Flash
  Cards, a separately documented, later feature).
- Build the master prompt from `PRODUCT_PLAN.md`'s Gemini Integration section verbatim,
  substituting the request fields:
  ```
  You are an educational assistant for neurodiverse learners.

  Current sensory load: {level}/10
  Learning difference: {type}
  Hyperfocus interest: {interest}
  Sand mode: {on/off}
  Topic: {topic}

  RULES:
  - Load 1-3: Rich academic content, use {interest} analogies, full paragraphs
  - Load 4-6: Bullet points only, max 2 lines each, simple vocabulary
  - Load 7-9: Max 3 sentences. One idea only. Extremely warm tone.
  - Load 10: One calming sentence only. No teaching.

  Sand mode ON: No exclamation marks. No urgency. Slow, warm, soft tone throughout.
  Sand mode OFF: Normal helpful tone.

  Always avoid jargon unless load is 1-3.
  Never use red/green to indicate right/wrong.
  ```
- Client side: call `/api/learn` directly via `fetch` and read the text stream manually
  — simpler than `useChat` for a single-shot, non-conversational screen (no need for the
  full chat-message data model when there's no back-and-forth conversation, just "topic
  + slider → content").
- Trigger a fresh call to `/api/learn` on: initial topic submit, and every slider move
  (debounced ~300–500ms so dragging the slider doesn't fire a request per pixel) —
  matches `PRODUCT_PLAN.md`'s "every slider move = new Gemini call."
- Missing-key guard: mirror `src/app/api/chat/route.ts`'s existing check for
  `process.env.GOOGLE_GENERATIVE_AI_API_KEY` before calling `streamText`.

### ContentRenderer

- **New:** `src/components/learn/ContentRenderer.tsx`, driven by the same `loadBand()`
  helper as the slider:
  - **low (1–3):** full prose paragraphs, normal font size.
  - **mid (4–6):** bulleted list (split streamed text on newlines/bullet markers as
    they arrive), medium+ font size.
  - **high (7–9):** one line/sentence visible at a time with a manual or auto-advancing
    "Next" affordance (this doubles as the "Stay Focused Mode" behavior from
    `PRODUCT_PLAN.md` §2 for this load band), large font.
  - **max (10):** renders nothing — the Learn page instead mounts the Level 10 Calm
    overlay and suppresses content entirely.
- Use `framer-motion` (already a real, active dependency in this project) for
  cross-fade transitions when the load band changes, per `PRODUCT_PLAN.md`'s "Animate
  transitions" enhancement: wrap each band's rendered output in
  `<AnimatePresence mode="wait">` + `motion.div` with `initial={{opacity:0}}` /
  `animate={{opacity:1}}` / `exit={{opacity:0}}`, matching the fade pattern already used
  in `src/app/assistant/page.tsx`.

### Component reuse plan

- **Reused as-is:** `Button` (`src/components/ui/button.tsx`) for topic submit / Next /
  Calm's "Come back when you're ready"; `Progress` (`src/components/ui/progress.tsx`)
  for showing streaming progress or Stay-Focused-Mode chunk position; `Tabs`
  (`src/components/ui/tabs.tsx`) if the Learn page ends up needing a switcher (e.g.
  Learn vs. Quiz panel at low load) rather than building a new tab primitive.
- **Reused with an explicit override:** `Card` (`src/components/ui/card.tsx`) for the
  topic-input panel and content container — but its base styles bake in a purple
  border/hover inherited by every consumer (see Part 1). The Learn page should pass a
  `className` that neutralizes this (e.g. explicit border/hover resets) to land on the
  calmer Sand/neutral aesthetic `PRODUCT_PLAN.md` describes, rather than inheriting the
  old green/purple gamified-therapy look. This is a per-usage override, not a change to
  `card.tsx` itself — Part 1's technical debt entry stays unfixed in this pass.
- **Genuinely new:** `SensorySlider` (no primitive exists), `ContentRenderer`
  (load-band-aware renderer, no analog exists), `CalmOverlay` (below), and the
  `/api/learn` route.
- **Reference precedent, not reused directly:** the flip-card flashcard UI in
  `src/app/autism/communication-skills/page.tsx` (real `Progress` bar + next/prev
  navigation state, hardcoded to 5 words) is the closest existing analog to a
  chunk-at-a-time UI in the app. Worth reading before building the "high load" one-line
  advance mode and (later, out of scope here) Flash Cards, but it lives in the old
  autism section and shouldn't be imported directly — its styling is tied to the
  green/purple palette this plan is explicitly moving away from.

### Level 10 Calm takeover

- **New:** `src/components/learn/CalmOverlay.tsx`, a full-screen conditional overlay
  (`fixed inset-0 z-50`, mounted when `loadBand(level) === "max"`) rendering, per
  `PRODUCT_PLAN.md` §6 and the `CalmScreen` entry in the UI Component Map:
  - `BreathingCircle` — an animated expanding/contracting circle, built with
    `framer-motion`'s `animate={{ scale: [1, 1.4, 1] }}` looped transition.
  - `GroundingExercise` — static 5-4-3-2-1 sensory-grounding text, no Gemini call
    needed.
  - `Affirmation` — one short Gemini-generated calming sentence, reusing `/api/learn`
    with `loadLevel: 10` (the prompt template's own "Load 10: One calming sentence
    only. No teaching." rule already handles this — no separate endpoint needed).
  - A single "Come back when you're ready" `Button` that sets the slider back down
    (e.g. to 6) and unmounts the overlay — "Nothing else on screen. Nothing," per the
    product plan.

### Explicit non-goals for this pass

- No Onboarding or Profile persistence — no Supabase writes, no localStorage. Load
  level, learning-difference type, hyperfocus interest, and sand-mode toggle are all
  plain component state, reset on refresh.
- No Flash Cards (`generateObject` + zod path) and no Browser Extension companion —
  both already fully scoped as separate, later tracks in `PRODUCT_PLAN.md`.
- No fixing of any Part 1 technical debt in this pass (the broken landing-page header,
  broken sub-routes, non-functional buttons, mock dashboard data, or `Card`'s baked-in
  purple styling at the component-definition level) — Part 1 is catalog-only.
- No Deaf Mode / Colour Blind Mode implementation yet — `PRODUCT_PLAN.md` scopes these
  as Profile-driven toggles; since Profile is deferred, these stay as noted future work
  rather than being half-built without a settings surface to control them.
