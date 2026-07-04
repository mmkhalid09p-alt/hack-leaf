# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project

NeuroDev Therapy (`autismhealthcare`) — a Next.js web app providing detection screeners and
gamified, module-based therapies for Autism Spectrum Disorder and Dyslexia.

See [`PRODUCT_PLAN.md`](./PRODUCT_PLAN.md) for the NeuroLearn direction — a sensory-load-adaptive
learning experience (load meter, deaf mode, colour-blind palettes, sand mode, Gemini-driven
content, flash cards, and a companion browser extension) layered on top of this codebase.

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS v4, Shadcn/UI (Radix primitives) components in `src/components/ui`
- Framer Motion for animation, Lucide/react-icons for icons
- Supabase (`@supabase/supabase-js`, `@supabase/auth-helpers-nextjs`) for auth + database

## Commands

```bash
npm run dev      # start dev server (http://localhost:3000)
npm run build    # production build
npm run start    # run production build
npm run lint     # next lint
```

No test suite is configured yet.

## Structure

```
src/
  app/                       # App Router routes
    page.tsx                 # landing page
    layout.tsx               # root layout
    AuthPage/                # login/signup
    auth/callback/           # supabase auth callback
    auth/reset-password/
    complete-profile/
    dashboard/                # gated behind auth (see middleware.ts)
    detection/                 # detection test page
    autism/                    # autism hub + therapy modules
      behavioral-training/ cognitive-skills/ communication-skills/
      language-literacy/ social-skills/
    dyslexia/                  # dyslexia hub
    about/
  components/ui/             # Shadcn-style reusable components
  lib/
    supabaseClient.ts         # Supabase client (reads NEXT_PUBLIC_SUPABASE_URL / _ANON_KEY)
    utils.ts
```

- Path alias: `@/*` → `./src/*` (see `tsconfig.json`).
- `middleware.ts` redirects unauthenticated requests to `/dashboard/*` back to `/AuthPage`
  using a Supabase session check.
- Required env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  (`src/lib/supabaseClient.ts` throws if either is missing).
- Optional (server-only): `GOOGLE_GENERATIVE_AI_API_KEY` — Gemini via AI Studio
  (`src/lib/gemini.ts`, `src/app/api/chat/route.ts`). Do not expose with `NEXT_PUBLIC_`.

## Conventions

- Components: PascalCase filenames (e.g. `TherapyCard.tsx`).
- Static assets: lowercase-hyphenated filenames (e.g. `hero-bg.png`), stored under `public/`.
- Tailwind utility-first styling; prefer existing `components/ui` primitives over new ad-hoc ones.
- New therapy/detection modules follow the existing per-condition page structure under
  `src/app/autism/*` and `src/app/dyslexia/*`.
