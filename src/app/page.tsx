"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings,
  X,
  Circle,
  Triangle,
  Square,
  Octagon,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Check,
  VolumeX,
} from "lucide-react";
import {
  useAccessibility,
  type ColourBlindMode,
} from "@/context/AccessibilityContext";
import { loadBand, type LoadBand } from "@/lib/sensoryLoad";
import { getPalette } from "@/lib/colourBlindPalettes";
import { BreathingCircle } from "@/components/ui/BreathingCircle";

// ─────────────────────────────────────────────────────────────────────────────
// Theme: everything morphs with the load band (Duolingo-bright → calm)
// ─────────────────────────────────────────────────────────────────────────────

interface Theme {
  bg: string;
  card: string;
  text: string;
  muted: string;
  accent: string;
  accentDark: string;
  accentText: string;
  border: string;
  track: string;
}

const BAND_THEMES: Record<LoadBand, Theme> = {
  low: {
    bg: "#FFFFFF",
    card: "#FFFFFF",
    text: "#3C3C3C",
    muted: "#777777",
    accent: "#58CC02",
    accentDark: "#46A302",
    accentText: "#FFFFFF",
    border: "#E5E5E5",
    track: "#E5E5E5",
  },
  mid: {
    bg: "#F7FBFF",
    card: "#FFFFFF",
    text: "#3C3C3C",
    muted: "#7A8A99",
    accent: "#1CB0F6",
    accentDark: "#1899D6",
    accentText: "#FFFFFF",
    border: "#DCE9F5",
    track: "#DCE9F5",
  },
  high: {
    bg: "#FAF9FF",
    card: "#FFFFFF",
    text: "#4B4B5E",
    muted: "#8E8AA8",
    accent: "#A78BFA",
    accentDark: "#8B6FE8",
    accentText: "#FFFFFF",
    border: "#E8E4F8",
    track: "#E8E4F8",
  },
  max: {
    bg: "#0B1220",
    card: "#111A2C",
    text: "#D8E0EE",
    muted: "#7C8AA5",
    accent: "#7C93B8",
    accentDark: "#5F7396",
    accentText: "#0B1220",
    border: "#22304A",
    track: "#22304A",
  },
};

const SAND_THEME: Theme = {
  bg: "#F5EFE0",
  card: "#FDF8EE",
  text: "#4A3F2F",
  muted: "#8C7B5E",
  accent: "#C2B280",
  accentDark: "#A0926A",
  accentText: "#4A3F2F",
  border: "#D9CCAA",
  track: "#E8DFC4",
};

function useTheme(band: LoadBand): Theme {
  const { sandMode, colourBlindMode } = useAccessibility();
  return useMemo(() => {
    if (sandMode) return SAND_THEME;
    const cb = getPalette(colourBlindMode);
    if (cb) {
      return {
        bg: cb.bg,
        card: cb.card,
        text: cb.text,
        muted: cb.textMuted,
        accent: cb.accent,
        accentDark: cb.accent,
        accentText: "#FFFFFF",
        border: cb.border,
        track: cb.border,
      };
    }
    return BAND_THEMES[band];
  }, [sandMode, colourBlindMode, band]);
}

// Shape-coded band indicators — never colour-only (colour blind safe)
const BAND_SHAPE: Record<LoadBand, React.ReactNode> = {
  low: <Circle className="h-4 w-4" aria-hidden />,
  mid: <Triangle className="h-4 w-4" aria-hidden />,
  high: <Square className="h-4 w-4" aria-hidden />,
  max: <Octagon className="h-4 w-4" aria-hidden />,
};

const BAND_LABEL: Record<LoadBand, string> = {
  low: "Feeling clear",
  mid: "A bit busy",
  high: "Overloaded",
  max: "Too much right now",
};

