<div align="center">

# 🧠 NEUROLEARN 🎮  
<p align="center">
  <img src="/public/images/nav.png" alt="NeuroLearn Banner" /> <br/>
</p>
A sensory-load-adaptive learning platform for neurodiverse learners

## 📌 Overview

NeuroLearn is an open-source project designed to:
- Adapt content and UI to each learner's **sensory load**
- Provide accessibility modes: **deaf mode**, **colour-blind palettes**, and **sand mode**
- Deliver **AI-driven, personalised** learning with detection screeners and module-based therapies
- Support **Autism Spectrum Disorder (ASD)** and **Dyslexia**

---

## 🧭 Platform Design

### 🖼️ Landing Page
- Hero section with **call-to-action (CTA) buttons**:
  - 👦 Autism
  - 🔤 Dyslexia
  - 🔍 Detection Test

### 👦 Autism Page
Features cards for:
- **Detection Modules**: AQ, M-CHAT-R/F, CARS, SRS-2
- **Therapy Modules**: Communication, Social, Cognitive, Sensory, Literacy, Behavioral, Voice


### 🔤 Dyslexia Page
Features cards for:
- **Detection Modules**: Phonological tests, RAN, Memory, Writing Analysis, Reading Fluency
- **Therapy Modules**: Phonics, TTS, Dictation, Sight Words, Typing, Sequencing, Letter Writing

---

## 🧪 Detection Modules

### Autism Detection
- **AQ** – 50-item self-assessment
- **M-CHAT-R/F** – 20 yes/no for toddlers
- **CARS** – Behavior rating scale
- **SRS-2** – Measures social ability

### Dyslexia Detection
- Phonological awareness tests
- Rapid Automatized Naming (RAN)
- Auditory memory tasks
- Writing sample analysis
- Reading fluency checks

---

## 🎯 Therapy Modules

### Autism Therapy
| Module | Sample Therapies |
|--------|------------------|
| Communication | Flashcards, speech-to-text, AAC icons |
| Social | Role-play, emotion games, cartoon clips |
| Cognitive | Memory puzzles, sequencing games |
| Sensory | Calming animations, soundboards |
| Literacy | Read-aloud, dictation, phonics |
| Behavioral | Token boards, animations |
| Voice Practice | Mirror games, pronunciation drills |

### Dyslexia Therapy
| Module | Sample Therapies |
|--------|------------------|
| Phonological | Sound-letter games, voice guidance |
| TTS/Read-along | Click to read, color-coded text |
| Dictation | Visual feedback transcription |
| Sight Words | Flashcards, gamified books |
| Spelling | Typing audio, glowing keys |
| Sequencing | Story building from images |
| Letter Writing | Trace + animate characters |

---

## 🛠️ Tech Stack

- **Next** for frontend and backend
- **Framer Motion** for animations
- **Shadcn/UI** for clean components
- **Lucide Icons** for accessibility
- **supabase** for database
- **gemini** for LLM model
- **Vercel AI SDK** for AI Integrations

---

## 🚀 Backend Setup (Supabase)

Login/signup won't work until a real Supabase project is connected — without
this, the app falls back to a placeholder URL and every auth call fails.

1. **Create a free project** at [supabase.com](https://supabase.com/dashboard) (takes ~2 minutes).
2. **Copy your credentials**: Project → Settings → API → copy the *Project URL* and the *anon public* key.
3. **Set up environment variables**: copy `env.example` to `.env.local` and paste in the two values:
   ```bash
   cp env.example .env.local
   ```
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
   ```
4. **Create the database schema**: open Project → SQL Editor → New query, paste the contents of
   [`supabase/schema.sql`](supabase/schema.sql), and run it. This creates the `user_profiles` table
   (used by signup/onboarding/dashboard) with row-level security so users can only read/write their own row.
5. **Restart the dev server**: `npm run dev`.

You should now be able to sign up, complete your profile, and land on `/dashboard`.

### Optional: enabling "Continue with Google"

The Google sign-in button on `/AuthPage` needs a one-time provider setup in the
Supabase dashboard — this can't be done from code:

1. In [Google Cloud Console](https://console.cloud.google.com/apis/credentials), create an OAuth 2.0 Client ID
   (type: Web application). Add `https://<your-project-ref>.supabase.co/auth/v1/callback` as an authorized redirect URI.
2. In Supabase: Authentication → Providers → Google → paste the Client ID and Client Secret → Save.
3. In Supabase: Authentication → URL Configuration → add your app's origin (e.g. `http://localhost:3000`)
   to the Redirect URLs allow list, since `src/app/AuthPage/page.tsx` redirects to `/auth/callback` after sign-in.

Until this is configured, "Continue with Google" will show an error from Supabase — email/password sign-in
works independently of this step.

---

## ✨ Want to Contribute?

We're building this as an open, community-driven platform.  
Feel free to suggest UI components, design animations, or fix bugs!

> See the [CONTRIBUTING.md](CONTRIBUTING.md) for setup and details.


---

## 🌟 Show Your Support

If you like the project, **leave a ⭐️ on GitHub** and help it reach more developers and families 💖  
