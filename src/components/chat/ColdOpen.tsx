"use client";

/**
 * ColdOpen — ambient empty-chat hero.
 *
 * Large breathing orb (the presence), huge "Aether" wordmark, single sub-line,
 * five floating suggestion chips. No "How can I help you today?" — the orb
 * is the speech.
 */

import * as React from "react";
import { motion } from "framer-motion";
import { ThinkingOrb } from "./ThinkingOrb";
import { useAetherMotion } from "@/design-system/motion";

interface ColdOpenProps {
  workspaceName?: string;
  suggestions: string[];
  onPick: (s: string) => void;
}

export const ColdOpen = React.memo(function ColdOpen({
  workspaceName = "You",
  suggestions,
  onPick,
}: ColdOpenProps) {
  const { reduced } = useAetherMotion();
  return (
    <motion.section
      initial={reduced ? false : { opacity: 0, y: 12, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
      style={{
        minHeight: "calc(100dvh - 360px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 28,
        textAlign: "center",
        padding: "60px 24px",
      }}
    >
      {/* Orb presence */}
      <div style={{ position: "relative" }}>
        <motion.div
          animate={
            reduced
              ? { scale: 1 }
              : { scale: [1, 1.06, 1], y: [0, -2, 0] }
          }
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "relative",
            width: 120,
            height: 120,
            display: "grid",
            placeItems: "center",
            borderRadius: 999,
            background:
              "radial-gradient(circle at 50% 35%, rgba(232,255,107,0.16) 0%, rgba(164,139,255,0.20) 35%, transparent 75%)",
            boxShadow:
              "0 0 80px -8px rgba(164,139,255,0.45), 0 0 160px -16px rgba(232,255,107,0.25)",
          }}
        >
          <ThinkingOrb size={72} intensity={1} title="Aether is listening" />
        </motion.div>
      </div>

      {/* Wordmark */}
      <div>
        <h1
          style={{
            margin: 0,
            fontSize: "clamp(2.5rem, 6vw, 5rem)",
            fontWeight: 500,
            letterSpacing: "-0.06em",
            color: "var(--aether-text-primary)",
          }}
        >
          Aether
        </h1>
        <p
          style={{
            marginTop: 10,
            fontSize: 14,
            letterSpacing: "-0.005em",
            color: "var(--aether-text-tertiary)",
          }}
        >
          An operating system for how you think with documents.
        </p>
        <p
          style={{
            marginTop: 6,
            fontSize: 11,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--aether-text-muted)",
          }}
        >
          Hello, {workspaceName}
        </p>
      </div>

      {/* Suggestion chips */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          justifyContent: "center",
          maxWidth: 680,
        }}
      >
        {suggestions.map((s, i) => (
          <motion.button
            key={s}
            onClick={() => onPick(s)}
            initial={reduced ? false : { opacity: 0, y: 10, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{
              duration: 0.36,
              delay: 0.2 + i * 0.06,
              ease: [0.32, 0.72, 0, 1],
            }}
            whileHover={{ y: -3, scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{
              padding: "10px 16px",
              fontSize: 13,
              color: "var(--aether-text-secondary)",
              background: "var(--aether-glass-default)",
              border: "1px solid var(--aether-border-subtle)",
              borderRadius: 999,
              cursor: "pointer",
              transition: "all 160ms ease",
              backdropFilter: "blur(14px) saturate(160%)",
              WebkitBackdropFilter: "blur(14px) saturate(160%)",
              boxShadow:
                "0 1px 0 rgba(255,255,255,0.04) inset, 0 12px 28px -16px rgba(0,0,0,0.45)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--aether-text-primary)";
              e.currentTarget.style.borderColor = "var(--aether-border-accent)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--aether-text-secondary)";
              e.currentTarget.style.borderColor = "var(--aether-border-subtle)";
            }}
          >
            {s}
          </motion.button>
        ))}
      </div>
    </motion.section>
  );
});
