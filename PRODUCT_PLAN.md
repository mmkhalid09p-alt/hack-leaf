# NeuroLearn — Full Product Plan

## Problem

Neurodiverse learners (autism, ADHD, sensory processing disorder, anxiety) don't have a
consistent brain every session. Their capacity shifts hour to hour. Every existing edtech
app ignores this completely and serves the same experience regardless. Deaf and colour-blind
learners are also massively underserved. NeuroLearn fixes all of this in one app.

## Target Users

- Autistic students
- ADHD learners
- Students with sensory processing disorder / anxiety
- Deaf / hard of hearing students
- Colour blind students
- Anyone having a rough day cognitively

## Core Architecture

Pages:

- **Onboarding** — quick profile setup (30 seconds, no account)
- **Learn** — main screen, topic input + dynamic content
- **Calm** — level 10 full screen takeover
- **Profile** — accessibility settings + preferences

## Features

### 1. Sensory Load Meter (the hero feature)

- Permanent slider at top of screen, 1–10
- Label: "How's your brain feeling right now?"
- Emoji face changes live: 😊 → 😐 → 😰 → 🌊
- Every single UI element + Gemini response morphs instantly on slider move
- User can update mid-session anytime

What changes per level:

| Level | Language | Format | Font Size | Colours | Animation | Sound |
|---|---|---|---|---|---|---|
| 1–3 | Academic, rich | Full paragraphs | Normal | Warm purple/yellow | Subtle | Optional music |
| 4–6 | Simplified | Bullet points | Medium+ | Soft blue/white | Minimal | Off by default |
| 7–9 | Dead simple, warm | One line at a time | Large | Cream/charcoal | None | TTS auto-on |
| 10 | No content | Breathing only | Massive | Black on cream | Breathing pulse | Guided breath |

Enhancements (optional, nice-to-have — not required for MVP):

- Persist the last-used level (profile or localStorage) so a returning user starts where
  they left off, with a soft re-check rather than assuming it's still accurate
- Animate transitions between level bands (Framer Motion cross-fade) instead of a hard
  content swap, so moving the slider feels gentle rather than jarring
- A brief (~10 second) calibration moment during onboarding — a single "how's your brain
  right now?" tap — to set a real starting level instead of defaulting to a guess
- Lightweight in-session load history (just the last few slider positions, not full
  analytics) so the Gemini master prompt can include a simple trend note — rising,
  falling, steady — for a slightly warmer tone on the way up, without building a logging
  system
- Optional, quiet nudge after long inactivity at an extreme level (e.g. level 9–10 with
  no interaction for a while) — a soft, silent-if-deaf-mode "still here when you're ready,"
  never a push notification or sound-based alert

### 2. Stay Focused Mode

- Available at load levels 4–6
- Hides everything except the current content chunk
- Focus ring pulses around active text
- "Next →" button to reveal next chunk only
- No scrolling, no sidebar, no distractions
- Designed specifically for ADHD + anxiety users

### 3. Deaf / Hard of Hearing Mode

- Toggle in profile, persists forever
- ALL audio disabled — TTS, breathing audio, background music
- Every audio cue replaced with visual equivalent:
  - Sound → colour flash + animated icon
  - Breathing audio → expanding/contracting circle animation only
  - Spoken content → captions always on
- Breathing exercise becomes fully visual — animated ring, no sound

### 4. Colour Blind Mode

Three submodes:

- Deuteranopia (red-green blind) → blue/yellow palette
- Protanopia (red weak) → high contrast blue/orange
- Monochromacy (full) → greyscale, relies on shape + size
- Load level indicator → shape + number based, never colour-only
- All status indicators use icons + text labels, not just colour
- Quiz correct/wrong → shape-coded not colour-coded

### 5. Sand Response Mode

