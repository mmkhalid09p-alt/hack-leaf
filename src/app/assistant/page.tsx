"use client";

import { motion } from "framer-motion";

import { GeminiChat } from "@/components/GeminiChat";
import { Navbar } from "@/components/ui/navbar";

export default function AssistantPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navbar />

      <main className="container mx-auto max-w-3xl px-4 py-10 md:py-14">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8 text-center"
        >
          <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">
            AI Learning Assistant
          </h1>
          <p className="mt-3 text-gray-600">
            Powered by Gemini. Educational support only — not a substitute for professional diagnosis or care.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <GeminiChat />
        </motion.div>
      </main>
    </div>
  );
}
