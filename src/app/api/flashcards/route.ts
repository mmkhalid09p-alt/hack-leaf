import { generateObject } from "ai";
import { z } from "zod";
import { getGeminiModel } from "@/lib/gemini";
import { loadBand } from "@/lib/sensoryLoad";

const cardSchema = z.object({
  front: z.string(),
  back: z.string(),
  hint: z.string().optional(),
});

function deckSize(loadLevel: number): number {
  const band = loadBand(loadLevel);
  if (band === "low") return 6;
  if (band === "mid") return 4;
  return 0;
}

function buildFlashcardPrompt({
  topic,
  loadLevel,
  count,
  learningDifference,
  hyperfocusInterest,
  sandMode,
}: {
  topic: string;
  loadLevel: number;
  count: number;
  learningDifference?: string;
  hyperfocusInterest?: string;
  sandMode: boolean;
}) {
  return `You are an educational assistant for neurodiverse learners, generating flash cards.

Current sensory load: ${loadLevel}/10
Learning difference: ${learningDifference?.trim() || "none"}
Hyperfocus interest: ${hyperfocusInterest?.trim() || "none"}
Sand mode: ${sandMode ? "on" : "off"}
Topic: ${topic}

Generate exactly ${count} flash cards about the topic above. Each card has:
- "front": a short question or term
- "back": a concise answer or explanation (max 2 sentences)
- "hint": an optional short hint, using the hyperfocus interest as an analogy
  where natural

RULES:
- Keep language simple and free of unnecessary jargon.
- Never phrase anything in terms of colour (e.g. "the green one").
- ${sandMode ? "Use a calm, unhurried, warm tone with no exclamation marks." : "Use a friendly, encouraging tone."}
- Cards should build from foundational to slightly deeper understanding.`;
}

export async function POST(req: Request) {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return Response.json(
      { error: "Missing GOOGLE_GENERATIVE_AI_API_KEY environment variable." },
      { status: 500 }
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

  const { topic, loadLevel, learningDifference, hyperfocusInterest, sandMode } = body;

  if (!topic?.trim()) {
    return Response.json({ error: "Provide a `topic` for flash cards." }, { status: 400 });
  }

  const level =
    typeof loadLevel === "number" && loadLevel >= 1 && loadLevel <= 10 ? loadLevel : 3;
  const count = deckSize(level);

  if (count === 0) {
    return Response.json(
      { error: "Flash cards are only available at sensory load 1-6." },
      { status: 400 }
    );
  }

  try {
    const { object } = await generateObject({
      model: getGeminiModel(),
      schema: z.object({ cards: z.array(cardSchema).length(count) }),
      prompt: buildFlashcardPrompt({
        topic: topic.trim(),
        loadLevel: level,
        count,
        learningDifference,
        hyperfocusInterest,
        sandMode: !!sandMode,
      }),
    });

    return Response.json(object);
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Failed to generate flash cards." },
      { status: 500 }
    );
  }
}
