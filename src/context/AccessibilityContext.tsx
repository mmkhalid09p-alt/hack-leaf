"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

export type ColourBlindMode = "none" | "deuteranopia" | "protanopia" | "monochromacy";

interface AccessibilityState {
  deafMode: boolean;
  colourBlindMode: ColourBlindMode;
  sandMode: boolean;
  sensoryLoad: number; // 1–10
}

interface AccessibilityContextValue extends AccessibilityState {
  setDeafMode: (v: boolean) => void;
  setColourBlindMode: (v: ColourBlindMode) => void;
  setSandMode: (v: boolean) => void;
  setSensoryLoad: (v: number) => void;
}

const defaultState: AccessibilityState = {
  deafMode: false,
  colourBlindMode: "none",
  sandMode: false,
  sensoryLoad: 3,
};

const AccessibilityContext = createContext<AccessibilityContextValue>({
  ...defaultState,
  setDeafMode: () => {},
  setColourBlindMode: () => {},
  setSandMode: () => {},
  setSensoryLoad: () => {},
});

const STORAGE_KEY = "neurolearn_accessibility";

function loadFromStorage(): AccessibilityState {
  if (typeof window === "undefined") return defaultState;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    return { ...defaultState, ...JSON.parse(raw) };
  } catch {
    return defaultState;
  }
}

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AccessibilityState>(defaultState);

  // Hydrate from localStorage on client
  useEffect(() => {
    setState(loadFromStorage());
  }, []);

  // Persist to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const setDeafMode = useCallback((v: boolean) => setState((s) => ({ ...s, deafMode: v })), []);
  const setColourBlindMode = useCallback((v: ColourBlindMode) => setState((s) => ({ ...s, colourBlindMode: v })), []);
  const setSandMode = useCallback((v: boolean) => setState((s) => ({ ...s, sandMode: v })), []);
  const setSensoryLoad = useCallback((v: number) => setState((s) => ({ ...s, sensoryLoad: v })), []);

  return (
    <AccessibilityContext.Provider
      value={{ ...state, setDeafMode, setColourBlindMode, setSandMode, setSensoryLoad }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  return useContext(AccessibilityContext);
}
