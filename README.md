<div align="center">

# 🦉 NeuroLearn

**Paste any topic, set how your brain feels right now, get revision content that actually works for you.**

Built for SEN and neurodiverse learners. Duolingo-inspired. One screen, no clutter.

</div>

---

## How it works

1. **Set the meter** — a permanent 1–10 slider asks *"How's your brain right now?"* (1 = clear, 10 = overwhelmed).
2. **Type a topic** — anything: photosynthesis, fractions, Romeo and Juliet.
3. **Content morphs** — Gemini rewrites the explanation live, and the whole UI adapts:

| Load | What you get |
|------|--------------|
| 1–3  | Rich explanation, full paragraphs, real-world examples |
| 4–6  | Calm bullet points, plain English |
| 7–9  | One idea at a time, big text, warm tone |
| 10   | No teaching at all — a calm message and a breathing guide |

## Accessibility (in the ⚙️ settings drawer)

- **Deaf mode** — everything is visual; audio is replaced with visual cues
- **Colour blind mode** — 3 palettes (deuteranopia, protanopia, monochromacy) with shape-coded indicators, never colour-only
- **Sand mode** — warm sandy palette and a slow, unhurried AI tone with zero urgency

## Run it

```bash
npm install
cp env.example .env.local   # add your Gemini key
npm run dev                 # http://localhost:3000
```

Requires one env var: `GOOGLE_GENERATIVE_AI_API_KEY` (from [Google AI Studio](https://aistudio.google.com/)).

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS v4 + Framer Motion
- Gemini via the Vercel AI SDK (`@ai-sdk/google`)
