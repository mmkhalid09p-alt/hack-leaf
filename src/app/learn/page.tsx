"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccessibility } from "@/context/AccessibilityContext";
import { Navbar } from "@/components/ui/navbar";
import SensorySlider from "@/components/learn/SensorySlider";
import ContentRenderer from "@/components/learn/ContentRenderer";
import CalmOverlay from "@/components/learn/CalmOverlay";
import { Volume2, VolumeX, Eye, Sparkles, BookOpen, Settings } from "lucide-react";

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

  // Local state for learning settings
  const [topicInput, setTopicInput] = useState("");
  const [activeTopic, setActiveTopic] = useState("");
  const [learningDifference, setLearningDifference] = useState("none");
  const [hyperfocusInterest, setHyperfocusInterest] = useState("");

  // Content streaming state
  const [streamedText, setStreamedText] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [debouncedLevel, setDebouncedLevel] = useState(sensoryLoad);

  // Show accessibility menu popover
  const [showSettings, setShowSettings] = useState(false);

  // Debounce sensory load level changes to prevent spamming Gemini API
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedLevel(sensoryLoad);
    }, 450);
    return () => clearTimeout(handler);
  }, [sensoryLoad]);

  // Stream content from Gemini when input state triggers a request
  useEffect(() => {
    if (!activeTopic || debouncedLevel === 10) return;

    let isMounted = true;
    async function fetchStream() {
      setStreaming(true);
      setStreamedText("");
      try {
        const res = await fetch("/api/learn", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic: activeTopic,
            loadLevel: debouncedLevel,
            learningDifference,
            hyperfocusInterest,
            sandMode,
          }),
        });

        if (!res.ok) {
          throw new Error("Failed to generate content");
        }

        if (res.body) {
          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let done = false;
          let result = "";

          while (!done) {
            const { value, done: readerDone } = await reader.read();
            done = readerDone;
            if (value) {
              const chunk = decoder.decode(value);
              const lines = chunk.split("\n");
              for (const line of lines) {
                if (line.startsWith("0:")) {
                  try {
                    const textVal = JSON.parse(line.substring(2));
                    result += textVal;
                    if (isMounted) setStreamedText(result);
                  } catch (e) {
                    result += line.substring(2).replace(/"/g, "");
                    if (isMounted) setStreamedText(result);
                  }
                }
              }
            }
          }
        }
      } catch (err) {
        console.error("Streaming error:", err);
        if (isMounted) {
          setStreamedText("An error occurred while generating learning content. Please check your API key or connection.");
        }
      } finally {
        if (isMounted) setStreaming(false);
      }
    }

    fetchStream();
    return () => {
      isMounted = false;
    };
  }, [debouncedLevel, activeTopic, sandMode, learningDifference, hyperfocusInterest]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topicInput.trim()) {
      setActiveTopic(topicInput.trim());
    }
  };

  return (
    <>
      {/* Calm Overlay Takeover for Level 10 (Crisis/Overwhelmed) */}
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
          {/* Header & Accessibility Popover controls */}
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

                  {/* Sand Mode */}
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm font-medium">Sand Mode (Calm UI)</span>
                    <input
                      type="checkbox"
                      checked={sandMode}
                      onChange={(e) => setSandMode(e.target.checked)}
                      className="rounded"
                    />
                  </label>

                  {/* Deaf Mode */}
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm font-medium">Deaf / HoH Mode</span>
                    <input
                      type="checkbox"
                      checked={deafMode}
                      onChange={(e) => setDeafMode(e.target.checked)}
                      className="rounded"
                    />
                  </label>

                  {/* Colour Blind Mode selection */}
                  <div className="space-y-1.5">
                    <span className="text-sm font-medium block">Colour Blind Mode</span>
                    <select
                      value={colourBlindMode}
                      onChange={(e: any) => setColourBlindMode(e.target.value)}
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

          {/* Sensory Load Slider Panel */}
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

          {/* Main setup settings form */}
          <section
            className={`p-6 border transition-all duration-300 ${
              sandMode
                ? "bg-[#FDF8EE] border-[#D9CCAA] rounded-3xl shadow-sm"
                : "bg-[#130d2a] border-white/10 rounded-2xl shadow-xl"
            }`}
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Topic Input */}
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
                    className={`w-full p-3 rounded-xl border text-sm transition-all focus:ring-2 focus:ring-offset-2 ${
                      sandMode
                        ? "bg-[#F5EFE0] border-[#D9CCAA] text-[#4A3F2F] placeholder-[#8C7B5E]/50 focus:ring-[#C2B280]"
                        : "bg-[#0a0614] border-white/10 text-white placeholder-slate-500 focus:ring-violet-500"
                    }`}
                  />
                </div>

                {/* Hyperfocus Interest */}
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
                    className={`w-full p-3 rounded-xl border text-sm transition-all focus:ring-2 focus:ring-offset-2 ${
                      sandMode
                        ? "bg-[#F5EFE0] border-[#D9CCAA] text-[#4A3F2F] placeholder-[#8C7B5E]/50 focus:ring-[#C2B280]"
                        : "bg-[#0a0614] border-white/10 text-white placeholder-slate-500 focus:ring-violet-500"
                    }`}
                  />
                </div>
              </div>

              {/* Learning Difference selection */}
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
                disabled={!topicInput.trim() || streaming}
                className={`w-full py-3 rounded-xl font-bold transition-all shadow-md active:scale-98 disabled:opacity-50 cursor-pointer text-sm ${
                  sandMode
                    ? "bg-[#C2B280] text-[#4A3F2F] hover:bg-[#A0926A]"
                    : "bg-violet-600 text-white hover:bg-violet-700"
                }`}
              >
                {streaming ? "Generative AI Tailoring Content..." : "Start Adaptive Learning Session"}
              </button>
            </form>
          </section>

          {/* Main output content renderer card */}
          {activeTopic && (
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
                  Topic: {activeTopic}
                </h3>
                {streaming && (
                  <span className="text-xs italic text-violet-400 animate-pulse">
                    Streaming content...
                  </span>
                )}
              </div>

              <ContentRenderer
                text={streamedText}
                level={sensoryLoad}
                sandMode={sandMode}
              />
            </section>
          )}
        </div>
      </main>
    </>
  );
}
