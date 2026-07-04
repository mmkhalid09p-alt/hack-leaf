# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project

NeuroLearn — a single-screen, sensory-load-adaptive revision app for SEN / neurodiverse
learners. Paste a topic, set how your brain feels (1–10), and Gemini rewrites the content
to match. Duolingo-inspired UI with Framer Motion animations.

Core features (non-negotiable):
- **Sensory meter** — permanent 1–10 slider; the entire UI and content morph with it
- **Gemini content adapter** — one engineered prompt, rewrites per load level
- **Deaf mode** — visual-only; audio replaced with visual cues
- **Colour blind mode** — 3 palettes + shape-coded indicators (never colour-only)
- **Sand mode** — sandy palette + slow, unhurried AI tone
- **Load 10** — no teaching; inline calm message + breathing guide (not a separate page)

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS v4 (CSS-first config in `globals.css`), Framer Motion, Lucide icons
- Gemini via Vercel AI SDK (`@ai-sdk/google`, `ai`)

## Commands

```bash
npm run dev   # start dev server (http://localhost:3000)
npm run build # production build
npm run lint  # next lint
```

No test suite is configured.

## Structure

```
src/
  app/
    page.tsx           # the whole app — single screen, no routing
    layout.tsx         # root layout (Nunito font, AccessibilityProvider)
    globals.css        # Tailwind + custom slider styles
    api/learn/route.ts # Gemini streaming endpoint (topic + loadLevel + sandMode)
  components/ui/
    BreathingCircle.tsx # visual breathing guide used at load 10
  context/
    AccessibilityContext.tsx # deafMode / colourBlindMode / sandMode / sensoryLoad (localStorage)
  lib/
    gemini.ts             # Gemini model factory
    sensoryLoad.ts        # 1–10 → low/mid/high/max band mapping
    colourBlindPalettes.ts # the 3 colour blind palettes
```

- Path alias: `@/*` → `./src/*` (see `tsconfig.json`).
- Required env var: `GOOGLE_GENERATIVE_AI_API_KEY` (server-only, never `NEXT_PUBLIC_`).

## Conventions

- Single screen: do not add routes or pages; new UI goes into `page.tsx` or a small component.
- Every visual state must respect all four accessibility modes (deaf, colour blind, sand, load band).
- Never use red/green alone to convey meaning; pair colour with shapes or text.
