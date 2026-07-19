"use client";

/**
 * GraphSearch — input overlay matching nodes by label / summary.
 *
 * Pure presentation. Uses CSS variables updated from the parent for
 * matching, and emits a set of matched node ids via onMatchChange.
 */

import * as React from "react";
import { motion } from "framer-motion";
import { Search, X } from "lucide-react";

interface GraphSearchProps {
  value: string;
  onChange: (q: string) => void;
  matchCount: number;
  totalCount: number;
}

export const GraphSearch = React.memo(function GraphSearch({
  value,
  onChange,
  matchCount,
  totalCount,
}: GraphSearchProps) {
  return (
    <motion.label
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 12px",
        background: "var(--aether-surface-recessed)",
        border: "1px solid var(--aether-border-subtle)",
        borderRadius: 999,
        backdropFilter: "blur(14px) saturate(160%)",
        WebkitBackdropFilter: "blur(14px) saturate(160%)",
      }}
    >
      <Search size={13} strokeWidth={1.6} style={{ color: "var(--aether-text-tertiary)" }} />
      <input
        aria-label="Search the graph"
        placeholder="Search concepts, people, places…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          flex: 1,
          background: "transparent",
          border: "none",
          outline: "none",
          fontSize: 12,
          color: "var(--aether-text-primary)",
          letterSpacing: "-0.005em",
        }}
      />
      <span
        style={{
          fontSize: 10,
          letterSpacing: "0.08em",
          color:
            value.length > 0 && matchCount > 0
              ? "var(--aether-text-accent)"
              : "var(--aether-text-muted)",
          textTransform: "uppercase",
        }}
      >
        {matchCount} / {totalCount}
      </span>
      {value && (
        <button
          aria-label="Clear"
          onClick={() => onChange("")}
          style={{
            padding: 3,
            background: "transparent",
            color: "var(--aether-text-tertiary)",
            border: "1px solid var(--aether-border-subtle)",
            borderRadius: 999,
            cursor: "pointer",
          }}
        >
          <X size={11} />
        </button>
      )}
    </motion.label>
  );
});
