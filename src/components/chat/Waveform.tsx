"use client";

/**
 * Waveform — animated signal-like bar array.
 *
 * Used inside ThinkingState and the cold-open orb. Renders N vertical bars
 * whose heights animate in a sine-flavoured loop. GPU-cheap (transform only).
 */

import * as React from "react";
import { motion } from "framer-motion";
import { useAetherMotion } from "@/design-system/motion";

interface WaveformProps {
  bars?: number;
  height?: number;
  className?: string;
  color?: string;
  speed?: number;
}

export const Waveform = React.memo(function Waveform({
  bars = 5,
  height = 18,
  className,
  color,
  speed = 1.4,
}: WaveformProps) {
  const { reduced } = useAetherMotion();

  return (
    <span
      aria-hidden
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "flex-end",
        gap: 3,
        height,
      }}
    >
      {Array.from({ length: bars }).map((_, i) => (
        <motion.span
          key={i}
          initial={false}
          animate={
            reduced
              ? { scaleY: 0.45, opacity: 0.7 }
              : { scaleY: [0.3, 1, 0.42, 0.85, 0.3], opacity: [0.6, 1, 0.7, 1, 0.6] }
          }
          transition={{
            duration: speed,
            repeat: reduced ? 0 : Infinity,
            ease: "easeInOut",
            delay: i * 0.08,
          }}
          style={{
            transformOrigin: "center bottom",
            display: "inline-block",
            width: 2.5,
            height: "100%",
            borderRadius: 2,
            background: color ?? "var(--aether-text-accent)",
            boxShadow: color
              ? "none"
              : "0 0 8px rgba(232,255,107,0.55)",
          }}
        />
      ))}
    </span>
  );
});
