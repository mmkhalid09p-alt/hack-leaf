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
  GraduationCap,
  BookOpen,
  MessageCircle,
  Send,
  Volume2,
  Copy,
  RefreshCw,
  History,
  LifeBuoy,
} from "lucide-react";
import {
  useAccessibility,
  type ColourBlindMode,
} from "@/context/AccessibilityContext";
import { loadBand, type LoadBand } from "@/lib/sensoryLoad";
import { getPalette } from "@/lib/colourBlindPalettes";
import { BreathingCircle } from "@/components/ui/BreathingCircle";
import { Pet } from "@/components/Pet";

// ─────────────────────────────────────────────────────────────────────────────
// Theme: clean study-tool palette that morphs with the load band
// (crisp Quizlet indigo → progressively calmer → dark calm at load 10)
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
  soft: string; // faint accent wash for pills / highlights
}

const BAND_THEMES: Record<LoadBand, Theme> = {
  low: {
    bg: "#F7F8FC",
    card: "#FFFFFF",
    text: "#0F172A",
    muted: "#64748B",
    accent: "#4255FF",
    accentDark: "#3730D8",
    accentText: "#FFFFFF",
    border: "#E2E8F0",
    track: "#E2E8F0",
    soft: "#EEF0FF",
  },
  mid: {
    bg: "#F8FAFC",
    card: "#FFFFFF",
    text: "#0F172A",
    muted: "#64748B",
    accent: "#2F6FED",
    accentDark: "#2456C8",
    accentText: "#FFFFFF",
    border: "#E4EAF2",
    track: "#E4EAF2",
    soft: "#EAF1FE",
  },
  high: {
    bg: "#FAF9FE",
    card: "#FFFFFF",
    text: "#312E4B",
    muted: "#7A7599",
    accent: "#7C6FF0",
    accentDark: "#6355D8",
    accentText: "#FFFFFF",
    border: "#EAE7F7",
    track: "#EAE7F7",
    soft: "#F1EEFC",
  },
  max: {
    bg: "#0F172A",
    card: "#1E293B",
    text: "#E2E8F0",
    muted: "#94A3B8",
    accent: "#818CF8",
    accentDark: "#6366F1",
    accentText: "#0F172A",
    border: "#334155",
    track: "#334155",
    soft: "#26314A",
  },
};

const SAND_THEME: Theme = {
  bg: "#F5EFE0",
  card: "#FBF6EA",
  text: "#4A3F2F",
  muted: "#8C7B5E",
  accent: "#B08D57",
  accentDark: "#957544",
  accentText: "#FFFFFF",
  border: "#E4D9BC",
  track: "#EADFC6",
  soft: "#EFE6CF",
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
        soft: `${cb.accent}14`,
      };
    }
    return BAND_THEMES[band];
  }, [sandMode, colourBlindMode, band]);
}

