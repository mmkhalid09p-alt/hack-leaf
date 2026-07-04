"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Navbar } from "@/components/ui/navbar";
import { useStudentData, type LearnSession } from "@/context/StudentDataContext";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Flame, Trophy, BookOpen, ExternalLink, FileText } from "lucide-react";

function SessionCard({ session }: { session: LearnSession }) {
  const date = new Date(session.createdAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border rounded-xl p-5 space-y-3 shadow-sm"
    >
      <div className="flex justify-between items-start gap-3">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                session.mode === "homework"
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                  : "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
              }`}
            >
              {session.mode === "homework" ? "Homework" : "Explore"}
            </span>
            {session.isNote && (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                Note
              </span>
            )}
            {session.summary && (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 flex items-center gap-1">
                <FileText className="h-2.5 w-2.5" /> Summarized
              </span>
            )}
          </div>
          <p className="font-semibold text-foreground text-sm truncate">{session.topic}</p>
          {session.subject && (
            <p className="text-xs text-muted-foreground">{session.subject}</p>
          )}
        </div>

        <div className="text-right text-xs text-muted-foreground shrink-0">
          <p>{date}</p>
          <p>Load {session.sensoryLoadAtCreation}/10</p>
        </div>
      </div>

      <p className="text-sm text-muted-foreground line-clamp-2">
        {session.content}
      </p>

      {session.summary && (
        <div className="pt-2 border-t border-border space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Summary
          </p>
          <p className="text-sm text-foreground">{session.summary}</p>
        </div>
      )}

      <div className="pt-1">
        <Link
          href={`/learn?topic=${encodeURIComponent(session.topic)}&subject=${encodeURIComponent(session.subject ?? "")}`}
          className="inline-flex items-center gap-1.5 text-xs text-primary font-medium hover:underline underline-offset-4"
        >
          <ExternalLink className="h-3 w-3" />
          Reopen in Learn
        </Link>
      </div>
    </motion.div>
  );
}

export default function ProgressPage() {
  const { sessions, streak } = useStudentData();
  const [filter, setFilter] = useState<"all" | "notes">("all");

  const displayed =
    filter === "notes" ? sessions.filter((s) => s.isNote) : sessions;

  const totalTopics = sessions.filter((s) => s.mode === "explore").length;
  const totalHomework = sessions.filter((s) => s.mode === "homework").length;

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16 px-4 md:px-8 bg-background">
        <div className="max-w-3xl mx-auto space-y-10">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              My Progress
            </h1>
            <p className="text-muted-foreground mt-1">
              Your learning history, streaks, and saved notes — all in one place.
            </p>
          </div>

          {/* Streak tiles */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="bg-card border rounded-xl p-5 shadow-sm space-y-1">
              <div className="flex items-center gap-2 text-orange-500">
                <Flame className="h-5 w-5" />
                <span className="text-xs font-bold uppercase tracking-widest">Current Streak</span>
              </div>
              <p className="text-4xl font-bold text-foreground">{streak.current}</p>
              <p className="text-xs text-muted-foreground">days in a row</p>
            </div>

            <div className="bg-card border rounded-xl p-5 shadow-sm space-y-1">
              <div className="flex items-center gap-2 text-primary">
                <Trophy className="h-5 w-5" />
                <span className="text-xs font-bold uppercase tracking-widest">Longest Streak</span>
              </div>
              <p className="text-4xl font-bold text-foreground">{streak.longest}</p>
              <p className="text-xs text-muted-foreground">days</p>
            </div>

            <div className="bg-card border rounded-xl p-5 shadow-sm space-y-1">
              <div className="flex items-center gap-2 text-primary">
                <BookOpen className="h-5 w-5" />
                <span className="text-xs font-bold uppercase tracking-widest">Sessions</span>
              </div>
              <p className="text-4xl font-bold text-foreground">{sessions.length}</p>
              <p className="text-xs text-muted-foreground">
                {totalTopics} topics · {totalHomework} homework
              </p>
            </div>
          </div>

          {/* Session list */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">History</h2>
              <Tabs value={filter} onValueChange={(v) => setFilter(v as "all" | "notes")}>
                <TabsList>
                  <TabsTrigger value="all">All Sessions</TabsTrigger>
                  <TabsTrigger value="notes">Notes Only</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {displayed.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <p className="text-muted-foreground text-sm">
                  {filter === "notes"
                    ? "No saved notes yet. Open a session and click \u201cSave Note\u201d."
                    : "No sessions yet. Head to Learn to get started."}
                </p>
                <Link
                  href="/learn"
                  className="inline-flex items-center gap-2 text-sm text-primary font-medium hover:underline underline-offset-4"
                >
                  Go to Learn →
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {displayed.map((session) => (
                  <SessionCard key={session.id} session={session} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
