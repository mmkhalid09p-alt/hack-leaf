# Student Learning Features — Implementation Plan

## Context

`PRODUCT_PLAN.md` scoped NeuroLearn as a sensory-load-adaptive experience for neurodiverse
learners specifically (autism, ADHD, sensory processing, deaf/HoH, colour blind). That
adaptive engine — the sensory load slider, `ContentRenderer`, deaf mode, sand mode, the
Calm takeover — is built and working (`src/app/learn/page.tsx`).

This plan pivots the app's positioning from "neurodiverse-therapy-only" to **helping all
students learn**, while keeping the sensory-adaptive system as one part of a broader
offering rather than the whole story. It adds four new feature areas plus a full visual
redesign:

1. A dynamic, Gemini-generated subject/curriculum library (not a static catalog)
2. Progress tracking & streaks, working for guests first, syncing to an account later
3. A homework/practice-helper mode inside the existing Learn page
4. Study tools — saving notes and auto-summaries from past Learn sessions

The redesign exists because the current visual language (`src/components/ui/card.tsx`'s
baked-in purple border, the old green/purple "gamified therapy" palette, the landing
page's broken duplicate header — all cataloged in `WEBSITE_UPGRADE_PLAN.md` Part 1) reads
as clinical/therapy-specific and doesn't fit a broadened, all-students audience.

Work is organized into 6 phases, ordered so it can ship and be deployed incrementally.
Phase 0 (design system) is deliberately first and independent of the four feature
phases — it touches shared primitives everything else builds on, with no feature-logic
dependencies.

---

## Phase 0 — Design System & Shell

**Goal:** one coherent token system, a neutral `Card`, a redesigned `Navbar`, and a real
landing page, so every later phase builds on a settled visual language instead of the old
green/purple look.

**Files changed:**

- `src/app/globals.css`
  - Keep the existing `@theme`/`:root` CSS-variable architecture — `Button`
    (`src/components/ui/button.tsx`), `Progress`, and `Tabs` already consume tokens like
    `bg-primary`/`text-primary-foreground`/`bg-secondary`, so wiring real hues into these
    tokens propagates through all three for free.
  - Replace the current achromatic `oklch(x 0 0)` values in `:root`/`.dark` with a real
    palette: anchor `--primary` on the violet already used in Learn/CalmScreen/Profile
    (`#7c3aed`-family), and the neutral base on the warm stone/cream already used in
    `CalmScreen.tsx` (`#fafaf9`/`#1c1917`-family). This gives continuity with the one
    surface that already has good design, instead of inventing a third palette.
  - `--destructive` stays as-is (still needed by auth pages).

- `src/components/ui/card.tsx`
  - Remove the baked-in `border-2 border-purple-200 ... hover:bg-purple-100 ...` (line 10).
  - Replace with neutral, token-driven styling: `border bg-card text-card-foreground
    shadow-sm hover:shadow-md transition-shadow`. Per-usage `className` overrides remain
    the escape hatch for pages that want emphasis.

- `src/components/ui/navbar.tsx`
  - Restyle with the new tokens (no logic changes — the auth-detection `useEffect`
    already works correctly).
  - Add a `/subjects` link (Phase 2) to both the desktop nav and mobile menu.

- `src/app/page.tsx` (landing page)
  - Delete the hand-rolled duplicate header (the `min-h-scrren`-typo'd block) and render
    the real `Navbar`, as `src/app/learn/page.tsx` and `src/app/profile/page.tsx` already do.
  - Rewrite hero/section copy to drop "Specialized Therapy for Autism & Dyslexia" as the
    sole framing, in favor of "helps all students learn, however your brain works." Keep
    the existing Autism/Dyslexia/Detection cards as one path among several; add a
    card/CTA pointing at `/learn` and `/subjects` as the primary entry points.
  - Replace hardcoded `bg-green-600`/`text-purple-600`/`border-green-500` classes with the
    new tokens, and reuse `Card`/`Button` where the page currently hand-rolls boxes.

**Scope boundary:** no bespoke redesign of `src/app/autism/*`, `src/app/dyslexia/*`,
`src/app/detection/page.tsx`, `src/app/dashboard/page.tsx`, or auth pages in this phase —
they inherit the new `Card`/`Button`/`Navbar`/tokens automatically since those are shared
components, but their own hardcoded utility classes are left as-is.

**New dependencies:** none.

---

## Phase 1 — Homework / Practice Helper (inside the existing Learn page)

**Goal:** add a mode toggle to `/learn` — "Explore a topic" vs "Help with a problem" —
without breaking existing behavior, reusing `/api/learn` rather than a new route.

**Why one endpoint, mode flag, not a new route:** `src/app/api/learn/route.ts`'s
`buildPrompt()` already centralizes the load-band rule table and mirrors
`PRODUCT_PLAN.md`'s master prompt. Homework help needs the same inputs (topic/problem
text, load level, hyperfocus interest, sand mode) and the same output shape (streamed
prose, band-simplified) — only the instructions change. A second route would duplicate
the API-key guard, the load-band table, and the streaming wiring for one changed
paragraph of prompt text, and let the two prompts drift apart over time — the same reason
`loadBand()` lives in one place (`src/lib/sensoryLoad.ts`) rather than being reimplemented
per consumer.

**Why `ContentRenderer` needs zero changes:** it operates purely on the returned text
stream (prose at low load, bullets at mid, sentence-chunked at high) with no awareness of
*why* that text was generated. Whether it's "how photosynthesis works" or "step 1:
isolate the variable," the same band-based rendering applies.

**Files changed:**

- `src/app/api/learn/route.ts`
  - Extend the request body: `mode?: "explore" | "homework"` (default `"explore"`,
    backward compatible) and `problemText?: string`.
  - `buildPrompt()` gains a `homework` branch — "A student needs help with a problem.
    Problem: {problemText}. Give step-by-step guidance, don't just give the final answer
    outright — help them reason through it." — same load-band rules table applied to
    both modes.
  - When `mode === "homework"`, require `problemText` instead of `topic`.

- `src/app/learn/page.tsx`
  - Add a `mode` state, driven by the existing `Tabs`/`TabsList`/`TabsTrigger`
    (`src/components/ui/tabs.tsx` — already a dependency, currently used once in
    `src/app/detection/page.tsx`; this is its first genuinely reusable second usage).
  - Swap the topic text input for a `<textarea>` ("Paste your question or problem
    here...") when `mode === "homework"`; keep the hyperfocus-interest field in both
    modes.
  - Thread `mode` through `generateContent()` / `handleTopicSubmit()` / the debounced
    regenerate-on-slider-move effect and their POST bodies/dependency arrays.
  - No changes needed to `CalmScreen`, `BreathingCircle`, `VisualCueFlash`, or deaf/sand
    mode wiring — orthogonal to explore vs. homework.

**New dependencies:** none.

---

## Phase 2 — Subject / Curriculum Library (dynamic, Gemini-generated)

**Goal:** a browsable subject picker that asks Gemini for topic suggestions (never a
static catalog), feeding into the Learn page's existing topic pipeline. First use of
structured output (`generateObject` + `zod`).

**New dependency:** `zod` — add to `package.json`. First used in the schema file below.

**Files changed/new:**

- **New:** `src/lib/schemas.ts` — shared zod schema for topic suggestions:
  `TopicSuggestionsSchema = z.object({ topics: z.array(z.object({ title: z.string(),
  blurb: z.string() })).min(4).max(10) })`. Kept in its own file since a later Flash
  Cards feature (`PRODUCT_PLAN.md` Feature 10, out of scope here) will want its own
  schema in the same file — establishing the convention now.

- **New:** `src/app/api/topics/route.ts`
  - Same shape as `src/app/api/learn/route.ts`: API-key guard, `getGeminiModel()` from
    `src/lib/gemini.ts` (unchanged).
  - Accepts `{ subject: string }`, calls `generateObject({ model: getGeminiModel(),
    schema: TopicSuggestionsSchema, prompt: ... })` — first `generateObject` call in the
    codebase.
  - Returns parsed `{ topics }` JSON (not a stream).

- **New:** `src/app/subjects/page.tsx`
  - Client component, renders `Navbar` (same pattern as `/learn`, `/profile`).
  - Free-text subject input (e.g. "Biology", "Algebra") + quick-pick chips for common
    subjects (chips just prefill the input — actual topics always come from Gemini, not
    a hardcoded list).
  - On submit: POST `/api/topics`, render `{ title, blurb }` as `Card`s.
  - Clicking a topic navigates to `/learn?topic=<title>&subject=<subject>`.

- `src/app/learn/page.tsx`
  - Read `topic`/`subject` from `useSearchParams()` on mount; if present, prefill and
    auto-fire `generateContent()` once. Check at implementation time whether a
    `<Suspense>` boundary is needed around this read.

**New dependencies:** `zod`.

---

## Phase 3 — Shared Guest-First / Optional-Supabase-Sync Data Layer

**Goal:** one reusable storage pattern — not four bespoke ones — that Phases 4 and 5 both
build on.

**Architectural decision — one context, not several:** progress/streaks (topics
explored, day-over-day activity) and study tools (notes, summaries, session history) are
the same underlying entity: a **learn session** produced by the Learn page, optionally
flagged as a note, optionally summarized. Streaks are a derived aggregate (distinct
active dates) over that same session log. One `StudentDataContext` avoids two contexts
independently persisting to two localStorage keys and two Supabase tables that would need
to stay in sync — mirroring how `AccessibilityContext` is split by *domain* (accessibility
settings), not by feature checkbox.

**Files:**

- **New:** `src/context/StudentDataContext.tsx`
  - Same shape as `src/context/AccessibilityContext.tsx`: `createContext` + `Provider` +
    `useStudentData()` hook, hydrate-on-mount, persist-on-change.
  - localStorage key: `neurolearn_student_data` (namespaced like `neurolearn_accessibility`).
  - Local shape:
    ```ts
    {
      sessions: LearnSession[],
      streak: { current: number; longest: number; lastActiveDate: string | null },
      importedToSupabase: boolean
    }
    ```
  - `LearnSession`: `{ id, createdAt, mode: "explore" | "homework", subject?, topic,
    hyperfocusInterest?, sensoryLoadAtCreation, content, isNote: boolean, summary?: string }`.
  - Exposes `logSession(session)`, `markAsNote(id)`, `setSummary(id, summary)`,
    `sessions`, `streak`.
  - Streak recompute: a pure function (`src/lib/streaks.ts`) called from `logSession` —
    compares `lastActiveDate` to today (UTC), increments/resets/no-ops. Kept separate
    from storage so it's independently testable.

- `src/app/layout.tsx` — wrap children in `<StudentDataProvider>` alongside the existing
  `<AccessibilityProvider>`.

- **Supabase sync (one-way, one-time import):**
  - Detect sign-in via `supabase.auth.onAuthStateChange` (same as `Navbar`).
  - On transition to signed-in, if local `importedToSupabase` is `false`: push all local
    `sessions` into the new `learn_sessions` table tagged with `user_id`, then flip
    `importedToSupabase = true` **locally only**. This keeps the import decision fully
    client-side; the accepted tradeoff is that a second guest device signing in later
    would import again as a second batch rather than deduping against the first device —
    acceptable since full cross-device merge is out of scope.
  - Once signed in, new `logSession`/`markAsNote`/`setSummary` calls write to Supabase
    directly, while keeping the local mirror too (single read model regardless of auth
    state, works optimistically/offline).
  - Streak aggregate for signed-in users persisted to a small `user_streaks` row so it
    isn't recomputed from a potentially-large session table on every load.

**New Supabase tables — run manually in the Supabase SQL editor (no migration tooling
exists in this repo):**

```sql
-- learn_sessions: one row per Learn-page generation (explore or homework),
-- optionally promoted to a saved note, optionally summarized.
create table if not exists learn_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mode text not null check (mode in ('explore', 'homework')),
  subject text,
  topic text not null,
  hyperfocus_interest text,
  sensory_load_at_creation int not null check (sensory_load_at_creation between 1 and 10),
  content text not null,
  is_note boolean not null default false,
  summary text,
  created_at timestamptz not null default now()
);

alter table learn_sessions enable row level security;

create policy "Users can read own sessions"
  on learn_sessions for select
  using (auth.uid() = user_id);

create policy "Users can insert own sessions"
  on learn_sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own sessions"
  on learn_sessions for update
  using (auth.uid() = user_id);

-- user_streaks: one row per user, cheap to read on every Learn/Progress page load
-- instead of recomputing from learn_sessions on every request.
create table if not exists user_streaks (
  user_id uuid primary key references auth.users(id) on delete cascade,
  current_streak int not null default 0,
  longest_streak int not null default 0,
  last_active_date date,
  updated_at timestamptz not null default now()
);

alter table user_streaks enable row level security;

create policy "Users can read own streak"
  on user_streaks for select
  using (auth.uid() = user_id);

create policy "Users can upsert own streak"
  on user_streaks for insert
  with check (auth.uid() = user_id);

create policy "Users can update own streak"
  on user_streaks for update
  using (auth.uid() = user_id);
```

**New dependencies:** none (uses the existing `@supabase/supabase-js` client in
`src/lib/supabaseClient.ts`).

---

## Phase 4 — Progress Tracking & Streaks

**Goal:** wire `StudentDataContext` into actual usage, surface it where guests can see it
without an account.

**Files changed/new:**

- `src/app/learn/page.tsx`
  - On successful generation (both explore and homework modes), call `logSession()` from
    `useStudentData()` — a single instrumentation point since Phase 1 already unified
    both modes through one `generateContent()` path.
  - Add a small streak/session-count badge near the top of the page (e.g. "🔥 3-day
    streak · 12 topics explored"), reading from `useStudentData()`.

- **New:** `src/app/progress/page.tsx`
  - Client component, renders `Navbar`, works for guests (local context) and signed-in
    users (same context, Supabase-backed per Phase 3).
  - Shows streak tiles (current/longest), total sessions/topics count, and a
    chronological list of past sessions (topic, mode badge, date, load at the time,
    content preview).
  - Each item has a "Reopen in Learn" action → `/learn?resume=<sessionId>`; the Learn
    page checks for `resume` and loads the stored content directly from context state,
    without a new Gemini call.
  - `src/components/ui/navbar.tsx` — add a `/progress` link.

**Scope boundary:** this does not wire the new streak/session data into
`src/app/dashboard/page.tsx`'s existing mocked "Weekly Overview" or therapy-module
progress cards — those are separate, pre-existing tech debt tied to therapy-module
concepts (sessions/16, communication skills) that this plan doesn't touch. `/progress` is
a new, purpose-built surface instead of retrofitting the dashboard.

**New dependencies:** none.

---

## Phase 5 — Study Tools: Notes & Summaries

**Goal:** save generated content as a note, auto-summarize, revisit later — building on
the Phase 3/4 session log rather than a separate storage layer.

**Files changed:**

- `src/app/api/learn/route.ts`
  - Extend `mode` to a third value: `"summarize"`. Body gains `sourceContent?: string`
    (the already-generated text to summarize), used instead of `topic`/`problemText`.
  - `buildPrompt()` gets a third branch: "Summarize the following content into a short
    set of key takeaways: {sourceContent}" — still respecting the load-band table (a
    load-1–3 summary can be a paragraph; load-7–9 is one line).

- `src/app/learn/page.tsx`
  - Add a "Save as note" button — calls `markAsNote(currentSessionId)` (the session was
    already logged per Phase 4; this just flips `isNote`).
  - Add a "Summarize" button — POSTs `mode: "summarize"`, `sourceContent: content`,
    streams the result, calls `setSummary(currentSessionId, summaryText)` on completion.

- `src/app/progress/page.tsx`
  - Add an "All sessions" vs "Notes only" filter (reuse `Tabs`), show `summary` inline
    where present.

**New dependencies:** none.

---

## Phase 6 — Cross-Cutting Polish & Verification

- Sweep `src/app/learn/page.tsx` for hardcoded violet/purple classes that should now
  reference Phase 0 tokens — but keep the Learn page's intentional dark violet/Calm
  aesthetic (per `PRODUCT_PLAN.md`'s colour system table) as bespoke; only the *shared
  shell* (Navbar, default Card, landing page) needs the new tokens.
- Confirm `/subjects`, `/progress`, and the extended `/learn` stay outside
  `middleware.ts`'s matcher (`/dashboard/:path*` only) — no middleware change needed.
- Manual QA, end-to-end, guest flow: explore → homework → save note → summarize → check
  `/progress` → sign up → confirm one-time import → sign back in → confirm no duplicate
  import. Highest-risk new logic path in this plan.

---

## Explicit Out-of-Scope (this pass)

- Full bidirectional Supabase sync/conflict resolution (only one-time one-way guest import).
- Quiz Mode and Automatic Flash Cards (`PRODUCT_PLAN.md` Features 8 & 10 — separate
  future work; Phase 2's `zod`/`generateObject` introduction makes Flash Cards easier
  later but isn't building them now).
- Browser Extension companion (`PRODUCT_PLAN.md`'s own separate track).
- Colour Blind Mode UI/palettes (pre-existing stub, not part of this task's four feature areas).
- Bespoke per-page redesigns of `src/app/autism/*`, `src/app/dyslexia/*`,
  `src/app/detection/page.tsx`, `src/app/dashboard/page.tsx`, and auth pages — they
  inherit shared-component styling only.
- Retrofitting `src/app/dashboard/page.tsx`'s mocked therapy-module progress section with
  the new streak/session data — a new `/progress` page is built instead.
- Fixing the cataloged broken sub-routes/non-functional buttons in
  `WEBSITE_UPGRADE_PLAN.md` Part 1 (autism/dyslexia module links, detection test CTAs) —
  unrelated pre-existing tech debt.

---

## New Dependencies Summary

| Package | First used in | Why |
|---|---|---|
| `zod` | `src/lib/schemas.ts`, consumed by `src/app/api/topics/route.ts` | First `generateObject` structured-output call (topic suggestions) |

No other new dependencies — `Tabs`, `framer-motion`, `@supabase/supabase-js`, and the AI
SDK are already installed and reused throughout.

## Critical Files

- `src/app/api/learn/route.ts` — extended across Phases 1, 2, 5 (mode flag: explore →
  homework → summarize)
- `src/context/StudentDataContext.tsx` — new, Phase 3
- `src/context/AccessibilityContext.tsx` — existing pattern to mirror for the new context
- `src/app/learn/page.tsx` — touched in every phase
- `src/components/ui/card.tsx` — Phase 0
- `src/app/globals.css` — Phase 0
- `src/app/api/topics/route.ts` — new, Phase 2

## Verification

- `npm run dev`, then manually walk: `/` (new Navbar + hero) → `/subjects` (enter a
  subject, get Gemini-suggested topics) → click a topic → `/learn` (prefilled, content
  generates) → toggle to homework mode, paste a problem → save as note → summarize →
  `/progress` (see the session, streak, and note) → sign up → confirm local sessions
  import into Supabase once → sign out/in again → confirm no duplicate rows in
  `learn_sessions`.
- `npm run lint` and `npm run build` after each phase to catch type errors early
  (`mode`/`problemText`/`sourceContent` threading in particular).
- No test suite exists in this repo (per `CLAUDE.md`) — rely on the manual walk-through
  above plus `npm run build` for regressions.
