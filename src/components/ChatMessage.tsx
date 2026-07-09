"use client";

import { useId, useState } from "react";

import type { Source } from "@/lib/api";

interface Props {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
}

function SourceBadge({ source, index }: { source: Source; index: number }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-2.5 text-xs">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between"
      >
        <span className="font-medium text-neutral-600">Source #{index + 1}</span>
        <span className="text-neutral-400">
          {expanded ? "▲" : "▼"} relevance: {source.score.toFixed(2)}
        </span>
      </button>
      {expanded && (
        <p className="mt-1.5 text-neutral-500 leading-relaxed line-clamp-4">
          {source.text}
        </p>
      )}
    </div>
  );
}

function FeedbackButtons({ messageId }: { messageId: string }) {
  const stored = typeof window !== "undefined" ? localStorage.getItem(`feedback-${messageId}`) : null;
  const [rating, setRating] = useState<"up" | "down" | null>(stored as "up" | "down" | null);

  const handleRate = (value: "up" | "down") => {
    const next = rating === value ? null : value;
    setRating(next);
    localStorage.setItem(`feedback-${messageId}`, next ?? "");
  };

  return (
    <div className="mt-2 flex items-center gap-2 text-xs text-neutral-400">
      <span className="text-neutral-300">Was this helpful?</span>
      <button
        onClick={() => handleRate("up")}
        className={`transition-colors ${rating === "up" ? "text-green-600" : "hover:text-neutral-600"}`}
      >
        ▲
      </button>
      <button
        onClick={() => handleRate("down")}
        className={`transition-colors ${rating === "down" ? "text-red-600" : "hover:text-neutral-600"}`}
      >
        ▼
      </button>
      {rating && <span className="text-neutral-300">Thanks!</span>}
    </div>
  );
}

export default function ChatMessage({ role, content, sources }: Props) {
  const isUser = role === "user";
  const messageId = useId();

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
          <div className="mt-3 space-y-1.5 border-t border-neutral-100 pt-2">
            {sources.map((s, i) => (
              <SourceBadge key={i} source={s} index={i} />
            ))}
          </div>
        )}
        {!isUser && <FeedbackButtons messageId={messageId} />}
      </div>
    </div>
  );
}
