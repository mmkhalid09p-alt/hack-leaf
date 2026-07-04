"use client";

import { motion } from "framer-motion";
import { BreathingCircle } from "@/components/ui/BreathingCircle";
import { GroundingExercise } from "@/components/ui/GroundingExercise";
import { Smile } from "lucide-react";
import { useEffect, useState } from "react";

const AFFIRMATIONS = [
  "Take a deep breath. You are safe, and you are in control.",
  "You do not have to process everything right now. Just focus on this moment.",
  "Your mind is allowed to rest. Take all the time you need.",
  "In this space, there are no expectations, no pressure, and no rush.",
  "Slowly, gently, let the tension lift. You are doing perfectly fine."
];

interface CalmScreenProps {
  deafMode: boolean;
  onExit: () => void;
}

export function CalmScreen({ deafMode, onExit }: CalmScreenProps) {
  const [affirmation, setAffirmation] = useState("");

  // Select a random affirmation on load
  useEffect(() => {
    const idx = Math.floor(Math.random() * AFFIRMATIONS.length);
    setAffirmation(AFFIRMATIONS[idx]);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="fixed inset-0 z-[999] flex flex-col justify-between p-6 bg-[#fafaf9] text-[#1c1917] overflow-y-auto selection:bg-stone-200"
    >
      {/* Soft Top Header */}
      <header className="flex justify-between items-center max-w-4xl mx-auto w-full border-b border-stone-200/60 pb-4">
        <h1 className="text-xl font-bold tracking-tight text-stone-800 flex items-center gap-2">
          <span>🧠</span> NeuroLearn Calm Mode
        </h1>
        {deafMode && (
          <span className="text-xs font-semibold px-2.5 py-1 bg-stone-200 text-stone-700 rounded-full">
            🔇 Silent Mode Active
          </span>
        )}
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto w-full flex flex-col md:flex-row items-center justify-center gap-12 my-8">
        
        {/* Breathing Circle Section */}
        <section className="flex flex-col items-center justify-center space-y-4 p-4">
          <h2 className="text-xs font-bold tracking-wider text-stone-500 uppercase">
            Breathing Pace Guide
          </h2>
          {/* Custom Breathing Circle with dark/cream adjustments */}
          <div className="bg-stone-100 p-8 rounded-2xl border border-stone-200/50 shadow-sm">
            <BreathingCircle deafMode={deafMode} size={180} />
          </div>
        </section>

        {/* Grounding Exercise Section */}
        <section className="flex flex-col items-center space-y-4 p-4 w-full max-w-md">
          <h2 className="text-xs font-bold tracking-wider text-stone-500 uppercase">
            Interactive Grounding (5-4-3-2-1)
          </h2>
          <GroundingExercise deafMode={deafMode} />
        </section>

      </main>

      {/* Bottom Affirmation & Exit CTA */}
      <footer className="max-w-4xl mx-auto w-full flex flex-col items-center gap-6 border-t border-stone-200/60 pt-6">
        
        {/* Affirmation Text */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-center text-stone-600 italic text-base max-w-lg leading-relaxed font-medium"
        >
          &ldquo;{affirmation}&rdquo;
        </motion.p>

        {/* Exit Button */}
        <button
          id="exit-calm-btn"
          onClick={onExit}
          className="group relative inline-flex items-center gap-2 px-8 py-4 bg-stone-900 text-stone-50 hover:bg-stone-800 transition-colors duration-200 font-bold rounded-xl shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-500 text-base"
        >
          <Smile className="w-5 h-5 text-stone-300 group-hover:scale-110 transition-transform" />
          I&apos;m ready to try again
        </button>

        <p className="text-xs text-stone-400 mt-1">
          Pressing this resets your sensory load levels to Calm (Level 3).
        </p>
      </footer>
    </motion.div>
  );
}
