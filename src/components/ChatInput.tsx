"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUp, Bot, MessageSquare } from "lucide-react";

import { cn } from "@/lib/utils";
import { ChatInputAnimation } from "@/components/animations/ChatInputAnimation";

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
    <ChatInputAnimation
      isExpanded={hasText}
      className="cyber-glass bg-black/60 rounded-xl px-4 py-3 focus-within:border-[#00f2fe]/50 transition-all duration-500"
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
              "block w-full resize-none rounded-xl border border-purple-500/10 bg-muted/30 px-4 py-2.5 pr-12 text-sm outline-none transition-all duration-300",
              "placeholder:text-muted-foreground/40",
              "focus:border-purple-500/30 focus:bg-background focus:shadow-[0_0_20px_rgba(124,58,237,0.08)]",
              "disabled:opacity-50",
            )}
          />
        </div>

        {onToggleAgentic && (
          <button
            type="button"
            onClick={onToggleAgentic}
            className={cn(
              "shrink-0 flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-all duration-200",
              agentic
                ? "bg-purple-500/15 text-purple-400 border border-purple-500/25 shadow-[inset_0_1px_0_rgba(124,58,237,0.1)]"
                : "bg-white/[0.03] text-muted-foreground/50 hover:text-muted-foreground border border-transparent hover:border-white/5",
            )}
            title={agentic ? "Agentic AI mode (multi-agent collaboration)" : "Standard mode"}
          >
            <Bot className={`h-3 w-3 ${agentic ? "text-purple-400" : ""}`} />
            Agent
          </button>
        )}
        {onToggleHybrid && (
          <button
            type="button"
            onClick={onToggleHybrid}
            className={cn(
              "shrink-0 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-all duration-200",
              hybrid
                ? "bg-purple-500/15 text-purple-400 border border-purple-500/25 shadow-[inset_0_1px_0_rgba(124,58,237,0.1)]"
                : "bg-white/[0.03] text-muted-foreground/50 hover:text-muted-foreground border border-transparent hover:border-white/5",
            )}
            title={hybrid ? "Hybrid search enabled (vector + keyword)" : "Vector-only search"}
          >
            Hybrid
          </button>
        )}

        <motion.button
          type="submit"
          disabled={disabled || !hasText}
          whileHover={{ scale: hasText && !disabled ? 1.05 : 1 }}
          whileTap={{ scale: hasText && !disabled ? 0.95 : 1 }}
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-300",
            hasText && !disabled
              ? "bg-gradient-to-br from-purple-600 to-purple-500 text-white shadow-[0_2px_12px_rgba(124,58,237,0.3)] hover:shadow-[0_4px_20px_rgba(124,58,237,0.4)] hover:from-purple-500 hover:to-purple-400"
              : "bg-white/5 text-muted-foreground/30",
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
    </ChatInputAnimation>
  );
}
