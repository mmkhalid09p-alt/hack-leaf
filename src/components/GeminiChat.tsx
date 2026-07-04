"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { Loader2, Send, Sparkles } from "lucide-react";
import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";

function getMessageText(message: UIMessage) {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
}

export function GeminiChat() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const isLoading = status === "submitted" || status === "streaming";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;

    void sendMessage({ text });
    setInput("");
  };

  return (
    <div className="flex h-[min(70vh,640px)] flex-col overflow-hidden rounded-2xl border bg-white shadow-lg">
      <div className="flex items-center gap-3 border-b bg-gradient-to-r from-blue-50 to-indigo-50 px-5 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-semibold text-gray-900">Gemini Assistant</h2>
          <p className="text-sm text-gray-600">
            Ask about autism and dyslexia support, therapy ideas, and learning strategies.
          </p>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
        {messages.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-sm text-gray-600">
            Try: &quot;How can I practice phonics at home?&quot; or &quot;What are social skills activities for a 7-year-old?&quot;
          </div>
        )}

        {messages.map((message) => {
          const text = getMessageText(message);
          if (!text) return null;

          const isUser = message.role === "user";

          return (
            <div
              key={message.id}
              className={`flex ${isUser ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  isUser
                    ? "bg-blue-600 text-white"
                    : "border bg-gray-50 text-gray-900"
                }`}
              >
                {text}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Gemini is thinking...
          </div>
        )}
      </div>

      {error && (
        <div className="border-t bg-red-50 px-5 py-3 text-sm text-red-700">
          {error.message.includes("GOOGLE_GENERATIVE_AI_API_KEY")
            ? "Add your AI Studio key to .env.local, then restart the dev server."
            : error.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="border-t bg-white px-5 py-4">
        <div className="flex gap-3">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask Gemini anything..."
            className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
            Send
          </Button>
        </div>
      </form>
    </div>
  );
}
