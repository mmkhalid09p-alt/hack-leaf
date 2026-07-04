"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { LoadBand } from "@/lib/sensoryLoad";

interface PetTheme {
  card: string;
  text: string;
  muted: string;
  accent: string;
  accentDark: string;
  border: string;
  soft: string;
}

interface PetProps {
  band: LoadBand;
  sandMode: boolean;
  isGenerating: boolean;
  justFinished: boolean;
  theme: PetTheme;
}

type Mood = "happy" | "thinking" | "celebrate" | "gentle" | "sleeping" | "loved";

const PETS_KEY = "neurolearn_pet_hearts";

function pickMessage(mood: Mood, band: LoadBand, sandMode: boolean): string {
  if (mood === "loved") return sandMode ? "Thank you, friend." : "Hehe! That tickles!";
  if (mood === "thinking") return sandMode ? "Let me think…" : "Hmm, thinking…";
  if (mood === "celebrate") return sandMode ? "Here you go." : "Nice one! 🎉";
  if (mood === "sleeping") return "Zzz…";
  if (band === "high") return sandMode ? "No rush at all." : "One step at a time.";
  if (band === "mid") return sandMode ? "We can go slowly." : "You've got this!";
  return sandMode ? "Take your time." : "Ready when you are!";
}

export function Pet({ band, sandMode, isGenerating, justFinished, theme }: PetProps) {
  const sleeping = band === "max";
  const [mood, setMood] = useState<Mood>("happy");
  const [bubble, setBubble] = useState<string | null>(null);
  const [hearts, setHearts] = useState(0);
  const [burst, setBurst] = useState(0); // increments to trigger a heart burst
  const bubbleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load pet hearts from storage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(PETS_KEY);
      if (raw) setHearts(Number(raw) || 0);
    } catch {}
  }, []);

  function say(text: string, ms = 3500) {
    if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
    setBubble(text);
    bubbleTimer.current = setTimeout(() => setBubble(null), ms);
  }

  // Mood follows app state
  useEffect(() => {
    if (sleeping) {
      setMood("sleeping");
      say("Zzz…", 60000);
      return;
    }
    if (isGenerating) {
      setMood("thinking");
      say(pickMessage("thinking", band, sandMode), 60000);
      return;
    }
    if (justFinished) {
      setMood("celebrate");
      say(pickMessage("celebrate", band, sandMode));
      const t = setTimeout(() => setMood(band === "high" ? "gentle" : "happy"), 2500);
      return () => clearTimeout(t);
    }
    setMood(band === "high" ? "gentle" : "happy");
    setBubble(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sleeping, isGenerating, justFinished, band, sandMode]);

  function petMe() {
    if (sleeping) {
      say(sandMode ? "Shh… resting." : "Shh… I'm napping 💤");
      return;
    }
    const next = hearts + 1;
    setHearts(next);
    setBurst((b) => b + 1);
    try {
      localStorage.setItem(PETS_KEY, String(next));
    } catch {}
    setMood("loved");
    say(pickMessage("loved", band, sandMode), 2500);
    setTimeout(() => setMood(band === "high" ? "gentle" : "happy"), 2200);
  }

  // Body animation per mood — calmer as load rises
  const bodyAnim =
    mood === "sleeping"
      ? { scale: [1, 1.04, 1] }
      : mood === "celebrate"
        ? { y: [0, -14, 0, -8, 0], rotate: [0, -4, 4, 0] }
        : mood === "loved"
          ? { rotate: [0, -8, 8, -6, 6, 0] }
          : mood === "thinking"
            ? { y: [0, -3, 0] }
            : mood === "gentle"
              ? { y: [0, -2, 0] }
              : { y: [0, -6, 0] };

  const bodyDur =
    mood === "sleeping" ? 4 : mood === "celebrate" ? 0.9 : mood === "loved" ? 0.7 : mood === "gentle" ? 3.2 : 2;

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-30 flex flex-col items-end gap-2">
      {/* Speech bubble */}
      <AnimatePresence>
        {bubble && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            className="pointer-events-none max-w-48 rounded-2xl rounded-br-sm border px-3.5 py-2 text-xs font-semibold shadow-sm"
            style={{
              backgroundColor: theme.card,
              borderColor: theme.border,
              color: theme.text,
            }}
            role="status"
          >
            {bubble}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative">
        {/* Heart burst when petted */}
        <AnimatePresence>
          {burst > 0 && (
            <motion.div
              key={burst}
              className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 text-lg"
              initial={{ opacity: 1, y: 0, scale: 0.6 }}
              animate={{ opacity: 0, y: -34, scale: 1.2 }}
              transition={{ duration: 1 }}
              aria-hidden
            >
              💚
            </motion.div>
          )}
        </AnimatePresence>

        {/* The owl */}
        <motion.button
          onClick={petMe}
          aria-label="Pet your study buddy"
          title="Pet me!"
          className="pointer-events-auto block cursor-pointer rounded-full border p-2 shadow-md transition-shadow hover:shadow-lg"
          style={{ backgroundColor: theme.card, borderColor: theme.border }}
          animate={bodyAnim}
          transition={{ repeat: mood === "celebrate" || mood === "loved" ? 0 : Infinity, duration: bodyDur, ease: "easeInOut" }}
          whileTap={{ scale: 0.9 }}
        >
          <OwlSvg mood={mood} accent={theme.accent} accentDark={theme.accentDark} soft={theme.soft} />
        </motion.button>

        {/* Hearts collected */}
        {hearts > 0 && (
          <span
            className="pointer-events-none absolute -left-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full border px-1 text-[10px] font-bold shadow-sm"
            style={{ backgroundColor: theme.card, borderColor: theme.border, color: theme.accent }}
            aria-label={`${hearts} hearts collected`}
          >
            {hearts > 99 ? "99+" : hearts}
          </span>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// The owl itself — simple expressive SVG
// ─────────────────────────────────────────────────────────────────────────────

function OwlSvg({
  mood,
  accent,
  accentDark,
  soft,
}: {
  mood: Mood;
  accent: string;
  accentDark: string;
  soft: string;
}) {
  const sleeping = mood === "sleeping";
  const thinking = mood === "thinking";
  const happyEyes = mood === "celebrate" || mood === "loved";

  return (
    <svg width="64" height="64" viewBox="0 0 64 64" aria-hidden>
      {/* wings */}
      <motion.ellipse
        cx="10"
        cy="38"
        rx="7"
        ry="12"
        fill={accentDark}
        animate={mood === "celebrate" ? { rotate: [-20, 20, -20] } : { rotate: [-4, 4, -4] }}
        transition={{ repeat: Infinity, duration: mood === "celebrate" ? 0.5 : 2.4, ease: "easeInOut" }}
        style={{ originX: "10px", originY: "30px" }}
      />
      <motion.ellipse
        cx="54"
        cy="38"
        rx="7"
        ry="12"
        fill={accentDark}
        animate={mood === "celebrate" ? { rotate: [20, -20, 20] } : { rotate: [4, -4, 4] }}
        transition={{ repeat: Infinity, duration: mood === "celebrate" ? 0.5 : 2.4, ease: "easeInOut" }}
        style={{ originX: "54px", originY: "30px" }}
      />

      {/* body */}
      <ellipse cx="32" cy="36" rx="22" ry="24" fill={accent} />
      {/* belly */}
      <ellipse cx="32" cy="44" rx="13" ry="13" fill={soft} />

      {/* ear tufts */}
      <path d="M16 16 L20 6 L26 14 Z" fill={accentDark} />
      <path d="M48 16 L44 6 L38 14 Z" fill={accentDark} />

      {/* eyes */}
      {sleeping ? (
        <>
          <path d="M20 28 Q25 32 30 28" stroke="#1F2937" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M34 28 Q39 32 44 28" stroke="#1F2937" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </>
      ) : happyEyes ? (
        <>
          <path d="M20 29 Q25 23 30 29" stroke="#1F2937" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M34 29 Q39 23 44 29" stroke="#1F2937" strokeWidth="3" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="25" cy="28" r="7" fill="#FFFFFF" />
          <circle cx="39" cy="28" r="7" fill="#FFFFFF" />
          {/* blinking pupils */}
          <motion.g
            animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
            transition={{ repeat: Infinity, duration: 4, times: [0, 0.45, 0.5, 0.55, 1] }}
            style={{ originX: "32px", originY: "28px" }}
          >
            <circle cx={thinking ? 26.5 : 25} cy={thinking ? 26 : 28} r="3" fill="#1F2937" />
            <circle cx={thinking ? 40.5 : 39} cy={thinking ? 26 : 28} r="3" fill="#1F2937" />
          </motion.g>
        </>
      )}

      {/* beak */}
      <path d="M29 34 L35 34 L32 40 Z" fill="#F59E0B" />

      {/* thinking sparkle */}
      {thinking && (
        <motion.text
          x="48"
          y="14"
          fontSize="10"
          animate={{ opacity: [0, 1, 0] }}
          transition={{ repeat: Infinity, duration: 1.4 }}
        >
          💭
        </motion.text>
      )}
      {sleeping && (
        <motion.text
          x="46"
          y="14"
          fontSize="10"
          animate={{ opacity: [0, 1, 0], y: [16, 8] }}
          transition={{ repeat: Infinity, duration: 2.4 }}
        >
          💤
        </motion.text>
      )}
    </svg>
  );
}
