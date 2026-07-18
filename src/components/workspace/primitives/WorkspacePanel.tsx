"use client";

/**
 * WorkspacePanel — interior header + slot.
 *
 * Used by every workspace panel body to keep a consistent, premium look.
 */

import * as React from "react";
import { motion } from "framer-motion";
import { useAetherMotion } from "@/design-system/motion";

interface WorkspacePanelProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  toolbar?: React.ReactNode;
}

export const WorkspacePanel = React.memo(function WorkspacePanel({
  title,
  subtitle,
  children,
  toolbar,
}: WorkspacePanelProps) {
  const { reduced } = useAetherMotion();
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 6, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
      style={{ display: "flex", flexDirection: "column", height: "100%" }}
    >
      <header
        style={{
          padding: "12px 16px 10px",
          borderBottom: "1px solid var(--aether-border-subtle)",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
          <span
            style={{
              fontSize: 11,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--aether-text-tertiary)",
            }}
          >
            {title}
          </span>
          {subtitle && (
            <span
              style={{
                fontSize: 12,
                color: "var(--aether-text-secondary)",
                letterSpacing: "-0.005em",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {subtitle}
            </span>
          )}
        </div>
        <div style={{ flex: 1 }} />
        {toolbar}
      </header>
      <main style={{ flex: 1, minHeight: 0, overflow: "auto", padding: "16px 14px 22px" }}>
        {children}
      </main>
    </motion.div>
  );
});
