"use client";

/**
 * AgentStepsFrame — re-uses the existing AgentStepsDisplay content,
 * but inside a glass surface that matches the new assistant look.
 */

import * as React from "react";
import { motion } from "framer-motion";
import AgentStepsDisplay from "@/components/AgentStepsDisplay";
import type { AgentStepEvent } from "@/lib/api";
import { useAetherMotion } from "@/design-system/motion";

interface AgentStepsFrameProps {
  steps: AgentStepEvent[];
}

export const AgentStepsFrame = React.memo(function AgentStepsFrame({
  steps,
}: AgentStepsFrameProps) {
  const { reduced } = useAetherMotion();
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 6, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: reduced ? 0.2 : 0.36, ease: [0.32, 0.72, 0, 1] }}
      style={{
        marginTop: 10,
        padding: 14,
        background: "var(--aether-surface-recessed)",
        border: "1px solid var(--aether-border-subtle)",
        borderRadius: 18,
        backdropFilter: "blur(14px) saturate(160%)",
        WebkitBackdropFilter: "blur(14px) saturate(160%)",
      }}
    >
      <AgentStepsDisplay steps={steps} />
    </motion.div>
  );
});
