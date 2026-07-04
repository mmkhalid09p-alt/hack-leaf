"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { computeStreak, type StreakState } from "@/lib/streaks";

export type LearnMode = "explore" | "homework";

export interface LearnSession {
  id: string;
  createdAt: string;
  mode: LearnMode;
  subject?: string;
  topic: string;
  hyperfocusInterest?: string;
  sensoryLoadAtCreation: number;
  content: string;
  isNote: boolean;
  summary?: string;
}

interface StudentData {
  sessions: LearnSession[];
  streak: StreakState;
}

interface StudentDataContextValue extends StudentData {
  logSession: (session: Omit<LearnSession, "id" | "createdAt" | "isNote">) => string;
  markAsNote: (id: string) => void;
  setSummary: (id: string, summary: string) => void;
}

const defaultStreak: StreakState = { current: 0, longest: 0, lastActiveDate: null };

const defaultData: StudentData = { sessions: [], streak: defaultStreak };

const StudentDataContext = createContext<StudentDataContextValue>({
  ...defaultData,
  logSession: () => "",
  markAsNote: () => {},
  setSummary: () => {},
});

const STORAGE_KEY = "neurolearn_student_data";

function loadFromStorage(): StudentData {
  if (typeof window === "undefined") return defaultData;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData;
    return { ...defaultData, ...JSON.parse(raw) };
  } catch {
    return defaultData;
  }
}

export function StudentDataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<StudentData>(defaultData);

  useEffect(() => {
    setData(loadFromStorage());
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const logSession = useCallback(
    (session: Omit<LearnSession, "id" | "createdAt" | "isNote">): string => {
      const id = crypto.randomUUID();
      const createdAt = new Date().toISOString();
      const newSession: LearnSession = { ...session, id, createdAt, isNote: false };

      setData((prev) => {
        const todayDate = createdAt.slice(0, 10);
        const updatedStreak = computeStreak(prev.streak, todayDate);
        return {
          sessions: [newSession, ...prev.sessions],
          streak: updatedStreak,
        };
      });

      return id;
    },
    []
  );

  const markAsNote = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      sessions: prev.sessions.map((s) =>
        s.id === id ? { ...s, isNote: true } : s
      ),
    }));
  }, []);

  const setSummary = useCallback((id: string, summary: string) => {
    setData((prev) => ({
      ...prev,
      sessions: prev.sessions.map((s) =>
        s.id === id ? { ...s, summary } : s
      ),
    }));
  }, []);

  return (
    <StudentDataContext.Provider
      value={{ ...data, logSession, markAsNote, setSummary }}
    >
      {children}
    </StudentDataContext.Provider>
  );
}

export function useStudentData() {
  return useContext(StudentDataContext);
}
