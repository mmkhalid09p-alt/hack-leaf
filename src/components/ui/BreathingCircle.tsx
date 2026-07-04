"use client";

import { motion } from "framer-motion";
import { useRef, useEffect } from "react";

interface BreathingCircleProps {
  deafMode: boolean;
  /** Duration of one inhale in seconds */
  inhaleDuration?: number;
  /** Duration of one exhale in seconds */
  exhaleDuration?: number;
  /** Optional audio file URL for non-deaf mode */
  audioSrc?: string;
  size?: number;
}

export function BreathingCircle({
  deafMode,
  inhaleDuration = 4,
  exhaleDuration = 6,
  audioSrc,
  size = 200,
}: BreathingCircleProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const totalCycle = inhaleDuration + exhaleDuration;

  useEffect(() => {
    if (deafMode) {
      // Stop any playing audio immediately
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    } else if (audioSrc && audioRef.current) {
      audioRef.current.play().catch(() => {/* autoplay blocked – fine */});
    }
  }, [deafMode, audioSrc]);

  return (
    <div
      className="flex flex-col items-center gap-6 select-none"
      aria-label="Breathing exercise — visual guide"
      role="img"
    >
      {/* Visual breathing ring */}
      <div
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        {/* Outer glow ring */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: size,
            height: size,
            background: "radial-gradient(circle, rgba(167,139,250,0.25) 0%, transparent 70%)",
          }}
          animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0.9, 0.4] }}
          transition={{
            duration: totalCycle,
            repeat: Infinity,
            ease: "easeInOut",
            times: [0, inhaleDuration / totalCycle, 1],
          }}
        />

        {/* Main circle */}
        <motion.div
          className="rounded-full border-4"
          style={{
            width: size * 0.55,
            height: size * 0.55,
            borderColor: "#7c3aed",
            background: "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 80%)",
          }}
          animate={{
            scale: [1, 1.55, 1],
            borderColor: ["#7c3aed", "#a78bfa", "#7c3aed"],
          }}
          transition={{
            duration: totalCycle,
            repeat: Infinity,
            ease: "easeInOut",
            times: [0, inhaleDuration / totalCycle, 1],
          }}
        />

        {/* Centre label */}
        <motion.span
          className="absolute text-sm font-semibold text-violet-300 pointer-events-none"
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{
            duration: totalCycle,
            repeat: Infinity,
            ease: "easeInOut",
            times: [0, inhaleDuration / totalCycle, 1],
          }}
        >
          breathe
        </motion.span>
      </div>

      {/* Inhale / Exhale label */}
      <motion.p
        className="text-violet-300 text-base font-medium tracking-widest uppercase"
        animate={{ opacity: [1, 0.5, 1] }}
        transition={{
          duration: totalCycle,
          repeat: Infinity,
          ease: "easeInOut",
          times: [0, inhaleDuration / totalCycle, 1],
        }}
      >
        <motion.span
          animate={{ opacity: [1, 0, 1] }}
          transition={{
            duration: totalCycle,
            repeat: Infinity,
            times: [0, inhaleDuration / totalCycle - 0.01, inhaleDuration / totalCycle],
          }}
        >
          inhale
        </motion.span>
        <motion.span
          className="absolute"
          animate={{ opacity: [0, 1, 0] }}
          transition={{
            duration: totalCycle,
            repeat: Infinity,
            times: [0, inhaleDuration / totalCycle, 1 - 0.01],
          }}
        >
          exhale
        </motion.span>
      </motion.p>

      {/* Deaf mode badge */}
      {deafMode && (
        <span className="flex items-center gap-1.5 text-xs text-violet-400 bg-violet-950 px-3 py-1 rounded-full border border-violet-800">
          🔇 Visual only — no audio
        </span>
      )}

      {/* Audio element — never rendered in deaf mode */}
      {!deafMode && audioSrc && (
        <audio ref={audioRef} src={audioSrc} loop className="hidden" aria-hidden="true" />
      )}
    </div>
  );
}
