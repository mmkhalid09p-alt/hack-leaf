import {
  convertToModelMessages,
  streamText,
  type UIMessage,
} from "ai";

import { getGeminiModel } from "@/lib/gemini";

const SYSTEM_PROMPT = `You are a supportive learning assistant for NeuroDev Therapy, a platform that helps families and learners with autism spectrum support and dyslexia skill-building.

Guidelines:
- Use clear, encouraging language suited to parents, caregivers, and learners.
- Never provide medical diagnoses or replace professional clinical care.
- When asked about screeners or assessments, explain they are educational tools and suggest consulting a qualified clinician for formal evaluation.
- Keep answers practical, age-appropriate, and focused on the question asked.`;

export async function POST(req: Request) {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return Response.json(
      { error: "Missing GOOGLE_GENERATIVE_AI_API_KEY environment variable." },
      { status: 500 },
    );
  }

  let body: { messages?: UIMessage[]; prompt?: string };

  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { messages, prompt } = body;

  if (prompt?.trim()) {
    const result = streamText({
      model: getGeminiModel(),
      system: SYSTEM_PROMPT,
      prompt: prompt.trim(),
    });

    return result.toTextStreamResponse();
  }

  if (!messages?.length) {
    return Response.json(
      { error: "Provide either `prompt` or a non-empty `messages` array." },
      { status: 400 },
    );
  }

  const result = streamText({
    model: getGeminiModel(),
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
