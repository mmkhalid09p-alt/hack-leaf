"use client";

import React from "react";
import { loadBand } from "@/lib/sensoryLoad";

export const LOAD_EMOJI = {
  low: "😊",
  mid: "😐",
  high: "😰",
  max: "🌊",
} as const;

export const LOAD_LABEL = {
  low: "Clear / Calm",
  mid: "Busy / Tiring",
  high: "Heavy / Overloaded",
  max: "Crisis / Overwhelmed",
} as const;

export const LOAD_COLOR = {
  low: "#8B5CF6", // Purple
  mid: "#3B82F6", // Blue
  high: "#F59E0B", // Amber
  max: "#EF4444", // Red
} as const;

// Shape + number indicator so the load level is never conveyed by colour alone
// (Feature 4: Colour Blind Mode requires shape + number, never colour-only).
const LEVEL_SHAPES: Record<number, string> = {
  1: "●",
  2: "●",
  3: "▲",
  4: "◆",
  5: "◆",
  6: "■",
  7: "⬟",
  8: "⬟",
  9: "⬢",
  10: "✦",
};

interface SensorySliderProps {
  level: number;
  onChange: (val: number) => void;
  sandMode: boolean;
}

export default function SensorySlider({ level, onChange, sandMode }: SensorySliderProps) {
  const band = loadBand(level);
  const emoji = LOAD_EMOJI[band];
  const label = LOAD_LABEL[band];
  const color = sandMode ? "#C2B280" : LOAD_COLOR[band];
  const shape = LEVEL_SHAPES[level] ?? "●";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-sm font-semibold uppercase tracking-widest ${sandMode ? "text-[#8C7B5E]" : "text-slate-400"}`}>
            How&apos;s your brain feeling right now?
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <span
              className="text-2xl font-bold leading-none"
              style={{ color }}
              aria-hidden="true"
              title={`Shape indicator for level ${level}`}
            >
              {shape}
            </span>
            <span className="text-2xl" role="img" aria-label="emoji description">{emoji}</span>
            <span
              className="text-lg font-bold transition-colors duration-300"
              style={{ color }}
            >
              {level}/10 — {label}
            </span>
          </div>
        </div>
      </div>

      <input
        type="range"
        min={1}
        max={10}
        step={1}
        value={level}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full cursor-pointer appearance-none transition-all duration-300"
        style={{
          background: `linear-gradient(to right, ${color} 0%, ${color} ${(level - 1) * 11.1}%, ${sandMode ? "#D9CCAA" : "#1e1b4b"} ${(level - 1) * 11.1}%, ${sandMode ? "#D9CCAA" : "#1e1b4b"} 100%)`,
          accentColor: color,
        }}
        aria-label="Sensory load level 1 to 10"
      />
      <div className={`flex justify-between text-xs mt-1 ${sandMode ? "text-[#8C7B5E]" : "text-slate-500"}`}>
        <span>1 — Clear</span>
        <span>10 — Crisis</span>
      </div>
    </div>
  );
}
