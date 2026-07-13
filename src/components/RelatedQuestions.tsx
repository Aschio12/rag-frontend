"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { StaggerContainer } from "@/components/animations/StaggerContainer";

interface Props {
  questions: string[];
  onSelect: (question: string) => void;
  loading?: boolean;
}

export default function RelatedQuestions({ questions, onSelect, loading }: Props) {
  if (loading) {
    return (
      <div className="mt-4 flex items-center gap-2 px-2">
        <Sparkles className="h-3 w-3 animate-pulse text-primary" />
        <span className="text-[10px] text-muted-foreground/60">Generating related questions...</span>
      </div>
    );
  }

  if (!questions || questions.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 space-y-1.5"
    >
      <p className="text-[10px] font-medium text-muted-foreground/50">Related questions</p>
      <StaggerContainer staggerDelay={0.04} direction="up">
        {questions.map((q) => (
          <button
            key={q}
            onClick={() => onSelect(q)}
            className="rounded-full border border-muted/40 bg-muted/20 px-2.5 py-1 text-[10px] text-muted-foreground/70 hover:bg-muted/40 hover:text-foreground transition-colors"
          >
            {q}
          </button>
        ))}
      </StaggerContainer>
    </motion.div>
  );
}
