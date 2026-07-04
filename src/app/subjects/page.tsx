"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/ui/navbar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Loader2 } from "lucide-react";
import type { TopicSuggestions } from "@/lib/schemas";

const QUICK_PICKS = [
  "Mathematics", "Biology", "Physics", "Chemistry",
  "History", "Geography", "English Literature", "Computer Science",
  "Psychology", "Economics",
];

export default function SubjectsPage() {
  const router = useRouter();
  const [subjectInput, setSubjectInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<TopicSuggestions["topics"] | null>(null);
  const [activeSubject, setActiveSubject] = useState("");

  async function fetchTopics(subject: string) {
    if (!subject.trim()) return;
    setLoading(true);
    setError(null);
    setResults(null);
    setActiveSubject(subject.trim());

    try {
      const res = await fetch("/api/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: subject.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to load topics.");
      }
      const data: TopicSuggestions = await res.json();
      setResults(data.topics);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    fetchTopics(subjectInput);
  }

  function openTopic(title: string) {
    const params = new URLSearchParams({ topic: title, subject: activeSubject });
    router.push(`/learn?${params.toString()}`);
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16 px-4 md:px-8 bg-background">
        <div className="max-w-3xl mx-auto space-y-10">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Subject Library</h1>
            <p className="text-muted-foreground">
              Enter any subject and Gemini will suggest specific topics to study.
            </p>
          </div>

          {/* Subject input */}
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="text"
              value={subjectInput}
              onChange={(e) => setSubjectInput(e.target.value)}
              placeholder="e.g. Biology, Algebra, World War II..."
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-xl border border-input bg-card text-foreground placeholder-muted-foreground text-sm outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all"
            />
            <Button type="submit" disabled={!subjectInput.trim() || loading} className="gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {loading ? "Thinking..." : "Suggest Topics"}
            </Button>
          </form>

          {/* Quick picks */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Quick picks
            </p>
            <div className="flex flex-wrap gap-2">
              {QUICK_PICKS.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setSubjectInput(s);
                    fetchTopics(s);
                  }}
                  disabled={loading}
                  className="px-3 py-1.5 rounded-full border border-border bg-card text-sm text-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer disabled:opacity-50"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-destructive">
              {error.includes("GOOGLE_GENERATIVE_AI_API_KEY")
                ? "Add your AI Studio key to .env.local and restart the dev server."
                : error}
            </p>
          )}

          {/* Topic cards */}
          <AnimatePresence mode="wait">
            {results && (
              <motion.div
                key={activeSubject}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <p className="text-sm text-muted-foreground">
                  Topics in <strong className="text-foreground">{activeSubject}</strong>
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {results.map((topic, i) => (
                    <motion.div
                      key={topic.title}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                    >
                      <Card
                        className="cursor-pointer hover:border-primary/50 transition-colors"
                        onClick={() => openTopic(topic.title)}
                      >
                        <CardHeader>
                          <CardTitle className="text-base">{topic.title}</CardTitle>
                          <CardDescription>{topic.blurb}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <span className="inline-flex items-center gap-1 text-sm text-primary font-medium">
                            Study this <ArrowRight className="h-3 w-3" />
                          </span>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </>
  );
}
