"use client";

import { useRef, useState, useCallback, useEffect, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccessibility } from "@/context/AccessibilityContext";
import { loadBand } from "@/lib/sensoryLoad";
import { BreathingCircle } from "@/components/ui/BreathingCircle";
import { VisualCueFlash, VisualCueFlashHandle } from "@/components/ui/VisualCueFlash";
import { Navbar } from "@/components/ui/navbar";
import { Button } from "@/components/ui/button";
import { VolumeX, Settings, ChevronRight, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { CalmScreen } from "@/components/ui/CalmScreen";
import { ContentRenderer } from "@/components/learn/ContentRenderer";

const SAMPLE_TEXT =
  "Neurodiversity is the idea that neurological differences like Autism, ADHD, and Dyslexia are natural variations of the human genome. Learning apps should adapt to the user's current mental bandwidth, offering streamlined bullet points or spoken text options depending on immediate sensory fatigue.";

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
  const { deafMode, sandMode, sensoryLoad, setSensoryLoad } = useAccessibility();
  const flashRef = useRef<VisualCueFlashHandle>(null);
  const [captionText, setCaptionText] = useState<string | null>(null);

  const meta = LOAD_META[sensoryLoad] ?? LOAD_META[3];
  const band = loadBand(sensoryLoad);

  // ── Topic input + Gemini-adaptive content generation ──
  const [topicInput, setTopicInput] = useState("");
  const [hyperfocusInterest, setHyperfocusInterest] = useState("");
  const [topic, setTopic] = useState<string | null>(null);
  const [content, setContent] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  const generateContent = useCallback(
    async (topicValue: string, loadLevel: number) => {
      setIsGenerating(true);
      setGenError(null);
      setContent("");

      try {
        const res = await fetch("/api/learn", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic: topicValue,
            loadLevel,
            hyperfocusInterest: hyperfocusInterest.trim() || undefined,
            sandMode,
          }),
        });

        if (!res.ok || !res.body) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.error || "Failed to generate content.");
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          setContent(accumulated);
        }
      } catch (err) {
        setGenError(
          err instanceof Error ? err.message : "Something went wrong."
        );
      } finally {
        setIsGenerating(false);
      }
    },
    [hyperfocusInterest, sandMode]
  );

  const handleTopicSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const value = topicInput.trim();
    if (!value || isGenerating) return;
    setTopic(value);
    void generateContent(value, sensoryLoad);
  };

  // Keep refs to the latest topic + generator so the debounced regeneration
  // effect below stays fresh without re-firing on every keystroke.
  const generateRef = useRef(generateContent);
  const topicRef = useRef(topic);
  useEffect(() => {
    generateRef.current = generateContent;
    topicRef.current = topic;
  });

  // Regenerate when sensory load or sand mode shifts mid-session, debounced —
  // "every slider move = new Gemini call" (per PRODUCT_PLAN.md), but only once a
  // topic has been submitted. Uses refs above so no stale closure and no need to
  // depend on the fast-changing input fields.
  useEffect(() => {
    if (!topicRef.current) return;
    const timeout = setTimeout(() => {
      if (topicRef.current) void generateRef.current(topicRef.current, sensoryLoad);
    }, 400);
    return () => clearTimeout(timeout);
  }, [sensoryLoad, sandMode]);

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



  return (
    <>
      {/* Level 10 Takeover Screen */}
      <AnimatePresence>
        {sensoryLoad === 10 && (
          <CalmScreen deafMode={deafMode} onExit={() => setSensoryLoad(3)} />
        )}
      </AnimatePresence>
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

          {/* ── Breathing Circle — surfaced only when load is elevated ── */}
          <AnimatePresence>
            {sensoryLoad >= 6 && (
              <motion.section
                key="breathing"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4 }}
                className="overflow-hidden rounded-2xl border border-white/10 bg-[#130d2a] p-8 shadow-xl flex flex-col items-center gap-2"
              >
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4">
                  Take a breath
                </h2>
                <BreathingCircle deafMode={deafMode} size={220} />
              </motion.section>
            )}
          </AnimatePresence>

          {/* ── Topic Input ── */}
          <section className="rounded-2xl border border-white/10 bg-[#130d2a] p-6 shadow-xl space-y-4">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">
              What do you want to learn?
            </h2>
            <form onSubmit={handleTopicSubmit} className="space-y-3">
              <input
                type="text"
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                placeholder="e.g. Photosynthesis, fractions, the water cycle..."
                className="w-full rounded-xl border border-white/10 bg-[#0a0614] px-4 py-3 text-sm text-slate-200 outline-none focus:border-violet-500"
                disabled={isGenerating}
              />
              <input
                type="text"
                value={hyperfocusInterest}
                onChange={(e) => setHyperfocusInterest(e.target.value)}
                placeholder="Optional: a hyperfocus interest (football, Minecraft, cooking...)"
                className="w-full rounded-xl border border-white/10 bg-[#0a0614] px-4 py-3 text-sm text-slate-200 outline-none focus:border-violet-500"
                disabled={isGenerating}
              />
              <Button
                type="submit"
                disabled={isGenerating || !topicInput.trim()}
                className="w-full bg-violet-700 hover:bg-violet-600 text-white"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {topic ? "Regenerate" : "Start Learning"}
              </Button>
            </form>
          </section>

          {/* ── Learning Passage with TTS & Word Highlighting ── */}
          <section className="rounded-2xl border border-white/10 bg-[#130d2a] p-6 shadow-xl space-y-4">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">
              Interactive Learning Content
            </h2>

            {genError && (
              <p className="text-xs text-red-400">
                {genError.includes("GOOGLE_GENERATIVE_AI_API_KEY")
                  ? "Add your AI Studio key to .env.local, then restart the dev server."
                  : genError}
              </p>
            )}

            {!genError && (
              <p className="text-xs text-slate-500">
                {!topic
                  ? "Enter a topic above — the layout adapts to your sensory load as you move the slider."
                  : sensoryLoad <= 3
                  ? "Rich reading with speech + word highlighting."
                  : sensoryLoad <= 6
                  ? "Simplified into calm bullet points."
                  : "One idea at a time. Read aloud automatically."}
              </p>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={`${topic ? "topic" : "sample"}-${band}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ContentRenderer
                  text={content || (topic ? "" : SAMPLE_TEXT)}
                  level={sensoryLoad}
                  deafMode={deafMode}
                  isStreaming={isGenerating}
                />
              </motion.div>
            </AnimatePresence>
          </section>

          {/* ── Notification cue simulator ── */}
          <section className="rounded-2xl border border-white/10 bg-[#130d2a] p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-450">Test Visual replacements</h2>
              <p className="text-xs text-slate-500 mt-1">
                Fires a notification alert. In Deaf Mode, this will trigger a silent screen edge flash.
              </p>
            </div>
            
            <button
              id="cue-btn"
              onClick={simulateCue}
              className="w-full sm:w-auto px-5 py-3 rounded-xl border border-violet-850 bg-violet-900/20 text-violet-300 font-semibold text-sm hover:bg-violet-900/40 transition-all duration-200"
            >
              🔔 {deafMode ? "Trigger Visual Flash" : "Trigger Audio Cue"}
            </button>
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
