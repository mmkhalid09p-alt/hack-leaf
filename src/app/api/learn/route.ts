import { streamText } from "ai";
import { getGeminiModel } from "@/lib/gemini";

function buildPrompt({
  topic,
  loadLevel,
  learningDifference,
  hyperfocusInterest,
  sandMode,
}: {
  topic: string;
  loadLevel: number;
  learningDifference?: string;
  hyperfocusInterest?: string;
  sandMode: boolean;
}) {
  return `You are an educational assistant for neurodiverse learners.

Current sensory load: ${loadLevel}/10
Learning difference: ${learningDifference?.trim() || "none"}
Hyperfocus interest: ${hyperfocusInterest?.trim() || "none"}
Sand mode: ${sandMode ? "on" : "off"}
Topic: ${topic}

RULES:
- Load 1-3: Rich academic content, use the hyperfocus interest for analogies where possible, full paragraphs
- Load 4-6: Bullet points only, max 2 lines each, simple vocabulary
- Load 7-9: Max 3 sentences. One idea only. Extremely warm tone.
- Load 10: One calming sentence only. No teaching.

Sand mode ON: No exclamation marks. No urgency. Slow, warm, soft tone throughout.
Sand mode OFF: Normal helpful tone.

Always avoid jargon unless load is 1-3.
Never use red/green to indicate right/wrong.`;
}

export async function POST(req: Request) {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return Response.json(
      { error: "Missing GOOGLE_GENERATIVE_AI_API_KEY environment variable." },
      { status: 500 },
    );
  }

  let body: {
    topic?: string;
    loadLevel?: number;
    learningDifference?: string;
    hyperfocusInterest?: string;
    sandMode?: boolean;
  };

  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { topic, loadLevel, learningDifference, hyperfocusInterest, sandMode } =
    body;

  if (!topic?.trim()) {
    return Response.json(
      { error: "Provide a `topic` to learn about." },
      { status: 400 },
    );
  }

  const level =
    typeof loadLevel === "number" && loadLevel >= 1 && loadLevel <= 10
      ? loadLevel
      : 5;

  const result = streamText({
    model: getGeminiModel(),
    prompt: buildPrompt({
      topic: topic.trim(),
      loadLevel: level,
      learningDifference,
      hyperfocusInterest,
      sandMode: !!sandMode,
    }),
  });

  return result.toTextStreamResponse();
}
