"use client";

import { useRef, useState, useCallback, useEffect, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useAccessibility,
  type ColourBlindMode,
} from "@/context/AccessibilityContext";
import { loadBand } from "@/lib/sensoryLoad";
import { Navbar } from "@/components/ui/navbar";
import SensorySlider from "@/components/learn/SensorySlider";
import { ContentRenderer } from "@/components/learn/ContentRenderer";
import CalmOverlay from "@/components/learn/CalmOverlay";
import { Settings } from "lucide-react";

export default function LearnPage() {
  const {
    deafMode,
    setDeafMode,
    colourBlindMode,
    setColourBlindMode,
    sandMode,
    setSandMode,
    sensoryLoad,
    setSensoryLoad,
  } = useAccessibility();

  const band = loadBand(sensoryLoad);

  const [topicInput, setTopicInput] = useState("");
  const [hyperfocusInterest, setHyperfocusInterest] = useState("");
  const [learningDifference, setLearningDifference] = useState("none");
  const [topic, setTopic] = useState<string | null>(null);
  const [content, setContent] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const generateContent = useCallback(
    async (topicValue: string, loadLevel: number) => {
      if (loadLevel === 10) return;

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
            learningDifference:
              learningDifference !== "none" ? learningDifference : undefined,
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
    [hyperfocusInterest, learningDifference, sandMode]
  );

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const value = topicInput.trim();
    if (!value || isGenerating) return;
    setTopic(value);
    void generateContent(value, sensoryLoad);
  };

  const generateRef = useRef(generateContent);
  const topicRef = useRef(topic);
  useEffect(() => {
    generateRef.current = generateContent;
    topicRef.current = topic;
  });

  useEffect(() => {
    if (!topicRef.current) return;
    const timeout = setTimeout(() => {
      if (topicRef.current) void generateRef.current(topicRef.current, sensoryLoad);
    }, 400);
    return () => clearTimeout(timeout);
  }, [sensoryLoad, sandMode]);

  return (
    <>
      <AnimatePresence>
        {sensoryLoad === 10 && (
          <CalmOverlay
            deafMode={deafMode}
            sandMode={sandMode}
            onExit={() => setSensoryLoad(5)}
          />
        )}
      </AnimatePresence>

      <Navbar />

      <main
        className={`min-h-screen pt-24 pb-16 px-4 md:px-8 transition-colors duration-500 ${
          sandMode ? "bg-[#F5EFE0]" : "bg-[#0a0614]"
        }`}
      >
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="flex justify-between items-center">
            <h1
              className={`text-2xl font-bold tracking-tight ${
                sandMode ? "text-[#4A3F2F]" : "text-white"
              }`}
            >
              NeuroLearn Center
            </h1>

            <div className="relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2.5 rounded-xl border flex items-center gap-2 text-sm font-semibold transition-all ${
                  sandMode
                    ? "bg-[#FDF8EE] border-[#D9CCAA] text-[#4A3F2F] hover:bg-[#EDE3C8]"
                    : "bg-[#130d2a] border-white/10 text-slate-300 hover:bg-white/5"
                }`}
              >
                <Settings className="w-4 h-4" />
                Quick Controls
              </button>

              {showSettings && (
                <div
                  className={`absolute right-0 mt-2 w-72 p-5 rounded-2xl border shadow-2xl z-40 space-y-4 ${
                    sandMode
                      ? "bg-[#FDF8EE] border-[#D9CCAA] text-[#4A3F2F]"
                      : "bg-[#130d2a] border-white/10 text-slate-300"
                  }`}
                >
                  <h3 className="font-bold border-b pb-2 text-sm uppercase tracking-wider opacity-80">
                    Accessibility Toggles
                  </h3>

                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm font-medium">Sand Mode (Calm UI)</span>
                    <input
                      type="checkbox"
                      checked={sandMode}
                      onChange={(e) => setSandMode(e.target.checked)}
                      className="rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm font-medium">Deaf / HoH Mode</span>
                    <input
                      type="checkbox"
                      checked={deafMode}
                      onChange={(e) => setDeafMode(e.target.checked)}
                      className="rounded"
                    />
                  </label>

                  <div className="space-y-1.5">
                    <span className="text-sm font-medium block">Colour Blind Mode</span>
                    <select
                      value={colourBlindMode}
                      onChange={(e) =>
                        setColourBlindMode(e.target.value as ColourBlindMode)
                      }
                      className={`w-full text-xs p-2 rounded-lg border ${
                        sandMode
                          ? "bg-[#F5EFE0] border-[#D9CCAA] text-[#4A3F2F]"
                          : "bg-[#0a0614] border-white/10 text-slate-300"
                      }`}
                    >
                      <option value="none">None</option>
                      <option value="deuteranopia">Deuteranopia (Red-Green)</option>
                      <option value="protanopia">Protanopia (Red Weak)</option>
                      <option value="monochromacy">Monochromacy (Greyscale)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          <section
            className={`p-6 border transition-all duration-300 ${
              sandMode
                ? "bg-[#FDF8EE] border-[#D9CCAA] rounded-3xl shadow-sm"
                : "bg-[#130d2a] border-white/10 rounded-2xl shadow-xl"
            }`}
          >
            <SensorySlider
              level={sensoryLoad}
              onChange={setSensoryLoad}
              sandMode={sandMode}
            />
          </section>

          <section
            className={`p-6 border transition-all duration-300 ${
              sandMode
                ? "bg-[#FDF8EE] border-[#D9CCAA] rounded-3xl shadow-sm"
                : "bg-[#130d2a] border-white/10 rounded-2xl shadow-xl"
            }`}
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label
                    className={`block text-xs font-bold uppercase tracking-wider ${
                      sandMode ? "text-[#8C7B5E]" : "text-slate-400"
                    }`}
                  >
                    Learning Topic
                  </label>
                  <input
                    type="text"
                    value={topicInput}
                    onChange={(e) => setTopicInput(e.target.value)}
                    placeholder="e.g. Photosynthesis, Binary Code, Gravity"
                    disabled={isGenerating}
                    className={`w-full p-3 rounded-xl border text-sm transition-all focus:ring-2 focus:ring-offset-2 ${
                      sandMode
                        ? "bg-[#F5EFE0] border-[#D9CCAA] text-[#4A3F2F] placeholder-[#8C7B5E]/50 focus:ring-[#C2B280]"
                        : "bg-[#0a0614] border-white/10 text-white placeholder-slate-500 focus:ring-violet-500"
                    }`}
                  />
                </div>

                <div className="space-y-2">
                  <label
                    className={`block text-xs font-bold uppercase tracking-wider ${
                      sandMode ? "text-[#8C7B5E]" : "text-slate-400"
                    }`}
                  >
                    Hyperfocus Interest (optional analogy)
                  </label>
                  <input
                    type="text"
                    value={hyperfocusInterest}
                    onChange={(e) => setHyperfocusInterest(e.target.value)}
                    placeholder="e.g. Minecraft, Trains, Space, Cooking"
                    disabled={isGenerating}
                    className={`w-full p-3 rounded-xl border text-sm transition-all focus:ring-2 focus:ring-offset-2 ${
                      sandMode
                        ? "bg-[#F5EFE0] border-[#D9CCAA] text-[#4A3F2F] placeholder-[#8C7B5E]/50 focus:ring-[#C2B280]"
                        : "bg-[#0a0614] border-white/10 text-white placeholder-slate-500 focus:ring-violet-500"
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  className={`block text-xs font-bold uppercase tracking-wider ${
                    sandMode ? "text-[#8C7B5E]" : "text-slate-400"
                  }`}
                >
                  Personalize for Cognitive Differences
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "none", label: "General" },
                    { id: "adhd", label: "ADHD (Analogy-rich)" },
                    { id: "dyslexia", label: "Dyslexia (Clear/Formatted)" },
                    { id: "autism", label: "Autism (Direct/Literal)" },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setLearningDifference(opt.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        learningDifference === opt.id
                          ? sandMode
                            ? "bg-[#C2B280] border-[#A0926A] text-[#4A3F2F]"
                            : "bg-violet-600 border-violet-500 text-white"
                          : sandMode
                          ? "bg-[#F5EFE0] border-[#D9CCAA] text-[#4A3F2F] hover:bg-[#EDE3C8]"
                          : "bg-[#0a0614] border-white/5 text-slate-400 hover:bg-white/5"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={!topicInput.trim() || isGenerating}
                className={`w-full py-3 rounded-xl font-bold transition-all shadow-md active:scale-98 disabled:opacity-50 cursor-pointer text-sm ${
                  sandMode
                    ? "bg-[#C2B280] text-[#4A3F2F] hover:bg-[#A0926A]"
                    : "bg-violet-600 text-white hover:bg-violet-700"
                }`}
              >
                {isGenerating
                  ? "Generative AI Tailoring Content..."
                  : topic
                  ? "Regenerate"
                  : "Start Adaptive Learning Session"}
              </button>
            </form>
          </section>

          {topic && (
            <section
              className={`p-8 border transition-all duration-500 relative ${
                sandMode
                  ? "bg-[#FDF8EE] border-[#D9CCAA] rounded-3xl shadow-sm"
                  : "bg-[#130d2a] border-white/10 rounded-2xl shadow-xl"
              }`}
            >
              <div className="flex justify-between items-center mb-6">
                <h3
                  className={`text-xs uppercase font-bold tracking-widest ${
                    sandMode ? "text-[#8C7B5E]" : "text-slate-400"
                  }`}
                >
                  Topic: {topic}
                </h3>
                {isGenerating && (
                  <span className="text-xs italic text-violet-400 animate-pulse">
                    Streaming content...
                  </span>
                )}
              </div>

              {genError && (
                <p className="text-xs text-red-400 mb-4">
                  {genError.includes("GOOGLE_GENERATIVE_AI_API_KEY")
                    ? "Add your AI Studio key to .env.local, then restart the dev server."
                    : genError}
                </p>
              )}

              {!genError && (
                <p
                  className={`text-xs mb-4 ${
                    sandMode ? "text-[#8C7B5E]" : "text-slate-500"
                  }`}
                >
                  {sensoryLoad <= 3
                    ? "Rich reading with speech + word highlighting."
                    : sensoryLoad <= 6
                    ? "Simplified into calm bullet points."
                    : "One idea at a time. Read aloud automatically."}
                </p>
              )}

              <AnimatePresence mode="wait">
                <motion.div
                  key={`${topic}-${band}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ContentRenderer
                    text={content ?? ""}
                    level={sensoryLoad}
                    deafMode={deafMode}
                    isStreaming={isGenerating}
                  />
                </motion.div>
              </AnimatePresence>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
