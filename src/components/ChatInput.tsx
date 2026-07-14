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
              "block w-full resize-none rounded-lg px-4 py-2.5 pr-12 outline-none transition-all duration-300",
              "bg-transparent border-none focus:ring-0 text-white placeholder-gray-500 font-mono text-sm tracking-wide",
              "disabled:opacity-50",
            )}
          />
        </div>

        {onToggleAgentic && (
          <button
            type="button"
            onClick={onToggleAgentic}
            className={cn(
              "shrink-0 flex items-center gap-1.5 rounded-lg px-2.5 py-2 transition-all duration-200 border",
              agentic
                ? "bg-[#7000ff]/20 text-[#00f2fe] border-[#00f2fe]/30 hover:bg-[#7000ff]/30"
                : "bg-white/5 text-gray-500 border-white/5 hover:bg-[#7000ff]/20 hover:text-[#00f2fe]",
            )}
            title={agentic ? "Agentic AI mode (multi-agent collaboration)" : "Standard mode"}
          >
            <Bot className="h-3.5 w-3.5" />
            <span className="text-[10px] font-mono tracking-wider uppercase">Agent</span>
            Agent
          </button>
        )}
        {onToggleHybrid && (
          <button
            type="button"
            onClick={onToggleHybrid}
            className={cn(
              "shrink-0 flex items-center gap-1.5 rounded-lg px-2.5 py-2 transition-all duration-200 border",
              hybrid
                ? "bg-[#7000ff]/20 text-[#00f2fe] border-[#00f2fe]/30 hover:bg-[#7000ff]/30"
                : "bg-white/5 text-gray-500 border-white/5 hover:bg-[#7000ff]/20 hover:text-[#00f2fe]",
            )}
            title={hybrid ? "Hybrid search enabled (vector + keyword)" : "Vector-only search"}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span className="text-[10px] font-mono tracking-wider uppercase">Hybrid</span>
          </button>
        )}

        <motion.button
          type="submit"
          disabled={disabled || !hasText}
          whileHover={{ scale: hasText && !disabled ? 1.05 : 1 }}
          whileTap={{ scale: hasText && !disabled ? 0.95 : 1 }}
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-all duration-300",
            hasText && !disabled
              ? "bg-gradient-to-r from-[#00f2fe] to-[#7000ff] text-black font-semibold shadow-[0_0_20px_rgba(0,242,254,0.2)] hover:opacity-90 active:scale-95"
              : "bg-white/5 text-gray-500/30",
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
