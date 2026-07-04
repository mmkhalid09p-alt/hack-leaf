"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BreathingCircle } from "@/components/ui/BreathingCircle";
import { GroundingExercise } from "@/components/ui/GroundingExercise";

interface CalmOverlayProps {
  deafMode: boolean;
  sandMode: boolean;
  onExit: () => void;
}

export default function CalmOverlay({ deafMode, sandMode, onExit }: CalmOverlayProps) {
  const [affirmation, setAffirmation] = useState("Take a deep breath.");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchAffirmation() {
      try {
        setLoading(true);
        const res = await fetch("/api/learn", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic: "calm reassurance",
            loadLevel: 10,
            sandMode,
          }),
        });

        if (res.ok && res.body) {
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
                if (line.startsWith('0:')) {
                  try {
                    const textVal = JSON.parse(line.substring(2));
                    result += textVal;
                    if (isMounted) setAffirmation(result);
                  } catch {
                    // fall back to appending raw string if JSON parse fails
                    result += line.substring(2).replace(/"/g, '');
                    if (isMounted) setAffirmation(result);
                  }
                }
              }
            }
          }
        }
      } catch (err) {
        console.error("Failed to load affirmation:", err);
        if (isMounted) setAffirmation("Breathe. You are safe here.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchAffirmation();
    return () => {
      isMounted = false;
    };
  }, [sandMode]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-6 text-center select-none overflow-y-auto ${
        sandMode ? "bg-[#F5EFE0]" : "bg-black"
      }`}
    >
      <div className="max-w-md w-full space-y-10 py-8">
        {/* Affirmation from Gemini */}
        <div className="space-y-2">
          <p className={`text-xs uppercase tracking-widest ${sandMode ? "text-[#8C7B5E]" : "text-stone-500"}`}>
            Affirmation
          </p>
          <h2
            className={`text-xl md:text-2xl font-light italic leading-relaxed px-4 ${
              sandMode ? "text-[#4A3F2F]" : "text-stone-300"
            }`}
          >
            &ldquo;{loading && affirmation === "Take a deep breath." ? "Finding a calming thought..." : affirmation}&rdquo;
          </h2>
        </div>

        {/* Breathing guide */}
        <div className="flex flex-col items-center justify-center">
          <BreathingCircle deafMode={deafMode} size={200} />
        </div>

        {/* Grounding 5-4-3-2-1 */}
        <div className="w-full">
          <GroundingExercise deafMode={deafMode} />
        </div>

        {/* Exit Button */}
        <div>
          <button
            onClick={onExit}
            className={`px-8 py-3.5 rounded-2xl font-bold transition-all shadow-md active:scale-95 cursor-pointer ${
              sandMode
                ? "bg-[#C2B280] text-[#4A3F2F] hover:bg-[#A0926A]"
                : "bg-stone-800 text-stone-200 hover:bg-stone-700 hover:text-white"
            }`}
          >
            Come back when you&apos;re ready
          </button>
        </div>
      </div>
    </motion.div>
  );
}
