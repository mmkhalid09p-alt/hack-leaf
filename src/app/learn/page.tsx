"use client";

import { useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccessibility } from "@/context/AccessibilityContext";
import { BreathingCircle } from "@/components/ui/BreathingCircle";
import { VisualCueFlash, VisualCueFlashHandle } from "@/components/ui/VisualCueFlash";
import { Navbar } from "@/components/ui/navbar";
import { Volume2, VolumeX, Settings, ChevronRight } from "lucide-react";
import Link from "next/link";

// Sensory load → label & emoji
const LOAD_META: Record<number, { label: string; emoji: string; colour: string }> = {
  1: { label: "Clear", emoji: "😊", colour: "#7c3aed" },
  2: { label: "Bright", emoji: "😊", colour: "#7c3aed" },
  3: { label: "Calm", emoji: "😌", colour: "#6d28d9" },
  4: { label: "Busy", emoji: "😐", colour: "#2563eb" },
  5: { label: "Tiring", emoji: "😐", colour: "#2563eb" },
  6: { label: "Strained", emoji: "😓", colour: "#0369a1" },
  7: { label: "Heavy", emoji: "😰", colour: "#92400e" },
  8: { label: "Overloaded", emoji: "😰", colour: "#b91c1c" },
  9: { label: "Overwhelmed", emoji: "🌊", colour: "#991b1b" },
  10: { label: "Crisis", emoji: "🌊", colour: "#450a0a" },
};

export default function LearnPage() {
  const { deafMode, sensoryLoad, setSensoryLoad } = useAccessibility();
  const flashRef = useRef<VisualCueFlashHandle>(null);
  const [captionText, setCaptionText] = useState<string | null>(null);

  const meta = LOAD_META[sensoryLoad] ?? LOAD_META[3];

  // Simulate an audio cue (e.g. a notification arriving)
  const simulateCue = useCallback(() => {
    if (deafMode) {
      // Visual replacement
      flashRef.current?.flash("Notification");
      setCaptionText("📢 New message received");
      setTimeout(() => setCaptionText(null), 3000);
    } else {
      // In non-deaf mode we would play audio — stub for now
      alert("🔊 Audio cue played (TTS / sound)");
    }
  }, [deafMode]);

  // Simple TTS stub — suppressed in deaf mode
  const speakContent = useCallback(() => {
    if (deafMode) {
      setCaptionText("📖 Content would be read aloud — visual captions shown instead");
      flashRef.current?.flash("TTS suppressed");
      setTimeout(() => setCaptionText(null), 4000);
      return;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const utt = new SpeechSynthesisUtterance(
        "This is a sample learning passage. In non-deaf mode, text-to-speech reads your content aloud."
      );
      window.speechSynthesis.speak(utt);
    }
  }, [deafMode]);

  return (
    <>
      {/* Global visual cue flash overlay */}
      <VisualCueFlash ref={flashRef} colour="#7c3aed" />

      <Navbar />

      <main
        className="min-h-screen text-white px-4 py-10 transition-colors duration-700"
        style={{ background: sensoryLoad >= 7 ? "#0d0d0d" : "#0a0614" }}
      >
        <div className="max-w-3xl mx-auto space-y-8">

          {/* ── Deaf mode banner ── */}
          <AnimatePresence>
            {deafMode && (
              <motion.div
                key="deaf-banner"
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35 }}
                className="flex items-center gap-3 px-5 py-3 rounded-xl border border-violet-700/50 bg-violet-950/60 shadow-lg shadow-violet-900/30"
                role="status"
                aria-live="polite"
              >
                <VolumeX className="w-5 h-5 text-violet-400 flex-shrink-0" />
                <span className="text-sm font-medium text-violet-200">
                  <strong>🔇 Audio Off</strong> — Visual Mode Active.
                  All sounds replaced with flashes and captions.
                </span>
                <Link
                  href="/profile"
                  className="ml-auto text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors"
                >
                  Change <ChevronRight className="w-3 h-3" />
                </Link>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Sensory Load Slider ── */}
          <section className="rounded-2xl border border-white/10 bg-[#130d2a] p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">
                  How&apos;s your brain feeling right now?
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-2xl">{meta.emoji}</span>
                  <span className="text-lg font-bold" style={{ color: meta.colour }}>
                    {sensoryLoad}/10 — {meta.label}
                  </span>
                </div>
              </div>
              <Link
                href="/profile"
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                title="Accessibility settings"
              >
                <Settings className="w-5 h-5 text-slate-400" />
              </Link>
            </div>

            <input
              id="sensory-slider"
              type="range"
              min={1}
              max={10}
              value={sensoryLoad}
              onChange={(e) => setSensoryLoad(Number(e.target.value))}
              className="w-full h-2 rounded-full cursor-pointer appearance-none"
              style={{
                background: `linear-gradient(to right, ${meta.colour} 0%, ${meta.colour} ${(sensoryLoad - 1) * 11.1}%, #1e1b4b ${(sensoryLoad - 1) * 11.1}%, #1e1b4b 100%)`,
                accentColor: meta.colour,
              }}
              aria-label="Sensory load level 1 to 10"
            />
            <div className="flex justify-between text-xs text-slate-600 mt-1">
              <span>1 — Clear</span>
              <span>10 — Crisis</span>
            </div>
          </section>

          {/* ── Caption bar (always-on in deaf mode) ── */}
          <AnimatePresence>
            {deafMode && captionText && (
              <motion.div
                key="caption"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-xl border border-violet-700/40 bg-[#1a0f35] px-5 py-3 text-sm text-violet-200 font-medium"
                role="status"
                aria-live="assertive"
              >
                {captionText}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Breathing Circle ── */}
          <section className="rounded-2xl border border-white/10 bg-[#130d2a] p-8 shadow-xl flex flex-col items-center gap-2">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4">
              Breathing Exercise
            </h2>
            <BreathingCircle deafMode={deafMode} size={220} />
          </section>

          {/* ── Simulate audio cues (demo panel) ── */}
          <section className="rounded-2xl border border-white/10 bg-[#130d2a] p-6 shadow-xl">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4">
              Demo — Audio Cue Replacement
            </h2>
            <div className="flex flex-col sm:flex-row gap-3">
              {/* TTS button */}
              <button
                id="tts-btn"
                onClick={speakContent}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl border transition-all duration-200 font-semibold text-sm"
                style={{
                  borderColor: deafMode ? "#4c1d95" : "#4c1d95",
                  background: deafMode ? "rgba(76,29,149,0.15)" : "rgba(76,29,149,0.3)",
                  color: deafMode ? "#a78bfa" : "#c4b5fd",
                }}
              >
                {deafMode ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
                {deafMode ? "TTS → Caption (Visual)" : "Speak Content (TTS)"}
              </button>

              {/* Notification cue button */}
              <button
                id="cue-btn"
                onClick={simulateCue}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-violet-800/50 bg-violet-900/20 text-violet-300 font-semibold text-sm hover:bg-violet-900/40 transition-all duration-200"
              >
                🔔
                {deafMode ? "Trigger Visual Flash" : "Trigger Audio Cue"}
              </button>
            </div>

            <p className="text-xs text-slate-600 mt-3 text-center">
              {deafMode
                ? "Deaf Mode ON — pressing either button fires a visual replacement instead of audio."
                : "Deaf Mode OFF — audio plays. Turn it on in Profile → Settings."}
            </p>
          </section>

          {/* ── Settings CTA ── */}
          <div className="text-center pb-4">
            <Link
              href="/profile"
              className="inline-flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Manage accessibility settings
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