const SUGGESTIONS = [
  "Photosynthesis",
  "Fractions",
  "The water cycle",
  "World War Two",
  "Food chains",
  "Romeo and Juliet",
];

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function Home() {
  const {
    deafMode,
    sandMode,
    sensoryLoad,
    setSensoryLoad,
  } = useAccessibility();

  const band = loadBand(sensoryLoad);
  const theme = useTheme(band);
  const calm = band === "max";

  const [topicInput, setTopicInput] = useState("");
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [doneFlash, setDoneFlash] = useState(false);

  const abortRef = useRef<AbortController | null>(null);

  const generate = useCallback(
    async (topic: string, loadLevel: number, sand: boolean) => {
      if (loadLevel === 10) return;

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setIsGenerating(true);
      setError(null);
      setContent("");
      setDoneFlash(false);

      try {
        const res = await fetch("/api/learn", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic, loadLevel, sandMode: sand }),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.error || "Something went wrong. Try again.");
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          setContent(accumulated);
        }
        setDoneFlash(true);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        if (abortRef.current === controller) setIsGenerating(false);
      }
    },
    [],
  );

  // Regenerate (debounced) when the meter or sand mode changes mid-session
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (!activeTopic || sensoryLoad === 10) return;
    const t = setTimeout(() => generate(activeTopic, sensoryLoad, sandMode), 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sensoryLoad, sandMode]);

  function startTopic(topic: string) {
    const value = topic.trim();
    if (!value || isGenerating) return;
    setTopicInput(value);
    setActiveTopic(value);
    generate(value, sensoryLoad, sandMode);
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    startTopic(topicInput);
  }

  return (
    <div
      className="min-h-screen transition-colors duration-700"
      style={{ backgroundColor: theme.bg, color: theme.text }}
    >
      <div className="mx-auto max-w-2xl px-4 pb-20 pt-6">
        {/* ── Header ─────────────────────────────────────────── */}
        <header className="mb-6 flex items-center justify-between">
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <motion.span
              className="text-3xl"
              animate={calm ? {} : { y: [0, -4, 0] }}
              transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
              role="img"
              aria-label="NeuroLearn owl"
            >
              🦉
            </motion.span>
            <h1 className="text-2xl font-black tracking-tight">
              Neuro<span style={{ color: theme.accent }}>Learn</span>
            </h1>
            {deafMode && (
              <span
                className="ml-1 flex items-center gap-1 rounded-full border-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                style={{ borderColor: theme.border, color: theme.muted }}
              >
                <VolumeX className="h-3 w-3" aria-hidden /> visual only
              </span>
            )}
          </motion.div>

          <button
            onClick={() => setDrawerOpen(true)}
            aria-label="Open settings"
            className="rounded-2xl border-2 border-b-4 p-2.5 transition-transform active:translate-y-0.5 active:border-b-2"
            style={{ borderColor: theme.border, backgroundColor: theme.card }}
          >
            <Settings className="h-5 w-5" style={{ color: theme.muted }} />
          </button>
        </header>

        {/* ── Permanent sensory meter ────────────────────────── */}
        <motion.section
          layout
          className="mb-5 rounded-3xl border-2 border-b-4 p-5 transition-colors duration-700"
          style={{ borderColor: theme.border, backgroundColor: theme.card }}
        >
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-extrabold uppercase tracking-wider" style={{ color: theme.muted }}>
              How&apos;s your brain right now?
            </h2>
            <div
              className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold"
              style={{ backgroundColor: `${theme.accent}22`, color: theme.accent }}
            >
              {BAND_SHAPE[band]}
              {BAND_LABEL[band]}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-2xl" role="img" aria-label="calm">
              😊
            </span>
            <input
              type="range"
              min={1}
              max={10}
              step={1}
              value={sensoryLoad}
              onChange={(e) => setSensoryLoad(Number(e.target.value))}
              className="meter w-full"
              aria-label="Overstimulation level, 1 calm to 10 overwhelmed"
              style={
                {
                  "--meter-accent": theme.accent,
                  background: `linear-gradient(to right, ${theme.accent} 0%, ${theme.accent} ${((sensoryLoad - 1) / 9) * 100}%, ${theme.track} ${((sensoryLoad - 1) / 9) * 100}%, ${theme.track} 100%)`,
                } as React.CSSProperties
              }
            />
            <span className="text-2xl" role="img" aria-label="overwhelmed">
              😰
            </span>
          </div>

          <p className="mt-2 text-center text-lg font-black" style={{ color: theme.accent }}>
            {sensoryLoad}/10
          </p>
        </motion.section>

        {/* ── Topic input (hidden at load 10) ────────────────── */}
        <AnimatePresence>
          {!calm && (
            <motion.section
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <form
                onSubmit={handleSubmit}
                className="mb-5 rounded-3xl border-2 border-b-4 p-5 transition-colors duration-700"
                style={{ borderColor: theme.border, backgroundColor: theme.card }}
              >
                <label
                  htmlFor="topic"
                  className="mb-3 block text-sm font-extrabold uppercase tracking-wider"
                  style={{ color: theme.muted }}
                >
                  What do you want to revise?
                </label>
                <div className="flex gap-2">
                  <input
                    id="topic"
                    type="text"
                    value={topicInput}
                    onChange={(e) => setTopicInput(e.target.value)}
                    placeholder="e.g. photosynthesis"
                    disabled={isGenerating}
                    className="w-full rounded-2xl border-2 px-4 py-3 text-base font-semibold outline-none transition-colors focus:border-current disabled:opacity-60"
                    style={{
                      borderColor: theme.border,
                      backgroundColor: theme.bg,
                      color: theme.text,
                    }}
                  />
                  <button
                    type="submit"
                    disabled={!topicInput.trim() || isGenerating}
                    className="rounded-2xl border-b-4 px-6 py-3 text-base font-black uppercase tracking-wide transition-all active:translate-y-0.5 active:border-b-0 disabled:opacity-50"
                    style={{
                      backgroundColor: theme.accent,
                      borderColor: theme.accentDark,
                      color: theme.accentText,
                    }}
                  >
                    Go
                  </button>
                </div>

                {/* Suggestion chips — only when nothing active & brain is fresh-ish */}
                {!activeTopic && band !== "high" && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {SUGGESTIONS.map((s, i) => (
                      <motion.button
                        key={s}
                        type="button"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.05 * i, type: "spring", stiffness: 300 }}
                        onClick={() => startTopic(s)}
                        className="rounded-full border-2 border-b-4 px-3.5 py-1.5 text-sm font-bold transition-transform hover:scale-105 active:translate-y-0.5 active:border-b-2"
                        style={{
                          borderColor: theme.border,
                          backgroundColor: theme.bg,
                          color: theme.muted,
                        }}
                      >
                        {s}
                      </motion.button>
                    ))}
                  </div>
                )}
              </form>
            </motion.section>
          )}
        </AnimatePresence>

        {/* ── Deaf-mode visual "ready" cue (replaces a sound) ── */}
        <AnimatePresence>
          {deafMode && doneFlash && !isGenerating && content && !calm && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: [0, 1, 0.6, 1], scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-4 flex items-center justify-center gap-2 rounded-2xl border-2 py-2.5 text-sm font-extrabold"
              style={{
                borderColor: theme.accent,
                backgroundColor: `${theme.accent}22`,
                color: theme.accent,
              }}
              role="status"
            >
              <Check className="h-4 w-4" aria-hidden /> Your content is ready
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Content area — morphs completely per load ──────── */}
        <main>
          {calm ? (
            <CalmInline theme={theme} sandMode={sandMode} onBetter={() => setSensoryLoad(5)} />
          ) : !activeTopic ? (
            <EmptyState theme={theme} band={band} />
          ) : (
            <motion.section
              layout
              className="rounded-3xl border-2 border-b-4 p-6 transition-colors duration-700"
              style={{ borderColor: theme.border, backgroundColor: theme.card }}
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3
                  className="text-xs font-extrabold uppercase tracking-widest"
                  style={{ color: theme.muted }}
                >
                  {activeTopic}
                </h3>
                {isGenerating && (
                  <motion.span
                    className="flex items-center gap-1.5 text-xs font-bold"
                    style={{ color: theme.accent }}
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ repeat: Infinity, duration: 1.2 }}
                  >
                    <Sparkles className="h-3.5 w-3.5" aria-hidden /> thinking…
                  </motion.span>
                )}
              </div>

              {error ? (
                <p className="text-sm font-semibold" style={{ color: theme.muted }}>
                  {error.includes("GOOGLE_GENERATIVE_AI_API_KEY")
                    ? "Add your Gemini key to .env.local and restart the dev server."
                    : error}
                </p>
              ) : (
                <AdaptiveContent
                  text={content}
                  band={band}
                  theme={theme}
                  isStreaming={isGenerating}
                />
              )}
            </motion.section>
          )}
        </main>
      </div>

      {/* ── Settings drawer ──────────────────────────────────── */}
      <SettingsDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} theme={theme} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Empty state