- Works across ALL load levels
- Gemini responds in an extremely calm, warm, unhurried tone
- No exclamation marks, no bold urgency, no rushing
- Like someone speaking softly in a quiet library
- UI shifts to sandy palette (#C2B280), rounded corners, zero sharp edges
- Toggle sits alongside deaf + colour blind modes in profile

### 6. Level 10 Calm Mode

- Full screen takeover, no content at all
- 5-4-3-2-1 grounding exercise (senses)
- Animated breathing circle (visual only if deaf mode on)
- One soft affirmation from Gemini
- "Come back when you're ready" button
- Nothing else on screen. Nothing.

### 7. Text-to-Speech

- Auto-activates at load levels 7–9
- Highlights each word as it's read
- Disabled entirely if deaf mode is on
- Manual toggle available at any level

### 8. Quiz Mode (load 1–3 only)

- Gemini generates 3 questions on the topic
- Multiple choice, colour-blind safe
- Streak tracker
- Disappears at load 4+ automatically

### 9. Hyperfocus Personalisation

- Set during onboarding: football / gaming / music / cooking / etc.
- Gemini weaves this into ALL examples and analogies
- Learning photosynthesis? Here's how it works in Minecraft farming
- Learning fractions? Here's how FIFA card values work

### 10. Automatic Flash Cards

- Alongside Quiz Mode, not a replacement — flash cards are lower-pressure (self-paced
  recall, no scoring) so they work at a wider load range: **available at load 1–6**
  (Quiz Mode stays 1–3 only, since it demands active multiple-choice recall)
- Disabled at load 7–10 — same reasoning as Quiz Mode disappearing at load 4+: dead-simple
  and breathing-only levels shouldn't add a study task
- Generated via Gemini using the same `getGeminiModel()` factory (`src/lib/gemini.ts`) as
  the rest of the app, but through `generateObject` instead of `streamText` — a structured
  call constrained to a schema of `{ front, back, hint? }` pairs, so output is always
  parseable card data rather than free text to split apart
- Deck size: 5–8 cards at load 1–3, trimmed to 4–5 at load 4–6 (mirrors the "less per
  screen" pattern used elsewhere as load rises)
- UI: tap-to-flip card (Framer Motion, already a dependency) with a "Next →" advance,
  same chunk-at-a-time feel as Stay Focused Mode — no hover-reveal, no scrolling
- Session-based only for v1 — no spaced-repetition scheduling (no ts-fsrs/sm-2 in the
  project today); noted as a future enhancement rather than building a scheduler now
- Colour-blind / deaf-mode safe: front vs. back distinguished by an icon + text label
  ("Question" / "Answer"), never colour alone; any flip sound is optional and, per the
  existing Deaf/HoH rule, replaced by a visual pulse when that mode is on; a "got it" /
  "still learning" self-mark uses shape/icon coding, not colour-only, consistent with
  Quiz Mode's rule
- Hyperfocus personalisation still applies — the "back" of a card can lean on the user's
  set interest for its example/analogy, same as other features

## Browser Extension (Companion)

A separate, later build track — a Manifest V3 Chrome extension that generates flash
cards from whatever page the user is currently reading. Not part of the Core MVP or
Full product time estimates below; its own phase after the main app ships.

Architecture:

- **manifest.json (MV3)** — `activeTab` + `scripting` + `storage` permissions only
  (avoids needing broad host permissions); a background service worker, a popup, and a
  content script injected on demand (on user click, not on every page load, for privacy)
- **Content script** — extracts the readable article text from the current tab using a
  Readability-style library (e.g. `@mozilla/readability`) — not currently a project
  dependency; would be added to the extension's own small bundle, separate from the
  main Next.js app's `package.json`
- **Background service worker** — relays extracted page text plus the user's stored
  NeuroLearn auth token from `chrome.storage.local` to the backend
- **Popup** — "Generate Flash Cards from this page" button, shows the linked account's
  current sensory load level (read-only pull from the profile), displays the resulting
  cards with a "Save to NeuroLearn" action

Backend:

- New route, e.g. `POST /api/flashcards/from-page`, following the same shape as
  `src/app/api/chat/route.ts`: checks `GOOGLE_GENERATIVE_AI_API_KEY`, accepts
  `{ pageText, pageTitle, sourceUrl, loadLevel, hyperfocusInterest }`
- Calls `getGeminiModel()` (same factory, no change needed there) but through
  `generateObject` with a zod schema for the card array — the same structured path
  introduced for Feature 10, reused here
- Must itself be authenticated (see below) — otherwise it's an open free-Gemini proxy

Account linking (v1, simplest viable):

- A new "Extension" section in Profile settings generates a personal API token
  (server-side, stored hashed, tied to the Supabase user id)
- User pastes that token once into the extension popup ("Connect your NeuroLearn
  account"); stored in `chrome.storage.local` (device-local, not synced) and sent as a
  bearer token on every request
- Flag a device-code / magic-link pairing flow as a nicer v2 — needs a pairing table and
  a polling endpoint, more infra than a v1 needs

Sensory load carry-over:

- Extension reads the user's current stored load level from their profile at generation
  time (e.g. `GET /api/profile/load-level`, same bearer token) so page-based cards obey
  the same rules as the in-app feature:
  - Load 1–6: normal generation, same deck-size rules as Feature 10
  - Load 7–10: decline to generate — show a calm redirect ("Your brain's at a 7 right
    now — flash cards are paused. Open NeuroLearn to breathe first.") rather than
    building a second, extension-only simplified prompt branch
- Never generate content at load 10 from any surface, including the extension

This is realistically its own multi-hour effort — extension scaffolding, Readability
integration, a new authenticated API route, and a profile token UI — kept explicitly
separate from the app-only time estimates below.

## Gemini Integration

Model: `gemini-2.5-flash` (matches `DEFAULT_GEMINI_MODEL` in `src/lib/gemini.ts`) —
fast, cheap, good enough.

Two generation paths, both built on the same `getGeminiModel()` factory:

- **Conversational / narrative content** (chat assistant, Learn screen prose,
  affirmations): `streamText` via the Vercel AI SDK, as already implemented in
  `src/app/api/chat/route.ts`
- **Structured content** (Flash Cards — Feature 10 — and, later, Quiz Mode could migrate
  here too for stronger reliability): `generateObject` with a zod schema describing
  `{ front: string; back: string; hint?: string }[]`. Requires adding `zod` as a new
  dependency (not currently in `package.json`)

Both paths share the same master prompt variables (load level, learning difference,
hyperfocus interest, sand mode) — the structured path just adds a schema constraint on
top of the same instructions instead of returning free text.

Master prompt structure (conversational path):

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

Every slider move = new Gemini call. Content re-renders smoothly.

## UI Component Map

```
App
├── ProfileSetup (onboarding)
├── TopBar
│   ├── SensorySlider (1-10, always visible)
│   └── LoadIndicator (emoji + colour/shape)
├── SettingsPanel (profile page)
│   ├── DeafModeToggle
│   ├── ColourBlindSelector (none/deut/prot/mono)
│   └── SandModeToggle
├── LearnScreen
│   ├── TopicInput
│   ├── ContentRenderer (dynamic per load)
│   ├── FocusedModeWrapper (load 4-6)
│   ├── TTSController (load 7-9, not deaf)
│   └── QuizPanel (load 1-3)
└── CalmScreen (load 10 takeover)
    ├── BreathingCircle
    ├── GroundingExercise
    └── Affirmation
```

## Colour System

| Mode | Low Load (1-3) | Mid Load (4-6) | High Load (7-9) | Level 10 |
|---|---|---|---|---|
| Default | Purple/yellow warm | Soft blue/white | Cream/charcoal | Black on cream |
| Sand | Sandy warm (#C2B280) | Lighter sand | Pale sand | Off-white only |
| Deuteranopia | Blue/yellow | Blue/yellow | Blue/grey | Black/white |
| Protanopia | Blue/orange | Blue/orange | Blue/grey | Black/white |
| Mono | Dark/light grey | Mid greys | Light grey | Black/white |

## Build Order

| Priority | Feature | Est. Time |
|---|---|---|
| Must | Sensory slider + UI morphing | 1.5 hrs |
| Must | Gemini API + prompt engineering | 1 hr |
| Must | Content re-render on slider change | 45 min |
| Must | Deaf mode (visual-only everything) | 30 min |
| Must | Colour blind mode (3 palettes) | 30 min |
| Should | Sand mode (tone + palette) | 20 min |
| Should | Level 10 calm/breathing screen | 30 min |
| Should | Stay focused mode | 25 min |
| Nice | TTS with word highlighting | 20 min |
| Nice | Quiz mode | 45 min |
| Nice | Hyperfocus personalisation | 30 min |
| Nice | Automatic Flash Cards (`generateObject` via existing factory) | 45 min |
| Nice | Sensory Load Meter enhancements (persistence, transitions, calibration, trend) | 40 min |
| Later (separate track) | Browser Extension companion (MV3 scaffold, Readability, account linking, new authenticated route) | 4–6 hrs, own track |

Core MVP: ~4 hours. Full product: ~6 hours. Browser Extension is a distinct third phase
on top of both — it needs its own build/package pipeline and a new authenticated
endpoint, so it isn't folded into either estimate above.

## Pitch (30 seconds)

> One in five students is neurodiverse. Every edtech app treats them the same way, every
> session. NeuroLearn is different — it adapts to your sensory capacity right now, today.
> Set your load level, and the entire app morphs — the content, the language, the colours,
> the sound, even the tone of the AI. Built for students who are autistic, have ADHD, are
> deaf, colour blind, or just having a hard day. Because your brain deserves an app that
> actually gets it.
