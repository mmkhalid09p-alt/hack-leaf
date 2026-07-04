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

## Gemini Integration

Model: `gemini-2.0-flash` — fast, cheap, good enough

Master prompt structure:

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

Core MVP: ~4 hours. Full product: ~6 hours.

## Pitch (30 seconds)

> One in five students is neurodiverse. Every edtech app treats them the same way, every
> session. NeuroLearn is different — it adapts to your sensory capacity right now, today.
> Set your load level, and the entire app morphs — the content, the language, the colours,
> the sound, even the tone of the AI. Built for students who are autistic, have ADHD, are
> deaf, colour blind, or just having a hard day. Because your brain deserves an app that
> actually gets it.
