"use client";

/**
 * ThinkingState — replaces the legacy 3-dot loader.
 *
 * Composes ThinkingOrb + Waveform inside a compact glass chip.
 * One sentence breathes in; the orb and waveform show liveness.
 */

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ThinkingOrb } from "./ThinkingOrb";
import { Waveform } from "./Waveform";
import { useAetherMotion } from "@/design-system/motion";

interface ThinkingStateProps {
  label?: string;
}

export const ThinkingState = React.memo(function ThinkingState({
  label = "Composing",
}: ThinkingStateProps) {
  const { reduced } = useAetherMotion();
  return (
    <AnimatePresence>
      <motion.div
        key="thinking"
        initial={{ opacity: 0, y: 8, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: -4, filter: "blur(4px)" }}
        transition={{
          duration: reduced ? 0.16 : 0.36,
          ease: [0.32, 0.72, 0, 1],
        }}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 14px",
          background: "var(--aether-glass-default)",
          border: "1px solid var(--aether-border-subtle)",
          borderRadius: 999,
          backdropFilter: "blur(14px) saturate(160%)",
          WebkitBackdropFilter: "blur(14px) saturate(160%)",
          boxShadow:
            "0 1px 0 rgba(255,255,255,0.04) inset, 0 8px 28px -16px rgba(0,0,0,0.45)",
        }}
      >
        <ThinkingOrb size={20} intensity={1} title={label} />
        <span
          style={{
            fontSize: 12,
            letterSpacing: "0.04em",
            color: "var(--aether-text-secondary)",
          }}
        >
          {label}
        </span>
        <Waveform bars={4} height={14} speed={1.2} />
      </motion.div>
    </AnimatePresence>
  );
});