// Shape-coded band indicators — never colour-only (colour blind safe)
const BAND_SHAPE: Record<LoadBand, React.ReactNode> = {
  low: <Circle className="h-3.5 w-3.5" aria-hidden />,
  mid: <Triangle className="h-3.5 w-3.5" aria-hidden />,
  high: <Square className="h-3.5 w-3.5" aria-hidden />,
  max: <Octagon className="h-3.5 w-3.5" aria-hidden />,
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

// Coping notes shown under the meter when the load is high — what to do,
// in bullet points. Only for the overstimulated bands (mid / high); load 10
// hands over to the full calm/breathing screen instead.
const OVERSTIM_TIPS: Partial<Record<LoadBand, { title: string; tips: string[] }>> = {
  mid: {
    title: "Feeling a bit busy? Try this",
    tips: [
      "Take one slow breath before the next point",
      "Read just one line at a time — no need to rush",
      "It's okay to slow down. There's no timer here",
    ],
  },
  high: {
    title: "Feeling overwhelmed? Here's what can help",
    tips: [
      "Breathe in for 4 seconds, out for 6",
      "Soften your shoulders and unclench your jaw",
      "Look away from the screen for a moment",
      "Have a sip of water or a short stretch",
      "Slide the meter down if this is still too much",
    ],
  },
};

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
  const [recentTopics, setRecentTopics] = useState<string[]>([]);

  const abortRef = useRef<AbortController | null>(null);

  // Recently revised topics — persisted so learners can jump back in
  useEffect(() => {
    try {
      const raw = localStorage.getItem("neurolearn_recent_topics");
      if (raw) setRecentTopics(JSON.parse(raw));
    } catch {
      /* ignore malformed storage */
    }
  }, []);

  function recordTopic(t: string) {
    setRecentTopics((prev) => {
      const next = [t, ...prev.filter((x) => x.toLowerCase() !== t.toLowerCase())].slice(0, 6);
      try {
        localStorage.setItem("neurolearn_recent_topics", JSON.stringify(next));
      } catch {
        /* ignore quota errors */
      }
      return next;
    });
  }

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
    recordTopic(value);
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
      <div className="mx-auto max-w-2xl px-4 pb-20 pt-8">
        {/* ── Header ─────────────────────────────────────────── */}
        <header className="mb-7 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{ backgroundColor: theme.accent, color: theme.accentText }}
              aria-hidden
            >
              <GraduationCap className="h-5 w-5" />
            </span>
            <h1 className="text-xl font-bold tracking-tight">
              Neuro<span style={{ color: theme.accent }}>Learn</span>
            </h1>
            {deafMode && (
              <span
                className="ml-1 flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                style={{ borderColor: theme.border, color: theme.muted }}
              >
                <VolumeX className="h-3 w-3" aria-hidden /> visual only
              </span>
            )}
          </div>

          <button
            onClick={() => setDrawerOpen(true)}
            aria-label="Open settings"
            className="rounded-xl border p-2.5 shadow-sm transition hover:shadow active:scale-95"
            style={{ borderColor: theme.border, backgroundColor: theme.card }}
          >
            <Settings className="h-5 w-5" style={{ color: theme.muted }} />
          </button>
        </header>

        {/* ── Permanent sensory meter ────────────────────────── */}
        <motion.section
          layout
          className="mb-4 rounded-2xl border p-5 shadow-sm transition-colors duration-700"
          style={{ borderColor: theme.border, backgroundColor: theme.card }}
        >
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wide" style={{ color: theme.muted }}>
              How&apos;s your brain right now?
            </h2>
            <div
              className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
              style={{ backgroundColor: theme.soft, color: theme.accent }}
            >
              {BAND_SHAPE[band]}
              {BAND_LABEL[band]}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xl" role="img" aria-label="calm">
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
            <span className="text-xl" role="img" aria-label="overwhelmed">
              😰
            </span>
          </div>

          <p className="mt-2.5 text-center text-sm font-semibold" style={{ color: theme.muted }}>
            Level <span style={{ color: theme.accent }}>{sensoryLoad}</span> of 10
          </p>
        </motion.section>

        {/* ── Overstimulation coping notes — appear under the meter ── */}
        <OverstimTips band={band} theme={theme} />

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
                className="mb-4 rounded-2xl border p-5 shadow-sm transition-colors duration-700"
                style={{ borderColor: theme.border, backgroundColor: theme.card }}
              >
                <label
                  htmlFor="topic"
                  className="mb-3 block text-xs font-semibold uppercase tracking-wide"
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
                    className="w-full rounded-xl border px-4 py-3 text-base font-medium outline-none transition-colors focus:border-current disabled:opacity-60"
                    style={{
                      borderColor: theme.border,
                      backgroundColor: theme.bg,
                      color: theme.text,
                    }}
                  />
                  <button
                    type="submit"
                    disabled={!topicInput.trim() || isGenerating}
                    className="rounded-xl px-6 py-3 text-base font-semibold shadow-sm transition-all hover:brightness-95 active:scale-[0.98] disabled:opacity-50"
                    style={{
                      backgroundColor: theme.accent,
                      color: theme.accentText,
                    }}
                  >
                    Revise
                  </button>
                </div>

                {/* Recent + suggestion chips — only when nothing active & brain is fresh-ish */}
                {!activeTopic && band !== "high" && (
                  <div className="mt-4 space-y-3">
                    {recentTopics.length > 0 && (
                      <div>
                        <p
                          className="mb-1.5 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide"
                          style={{ color: theme.muted }}
                        >
                          <History className="h-3 w-3" aria-hidden /> Recently revised
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {recentTopics.map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => startTopic(s)}
                              className="rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors hover:brightness-95"
                              style={{
                                borderColor: theme.accent,
                                backgroundColor: theme.soft,
                                color: theme.accent,
                              }}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    <div>
                      {recentTopics.length > 0 && (
                        <p
                          className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide"
                          style={{ color: theme.muted }}
                        >
                          Or try one
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {SUGGESTIONS.map((s, i) => (
                          <motion.button
                            key={s}
                            type="button"
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.04 * i, duration: 0.25 }}
                            onClick={() => startTopic(s)}
                            className="rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors hover:brightness-95"
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
                    </div>
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
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: [0, 1, 0.7, 1], scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7 }}
              className="mb-4 flex items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-semibold"
              style={{
                borderColor: theme.accent,
                backgroundColor: theme.soft,
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
              className="rounded-2xl border p-6 shadow-sm transition-colors duration-700"
              style={{ borderColor: theme.border, backgroundColor: theme.card }}
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3
                  className="text-xs font-semibold uppercase tracking-wide"
                  style={{ color: theme.muted }}
                >
                  {activeTopic}
                </h3>
                {isGenerating && (
                  <motion.span
                    className="flex items-center gap-1.5 text-xs font-semibold"
                    style={{ color: theme.accent }}
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ repeat: Infinity, duration: 1.2 }}
                  >
                    <Sparkles className="h-3.5 w-3.5" aria-hidden /> thinking…
                  </motion.span>
                )}
              </div>

              {error ? (
                <p className="text-sm font-medium" style={{ color: theme.muted }}>
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

              {!error && content && !isGenerating && (
                <ContentTools
                  content={content}
                  deafMode={deafMode}
                  theme={theme}
                  disabled={isGenerating}
                  onRegenerate={() => generate(activeTopic, sensoryLoad, sandMode)}
                />
              )}
            </motion.section>
          )}

          {/* ── Chat — talk to the assistant about the topic ──── */}
          {activeTopic && !calm && (
            <ChatSection
              key={activeTopic}
              topic={activeTopic}
              loadLevel={sensoryLoad}
              sandMode={sandMode}
              deafMode={deafMode}
              theme={theme}
            />
          )}
        </main>
      </div>

      {/* ── Study buddy pet ──────────────────────────────────── */}
      <Pet
        band={band}
        sandMode={sandMode}
        isGenerating={isGenerating}
        justFinished={doneFlash}
        theme={theme}
      />

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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-2xl border border-dashed p-12 text-center"
      style={{ borderColor: theme.border }}
    >
      <span
        className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full"
        style={{ backgroundColor: theme.soft, color: theme.accent }}
        aria-hidden
      >
        <BookOpen className="h-7 w-7" />
      </span>
      <p className="text-lg font-semibold">Pick a topic to get started</p>
      <p className="mt-1 text-sm font-medium" style={{ color: theme.muted }}>
        {band === "high"
          ? "One small idea at a time. No rush."
          : "The explanation will match exactly how your brain feels right now."}
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
      className="flex flex-col items-center gap-8 rounded-2xl border p-10 text-center shadow-sm"
      style={{ borderColor: theme.border, backgroundColor: theme.card }}
    >
      <p className="text-xl font-semibold leading-relaxed" style={{ color: theme.text }}>
        {sandMode
          ? "Everything can wait. You are doing just fine."
          : "No learning right now. Just breathe — you're safe."}
      </p>

      <BreathingCircle deafMode={deafMode} size={180} />

      <button
        onClick={onBetter}
        className="rounded-xl px-8 py-3.5 text-base font-semibold shadow-sm transition-all hover:brightness-95 active:scale-[0.98]"
        style={{
          backgroundColor: theme.accent,
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
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: theme.accent }}
            animate={{ y: [0, -7, 0] }}
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
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: Math.min(i * 0.05, 0.4), duration: 0.25 }}
            className="flex gap-3 text-lg font-medium leading-relaxed"
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
      <p className="text-2xl font-semibold leading-relaxed" style={{ color: theme.text }}>
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
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="flex min-h-24 items-center text-2xl font-semibold leading-snug"
          style={{ color: theme.text }}
        >
          {chunks[safeIndex]}
        </motion.p>
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <button
          onClick={() => setChunkIndex((i) => Math.max(0, i - 1))}
          disabled={safeIndex === 0}
          className="flex items-center gap-1 rounded-xl border px-3 py-2 text-sm font-semibold transition hover:brightness-95 active:scale-[0.98] disabled:opacity-30"
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
          className="flex items-center gap-1 rounded-xl border px-3 py-2 text-sm font-semibold transition hover:brightness-95 active:scale-[0.98] disabled:opacity-30"
          style={{ borderColor: theme.border, color: theme.accent }}
        >
          Next <ChevronRight className="h-4 w-4" aria-hidden />
        </button>
      </div>

      <p className="text-center text-xs font-semibold" style={{ color: theme.muted }}>
        {safeIndex + 1} of {chunks.length}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Overstimulation coping notes — bullet-point "what to do" under the meter
// ─────────────────────────────────────────────────────────────────────────────

function OverstimTips({ band, theme }: { band: LoadBand; theme: Theme }) {
  const info = OVERSTIM_TIPS[band];
  return (
    <AnimatePresence mode="wait">
      {info && (
        <motion.section
          key={band}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
          aria-live="polite"
        >
          <div
            className="mb-4 rounded-2xl border p-5 shadow-sm transition-colors duration-700"
            style={{ borderColor: theme.accent, backgroundColor: theme.soft }}
          >
            <div className="mb-3 flex items-center gap-2">
              <LifeBuoy className="h-4 w-4" style={{ color: theme.accent }} aria-hidden />
              <h3 className="text-sm font-bold" style={{ color: theme.accent }}>
                {info.title}
              </h3>
            </div>
            <ul className="space-y-2.5">
              {info.tips.map((tip, i) => (
                <motion.li
                  key={tip}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(i * 0.05, 0.35), duration: 0.25 }}
                  className="flex gap-2.5 text-sm font-medium leading-snug"
                  style={{ color: theme.text }}
                >
                  <span
                    className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full"
                    style={{ backgroundColor: theme.accent }}
                    aria-hidden
                  />
                  <span>{tip}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Content tools — listen (TTS) / copy / regenerate
// ─────────────────────────────────────────────────────────────────────────────

function ContentTools({
  content,
  deafMode,
  theme,
  disabled,
  onRegenerate,
}: {
  content: string;
  deafMode: boolean;
  theme: Theme;
  disabled: boolean;
  onRegenerate: () => void;
}) {
  const [speaking, setSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);

  const plain = useMemo(
    () => content.replace(/\*\*/g, "").replace(/^#+\s*/gm, ""),
    [content],
  );

  // Stop any speech if the content changes or the tools unmount
  useEffect(() => {
    setSpeaking(false);
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    return () => {
      if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    };
  }, [content]);

  function toggleSpeak() {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(plain);
    utterance.rate = 0.95;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(plain);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  }

  const btn =
    "flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-semibold transition hover:brightness-95 active:scale-[0.98] disabled:opacity-40";

  return (
    <div
      className="mt-5 flex flex-wrap items-center gap-2 border-t pt-4"
      style={{ borderColor: theme.border }}
    >
      {/* Listen — hidden in deaf mode (all audio disabled) */}
      {!deafMode && (
        <button
          type="button"
          onClick={toggleSpeak}
          aria-pressed={speaking}
          className={btn}
          style={{
            borderColor: speaking ? theme.accent : theme.border,
            backgroundColor: speaking ? theme.soft : "transparent",
            color: speaking ? theme.accent : theme.muted,
          }}
        >
          {speaking ? (
            <>
              <Square className="h-4 w-4" aria-hidden /> Stop
            </>
          ) : (
            <>
              <Volume2 className="h-4 w-4" aria-hidden /> Listen
            </>
          )}
        </button>
      )}

      <button
        type="button"
        onClick={copy}
        className={btn}
        style={{
          borderColor: copied ? theme.accent : theme.border,
          color: copied ? theme.accent : theme.muted,
        }}
      >
        {copied ? (
          <>
            <Check className="h-4 w-4" aria-hidden /> Copied
          </>
        ) : (
          <>
            <Copy className="h-4 w-4" aria-hidden /> Copy
          </>
        )}
      </button>

      <button
        type="button"
        onClick={onRegenerate}
        disabled={disabled}
        className={btn}
        style={{ borderColor: theme.border, color: theme.muted }}
      >
        <RefreshCw className="h-4 w-4" aria-hidden /> Regenerate
      </button>
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
            transition={{ type: "spring", damping: 30, stiffness: 320 }}
            className="fixed right-0 top-0 z-50 h-full w-80 max-w-[85vw] overflow-y-auto p-6 shadow-xl"
            style={{ backgroundColor: theme.card, color: theme.text }}
            role="dialog"
            aria-label="Accessibility settings"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold">Settings</h2>
              <button
                onClick={onClose}
                aria-label="Close settings"
                className="rounded-lg border p-2 transition hover:brightness-95"
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
                <p className="text-sm font-bold">Colour blind mode</p>
                <p className="mb-3 mt-0.5 text-xs font-medium" style={{ color: theme.muted }}>
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
                      className="flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-semibold transition-colors"
                      style={{
                        borderColor: colourBlindMode === opt.id ? theme.accent : theme.border,
                        backgroundColor:
                          colourBlindMode === opt.id ? theme.soft : "transparent",
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

// ─────────────────────────────────────────────────────────────────────────────
// Chat — talk to the assistant about the active topic
// ─────────────────────────────────────────────────────────────────────────────

interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

function ChatSection({
  topic,
  loadLevel,
  sandMode,
  deafMode,
  theme,
}: {
  topic: string;
  loadLevel: number;
  sandMode: boolean;
  deafMode: boolean;
  theme: Theme;
}) {
  const [messages, setMessages] = useState<ChatTurn[]>([]);
  const [input, setInput] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [replyDone, setReplyDone] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages]);

  async function send(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const question = input.trim();
    if (!question || isReplying) return;

    const history = messages;
    setMessages((m) => [...m, { role: "user", content: question }, { role: "assistant", content: "" }]);
    setInput("");
    setIsReplying(true);
    setReplyDone(false);

    try {
      const res = await fetch("/api/learn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, loadLevel, sandMode, question, history }),
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
        const text = accumulated;
        setMessages((m) => {
          const next = [...m];
          next[next.length - 1] = { role: "assistant", content: text };
          return next;
        });
      }
      setReplyDone(true);
    } catch (err) {
      const msg =
        err instanceof Error && err.message.includes("GOOGLE_GENERATIVE_AI_API_KEY")
          ? "Add your Gemini key to .env.local and restart the dev server."
          : "Something went wrong. Try again.";
      setMessages((m) => {
        const next = [...m];
        next[next.length - 1] = { role: "assistant", content: msg };
        return next;
      });
    } finally {
      setIsReplying(false);
    }
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mt-4 rounded-2xl border p-5 shadow-sm transition-colors duration-700"
      style={{ borderColor: theme.border, backgroundColor: theme.card }}
    >
      <div className="mb-3 flex items-center gap-2">
        <MessageCircle className="h-4 w-4" style={{ color: theme.accent }} aria-hidden />
        <h3 className="text-xs font-semibold uppercase tracking-wide" style={{ color: theme.muted }}>
          Ask me anything about {topic}
        </h3>
        {deafMode && replyDone && !isReplying && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.6, 1] }}
            transition={{ duration: 0.7 }}
            className="ml-auto flex items-center gap-1 text-xs font-semibold"
            style={{ color: theme.accent }}
            role="status"
          >
            <Check className="h-3.5 w-3.5" aria-hidden /> replied
          </motion.span>
        )}
      </div>

      {messages.length > 0 && (
        <div className="mb-4 max-h-80 space-y-3 overflow-y-auto pr-1">
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className="max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm font-medium leading-relaxed"
                style={
                  m.role === "user"
                    ? { backgroundColor: theme.accent, color: theme.accentText }
                    : { backgroundColor: theme.soft, color: theme.text }
                }
              >
                {m.content ? (
                  m.content.replace(/\*\*/g, "")
                ) : (
                  <span className="flex gap-1 py-1" aria-label="Assistant is typing">
                    {[0, 1, 2].map((d) => (
                      <motion.span
                        key={d}
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: theme.accent }}
                        animate={{ y: [0, -4, 0] }}
                        transition={{ repeat: Infinity, duration: 0.8, delay: d * 0.15 }}
                      />
                    ))}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
          <div ref={bottomRef} />
        </div>
      )}

      <form onSubmit={send} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            messages.length === 0 ? "e.g. can you explain that more simply?" : "Ask a follow-up…"
          }
          disabled={isReplying}
          aria-label="Ask the assistant a question"
          className="w-full rounded-xl border px-4 py-2.5 text-sm font-medium outline-none transition-colors focus:border-current disabled:opacity-60"
          style={{
            borderColor: theme.border,
            backgroundColor: theme.bg,
            color: theme.text,
          }}
        />
        <button
          type="submit"
          disabled={!input.trim() || isReplying}
          aria-label="Send question"
          className="flex items-center justify-center rounded-xl px-4 py-2.5 shadow-sm transition-all hover:brightness-95 active:scale-[0.98] disabled:opacity-50"
          style={{ backgroundColor: theme.accent, color: theme.accentText }}
        >
          <Send className="h-4 w-4" aria-hidden />
        </button>
      </form>
    </motion.section>
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
        <p className="text-sm font-bold">{label}</p>
        <p className="mt-0.5 text-xs font-medium" style={{ color: theme.muted }}>
          {description}
        </p>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className="relative h-7 w-12 flex-shrink-0 rounded-full transition-colors"
        style={{
          backgroundColor: checked ? theme.accent : theme.track,
        }}
      >
        <motion.span
          className="absolute top-0.5 h-6 w-6 rounded-full bg-white shadow"
          animate={{ left: checked ? 22 : 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </button>
    </div>
  );
}
