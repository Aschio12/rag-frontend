"use client";

import { motion, AnimatePresence } from "framer-motion";

interface Step {
  id: string;
  label: string;
  status: "pending" | "active" | "complete" | "error";
}

interface AgentStepsAnimationProps {
  steps: Step[];
  className?: string;
}

const statusIcons: Record<string, string> = {
  pending: "○",
  active: "◉",
  complete: "●",
  error: "✕",
};

const statusColors: Record<string, string> = {
  pending: "text-[#7000ff]/40",
  active: "text-[#00f2fe]",
  complete: "text-[#00ff87]",
  error: "text-red-400",
};

export function AgentStepsAnimation({
  steps,
  className,
}: AgentStepsAnimationProps) {
  return (
    <div className={`space-y-2 ${className || ""}`}>
      <AnimatePresence mode="popLayout">
        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            layout
            initial={{ opacity: 0, x: -20, height: 0 }}
            animate={{
              opacity: 1,
              x: 0,
              height: "auto",
              transition: {
                type: "spring",
                stiffness: 200,
                damping: 25,
                delay: index * 0.05,
              },
            }}
            exit={{ opacity: 0, x: 20, height: 0 }}
            className="flex items-center gap-3"
          >
            <motion.span
              className={`text-sm ${statusColors[step.status]}`}
              animate={
                step.status === "active"
                  ? { scale: [1, 1.2, 1] }
                  : {}
              }
              transition={
                step.status === "active"
                  ? { duration: 1, repeat: Infinity }
                  : {}
              }
            >
              {statusIcons[step.status]}
            </motion.span>
            <motion.span
              className={`text-xs ${
                step.status === "complete"
                  ? "text-[#00ff87]/80 line-through opacity-60"
                  : step.status === "error"
                  ? "text-red-300"
                  : "text-[#00f2fe]/60"
              }`}
            >
              {step.label}
            </motion.span>
            {step.status === "active" && (
              <motion.div
                className="w-1.5 h-1.5 rounded-full bg-[#00f2fe] shadow-[0_0_6px_rgba(0,242,254,0.6)]"
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.6, repeat: Infinity }}
              />
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
