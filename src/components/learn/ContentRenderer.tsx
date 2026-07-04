"use client";

import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { loadBand } from "@/lib/sensoryLoad";
import { TTSHighlightRenderer } from "@/components/ui/TTSHighlightRenderer";

interface ContentRendererProps {
  text: string;
  /** Sensory load level 1–10 */
  level: number;
  deafMode: boolean;
  /** True while the text is still streaming in from the model */
  isStreaming?: boolean;
}

function toBullets(text: string): string[] {
  return text
    .split(/\n+/)
    .map((l) => l.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, "").trim())
    .filter(Boolean);
}

function toChunks(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Renders learning content in a layout that adapts to the reader's sensory
 * load, per PRODUCT_PLAN.md's "what changes per level" table:
 *   low  (1–3): rich prose with text-to-speech + word highlighting
 *   mid  (4–6): calm bulleted list
 *   high (7–9): one idea at a time (Stay Focused Mode) with per-line TTS
 *   max  (10):  nothing — the Learn page shows the Calm takeover instead
 */
export function ContentRenderer({
  text,
  level,
  deafMode,
  isStreaming = false,
}: ContentRendererProps) {
  const band = loadBand(level);
  const chunks = useMemo(() => toChunks(text), [text]);
  const [chunkIndex, setChunkIndex] = useState(0);

  // Restart focus-mode position whenever the text or band changes.
  useEffect(() => {
    setChunkIndex(0);
  }, [text, band]);

  if (band === "max") return null;

  if (!text.trim()) {
    return <p className="text-sm text-slate-500 italic">Nothing to show yet.</p>;
  }

  // ── low: rich prose + TTS ──
  if (band === "low") {
    return <TTSHighlightRenderer text={text} deafMode={deafMode} />;
  }

  // ── mid: bullet points ──
  if (band === "mid") {
    const bullets = toBullets(text);
    return (
      <ul className="space-y-3">
        {bullets.map((b, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: Math.min(i * 0.04, 0.4) }}
            className="flex gap-3 text-lg leading-relaxed text-slate-200"
          >
            <span className="mt-2.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-violet-400" />
            <span>{b}</span>
          </motion.li>
        ))}
      </ul>
    );
  }

  // ── high: one idea at a time (Stay Focused Mode) ──
  // While streaming, don't chunk yet — show what's arrived, large.
  if (isStreaming || chunks.length <= 1) {
    return (
      <p className="text-2xl leading-relaxed font-medium text-slate-100">
        {text}
      </p>
    );
  }

  const safeIndex = Math.min(chunkIndex, chunks.length - 1);
  const current = chunks[safeIndex];

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        <motion.p
          key={safeIndex}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="text-3xl leading-snug font-semibold text-slate-100 min-h-[6rem] flex items-center"
        >
          {current}
        </motion.p>
      </AnimatePresence>

      {/* Speak the current line only; auto-play unless deaf mode is on */}
      <TTSHighlightRenderer
        key={`tts-${safeIndex}`}
        text={current}
        deafMode={deafMode}
        autoPlay={!deafMode}
      />

      <div className="flex items-center justify-between">
        <button
          onClick={() => setChunkIndex((i) => Math.max(0, i - 1))}
          disabled={safeIndex === 0}
          className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </button>

        <div className="flex gap-1.5" aria-hidden>
          {chunks.map((_, i) => (
            <span
              key={i}
              className="h-1.5 rounded-full transition-all"
              style={{
                width: i === safeIndex ? 20 : 6,
                background: i === safeIndex ? "#a78bfa" : "#3f3a5c",
              }}
            />
          ))}
        </div>

        <button
          onClick={() =>
            setChunkIndex((i) => Math.min(chunks.length - 1, i + 1))
          }
          disabled={safeIndex === chunks.length - 1}
          className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-violet-300 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent"
        >
          Next <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <p className="text-center text-xs text-slate-500">
        {safeIndex + 1} of {chunks.length}
      </p>
    </div>
  );
}
