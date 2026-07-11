"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUp } from "lucide-react";

import { cn } from "@/lib/utils";

interface Props {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  hybrid?: boolean;
  onToggleHybrid?: () => void;
  agentic?: boolean;
  onToggleAgentic?: () => void;
}

export default function ChatInput({ onSend, disabled, placeholder, hybrid, onToggleHybrid, agentic, onToggleAgentic }: Props) {
  const [input, setInput] = useState("");
  const textRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textRef.current?.focus();
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setInput("");
    if (textRef.current) {
      textRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  };

  const hasText = input.trim().length > 0;

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="border-t bg-background px-4 py-3"
    >
      <form onSubmit={handleSubmit} className="mx-auto flex w-full max-w-3xl items-end gap-2">
        <div className="relative flex-1">
          <textarea
            ref={textRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || "Ask a question about your documents..."}
            disabled={disabled}
            rows={1}
            className={cn(
              "block w-full resize-none rounded-xl border border-input bg-muted/50 px-4 py-2.5 pr-12 text-sm outline-none transition-all duration-200",
              "placeholder:text-muted-foreground/50",
              "focus:border-primary/30 focus:bg-background focus:shadow-sm",
              "disabled:opacity-50",
            )}
          />
        </div>

        {onToggleAgentic && (
          <button
            type="button"
            onClick={onToggleAgentic}
            className={cn(
              "shrink-0 rounded-lg px-2 py-1.5 text-[10px] font-medium transition-colors",
              agentic
                ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                : "bg-muted/30 text-muted-foreground/50 hover:text-muted-foreground",
            )}
            title={agentic ? "Agentic AI mode (multi-agent collaboration)" : "Standard mode"}
          >
            {agentic ? "🤖 Agent" : "💬 Chat"}
          </button>
        )}
        {onToggleHybrid && (
          <button
            type="button"
            onClick={onToggleHybrid}
            className={cn(
              "shrink-0 rounded-lg px-2 py-1.5 text-[10px] font-medium transition-colors",
              hybrid
                ? "bg-primary/10 text-primary"
                : "bg-muted/30 text-muted-foreground/50 hover:text-muted-foreground",
            )}
            title={hybrid ? "Hybrid search enabled (vector + keyword)" : "Vector-only search"}
          >
            {hybrid ? "Hybrid" : "Vector"}
          </button>
        )}

        <motion.button
          type="submit"
          disabled={disabled || !hasText}
          whileHover={{ scale: hasText && !disabled ? 1.05 : 1 }}
          whileTap={{ scale: hasText && !disabled ? 0.95 : 1 }}
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-200",
            hasText && !disabled
              ? "bg-primary text-primary-foreground shadow-xs hover:opacity-90"
              : "bg-muted text-muted-foreground/50",
          )}
        >
          {disabled ? (
            <div className="flex gap-0.5">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          ) : (
            <ArrowUp className="h-4 w-4" />
          )}
        </motion.button>
      </form>
      <p className="mt-2 text-center text-[10px] text-muted-foreground/40">
        RAG Knowledge Chatbot may produce inaccurate information. Verify important facts.
      </p>
    </motion.div>
  );
}
