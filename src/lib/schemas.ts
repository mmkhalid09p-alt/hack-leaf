import { z } from "zod";

export const TopicSuggestionsSchema = z.object({
  topics: z
    .array(
      z.object({
        title: z.string(),
        blurb: z.string(),
      })
    )
    .min(4)
    .max(10),
});

export type TopicSuggestions = z.infer<typeof TopicSuggestionsSchema>;
