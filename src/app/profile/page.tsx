"use client";

import { useAccessibility, type ColourBlindMode } from "@/context/AccessibilityContext";
import { DeafModeToggle } from "@/components/ui/DeafModeToggle";
import { Navbar } from "@/components/ui/navbar";
import { motion } from "framer-motion";
import { Volume2, Eye, Palette, Sparkles } from "lucide-react";

const COLOUR_BLIND_OPTIONS: { value: ColourBlindMode; label: string }[] = [
  { value: "none", label: "None (default)" },
  { value: "deuteranopia", label: "Deuteranopia — blue / yellow" },
  { value: "protanopia", label: "Protanopia — blue / orange" },
  { value: "monochromacy", label: "Monochromacy — greyscale" },
];

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.45, ease: "easeOut" as const },
  }),
};

export default function ProfilePage() {
  const { deafMode, setDeafMode, sandMode, setSandMode, colourBlindMode, setColourBlindMode } =
    useAccessibility();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#0a0614] text-white px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Page header */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10"
          >
            <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              Accessibility Settings
            </h1>
            <p className="text-slate-400 mt-2 text-sm leading-relaxed">
              Your preferences are saved automatically and persist across sessions.
            </p>
          </motion.div>

          {/* ─── Deaf / HoH Mode ─── */}
          <motion.section
            custom={0}
            initial="hidden"
            animate="visible"
            variants={sectionVariants}
            className="rounded-2xl border border-violet-800/40 bg-[#130d2a] p-6 mb-5 shadow-lg shadow-violet-950/40"
          >
            <div className="flex items-start gap-4 mb-5">
              <div className="p-2.5 rounded-xl bg-violet-900/40 border border-violet-700/30">
                <Volume2 className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">Deaf / Hard of Hearing Mode</h2>
                <p className="text-slate-400 text-sm mt-1 leading-relaxed">
                  Disables <strong className="text-slate-300">all audio</strong> — TTS, breathing sounds,
                  background music. Every audio cue is replaced with a visual equivalent: colour
                  flashes, animated icons, and captions always on.
                </p>
              </div>
            </div>

            <DeafModeToggle enabled={deafMode} onToggle={setDeafMode} id="deaf-mode-toggle" />

            {deafMode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 rounded-xl bg-violet-900/20 border border-violet-700/30 px-4 py-3"
              >
                <p className="text-violet-300 text-xs leading-relaxed">
                  ✅ <strong>Active:</strong> TTS is suppressed · Breathing circle is visual-only ·
                  All cues will flash instead of play · Captions shown automatically.
                </p>
              </motion.div>
            )}
          </motion.section>

          {/* ─── Sand Mode (stub) ─── */}
          <motion.section
            custom={1}
            initial="hidden"
            animate="visible"
            variants={sectionVariants}
            className="rounded-2xl border border-amber-800/30 bg-[#130d2a] p-6 mb-5 shadow-lg shadow-amber-950/20"
          >
            <div className="flex items-start gap-4 mb-5">
              <div className="p-2.5 rounded-xl bg-amber-900/30 border border-amber-700/30">
                <Sparkles className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">Sand Response Mode</h2>
                <p className="text-slate-400 text-sm mt-1 leading-relaxed">
                  Shifts the AI tone to be extremely calm, warm, and unhurried. No exclamation
                  marks. Sandy colour palette. Like someone speaking softly in a quiet library.
                </p>
              </div>
            </div>

            {/* Simple toggle for sand mode (Feature 5 full impl later) */}
            <div className="flex items-center gap-4">
              <span className="text-2xl select-none">🏖️</span>
              <button
                id="sand-mode-toggle"
                role="switch"
                aria-checked={sandMode}
                aria-label="Toggle Sand Response Mode"
                onClick={() => setSandMode(!sandMode)}
                className="relative inline-flex items-center w-14 h-7 rounded-full cursor-pointer transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
                style={{ backgroundColor: sandMode ? "#b45309" : "#374151" }}
              >
                <motion.span
                  layout
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-md"
                  style={{ x: sandMode ? 28 : 0 }}
                />
              </button>
              <span className="text-sm font-semibold" style={{ color: sandMode ? "#fbbf24" : "#9ca3af" }}>
                {sandMode ? "ON" : "OFF"}
              </span>
            </div>
          </motion.section>

          {/* ─── Colour Blind Mode ─── */}
          <motion.section
            custom={2}
            initial="hidden"
            animate="visible"
            variants={sectionVariants}
            className="rounded-2xl border border-sky-800/30 bg-[#130d2a] p-6 mb-5 shadow-lg shadow-sky-950/20"
          >
            <div className="flex items-start gap-4 mb-5">
              <div className="p-2.5 rounded-xl bg-sky-900/30 border border-sky-700/30">
                <Palette className="w-5 h-5 text-sky-400" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">Colour Blind Mode</h2>
                <p className="text-slate-400 text-sm mt-1 leading-relaxed">
                  Swaps palettes so status and feedback never rely on red/green alone.
                  Shape + text labels are used throughout NeuroLearn.
                </p>
              </div>
            </div>

            <select
              value={colourBlindMode}
              onChange={(e) => setColourBlindMode(e.target.value as ColourBlindMode)}
              className="w-full p-3 rounded-xl border border-sky-700/40 bg-[#0a0614] text-slate-200 text-sm"
              aria-label="Colour blind mode"
            >
              {COLOUR_BLIND_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {colourBlindMode !== "none" && (
              <p className="mt-3 text-sky-300 text-xs">
                Active on the Learn page — blue/yellow or greyscale palettes applied.
              </p>
            )}
          </motion.section>

          {/* ─── Learn page CTA ─── */}
          <motion.div
            custom={3}
            initial="hidden"
            animate="visible"
            variants={sectionVariants}
            className="mt-8 text-center"
          >
            <a
              href="/learn"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold text-sm shadow-lg shadow-violet-900/40 hover:from-violet-500 hover:to-fuchsia-500 transition-all duration-200"
            >
              <Eye className="w-4 h-4" />
              Try it on the Learn page →
            </a>
          </motion.div>
        </div>
      </main>
    </>
  );
}
