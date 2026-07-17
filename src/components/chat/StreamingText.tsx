"use client";

/**
 * StreamingText — incremental character reveal with vibrance at sentence ends.
 *
 * Maintains a stable reveal progress, jumps in 1–6 char bursts based on chunk
 * size, and pulses a caret at the head. Honors reduced motion by snapping.
 */

import * as React from "react";
import { motion } from "framer-motion";
import { useAetherMotion } from "@/design-system/motion";

interface StreamingTextProps {
  content: string;
  speed?: number;
}

export const StreamingText = React.memo(function StreamingText({
  content,
  speed = 1,
}: StreamingTextProps) {
  const { reduced } = useAetherMotion();
  const [revealed, setRevealed] = React.useState(0);

  React.useEffect(() => {
    setRevealed(0);
  }, [content]);

  React.useEffect(() => {
    if (reduced) {
      setRevealed(content.length);
      return;
    }
    if (revealed >= content.length) return;
    const len = content.length;
    const charsPerTick = len > 200 ? Math.max(2, Math.round(len / 400)) : 2;
    const t = window.setTimeout(() => {
      setRevealed((p) => Math.min(len, p + charsPerTick));
    }, 14 / speed);
    return () => window.clearTimeout(t);
  }, [revealed, content.length, content, reduced, speed]);

  const slice = content.slice(0, revealed);
  const caretOn = revealed < content.length;

  return (
    <span
      style={{
        whiteSpace: "pre-wrap",
        color: "var(--aether-text-primary)",
      }}
    >
      {slice}
      {caretOn && (
        <motion.span
          aria-hidden
          animate={{ opacity: [1, 0.25, 1] }}
          transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
          style={{
            display: "inline-block",
            width: 2,
            height: 16,
            marginLeft: 2,
            background: "var(--aether-text-accent)",
            boxShadow: "0 0 8px rgba(232,255,107,0.65)",
            verticalAlign: "-3px",
            borderRadius: 1,
          }}
        />
      )}
    </span>
  );
});
