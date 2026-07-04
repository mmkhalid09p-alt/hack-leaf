"use client";

import { motion, AnimatePresence } from "framer-motion";
import { forwardRef, useImperativeHandle, useState } from "react";

export interface VisualCueFlashHandle {
  /** Trigger a flash. Pass an optional label to show (e.g. "New message") */
  flash: (label?: string) => void;
}

interface VisualCueFlashProps {
  /** Colour of the flash border */
  colour?: string;
}

export const VisualCueFlash = forwardRef<VisualCueFlashHandle, VisualCueFlashProps>(
  function VisualCueFlash({ colour = "#7c3aed" }, ref) {
    const [visible, setVisible] = useState(false);
    const [label, setLabel] = useState<string | undefined>(undefined);

    useImperativeHandle(ref, () => ({
      flash(msg?: string) {
        setLabel(msg);
        setVisible(true);
        setTimeout(() => setVisible(false), 1200);
      },
    }));

    return (
      <AnimatePresence>
        {visible && (
          <>
            {/* Viewport border flash */}
            <motion.div
              key="flash-border"
              className="fixed inset-0 pointer-events-none z-50 rounded-none"
              style={{ border: `4px solid ${colour}` }}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0.6, 1, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.1, ease: "easeInOut" }}
            />

            {/* Icon + label pill */}
            <motion.div
              key="flash-pill"
              className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-full shadow-2xl border"
              style={{
                background: "rgba(15,10,30,0.92)",
                borderColor: colour,
                color: colour,
              }}
              initial={{ opacity: 0, y: -20, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
            >
              {/* Animated bell-with-slash icon */}
              <motion.span
                className="text-xl"
                animate={{ rotate: [0, -12, 12, -8, 8, 0] }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                aria-hidden="true"
              >
                🔔
              </motion.span>
              <span className="text-sm font-semibold tracking-wide">
                {label ?? "Audio cue (visual)"}
              </span>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }
);
