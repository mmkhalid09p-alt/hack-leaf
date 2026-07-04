"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers,
  RotateCcw,
  ArrowRight,
  CheckCircle2,
  RefreshCcw,
  HelpCircle,
} from "lucide-react";
import type { Palette } from "@/lib/colourBlindPalettes";

interface FlashCard {
  front: string;
  back: string;
  hint?: string;
}

interface FlashCardDeckProps {
  topic: string;
  loadLevel: number;
  hyperfocusInterest?: string;
  learningDifference?: string;
  sandMode: boolean;
  deafMode: boolean;
  palette: Palette | null;
}

export function FlashCardDeck({
  topic,
  loadLevel,
  hyperfocusInterest,
  learningDifference,
  sandMode,
  deafMode,
  palette,
}: FlashCardDeckProps) {
  const [cards, setCards] = useState<FlashCard[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [marks, setMarks] = useState<Record<number, "got-it" | "still-learning">>({});

  useEffect(() => {
    let cancelled = false;

    async function fetchCards() {
      setLoading(true);
      setError(null);
      setCards(null);
      setIndex(0);
      setFlipped(false);
      setMarks({});

      try {
        const res = await fetch("/api/flashcards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic,
            loadLevel,
            hyperfocusInterest,
            learningDifference,
            sandMode,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to load flash cards.");
        if (!cancelled) setCards(data.cards);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load flash cards.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchCards();
    return () => {
      cancelled = true;
    };
  }, [topic, loadLevel, hyperfocusInterest, learningDifference, sandMode]);

  const accent = sandMode ? "#C2B280" : palette?.accent ?? "#7c3aed";
  const cardBg = sandMode ? "#FDF8EE" : palette?.card ?? "#130d2a";
  const border = sandMode ? "#D9CCAA" : palette?.border ?? "rgba(255,255,255,0.1)";
  const textColour = sandMode ? "#4A3F2F" : palette?.text ?? "#f1f5f9";
  const mutedColour = sandMode ? "#8C7B5E" : palette?.textMuted ?? "#94a3b8";

  if (!cards && !loading && !error) return null;

  const current = cards?.[index];
  const isDeckComplete = Boolean(cards) && index >= (cards?.length ?? 0);
  const gotItCount = Object.values(marks).filter((m) => m === "got-it").length;

  const mark = (value: "got-it" | "still-learning") => {
    setMarks((prev) => ({ ...prev, [index]: value }));
    setFlipped(false);
    setIndex((i) => i + 1);
  };

  return (
    <section
      className="rounded-2xl border p-6 shadow-xl space-y-4"
      style={{ backgroundColor: cardBg, borderColor: border, color: textColour }}
    >
      <div className="flex items-center gap-2 border-b pb-3" style={{ borderColor: border }}>
        <Layers className="w-5 h-5" style={{ color: accent }} />
        <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: mutedColour }}>
          Flash Cards
        </h3>
      </div>

      {loading && (
        <div className="animate-pulse h-40 rounded-xl" style={{ backgroundColor: `${mutedColour}22` }} />
      )}

      {error && !loading && (
        <p className="text-sm" style={{ color: "#ef4444" }}>
          {error.includes("GOOGLE_GENERATIVE_AI_API_KEY")
            ? "Add your AI Studio key to .env.local, then restart the dev server."
            : error}
        </p>
      )}

      {!loading && !error && cards && (
        <AnimatePresence mode="wait">
          {isDeckComplete ? (
            <motion.div
              key="deck-done"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-6 space-y-4"
            >
              <CheckCircle2 className="w-10 h-10 mx-auto" style={{ color: accent }} />
              <h4 className="text-xl font-bold">Deck Complete!</h4>
              <p className="text-sm" style={{ color: mutedColour }}>
                {gotItCount} of {cards.length} marked &ldquo;Got it&rdquo;
              </p>
              <button
                onClick={() => {
                  setIndex(0);
                  setMarks({});
                  setFlipped(false);
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm transition-colors"
                style={{ backgroundColor: accent, color: sandMode ? "#4A3F2F" : "#0a0614" }}
              >
                <RefreshCcw className="w-4 h-4" /> Restart Deck
              </button>
            </motion.div>
          ) : current ? (
            <motion.div key={index} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <p className="text-xs" style={{ color: mutedColour }}>
                Card {index + 1} of {cards.length}
              </p>

              <div
                className="relative w-full min-h-[160px] cursor-pointer select-none"
                style={{ perspective: 1000 }}
                onClick={() => setFlipped((f) => !f)}
                role="button"
                tabIndex={0}
                aria-label={flipped ? "Showing answer, tap to flip back" : "Showing question, tap to flip"}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") setFlipped((f) => !f);
                }}
              >
                <motion.div
                  animate={{ rotateY: flipped ? 180 : 0 }}
                  transition={{ duration: deafMode ? 0.15 : 0.45 }}
                  style={{ transformStyle: "preserve-3d" }}
                  className="relative w-full min-h-[160px]"
                >
                  {/* Front */}
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 rounded-xl border text-center"
                    style={{ backfaceVisibility: "hidden", borderColor: border, backgroundColor: `${mutedColour}0d` }}
                  >
                    <span
                      className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide"
                      style={{ color: accent }}
                    >
                      <HelpCircle className="w-3.5 h-3.5" /> Question
                    </span>
                    <p className="text-lg font-semibold">{current.front}</p>
                    {current.hint && (
                      <p className="text-xs italic" style={{ color: mutedColour }}>
                        Hint: {current.hint}
                      </p>
                    )}
                  </div>

                  {/* Back */}
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 rounded-xl border text-center"
                    style={{
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                      borderColor: accent,
                      backgroundColor: `${accent}12`,
                    }}
                  >
                    <span
                      className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide"
                      style={{ color: accent }}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Answer
                    </span>
                    <p className="text-base leading-relaxed">{current.back}</p>
                  </div>
                </motion.div>
              </div>

              <p className="text-center text-xs" style={{ color: mutedColour }}>
                Tap the card to flip
              </p>

              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => mark("still-learning")}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-colors"
                  style={{ borderColor: border, color: textColour }}
                >
                  <RotateCcw className="w-4 h-4" /> Still learning
                </button>
                <button
                  onClick={() => mark("got-it")}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                  style={{ backgroundColor: accent, color: sandMode ? "#4A3F2F" : "#0a0614" }}
                >
                  Got it <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      )}
    </section>
  );
}
