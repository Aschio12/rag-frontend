"use client";

/**
 * FilterChipStrip — animated chip strip with shared-layout pill.
 *
 * Used by the Library toolbar to filter documents by type / status.
 * Each chip animates between states via motion's layoutId so the active
 * pill glides between selections.
 */

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAetherMotion } from "@/design-system/motion";

export interface FilterChip {
  id: string;
  label: string;
  icon?: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  count?: number;
}

interface FilterChipStripProps {
  chips: FilterChip[];
  active: string;
  onChange: (id: string) => void;
  layoutId?: string;
}

export const FilterChipStrip = React.memo(function FilterChipStrip({
  chips,
  active,
  onChange,
  layoutId = "filter-pill",
}: FilterChipStripProps) {
  const { reduced } = useAetherMotion();
  return (
    <div
      role="tablist"
      style={{
        display: "flex",
        gap: 6,
        padding: 4,
        background: "var(--aether-surface-recessed)",
        border: "1px solid var(--aether-border-subtle)",
        borderRadius: 999,
        width: "fit-content",
        maxWidth: "100%",
        overflowX: "auto",
      }}
    >
      {chips.map((chip) => {
        const isActive = active === chip.id;
        const Icon = chip.icon;
        return (
          <motion.button
            key={chip.id}
            onClick={() => onChange(chip.id)}
            role="tab"
            aria-selected={isActive}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 280, damping: 24 }}
            style={{
              position: "relative",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 13px",
              borderRadius: 999,
              fontSize: 11.5,
              fontWeight: 500,
              letterSpacing: "0.02em",
              color: isActive
                ? "var(--aether-text-on-accent)"
                : "var(--aether-text-tertiary)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              transition: "color 200ms ease",
              zIndex: 1,
              whiteSpace: "nowrap",
            }}
          >
            <AnimatePresence>
              {isActive && (
                <motion.span
                  key="pill"
                  layoutId={`${layoutId}-${chip.id}`}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={reduced ? { duration: 0.16 } : { type: "spring", stiffness: 320, damping: 30 }}
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: 999,
                    background: "var(--aether-text-accent)",
                    boxShadow: "0 0 14px rgba(232,255,107,0.45)",
                    zIndex: -1,
                  }}
                />
              )}
            </AnimatePresence>
            {Icon && <Icon size={11.5} strokeWidth={1.7} />}
            <span>{chip.label}</span>
            {chip.count !== undefined && (
              <span
                style={{
                  fontSize: 10,
                  color: isActive ? "var(--aether-text-on-accent)" : "var(--aether-text-muted)",
                  letterSpacing: "0.04em",
                  opacity: 0.75,
                }}
              >
                {chip.count}
              </span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
});
