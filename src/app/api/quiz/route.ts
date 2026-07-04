import { generateObject } from "ai";
import { z } from "zod";
import { getGeminiModel } from "@/lib/gemini";

const quizSchema = z.object({
  questions: z
    .array(
      z.object({
        question: z.string(),
        options: z.array(z.string()).length(4),
        answer: z.string(),
      })
    )
    .length(3),
});

function buildQuizPrompt({
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
  return `You are an educational assistant for neurodiverse learners, generating a quiz.

Current sensory load: ${loadLevel}/10
Learning difference: ${learningDifference?.trim() || "none"}
Hyperfocus interest: ${hyperfocusInterest?.trim() || "none"}
Sand mode: ${sandMode ? "on" : "off"}
Topic: ${topic}

Generate exactly 3 multiple-choice quiz questions about the topic above.
Each question needs exactly 4 options and one correct "answer" that matches
one of the options exactly (character-for-character).

RULES:
- Questions should suit sensory load 1-3: rich understanding, can reference
  the hyperfocus interest in wording where natural.
- Keep each question and option short enough to read at a glance.
- Never phrase feedback or wording in terms of colour (e.g. "the green one").
- ${sandMode ? "Use a calm, unhurried, warm tone with no exclamation marks." : "Use a friendly, encouraging tone."}
- Avoid jargon unless the topic requires it.`;
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
    return Response.json({ error: "Provide a `topic` to quiz on." }, { status: 400 });
  }

  const level =
    typeof loadLevel === "number" && loadLevel >= 1 && loadLevel <= 10 ? loadLevel : 3;

  try {
    const { object } = await generateObject({
      model: getGeminiModel(),
      schema: quizSchema,
      prompt: buildQuizPrompt({
        topic: topic.trim(),
        loadLevel: level,
        learningDifference,
        hyperfocusInterest,
        sandMode: !!sandMode,
      }),
    });

    return Response.json(object);
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Failed to generate quiz." },
      { status: 500 }
    );
  }
}
