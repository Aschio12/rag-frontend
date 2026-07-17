"use client";

/**
 * ThinkingOrb — the breathing assistant presence.
 *
 * Concentric rings rotate at different speeds; an iris-filled core breathes
 * (scale + opacity loop). Used as the active indicator on the assistant's
 * message surface and inside the ThinkingState.
 */

import * as React from "react";
import { motion } from "framer-motion";
import { useAetherMotion } from "@/design-system/motion";

interface ThinkingOrbProps {
  size?: number;
  intensity?: 0 | 1 | 2;
  title?: string;
}

export const ThinkingOrb = React.memo(function ThinkingOrb({
  size = 22,
  intensity = 1,
  title = "Thinking",
}: ThinkingOrbProps) {
  const { reduced } = useAetherMotion();

  return (
    <motion.span
      role={title ? "img" : undefined}
      aria-label={title}
      style={{
        position: "relative",
        display: "inline-grid",
        placeItems: "center",
        width: size,
        height: size,
      }}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
    >
      {/* Core breath */}
      <motion.span
        animate={
          reduced
            ? { scale: 1, opacity: 0.9 }
            : { scale: [1, 1.08, 1], opacity: [0.85, 1, 0.85] }
        }
        transition={{
          duration: 3.2,
          repeat: reduced ? 0 : Infinity,
          ease: "easeInOut",
        }}
        style={{
          position: "absolute",
          inset: size * 0.32,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 50% 50%, rgba(232,255,107,0.95) 0%, rgba(164,139,255,0.55) 60%, transparent 100%)",
          boxShadow:
            "0 0 12px rgba(232,255,107,0.65), 0 0 24px rgba(164,139,255,0.45)",
          filter: "blur(0.3px)",
        }}
      />

      {/* Outer slow ring */}
      <motion.span
        animate={reduced ? { rotate: 0 } : { rotate: 360 }}
        transition={{
          duration: 18 / intensity,
          repeat: reduced ? 0 : Infinity,
          ease: "linear",
        }}
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          border: "1px solid var(--aether-border-accent)",
          borderTopColor: "var(--aether-text-accent)",
          borderRightColor: "transparent",
          opacity: 0.85,
        }}
      />

      {/* Inner counter-rotating dash ring */}
      <motion.span
        animate={reduced ? { rotate: 0 } : { rotate: -360 }}
        transition={{
          duration: 12 / intensity,
          repeat: reduced ? 0 : Infinity,
          ease: "linear",
        }}
        style={{
          position: "absolute",
          inset: size * 0.18,
          borderRadius: "50%",
          border: "1px dashed var(--aether-border-iris)",
          opacity: 0.75,
        }}
      />
    </motion.span>
  );
});
