"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, RefreshCw, Flame } from "lucide-react";
import type { Palette } from "@/lib/colourBlindPalettes";

interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
}

interface QuizPanelProps {
  topic: string;
  loadLevel: number;
  hyperfocusInterest?: string;
  learningDifference?: string;
  sandMode: boolean;
  palette: Palette | null;
}

export function QuizPanel({
  topic,
  loadLevel,
  hyperfocusInterest,
  learningDifference,
  sandMode,
  palette,
}: QuizPanelProps) {
  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function fetchQuiz() {
      setLoading(true);
      setError(null);
      setQuestions(null);
      setCurrentIdx(0);
      setSelectedIdx(null);
      setIsAnswered(false);
      setScore(0);
      setStreak(0);

      try {
        const res = await fetch("/api/quiz", {
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
        if (!res.ok) throw new Error(data?.error || "Failed to load quiz.");
        if (!cancelled) setQuestions(data.questions);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load quiz.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchQuiz();
    return () => {
      cancelled = true;
    };
  }, [topic, loadLevel, hyperfocusInterest, learningDifference, sandMode]);

  const accent = sandMode ? "#C2B280" : palette?.accent ?? "#7c3aed";
  const correctColour = sandMode ? "#8C9A6B" : palette?.accent ?? "#10b981";
  const wrongColour = sandMode ? "#B08968" : palette?.accent2 ?? "#ef4444";
  const cardBg = sandMode ? "#FDF8EE" : palette?.card ?? "#130d2a";
  const border = sandMode ? "#D9CCAA" : palette?.border ?? "rgba(255,255,255,0.1)";
  const textColour = sandMode ? "#4A3F2F" : palette?.text ?? "#f1f5f9";
  const mutedColour = sandMode ? "#8C7B5E" : palette?.textMuted ?? "#94a3b8";

  const activeQuestion = questions?.[currentIdx];
  const isCompleted = Boolean(questions) && currentIdx >= (questions?.length ?? 0);

  const handleSelectOption = (idx: number) => {
    if (isAnswered || !activeQuestion) return;
    setSelectedIdx(idx);
    setIsAnswered(true);
    if (activeQuestion.options[idx] === activeQuestion.answer) {
      setScore((s) => s + 1);
      setStreak((s) => s + 1);
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    setSelectedIdx(null);
    setIsAnswered(false);
    setCurrentIdx((prev) => prev + 1);
  };

  return (
    <section
      className="rounded-2xl border p-6 shadow-xl space-y-4"
      style={{ backgroundColor: cardBg, borderColor: border, color: textColour }}
    >
      <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: border }}>
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5" style={{ color: accent }} />
          <h3
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: mutedColour }}
          >
            Quiz Mode — Shape-Coded Feedback
          </h3>
        </div>
        {streak > 1 && (
          <span
            className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full"
            style={{ backgroundColor: `${accent}22`, color: accent }}
          >
            <Flame className="w-3.5 h-3.5" /> Streak {streak}
          </span>
        )}
      </div>

      {loading && (
        <div className="animate-pulse space-y-3">
          <div className="h-4 rounded w-3/4" style={{ backgroundColor: `${mutedColour}33` }} />
          <div className="h-10 rounded" style={{ backgroundColor: `${mutedColour}22` }} />
          <div className="h-10 rounded" style={{ backgroundColor: `${mutedColour}22` }} />
        </div>
      )}

      {error && !loading && (
        <p className="text-sm" style={{ color: wrongColour }}>
          {error.includes("GOOGLE_GENERATIVE_AI_API_KEY")
            ? "Add your AI Studio key to .env.local, then restart the dev server."
            : error}
        </p>
      )}

      {!loading && !error && (
        <AnimatePresence mode="wait">
          {isCompleted ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center py-6 space-y-4"
            >
              <span className="text-4xl" style={{ color: accent }}>★</span>
              <h4 className="text-xl font-bold">Quiz Complete!</h4>
              <p className="text-sm" style={{ color: mutedColour }}>
                Your final score: {score} out of {questions?.length ?? 0}
              </p>
              <button
                onClick={() => {
                  setCurrentIdx(0);
                  setSelectedIdx(null);
                  setIsAnswered(false);
                  setScore(0);
                  setStreak(0);
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm transition-colors"
                style={{ backgroundColor: accent, color: sandMode ? "#4A3F2F" : "#0a0614" }}
              >
                <RefreshCw className="w-4 h-4" /> Restart Quiz
              </button>
            </motion.div>
          ) : activeQuestion ? (
            <motion.div
              key={currentIdx}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              className="space-y-4"
            >
              <h4 className="text-lg font-bold">
                Q{currentIdx + 1}. {activeQuestion.question}
              </h4>

              <div className="grid grid-cols-1 gap-3">
                {activeQuestion.options.map((opt, idx) => {
                  const isSelected = selectedIdx === idx;
                  const isCorrect = opt === activeQuestion.answer;

                  let btnStyle: CSSProperties = { borderColor: border };
                  if (isAnswered) {
                    if (isCorrect) {
                      btnStyle = { borderColor: correctColour, borderWidth: 2 };
                    } else if (isSelected) {
                      btnStyle = { borderColor: wrongColour, borderWidth: 2 };
                    }
                  }

                  return (
                    <button
                      key={idx}
                      disabled={isAnswered}
                      onClick={() => handleSelectOption(idx)}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-lg border text-left font-medium transition-all cursor-pointer disabled:cursor-default"
                      style={{ ...btnStyle, color: textColour }}
                    >
                      <span>{opt}</span>
                      {isAnswered && (
                        <span
                          className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wide"
                          style={{ color: isCorrect ? correctColour : isSelected ? wrongColour : "transparent" }}
                        >
                          {isCorrect ? "▲ Correct" : isSelected ? "■ Wrong" : ""}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {isAnswered && selectedIdx !== null && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="rounded-lg p-3.5 text-sm flex items-start gap-3"
                  style={{ backgroundColor: `${mutedColour}15`, border: `1px solid ${border}` }}
                >
                  <span
                    className="text-2xl font-black"
                    style={{
                      color:
                        activeQuestion.options[selectedIdx] === activeQuestion.answer
                          ? correctColour
                          : wrongColour,
                    }}
                  >
                    {activeQuestion.options[selectedIdx] === activeQuestion.answer ? "▲" : "■"}
                  </span>
                  <div>
                    <p className="font-semibold">
                      {activeQuestion.options[selectedIdx] === activeQuestion.answer
                        ? "Correct Answer!"
                        : `Not quite — the answer was "${activeQuestion.answer}".`}
                    </p>
                  </div>
                </motion.div>
              )}

              <div className="flex justify-between items-center pt-2">
                <span className="text-xs" style={{ color: mutedColour }}>
                  Score: {score} / {isAnswered ? currentIdx + 1 : currentIdx} answered
                </span>
                {isAnswered && (
                  <button
                    onClick={handleNext}
                    className="px-4 py-2 rounded-lg font-bold text-sm transition-colors"
                    style={{ backgroundColor: accent, color: sandMode ? "#4A3F2F" : "#0a0614" }}
                  >
                    Next Question →
                  </button>
                )}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      )}
    </section>
  );
}
