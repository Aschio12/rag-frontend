"use client";

import { type FormEvent, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUp } from "lucide-react";

import { cn } from "@/lib/utils";

interface Props {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function ChatInput({ onSend, disabled, placeholder }: Props) {
  const [input, setInput] = useState("");
  const textRef = useRef<HTMLTextAreaElement>(null);

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
      <form onSubmit={handleSubmit} className="mx-auto flex max-w-3xl items-end gap-2">
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
