import { streamText } from "ai";
import { getGeminiModel } from "@/lib/gemini";

function buildPrompt({
  topic,
  loadLevel,
  sandMode,
}: {
  topic: string;
  loadLevel: number;
  sandMode: boolean;
}) {
  return `You are an educational assistant for neurodiverse learners.

Sensory load: ${loadLevel}/10
Sand mode: ${sandMode ? "on" : "off"}
Topic: ${topic}

Load 1-3: Rich explanation, full paragraphs, academic tone, real-world examples
Load 4-6: Bullet points only, max 2 lines each, plain English
Load 7-9: Max 3 sentences. One key idea only. Warm and gentle tone.
Load 10: One single calming sentence. No teaching at all.

Sand mode ON: No exclamation marks. Slow, soft, unhurried tone. No urgency whatsoever.

Never use red/green for meaning. Keep all language jargon-free below load 4.`;
}

export async function POST(req: Request) {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return Response.json(
      { error: "Missing GOOGLE_GENERATIVE_AI_API_KEY environment variable." },
      { status: 500 },
    );
  }

  let body: { topic?: string; loadLevel?: number; sandMode?: boolean };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const topic = body.topic?.trim();
  if (!topic) {
    return Response.json({ error: "Provide a `topic` to learn about." }, { status: 400 });
  }

  const loadLevel =
    typeof body.loadLevel === "number" && body.loadLevel >= 1 && body.loadLevel <= 10
      ? body.loadLevel
      : 5;

  const result = streamText({
    model: getGeminiModel(),
    prompt: buildPrompt({ topic, loadLevel, sandMode: !!body.sandMode }),
  });

  return result.toTextStreamResponse();
}
