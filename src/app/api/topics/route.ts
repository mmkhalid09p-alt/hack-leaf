import { generateObject } from "ai";
import { getGeminiModel } from "@/lib/gemini";
import { TopicSuggestionsSchema } from "@/lib/schemas";

export async function POST(req: Request) {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return Response.json(
      { error: "Missing GOOGLE_GENERATIVE_AI_API_KEY environment variable." },
      { status: 500 },
    );
  }

  let body: { subject?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { subject } = body;
  if (!subject?.trim()) {
    return Response.json({ error: "Provide a `subject` field." }, { status: 400 });
  }

  const { object } = await generateObject({
    model: getGeminiModel(),
    schema: TopicSuggestionsSchema,
    prompt: `Suggest 6 specific, learnable topics within the subject "${subject.trim()}".
Each topic should be a concrete concept a student can study in one session (not a broad category).
Return a title (short, clear, max 6 words) and a blurb (one sentence explaining what they will learn).
Vary difficulty — include beginner, intermediate, and advanced topics.`,
  });

  return Response.json(object);
}
