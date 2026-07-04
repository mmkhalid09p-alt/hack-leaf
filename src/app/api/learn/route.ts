import { streamText, type ModelMessage } from "ai";
import { getGeminiModel } from "@/lib/gemini";

interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

function loadRules(loadLevel: number, sandMode: boolean) {
  return `Sensory load: ${loadLevel}/10
Sand mode: ${sandMode ? "on" : "off"}

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

  let body: {
    topic?: string;
    loadLevel?: number;
    sandMode?: boolean;
    question?: string;
    history?: ChatTurn[];
  };
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
  const sandMode = !!body.sandMode;
  const question = body.question?.trim();

  // ── Chat mode: the learner talks to the assistant about the topic ──
  if (question) {
    const history = Array.isArray(body.history) ? body.history.slice(-12) : [];
    const messages: ModelMessage[] = [
      {
        role: "system",
        content: `You are a friendly educational assistant for neurodiverse learners. The learner is revising the topic "${topic}" and is chatting with you about it.

${loadRules(loadLevel, sandMode)}

Answer their questions patiently. Stay on topic unless they clearly want to move on. Celebrate curiosity — never make them feel silly for asking.`,
      },
      ...history
        .filter((t) => t?.content?.trim())
        .map((t) => ({
          role: t.role === "assistant" ? ("assistant" as const) : ("user" as const),
          content: t.content,
        })),
      { role: "user", content: question },
    ];

    const result = streamText({ model: getGeminiModel(), messages });
    return result.toTextStreamResponse();
  }

  // ── Explain mode: the initial adaptive explanation ──
  const result = streamText({
    model: getGeminiModel(),
    prompt: `You are an educational assistant for neurodiverse learners.

${loadRules(loadLevel, sandMode)}

Topic: ${topic}`,
  });

  return result.toTextStreamResponse();
}
