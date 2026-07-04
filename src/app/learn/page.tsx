"use client";

import {
  useRef,
  useState,
  useCallback,
  useEffect,
  FormEvent,
  Suspense,
} from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAccessibility, type ColourBlindMode } from "@/context/AccessibilityContext";
import { useStudentData } from "@/context/StudentDataContext";
import { loadBand } from "@/lib/sensoryLoad";
import { getPalette } from "@/lib/colourBlindPalettes";
import { Navbar } from "@/components/ui/navbar";
import SensorySlider from "@/components/learn/SensorySlider";
import { ContentRenderer } from "@/components/learn/ContentRenderer";
import CalmOverlay from "@/components/learn/CalmOverlay";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings,
  BookOpen,
  HelpCircle,
  Bookmark,
  BookmarkCheck,
  FileText,
  Loader2,
  Flame,
} from "lucide-react";

type Mode = "explore" | "homework";

function LearnInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const {
    deafMode,
    setDeafMode,
    colourBlindMode,
    setColourBlindMode,
    sandMode,
    setSandMode,
    sensoryLoad,
    setSensoryLoad,
  } = useAccessibility();

  const { logSession, markAsNote, setSummary, streak, sessions } =
    useStudentData();

  const band = loadBand(sensoryLoad);
  const cbPalette = !sandMode ? getPalette(colourBlindMode) : null;

  // Mode: explore or homework
  const [mode, setMode] = useState<Mode>("explore");

  // Inputs
  const [topicInput, setTopicInput] = useState("");
  const [problemInput, setProblemInput] = useState("");
  const [hyperfocusInterest, setHyperfocusInterest] = useState("");
  const [learningDifference, setLearningDifference] = useState("none");

  // Output state
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [activeSubject, setActiveSubject] = useState<string | undefined>();
  const [content, setContent] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isNote, setIsNote] = useState(false);
  const [summary, setLocalSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);

  const [showSettings, setShowSettings] = useState(false);

  const generateContent = useCallback(
    async (
      params: {
        mode: Mode;
        topic?: string;
        problemText?: string;
        loadLevel: number;
        subject?: string;
      }
    ) => {
      if (params.loadLevel === 10) return;

      setIsGenerating(true);
      setGenError(null);
      setContent("");
      setLocalSummary(null);
      setIsNote(false);
      setCurrentSessionId(null);

      let accumulated = "";

      try {
        const res = await fetch("/api/learn", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: params.mode,
            topic: params.topic,
            problemText: params.problemText,
            loadLevel: params.loadLevel,
            hyperfocusInterest: hyperfocusInterest.trim() || undefined,
            learningDifference:
              learningDifference !== "none" ? learningDifference : undefined,
            sandMode,
          }),
        });

        if (!res.ok || !res.body) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.error || "Failed to generate content.");
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          setContent(accumulated);
        }

        // Log the session once streaming completes
        if (accumulated.trim()) {
          const id = logSession({
            mode: params.mode,
            subject: params.subject,
            topic:
              params.mode === "homework"
                ? params.problemText ?? "Homework"
                : params.topic ?? "Unknown",
            hyperfocusInterest: hyperfocusInterest.trim() || undefined,
            sensoryLoadAtCreation: params.loadLevel,
            content: accumulated,
          });
          setCurrentSessionId(id);
        }
      } catch (err) {
        setGenError(
          err instanceof Error ? err.message : "Something went wrong."
        );
      } finally {
        setIsGenerating(false);
      }
    },
    [hyperfocusInterest, learningDifference, sandMode, logSession]
  );

  // Prefill from ?topic=&subject= (from subjects page)
  useEffect(() => {
    const qTopic = searchParams.get("topic");
    const qSubject = searchParams.get("subject") ?? undefined;
    if (qTopic) {
      setTopicInput(qTopic);
      setActiveSubject(qSubject);
      setActiveTopic(qTopic);
      void generateContent({ mode: "explore", topic: qTopic, loadLevel: sensoryLoad, subject: qSubject });
      // Clean URL so a manual refresh doesn't re-fire
      router.replace("/learn", { scroll: false });
    }
    // Only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refs for debounced regenerate-on-slider
  const generateRef = useRef(generateContent);
  const activeTopicRef = useRef(activeTopic);
  const modeRef = useRef(mode);
  const problemRef = useRef(problemInput);
  const subjectRef = useRef(activeSubject);

  useEffect(() => {
    generateRef.current = generateContent;
    activeTopicRef.current = activeTopic;
    modeRef.current = mode;
    problemRef.current = problemInput;
    subjectRef.current = activeSubject;
  });

  // Debounced re-generate when slider or sand mode changes
  useEffect(() => {
    if (!activeTopicRef.current && !problemRef.current) return;
    const timeout = setTimeout(() => {
      if (modeRef.current === "explore" && activeTopicRef.current) {
        void generateRef.current({
          mode: "explore",
          topic: activeTopicRef.current,
          loadLevel: sensoryLoad,
          subject: subjectRef.current,
        });
      } else if (modeRef.current === "homework" && problemRef.current) {
        void generateRef.current({
          mode: "homework",
          problemText: problemRef.current,
          loadLevel: sensoryLoad,
        });
      }
    }, 400);
    return () => clearTimeout(timeout);
  }, [sensoryLoad, sandMode]);

  function handleExploreSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const value = topicInput.trim();
    if (!value || isGenerating) return;
    setActiveTopic(value);
    void generateContent({ mode: "explore", topic: value, loadLevel: sensoryLoad, subject: activeSubject });
  }

  function handleHomeworkSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const value = problemInput.trim();
    if (!value || isGenerating) return;
    setActiveTopic(value);
    void generateContent({ mode: "homework", problemText: value, loadLevel: sensoryLoad });
  }

  async function handleSummarize() {
    if (!content || isSummarizing) return;
    setIsSummarizing(true);
    let result = "";
    try {
      const res = await fetch("/api/learn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "summarize",
          sourceContent: content,
          loadLevel: sensoryLoad,
          sandMode,
        }),
      });
      if (!res.ok || !res.body) throw new Error("Failed to summarize.");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        result += decoder.decode(value, { stream: true });
        setLocalSummary(result);
      }
      if (currentSessionId && result.trim()) {
        setSummary(currentSessionId, result);
      }
    } catch {
      setLocalSummary("Could not generate a summary.");
    } finally {
      setIsSummarizing(false);
    }
  }

  function handleSaveNote() {
    if (!currentSessionId) return;
    markAsNote(currentSessionId);
    setIsNote(true);
  }

  const totalSessions = sessions.length;

  return (
    <>
      <AnimatePresence>
        {sensoryLoad === 10 && (
          <CalmOverlay
            deafMode={deafMode}
            sandMode={sandMode}
            onExit={() => setSensoryLoad(5)}
          />
        )}
      </AnimatePresence>

      <Navbar />

      <main
        className={`min-h-screen pt-24 pb-16 px-4 md:px-8 transition-colors duration-500 ${
          sandMode ? "bg-[#F5EFE0]" : cbPalette ? "" : "bg-[#0a0614]"
        }`}
        style={
          cbPalette && !sandMode
            ? { backgroundColor: cbPalette.bg, color: cbPalette.text }
            : undefined
        }
      >
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Header row */}
          <div className="flex justify-between items-center">
            <div>
              <h1
                className={`text-2xl font-bold tracking-tight ${
                  sandMode ? "text-[#4A3F2F]" : "text-white"
                }`}
              >
                NeuroLearn Center
              </h1>
              {/* Streak / session badge */}
              {(streak.current > 0 || totalSessions > 0) && (
                <p
                  className={`text-xs mt-1 flex items-center gap-2 ${
                    sandMode ? "text-[#8C7B5E]" : "text-slate-400"
                  }`}
                >
                  {streak.current > 0 && (
                    <span className="flex items-center gap-1">
                      <Flame className="h-3 w-3 text-orange-400" />
                      {streak.current}-day streak
                    </span>
                  )}
                  {streak.current > 0 && totalSessions > 0 && (
                    <span className="opacity-40">·</span>
                  )}
                  {totalSessions > 0 && (
                    <span>{totalSessions} topic{totalSessions !== 1 ? "s" : ""} explored</span>
                  )}
                </p>
              )}
            </div>

            {/* Quick Controls */}
            <div className="relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2.5 rounded-xl border flex items-center gap-2 text-sm font-semibold transition-all ${
                  sandMode
                    ? "bg-[#FDF8EE] border-[#D9CCAA] text-[#4A3F2F] hover:bg-[#EDE3C8]"
                    : "bg-[#130d2a] border-white/10 text-slate-300 hover:bg-white/5"
                }`}
              >
                <Settings className="w-4 h-4" />
                Quick Controls
              </button>

              {showSettings && (
                <div
                  className={`absolute right-0 mt-2 w-72 p-5 rounded-2xl border shadow-2xl z-40 space-y-4 ${
                    sandMode
                      ? "bg-[#FDF8EE] border-[#D9CCAA] text-[#4A3F2F]"
                      : "bg-[#130d2a] border-white/10 text-slate-300"
                  }`}
                >
                  <h3 className="font-bold border-b pb-2 text-sm uppercase tracking-wider opacity-80">
                    Accessibility Toggles
                  </h3>

                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm font-medium">Sand Mode (Calm UI)</span>
                    <input
                      type="checkbox"
                      checked={sandMode}
                      onChange={(e) => setSandMode(e.target.checked)}
                      className="rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm font-medium">Deaf / HoH Mode</span>
                    <input
                      type="checkbox"
                      checked={deafMode}
                      onChange={(e) => setDeafMode(e.target.checked)}
                      className="rounded"
                    />
                  </label>

                  <div className="space-y-1.5">
                    <span className="text-sm font-medium block">Colour Blind Mode</span>
                    <select
                      value={colourBlindMode}
                      onChange={(e) =>
                        setColourBlindMode(e.target.value as ColourBlindMode)
                      }
                      className={`w-full text-xs p-2 rounded-lg border ${
                        sandMode
                          ? "bg-[#F5EFE0] border-[#D9CCAA] text-[#4A3F2F]"
                          : "bg-[#0a0614] border-white/10 text-slate-300"
                      }`}
                    >
                      <option value="none">None</option>
                      <option value="deuteranopia">Deuteranopia (Red-Green)</option>
                      <option value="protanopia">Protanopia (Red Weak)</option>
                      <option value="monochromacy">Monochromacy (Greyscale)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sensory Load Slider */}
          <section
            className={`p-6 border transition-all duration-300 ${
              sandMode
                ? "bg-[#FDF8EE] border-[#D9CCAA] rounded-3xl shadow-sm"
                : "bg-[#130d2a] border-white/10 rounded-2xl shadow-xl"
            }`}
          >
            <SensorySlider level={sensoryLoad} onChange={setSensoryLoad} sandMode={sandMode} />
          </section>

          {/* Mode toggle + form */}
          <section
            className={`p-6 border transition-all duration-300 ${
              sandMode
                ? "bg-[#FDF8EE] border-[#D9CCAA] rounded-3xl shadow-sm"
                : "bg-[#130d2a] border-white/10 rounded-2xl shadow-xl"
            }`}
          >
            <Tabs
              value={mode}
              onValueChange={(v) => setMode(v as Mode)}
              className="mb-5"
            >
              <TabsList
                className={`w-full ${
                  sandMode
                    ? "bg-[#EDE3C8]"
                    : "bg-[#0a0614]"
                }`}
              >
                <TabsTrigger value="explore" className="flex-1 gap-2">
                  <BookOpen className="h-4 w-4" />
                  Explore a Topic
                </TabsTrigger>
                <TabsTrigger value="homework" className="flex-1 gap-2">
                  <HelpCircle className="h-4 w-4" />
                  Homework Helper
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {mode === "explore" ? (
              <form onSubmit={handleExploreSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label
                      className={`block text-xs font-bold uppercase tracking-wider ${
                        sandMode ? "text-[#8C7B5E]" : "text-slate-400"
                      }`}
                    >
                      Learning Topic
                    </label>
                    <input
                      type="text"
                      value={topicInput}
                      onChange={(e) => setTopicInput(e.target.value)}
                      placeholder="e.g. Photosynthesis, Binary Code, Gravity"
                      disabled={isGenerating}
                      className={`w-full p-3 rounded-xl border text-sm transition-all focus:ring-2 focus:ring-offset-2 ${
                        sandMode
                          ? "bg-[#F5EFE0] border-[#D9CCAA] text-[#4A3F2F] placeholder-[#8C7B5E]/50 focus:ring-[#C2B280]"
                          : "bg-[#0a0614] border-white/10 text-white placeholder-slate-500 focus:ring-violet-500"
                      }`}
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      className={`block text-xs font-bold uppercase tracking-wider ${
                        sandMode ? "text-[#8C7B5E]" : "text-slate-400"
                      }`}
                    >
                      Hyperfocus Interest (optional)
                    </label>
                    <input
                      type="text"
                      value={hyperfocusInterest}
                      onChange={(e) => setHyperfocusInterest(e.target.value)}
                      placeholder="e.g. Minecraft, Trains, Space"
                      disabled={isGenerating}
                      className={`w-full p-3 rounded-xl border text-sm transition-all focus:ring-2 focus:ring-offset-2 ${
                        sandMode
                          ? "bg-[#F5EFE0] border-[#D9CCAA] text-[#4A3F2F] placeholder-[#8C7B5E]/50 focus:ring-[#C2B280]"
                          : "bg-[#0a0614] border-white/10 text-white placeholder-slate-500 focus:ring-violet-500"
                      }`}
                    />
                  </div>
                </div>

                <CogDiffPicker value={learningDifference} onChange={setLearningDifference} sandMode={sandMode} />

                <SubmitButton loading={isGenerating} disabled={!topicInput.trim()} label={activeTopic ? "Regenerate" : "Start Learning"} sandMode={sandMode} />
              </form>
            ) : (
              <form onSubmit={handleHomeworkSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label
                    className={`block text-xs font-bold uppercase tracking-wider ${
                      sandMode ? "text-[#8C7B5E]" : "text-slate-400"
                    }`}
                  >
                    Paste your question or problem
                  </label>
                  <textarea
                    value={problemInput}
                    onChange={(e) => setProblemInput(e.target.value)}
                    rows={4}
                    placeholder="e.g. Solve for x: 3x + 7 = 22. Explain each step."
                    disabled={isGenerating}
                    className={`w-full p-3 rounded-xl border text-sm transition-all resize-none focus:ring-2 focus:ring-offset-2 ${
                      sandMode
                        ? "bg-[#F5EFE0] border-[#D9CCAA] text-[#4A3F2F] placeholder-[#8C7B5E]/50 focus:ring-[#C2B280]"
                        : "bg-[#0a0614] border-white/10 text-white placeholder-slate-500 focus:ring-violet-500"
                    }`}
                  />
                </div>

                <div className="space-y-2">
                  <label
                    className={`block text-xs font-bold uppercase tracking-wider ${
                      sandMode ? "text-[#8C7B5E]" : "text-slate-400"
                    }`}
                  >
                    Hyperfocus Interest (optional)
                  </label>
                  <input
                    type="text"
                    value={hyperfocusInterest}
                    onChange={(e) => setHyperfocusInterest(e.target.value)}
                    placeholder="e.g. Minecraft, Trains, Space"
                    disabled={isGenerating}
                    className={`w-full p-3 rounded-xl border text-sm transition-all focus:ring-2 focus:ring-offset-2 ${
                      sandMode
                        ? "bg-[#F5EFE0] border-[#D9CCAA] text-[#4A3F2F] placeholder-[#8C7B5E]/50 focus:ring-[#C2B280]"
                        : "bg-[#0a0614] border-white/10 text-white placeholder-slate-500 focus:ring-violet-500"
                    }`}
                  />
                </div>

                <CogDiffPicker value={learningDifference} onChange={setLearningDifference} sandMode={sandMode} />

                <SubmitButton loading={isGenerating} disabled={!problemInput.trim()} label={activeTopic ? "Regenerate" : "Get Help"} sandMode={sandMode} />
              </form>
            )}
          </section>

          {/* Output card */}
          {activeTopic && (
            <section
              className={`p-8 border transition-all duration-500 relative ${
                sandMode
                  ? "bg-[#FDF8EE] border-[#D9CCAA] rounded-3xl shadow-sm"
                  : "bg-[#130d2a] border-white/10 rounded-2xl shadow-xl"
              }`}
            >
              <div className="flex justify-between items-start mb-6 gap-4">
                <div className="space-y-1">
                  <h3
                    className={`text-xs uppercase font-bold tracking-widest ${
                      sandMode ? "text-[#8C7B5E]" : "text-slate-400"
                    }`}
                  >
                    {mode === "homework" ? "Homework Help" : `Topic: ${activeTopic}`}
                  </h3>
                  {isGenerating && (
                    <span className="text-xs italic text-violet-400 animate-pulse">
                      Streaming content...
                    </span>
                  )}
                </div>

                {/* Action buttons — show once generation completes */}
                {!isGenerating && content && currentSessionId && (
                  <div className="flex gap-2 flex-wrap justify-end">
                    <button
                      onClick={handleSaveNote}
                      disabled={isNote}
                      title={isNote ? "Saved as note" : "Save as note"}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                        isNote
                          ? sandMode
                            ? "bg-[#C2B280] border-[#A0926A] text-[#4A3F2F] opacity-70 cursor-default"
                            : "bg-violet-700 border-violet-600 text-white opacity-70 cursor-default"
                          : sandMode
                          ? "bg-[#F5EFE0] border-[#D9CCAA] text-[#4A3F2F] hover:bg-[#EDE3C8] cursor-pointer"
                          : "bg-[#0a0614] border-white/10 text-slate-300 hover:bg-white/5 cursor-pointer"
                      }`}
                    >
                      {isNote ? (
                        <BookmarkCheck className="h-3 w-3" />
                      ) : (
                        <Bookmark className="h-3 w-3" />
                      )}
                      {isNote ? "Saved" : "Save Note"}
                    </button>

                    <button
                      onClick={handleSummarize}
                      disabled={isSummarizing || !!summary}
                      title={summary ? "Already summarized" : "Summarize with AI"}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                        summary
                          ? sandMode
                            ? "opacity-50 cursor-default bg-[#F5EFE0] border-[#D9CCAA] text-[#4A3F2F]"
                            : "opacity-50 cursor-default bg-[#0a0614] border-white/10 text-slate-500"
                          : sandMode
                          ? "bg-[#F5EFE0] border-[#D9CCAA] text-[#4A3F2F] hover:bg-[#EDE3C8] cursor-pointer"
                          : "bg-[#0a0614] border-white/10 text-slate-300 hover:bg-white/5 cursor-pointer"
                      }`}
                    >
                      {isSummarizing ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <FileText className="h-3 w-3" />
                      )}
                      {isSummarizing ? "Summarizing..." : summary ? "Summarized" : "Summarize"}
                    </button>
                  </div>
                )}
              </div>

              {genError && (
                <p className="text-xs text-red-400 mb-4">
                  {genError.includes("GOOGLE_GENERATIVE_AI_API_KEY")
                    ? "Add your AI Studio key to .env.local, then restart the dev server."
                    : genError}
                </p>
              )}

              {!genError && (
                <p
                  className={`text-xs mb-4 ${
                    sandMode ? "text-[#8C7B5E]" : "text-slate-500"
                  }`}
                >
                  {sensoryLoad <= 3
                    ? "Rich reading with speech + word highlighting."
                    : sensoryLoad <= 6
                    ? "Simplified into calm bullet points."
                    : "One idea at a time."}
                </p>
              )}

              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activeTopic}-${band}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ContentRenderer
                    text={content ?? ""}
                    level={sensoryLoad}
                    deafMode={deafMode}
                    isStreaming={isGenerating}
                  />
                </motion.div>
              </AnimatePresence>

              {/* AI Summary */}
              {summary && (
                <div
                  className={`mt-8 pt-6 border-t space-y-2 ${
                    sandMode ? "border-[#D9CCAA]" : "border-white/10"
                  }`}
                >
                  <p
                    className={`text-xs font-bold uppercase tracking-widest ${
                      sandMode ? "text-[#8C7B5E]" : "text-slate-400"
                    }`}
                  >
                    AI Summary
                  </p>
                  <p
                    className={`text-sm leading-relaxed ${
                      sandMode ? "text-[#4A3F2F]" : "text-slate-300"
                    }`}
                  >
                    {summary}
                  </p>
                </div>
              )}
            </section>
          )}
        </div>
      </main>
    </>
  );
}

// Sub-components to keep the main component readable
function CogDiffPicker({
  value,
  onChange,
  sandMode,
}: {
  value: string;
  onChange: (v: string) => void;
  sandMode: boolean;
}) {
  return (
    <div className="space-y-2">
      <label
        className={`block text-xs font-bold uppercase tracking-wider ${
          sandMode ? "text-[#8C7B5E]" : "text-slate-400"
        }`}
      >
        Personalize for Cognitive Differences
      </label>
      <div className="flex flex-wrap gap-2">
        {[
          { id: "none", label: "General" },
          { id: "adhd", label: "ADHD" },
          { id: "dyslexia", label: "Dyslexia" },
          { id: "autism", label: "Autism" },
        ].map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              value === opt.id
                ? sandMode
                  ? "bg-[#C2B280] border-[#A0926A] text-[#4A3F2F]"
                  : "bg-violet-600 border-violet-500 text-white"
                : sandMode
                ? "bg-[#F5EFE0] border-[#D9CCAA] text-[#4A3F2F] hover:bg-[#EDE3C8]"
                : "bg-[#0a0614] border-white/5 text-slate-400 hover:bg-white/5"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function SubmitButton({
  loading,
  disabled,
  label,
  sandMode,
}: {
  loading: boolean;
  disabled: boolean;
  label: string;
  sandMode: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={disabled || loading}
      className={`w-full py-3 rounded-xl font-bold transition-all shadow-md disabled:opacity-50 cursor-pointer text-sm flex items-center justify-center gap-2 ${
        sandMode
          ? "bg-[#C2B280] text-[#4A3F2F] hover:bg-[#A0926A]"
          : "bg-violet-600 text-white hover:bg-violet-700"
      }`}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {loading ? "Generating..." : label}
    </button>
  );
}

export default function LearnPage() {
  return (
    <Suspense>
      <LearnInner />
    </Suspense>
  );
}
