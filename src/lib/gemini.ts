import { google } from "@ai-sdk/google";

export const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";

export function getGeminiModel(modelId = DEFAULT_GEMINI_MODEL) {
  return google(modelId);
}
