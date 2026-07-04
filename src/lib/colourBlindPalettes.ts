import type { ColourBlindMode } from "@/context/AccessibilityContext";

export interface Palette {
  bg: string;
  card: string;
  text: string;
  textMuted: string;
  accent: string;
  accent2: string;
  border: string;
}

export const PALETTES: Record<Exclude<ColourBlindMode, "none">, Palette> = {
  deuteranopia: {
    bg: "#F5F8FF",
    card: "#FFFFFF",
    text: "#1A2C6B",
    textMuted: "#5A6FA8",
    accent: "#2563EB",
    accent2: "#F59E0B",
    border: "#BFCFEF",
  },
  protanopia: {
    bg: "#F4F6FF",
    card: "#FFFFFF",
    text: "#0F172A",
    textMuted: "#475569",
    accent: "#1D4ED8",
    accent2: "#EA580C",
    border: "#CBD5E1",
  },
  monochromacy: {
    bg: "#F2F2F2",
    card: "#FFFFFF",
    text: "#111111",
    textMuted: "#555555",
    accent: "#222222",
    accent2: "#888888",
    border: "#CCCCCC",
  },
};

export function getPalette(mode: ColourBlindMode): Palette | null {
  if (mode === "none") return null;
  return PALETTES[mode];
}