// ─────────────────────────────────────────────────────────────────────────────

function EmptyState({ theme, band }: { theme: Theme; band: LoadBand }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border-2 border-dashed p-10 text-center"
      style={{ borderColor: theme.border }}
    >
      <motion.p
        className="mb-3 text-5xl"
        animate={band === "high" ? {} : { rotate: [0, -6, 6, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
      >
        📚
      </motion.p>
      <p className="text-lg font-extrabold">Pick a topic to get started</p>
      <p className="mt-1 text-sm font-semibold" style={{ color: theme.muted }}>
        The explanation will match exactly how your brain feels right now.
      </p>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Calm takeover at load 10 — inline, not a separate page
// ─────────────────────────────────────────────────────────────────────────────

function CalmInline({
  theme,
  sandMode,
  onBetter,
}: {
  theme: Theme;
  sandMode: boolean;
  onBetter: () => void;
}) {
  const { deafMode } = useAccessibility();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="flex flex-col items-center gap-8 rounded-3xl border-2 p-10 text-center"
      style={{ borderColor: theme.border, backgroundColor: theme.card }}
    >
      <p className="text-xl font-bold leading-relaxed" style={{ color: theme.text }}>
        {sandMode
          ? "Everything can wait. You are doing just fine."
          : "No learning right now. Just breathe — you're safe."}
      </p>

      <BreathingCircle deafMode={deafMode} size={180} />

      <button
        onClick={onBetter}
        className="rounded-2xl border-b-4 px-8 py-3.5 text-base font-black transition-all active:translate-y-0.5 active:border-b-0"
        style={{
          backgroundColor: theme.accent,
          borderColor: theme.accentDark,
          color: theme.accentText,
        }}
      >
        I&apos;m feeling a bit better
      </button>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Adaptive content renderer — the morph
// ─────────────────────────────────────────────────────────────────────────────

function toBullets(text: string): string[] {
  return text
    .split(/\n+/)
    .map((l) => l.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, "").replace(/\*\*/g, "").trim())
    .filter(Boolean);
}

function toChunks(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.replace(/\*\*/g, "").trim())
    .filter(Boolean);
}

function AdaptiveContent({
  text,
  band,
  theme,
  isStreaming,
}: {
  text: string;
  band: LoadBand;
  theme: Theme;
  isStreaming: boolean;
}) {
  const chunks = useMemo(() => toChunks(text), [text]);
  const [chunkIndex, setChunkIndex] = useState(0);

  useEffect(() => {
    setChunkIndex(0);
  }, [text, band]);

  if (!text.trim()) {
    return (
      <div className="flex justify-center gap-1.5 py-8" aria-label="Loading">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: theme.accent }}
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 0.9, delay: i * 0.15 }}
          />
        ))}
      </div>
    );
  }

  // low (1–3): rich prose
  if (band === "low") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-4 text-base leading-relaxed"
        style={{ color: theme.text }}
      >
        {text
          .split(/\n{2,}/)
          .filter(Boolean)
          .map((para, i) => (
            <p key={i}>{para.replace(/\*\*/g, "").replace(/^#+\s*/gm, "")}</p>
          ))}
      </motion.div>
    );
  }

  // mid (4–6): calm bullets
  if (band === "mid") {
    return (
      <ul className="space-y-3.5">
        {toBullets(text).map((b, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: Math.min(i * 0.05, 0.4), type: "spring", stiffness: 200 }}
            className="flex gap-3 text-lg font-semibold leading-relaxed"
            style={{ color: theme.text }}
          >
            <span
              className="mt-2.5 h-2 w-2 flex-shrink-0 rounded-full"
              style={{ backgroundColor: theme.accent }}
            />
            <span>{b}</span>
          </motion.li>
        ))}
      </ul>
    );
  }

  // high (7–9): one idea at a time
  if (isStreaming || chunks.length <= 1) {
    return (
      <p className="text-2xl font-bold leading-relaxed" style={{ color: theme.text }}>
        {text.replace(/\*\*/g, "")}
      </p>
    );
  }

  const safeIndex = Math.min(chunkIndex, chunks.length - 1);

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        <motion.p
          key={safeIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="flex min-h-24 items-center text-2xl font-bold leading-snug"
          style={{ color: theme.text }}
        >
          {chunks[safeIndex]}
        </motion.p>
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <button
          onClick={() => setChunkIndex((i) => Math.max(0, i - 1))}
          disabled={safeIndex === 0}
          className="flex items-center gap-1 rounded-xl border-2 border-b-4 px-3 py-2 text-sm font-extrabold transition-all active:translate-y-0.5 active:border-b-2 disabled:opacity-30"
          style={{ borderColor: theme.border, color: theme.muted }}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden /> Back
        </button>

        <div className="flex gap-1.5" aria-hidden>
          {chunks.map((_, i) => (
            <span
              key={i}
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: i === safeIndex ? 22 : 8,
                backgroundColor: i === safeIndex ? theme.accent : theme.track,
              }}
            />
          ))}
        </div>

        <button
          onClick={() => setChunkIndex((i) => Math.min(chunks.length - 1, i + 1))}
          disabled={safeIndex === chunks.length - 1}
          className="flex items-center gap-1 rounded-xl border-2 border-b-4 px-3 py-2 text-sm font-extrabold transition-all active:translate-y-0.5 active:border-b-2 disabled:opacity-30"
          style={{ borderColor: theme.border, color: theme.accent }}
        >
          Next <ChevronRight className="h-4 w-4" aria-hidden />
        </button>
      </div>

      <p className="text-center text-xs font-bold" style={{ color: theme.muted }}>
        {safeIndex + 1} of {chunks.length}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Settings drawer — deaf mode / colour blind / sand mode
