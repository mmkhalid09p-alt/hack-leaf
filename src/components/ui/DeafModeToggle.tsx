"use client";

import { motion } from "framer-motion";

interface DeafModeToggleProps {
  enabled: boolean;
  onToggle: (v: boolean) => void;
  id?: string;
}

export function DeafModeToggle({ enabled, onToggle, id = "deaf-mode-toggle" }: DeafModeToggleProps) {
  return (
    <div className="flex items-center gap-4">
      {/* Icon */}
      <span className="text-2xl select-none" aria-hidden="true">
        {enabled ? "🔇" : "🔊"}
      </span>

      {/* Track */}
      <button
        id={id}
        role="switch"
        aria-checked={enabled}
        aria-label="Toggle Deaf / Hard of Hearing Mode"
        onClick={() => onToggle(!enabled)}
        className="relative inline-flex items-center w-14 h-7 rounded-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 transition-colors duration-300"
        style={{
          backgroundColor: enabled ? "#7c3aed" : "#374151",
        }}
      >
        {/* Thumb */}
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-md"
          style={{
            x: enabled ? 28 : 0,
          }}
        />
        <span className="sr-only">{enabled ? "On" : "Off"}</span>
      </button>

      {/* State label */}
      <span
        className="text-sm font-semibold tracking-wide"
        style={{ color: enabled ? "#7c3aed" : "#9ca3af" }}
      >
        {enabled ? "ON" : "OFF"}
      </span>
    </div>
  );
}
