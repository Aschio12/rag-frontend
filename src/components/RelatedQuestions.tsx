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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-4 flex items-center gap-2 px-2"
      >
        <Sparkles className="h-3 w-3 text-purple-400" />
        <motion.span
          animate={{ opacity: [1, 0.4] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="text-[10px] text-muted-foreground/50"
        >
          Generating related questions...
        </motion.span>
      </motion.div>
    );
  }

  if (!questions || questions.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 space-y-2"
    >
      <p className="text-[10px] font-medium text-muted-foreground/40 tracking-wider uppercase">
        Related questions
      </p>
      <StaggerContainer staggerDelay={0.04} direction="up">
        {questions.map((q) => (
          <motion.button
            key={q}
            onClick={() => onSelect(q)}
            whileHover={{
              backgroundColor: "rgba(124, 58, 237, 0.08)",
              borderColor: "rgba(124, 58, 237, 0.2)",
              x: 2,
            }}
            whileTap={{ scale: 0.99 }}
            className="w-full text-left rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2 text-[11px] text-muted-foreground/60 hover:text-foreground/80 transition-all duration-200"
          >
            {q}
          </motion.button>
        ))}
      </StaggerContainer>
    </motion.div>
  );
}
