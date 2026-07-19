"use client";

/**
 * GraphFilterRail — animated chip rail that filters by concept kind.
 *
 * Uses the same shared-layout pill pattern as DocumentLibrary's filter
 * chips, so the entire interior feels intentional.
 */

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAetherMotion } from "@/design-system/motion";
import type { ConceptKind } from "./graph-model";

const KIND_LABEL: Record<ConceptKind, string> = {
  concept: "Concepts",
  person: "People",
  place: "Places",
  thing: "Things",
  event: "Events",
};

const KIND_ORDER: ConceptKind[] = ["concept", "person", "place", "thing", "event"];

interface GraphFilterRailProps {
  active: Set<ConceptKind>;
  onChange: (next: Set<ConceptKind>) => void;
  counts: Record<ConceptKind, number>;
}

export const GraphFilterRail = React.memo(function GraphFilterRail({
  active,
  onChange,
  counts,
}: GraphFilterRailProps) {
  const { reduced } = useAetherMotion();
  const toggle = (kind: ConceptKind) => {
    const next = new Set(active);
    if (next.has(kind)) next.delete(kind);
    else next.add(kind);
    onChange(next);
  };
  return (
    <div
      role="tablist"
      style={{
        display: "flex",
        gap: 6,
        flexWrap: "wrap",
      }}
    >
      {KIND_ORDER.map((kind) => {
        const isOn = active.has(kind);
        return (
          <motion.button
            key={kind}
            onClick={() => toggle(kind)}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 280, damping: 24 }}
            aria-pressed={isOn}
            style={{
              position: "relative",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 11px",
              fontSize: 11,
              fontWeight: 500,
              color: isOn ? "var(--aether-text-on-accent)" : "var(--aether-text-tertiary)",
              background: "transparent",
              border: "1px solid var(--aether-border-subtle)",
              borderRadius: 999,
              cursor: "pointer",
              zIndex: 1,
              whiteSpace: "nowrap",
            }}
          >
            <AnimatePresence>
              {isOn && (
                <motion.span
                  key="bg"
                  layoutId={`graph-pill-${kind}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={
                    reduced ? { duration: 0.16 } : { type: "spring", stiffness: 320, damping: 28 }
                  }
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
            <span>{KIND_LABEL[kind]}</span>
            <span
              style={{
                fontSize: 10,
                opacity: 0.7,
                letterSpacing: "0.02em",
              }}
            >
              {counts[kind] ?? 0}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
});
