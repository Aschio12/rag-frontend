"use client";

/**
 * ComingSoonPanel — placeholder for workspace kinds the prompt did not
 * request. Renders a premium empty state so the window still looks
 * intentional.
 */

import * as React from "react";
import { motion } from "framer-motion";
import { useAetherMotion } from "@/design-system/motion";

interface ComingSoonPanelProps {
  kind: string;
  title?: string;
  message?: string;
}

export const ComingSoonPanel = React.memo(function ComingSoonPanel({
  kind,
  title,
  message,
}: ComingSoonPanelProps) {
  const { reduced } = useAetherMotion();
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "36px 24px",
        gap: 14,
        background:
          "radial-gradient(120% 60% at 50% 0%, rgba(164,139,255,0.08) 0%, transparent 70%)",
      }}
    >
      <motion.span
        animate={
          reduced ? { y: 0 } : { y: [-2, 2, -2] }
        }
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        style={{
          width: 64,
          height: 64,
          borderRadius: 18,
          display: "grid",
          placeItems: "center",
          background:
            "radial-gradient(circle, rgba(232,255,107,0.16) 0%, rgba(164,139,255,0.20) 60%, transparent 80%)",
          border: "1px solid var(--aether-border-subtle)",
        }}
      >
        <span
          style={{
            display: "block",
            width: 10,
            height: 10,
            borderRadius: 999,
            background: "var(--aether-text-accent)",
            boxShadow: "0 0 12px rgba(232,255,107,0.55)",
          }}
        />
      </motion.span>
      <p
        style={{
          fontSize: 12,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--aether-text-tertiary)",
        }}
      >
        {kind}
      </p>
      <h3
        style={{
          fontSize: 16,
          fontWeight: 500,
          color: "var(--aether-text-primary)",
          letterSpacing: "-0.02em",
          margin: 0,
        }}
      >
        {title ?? "Pending a future phase"}
      </h3>
      <p
        style={{
          fontSize: 12,
          color: "var(--aether-text-tertiary)",
          margin: 0,
          textAlign: "center",
        }}
      >
        {message ?? "This workspace panel is queued for a later phase."}
      </p>
    </motion.div>
  );
});
