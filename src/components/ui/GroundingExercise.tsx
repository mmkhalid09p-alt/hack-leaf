"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, ShieldAlert, Sparkles, Activity, Smile, ArrowRight, RotateCcw } from "lucide-react";

interface GroundingExerciseProps {
  deafMode: boolean;
}

export function GroundingExercise({ deafMode }: GroundingExerciseProps) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "5. SEE",
      instructions: "Look around you. Find 5 distinct things you can see in the room right now.",
      example: "e.g., A blue pen, a spot on the wall, a window, a chair, or your shoes.",
      icon: <Eye className="w-6 h-6 text-stone-700" />,
    },
    {
      title: "4. TOUCH",
      instructions: "Touch 4 different things and notice their texture, warmth, or weight.",
      example: "e.g., The fabric of your clothes, the smooth table surface, cool metal, or soft hair.",
      icon: <Activity className="w-6 h-6 text-stone-700" />,
    },
    {
      title: "3. HEAR / FEEL",
      instructions: deafMode
        ? "Pay attention to 3 things you can feel vibrating or perceive visually around you."
        : "Listen closely. Focus on 3 sounds you can hear in your environment.",
      example: deafMode
        ? "e.g., The vibration of a refrigerator, light flickering, or shadows moving."
        : "e.g., Wind outside, a ticking clock, humming computers, or distant traffic.",
      icon: <ShieldAlert className="w-6 h-6 text-stone-700" />,
    },
    {
      title: "2. SMELL",
      instructions: "Identify 2 scents or air properties you can notice right now.",
      example: "e.g., Coffee, clean laundry, soap, wood, or just the crispness of the air.",
      icon: <Sparkles className="w-6 h-6 text-stone-700" />,
    },
    {
      title: "1. TASTE",
      instructions: "Focus on 1 taste in your mouth, or note the neutral state of your tongue.",
      example: "e.g., Traces of toothpaste, water you just drank, or just focusing on swallowing.",
      icon: <Smile className="w-6 h-6 text-stone-700" />,
    },
  ];

  const current = steps[step];

  return (
    <div className="w-full max-w-md mx-auto p-6 rounded-2xl bg-stone-100 border border-stone-200/80 shadow-md flex flex-col justify-between min-h-[300px]">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-4 flex-grow"
        >
          <div className="flex items-center gap-3 border-b border-stone-200 pb-3">
            {current.icon}
            <h3 className="text-xl font-bold tracking-tight text-stone-800">{current.title}</h3>
          </div>
          
          <p className="text-base text-stone-700 leading-relaxed font-medium">
            {current.instructions}
          </p>

          <p className="text-xs italic text-stone-500 bg-stone-200/50 p-2.5 rounded-lg border border-stone-200/40">
            {current.example}
          </p>
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between items-center mt-6 pt-4 border-t border-stone-200">
        <div className="flex gap-1.5">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: idx === step ? "24px" : "8px",
                backgroundColor: idx === step ? "#1c1917" : "#d6d3d1",
              }}
            />
          ))}
        </div>

        {step < steps.length - 1 ? (
          <button
            onClick={() => setStep(s => s + 1)}
            className="flex items-center gap-2 px-4 py-2 bg-stone-800 text-white rounded-lg text-sm font-semibold hover:bg-stone-700 transition-colors"
          >
            Next <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => setStep(0)}
            className="flex items-center gap-2 px-4 py-2 border border-stone-800 text-stone-800 rounded-lg text-sm font-semibold hover:bg-stone-200 transition-colors"
          >
            Restart <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
