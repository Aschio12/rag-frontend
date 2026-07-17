"use client";

/**
 * UserMessageChip — minimal right-aligned user bubble.
 *
 * Thin glass. Sentence-case type. Slight lime bloom on hover.
 */

import * as React from "react";
import { motion } from "framer-motion";
import { useAetherMotion } from "@/design-system/motion";

interface UserMessageChipProps {
  content: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const UserMessageChip = React.memo(function UserMessageChip({
  content,
  onEdit,
  onDelete,
}: UserMessageChipProps) {
  const { reduced } = useAetherMotion();
  const [hovered, setHovered] = React.useState(false);

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 12, scale: 0.97, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      transition={{ duration: reduced ? 0.16 : 0.36, ease: [0.32, 0.72, 0, 1] }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 6,
      }}
    >
      <motion.div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        animate={{ scale: hovered ? 1.01 : 1, y: hovered ? -1 : 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        style={{
          maxWidth: 520,
          padding: "10px 16px",
          fontSize: 14,
          lineHeight: 1.6,
          letterSpacing: "-0.005em",
          color: "var(--aether-text-primary)",
          background: "var(--aether-glass-default)",
          border: "1px solid var(--aether-border-subtle)",
          borderRadius: 18,
          backdropFilter: "blur(14px) saturate(160%)",
          WebkitBackdropFilter: "blur(14px) saturate(160%)",
          boxShadow:
            "0 1px 0 rgba(255,255,255,0.05) inset, 0 12px 28px -16px rgba(0,0,0,0.45)",
          whiteSpace: "pre-wrap",
          position: "relative",
        }}
      >
        {content}
      </motion.div>
      <AnimatePresence>
        {hovered && (onEdit || onDelete) && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.16 }}
            style={{ display: "inline-flex", gap: 6 }}
          >
            {onEdit && (
              <ActionChip label="Edit" onClick={onEdit} />
            )}
            {onDelete && (
              <ActionChip label="Delete" tone="warn" onClick={onDelete} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

const ActionChip = React.memo(function ActionChip({
  label,
  tone,
  onClick,
}: {
  label: string;
  tone?: "warn";
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      style={{
        padding: "4px 10px",
        fontSize: 10.5,
        letterSpacing: "0.04em",
        color: tone === "warn" ? "#FF6E7A" : "var(--aether-text-tertiary)",
        background: "var(--aether-surface-recessed)",
        border: "1px solid var(--aether-border-subtle)",
        borderRadius: 999,
        cursor: "pointer",
        transition: "all 160ms ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = tone === "warn" ? "#FF8A95" : "var(--aether-text-primary)";
        e.currentTarget.style.borderColor = "var(--aether-border-default)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = tone === "warn" ? "#FF6E7A" : "var(--aether-text-tertiary)";
        e.currentTarget.style.borderColor = "var(--aether-border-subtle)";
      }}
    >
      {label}
    </button>
  );
});

import { AnimatePresence } from "framer-motion";
