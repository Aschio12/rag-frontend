"use client";

import type { Source } from "@/lib/api";

interface Props {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
}

export default function ChatMessage({ role, content, sources }: Props) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-neutral-900 text-white rounded-br-md"
            : "bg-white border border-neutral-200 rounded-bl-md"
        }`}
      >
        <p className="whitespace-pre-wrap">{content}</p>
        {sources && sources.length > 0 && (
          <details className="mt-2">
            <summary className="cursor-pointer text-xs text-neutral-400 hover:text-neutral-600">
              {sources.length} source{sources.length > 1 ? "s" : ""}
            </summary>
            <div className="mt-1 space-y-1">
              {sources.map((s, i) => (
                <div key={i} className="rounded bg-neutral-50 p-2 text-xs text-neutral-500">
                  <span className="font-medium">Score: {s.score.toFixed(2)}</span>
                  <p className="mt-0.5 line-clamp-2">{s.text}</p>
                </div>
              ))}
            </div>
          </details>
        )}
      </div>
    </div>
  );
}
