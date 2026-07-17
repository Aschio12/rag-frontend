"use client";

/**
 * FollowUpChipStripe — soft floating suggestion chips that appear after
 * the assistant settles. Lives below the message surface.
 */

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useAetherMotion } from "@/design-system/motion";

interface FollowUpChipStripeProps {
  items: string[];
  onPick: (item: string) => void;
  label?: string;
}

export const FollowUpChipStripe = React.memo(function FollowUpChipStripe({
  items,
  onPick,
  label = "Continue with",
}: FollowUpChipStripeProps) {
  const { reduced } = useAetherMotion();

  if (!items || items.length === 0) return null;

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 8, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: 4 }}
      transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 8,
        marginTop: 14,
        marginLeft: 6,
      }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: 10.5,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--aether-text-tertiary)",
        }}
      >
        <Sparkles size={11} style={{ color: "var(--aether-text-accent)" }} />
        {label}
      </span>
      <AnimatePresence>
        {items.map((q, i) => (
          <motion.button
            key={q}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.24,
              delay: i * 0.04,
              ease: [0.32, 0.72, 0, 1],
            }}
            whileHover={{ y: -2, scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onPick(q)}
            style={{
              padding: "8px 13px",
              fontSize: 12,
              background: "var(--aether-glass-default)",
              border: "1px solid var(--aether-border-subtle)",
              color: "var(--aether-text-secondary)",
              borderRadius: 999,
              cursor: "pointer",
              transition: "all 160ms ease",
              backdropFilter: "blur(10px) saturate(160%)",
              WebkitBackdropFilter: "blur(10px) saturate(160%)",
              boxShadow:
                "0 1px 0 rgba(255,255,255,0.03) inset, 0 6px 18px -12px rgba(0,0,0,0.45)",
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
            {q}
          </motion.button>
        ))}
      </AnimatePresence>
    </motion.div>
  );
});
