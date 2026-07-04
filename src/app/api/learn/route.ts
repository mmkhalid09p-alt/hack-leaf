import { streamText } from "ai";
import { getGeminiModel } from "@/lib/gemini";

type Mode = "explore" | "homework" | "summarize";

function buildPrompt({
  mode,
  topic,
  problemText,
  sourceContent,
  loadLevel,
  hyperfocusInterest,
  learningDifference,
  sandMode,
}: {
  mode: Mode;
  topic?: string;
  problemText?: string;
  sourceContent?: string;
  loadLevel: number;
  hyperfocusInterest?: string;
  learningDifference?: string;
  sandMode: boolean;
}) {
  const toneRules = `
LOAD RULES (apply to all modes):
- Load 1-3: Rich academic content, full paragraphs, use hyperfocus interest for analogies where possible.
- Load 4-6: Bullet points only, max 2 lines each, simple vocabulary.
- Load 7-9: Max 3 sentences. One idea only. Extremely warm tone.
- Load 10: One calming sentence only. No teaching.

COGNITIVE DIFFERENCE (${learningDifference || "none"}):
- adhd: Use vivid analogies, short energetic sentences, connect to hyperfocus interest often.
- dyslexia: Prefer clear formatting, avoid long dense paragraphs, use plain language.
- autism: Be literal and direct. Avoid idioms. Be precise and structured.
- none/general: Normal helpful tone.

SAND MODE ${sandMode ? "ON" : "OFF"}: ${sandMode ? "No exclamation marks. No urgency. Slow, warm, unhurried tone throughout." : "Normal helpful tone."}

Current sensory load: ${loadLevel}/10
Hyperfocus interest: ${hyperfocusInterest?.trim() || "none"}

Always avoid jargon unless load is 1-3. Never use red/green to indicate right/wrong.`;

  if (mode === "summarize") {
    return `You are an educational assistant. Summarize the following content into key takeaways.
${toneRules}

At load 1-3: A concise paragraph summary.
At load 4-6: 3-5 bullet-point takeaways.
At load 7-9: One single most-important sentence.

Content to summarize:
${sourceContent}`;
  }

  if (mode === "homework") {
    return `You are an educational assistant helping a student with a problem.
${toneRules}

IMPORTANT: Guide the student to reason through the problem step by step. Do NOT just give the final answer outright — help them think it through. Celebrate their reasoning, not just the result.

Problem: ${problemText}`;
  }

  // explore (default)
  return `You are an educational assistant for neurodiverse learners.
${toneRules}

Topic: ${topic}`;
}

export async function POST(req: Request) {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return Response.json(
      { error: "Missing GOOGLE_GENERATIVE_AI_API_KEY environment variable." },
      { status: 500 },
    );
  }

  let body: {
    mode?: Mode;
    topic?: string;
    problemText?: string;
    sourceContent?: string;
    loadLevel?: number;
    hyperfocusInterest?: string;
    learningDifference?: string;
    sandMode?: boolean;
  };

  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const {
    mode = "explore",
    topic,
    problemText,
    sourceContent,
    loadLevel,
    hyperfocusInterest,
    learningDifference,
    sandMode,
  } = body;

  const level =
    typeof loadLevel === "number" && loadLevel >= 1 && loadLevel <= 10
      ? loadLevel
      : 5;

  if (mode === "summarize" && !sourceContent?.trim()) {
    return Response.json({ error: "Provide `sourceContent` for summarize mode." }, { status: 400 });
  }
  if (mode === "homework" && !problemText?.trim()) {
    return Response.json({ error: "Provide `problemText` for homework mode." }, { status: 400 });
  }
  if (mode === "explore" && !topic?.trim()) {
    return Response.json({ error: "Provide a `topic` to learn about." }, { status: 400 });
  }

  const result = streamText({
    model: getGeminiModel(),
    prompt: buildPrompt({
      mode,
      topic: topic?.trim(),
      problemText: problemText?.trim(),
      sourceContent: sourceContent?.trim(),
      loadLevel: level,
      hyperfocusInterest,
      learningDifference,
      sandMode: !!sandMode,
    }),
  });

  return result.toTextStreamResponse();
}
