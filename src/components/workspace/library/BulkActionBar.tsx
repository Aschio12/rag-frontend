"use client";

/**
 * BulkActionBar — floating action bar that appears when ≥1 document is
 * selected. Slides down from the top of the library interior with shared
 * layout transitions on its chips.
 */

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2,
  Download,
  FolderOutput,
  Tag,
  Layers,
  X,
} from "lucide-react";
import { useAetherMotion } from "@/design-system/motion";

export interface BulkAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  tone?: "warn" | "default";
}

interface BulkActionBarProps {
  open: boolean;
  selectedCount: number;
  actions: BulkAction[];
  onAction?: (id: string) => void;
  onClear?: () => void;
}

export const BulkActionBar = React.memo(function BulkActionBar({
  open,
  selectedCount,
  actions,
  onAction,
  onClear,
}: BulkActionBarProps) {
  const { reduced } = useAetherMotion();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="bulk"
          initial={{ opacity: 0, y: -10, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.96 }}
          transition={reduced ? { duration: 0.18 } : { type: "spring", stiffness: 280, damping: 26 }}
          role="toolbar"
          aria-label="Bulk actions"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 8px",
            background: "rgba(11,11,14,0.85)",
            border: "1px solid var(--aether-border-default)",
            borderRadius: 999,
            backdropFilter: "blur(20px) saturate(160%)",
            WebkitBackdropFilter: "blur(20px) saturate(160%)",
            boxShadow:
              "0 1px 0 rgba(255,255,255,0.05) inset, 0 16px 32px -16px rgba(0,0,0,0.55)",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "5px 10px",
              fontSize: 10.5,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--aether-text-accent)",
              borderRight: "1px solid var(--aether-border-subtle)",
            }}
          >
            {selectedCount} selected
          </span>
          {actions.map((a) => {
            const Icon = a.icon;
            const color =
              a.tone === "warn"
                ? "#FF6E7A"
                : "var(--aether-text-secondary)";
            return (
              <motion.button
                key={a.id}
                onClick={() => onAction?.(a.id)}
                whileTap={{ scale: 0.92 }}
                transition={{ type: "spring", stiffness: 320, damping: 22 }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 10px",
                  fontSize: 11.5,
                  color,
                  background: "transparent",
                  border: "1px solid transparent",
                  borderRadius: 999,
                  cursor: "pointer",
                  transition: "all 160ms ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--aether-hover-tint)";
                  e.currentTarget.style.borderColor = "var(--aether-border-subtle)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.borderColor = "transparent";
                }}
              >
                <Icon size={12.5} strokeWidth={1.6} />
                <span>{a.label}</span>
              </motion.button>
            );
          })}
          {onClear && (
            <motion.button
              onClick={onClear}
              aria-label="Clear selection"
              whileTap={{ scale: 0.92 }}
              transition={{ type: "spring", stiffness: 320, damping: 22 }}
              style={{
                marginLeft: 4,
                padding: 5,
                background: "transparent",
                border: "none",
                color: "var(--aether-text-tertiary)",
                cursor: "pointer",
                borderRadius: 999,
                transition: "color 160ms ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--aether-text-primary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--aether-text-tertiary)";
              }}
            >
              <X size={12.5} />
            </motion.button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
});

export const DEFAULT_BULK_ACTIONS: BulkAction[] = [
  { id: "reindex", label: "Re-index", icon: Layers },
  { id: "tag",     label: "Tag",     icon: Tag },
  { id: "move",    label: "Move",    icon: FolderOutput },
  { id: "export",  label: "Export",  icon: Download },
  { id: "delete",  label: "Delete",  icon: Trash2, tone: "warn" },
];
