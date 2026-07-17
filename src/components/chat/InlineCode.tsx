"use client";

/**
 * InlineCode — small inline code surface, paired with AetherMarkdown.
 */

import * as React from "react";
import { motion } from "framer-motion";
import { useAetherMotion } from "@/design-system/motion";

interface InlineCodeProps {
  children?: React.ReactNode;
}

export const InlineCode = React.memo(function InlineCode({ children }: InlineCodeProps) {
  const { reduced } = useAetherMotion();
  return (
    <motion.code
      initial={reduced ? false : { opacity: 0, y: 2 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.16 }}
      style={{
        fontFamily:
          "var(--font-geist-mono, 'JetBrains Mono', ui-monospace, monospace)",
        fontSize: "0.86em",
        padding: "2px 6px",
        borderRadius: 6,
        background: "var(--aether-surface-recessed)",
        border: "1px solid var(--aether-border-subtle)",
        color: "var(--aether-text-primary)",
        letterSpacing: "-0.01em",
      }}
    >
      {children}
    </motion.code>
  );
});
