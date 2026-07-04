export type LoadBand = "low" | "mid" | "high" | "max";

/**
 * Maps a 1–10 sensory-load level to a band that drives how content is rendered.
 * Single source of truth shared by the Learn page and ContentRenderer so the
 * "what changes per level" table in PRODUCT_PLAN.md is only encoded once.
 *
 * - low  (1–3): rich prose
 * - mid  (4–6): bullet points
 * - high (7–9): one idea at a time (Stay Focused Mode)
 * - max  (10):  no learning content — Calm takeover
 */
export function loadBand(level: number): LoadBand {
  if (level <= 3) return "low";
  if (level <= 6) return "mid";
  if (level <= 9) return "high";
  return "max";
}