// ─────────────────────────────────────────────────────────────────────────────

function SettingsDrawer({
  open,
  onClose,
  theme,
}: {
  open: boolean;
  onClose: () => void;
  theme: Theme;
}) {
  const {
    deafMode,
    setDeafMode,
    colourBlindMode,
    setColourBlindMode,
    sandMode,
    setSandMode,
  } = useAccessibility();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40"
            aria-hidden
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 h-full w-80 max-w-[85vw] overflow-y-auto p-6"
            style={{ backgroundColor: theme.card, color: theme.text }}
            role="dialog"
            aria-label="Accessibility settings"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-black">Settings</h2>
              <button
                onClick={onClose}
                aria-label="Close settings"
                className="rounded-xl border-2 p-2"
                style={{ borderColor: theme.border }}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-6">
              <ToggleRow
                label="Deaf mode"
                description="Everything is visual. Any audio is replaced with visual cues."
                checked={deafMode}
                onChange={setDeafMode}
                theme={theme}
              />

              <ToggleRow
                label="Sand mode"
                description="Warm sandy colours and a slow, unhurried tone. No urgency."
                checked={sandMode}
                onChange={setSandMode}
                theme={theme}
              />

              <div>
                <p className="text-sm font-extrabold">Colour blind mode</p>
                <p className="mb-3 mt-0.5 text-xs font-semibold" style={{ color: theme.muted }}>
                  Palettes with shape-coded indicators — never colour-only.
                </p>
                <div className="space-y-2">
                  {(
                    [
                      { id: "none", label: "Off" },
                      { id: "deuteranopia", label: "Deuteranopia (red–green)" },
                      { id: "protanopia", label: "Protanopia (red weak)" },
                      { id: "monochromacy", label: "Monochromacy (greyscale)" },
                    ] as { id: ColourBlindMode; label: string }[]
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setColourBlindMode(opt.id)}
                      className="flex w-full items-center justify-between rounded-2xl border-2 px-4 py-3 text-sm font-bold transition-colors"
                      style={{
                        borderColor: colourBlindMode === opt.id ? theme.accent : theme.border,
                        backgroundColor:
                          colourBlindMode === opt.id ? `${theme.accent}22` : "transparent",
                        color: colourBlindMode === opt.id ? theme.accent : theme.muted,
                      }}
                    >
                      {opt.label}
                      {colourBlindMode === opt.id && <Check className="h-4 w-4" aria-hidden />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
  theme,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  theme: Theme;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-extrabold">{label}</p>
        <p className="mt-0.5 text-xs font-semibold" style={{ color: theme.muted }}>
          {description}
        </p>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className="relative h-8 w-14 flex-shrink-0 rounded-full border-2 transition-colors"
        style={{
          backgroundColor: checked ? theme.accent : theme.track,
          borderColor: checked ? theme.accentDark : theme.border,
        }}
      >
        <motion.span
          className="absolute top-0.5 h-6 w-6 rounded-full bg-white shadow"
          animate={{ left: checked ? 26 : 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </button>
    </div>
  );
}
