"use client";

/**
 * DocumentLibraryToolbar — search field + filter rail.
 *
 * Search updates library state via onQueryChange; filter chips live in their
 * own strip and are passed in (lift state up).
 */

import * as React from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useAetherMotion } from "@/design-system/motion";
import { FilterChipStrip, type FilterChip } from "./FilterChipStrip";

interface DocumentLibraryToolbarProps {
  query: string;
  onQueryChange: (q: string) => void;
  filterChip: FilterChip;
  onFilterChange: (id: string) => void;
  chips: FilterChip[];
  selectedCount: number;
}

export const DocumentLibraryToolbar = React.memo(function DocumentLibraryToolbar({
  query,
  onQueryChange,
  filterChip,
  onFilterChange,
  chips,
  selectedCount,
}: DocumentLibraryToolbarProps) {
  const { reduced } = useAetherMotion();
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        flexWrap: "wrap",
      }}
    >
      <label
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          flex: "1 1 280px",
          minWidth: 220,
          padding: "7px 12px",
          background: "var(--aether-surface-recessed)",
          border: "1px solid var(--aether-border-subtle)",
          borderRadius: 999,
        }}
      >
        <Search
          size={13}
          strokeWidth={1.6}
          style={{ color: "var(--aether-text-tertiary)", marginRight: 8 }}
        />
        <input
          type="search"
          aria-label="Search documents"
          placeholder="Search documents"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            color: "var(--aether-text-primary)",
            fontSize: 12.5,
            letterSpacing: "-0.005em",
          }}
        />
        {query && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onQueryChange("")}
            aria-label="Clear search"
            style={{
              marginLeft: 6,
              padding: "3px 8px",
              fontSize: 10,
              color: "var(--aether-text-tertiary)",
              background: "transparent",
              border: "1px solid var(--aether-border-subtle)",
              borderRadius: 999,
              cursor: "pointer",
            }}
          >
            clear
          </motion.button>
        )}
      </label>
      <FilterChipStrip chips={chips} active={filterChip.id} onChange={onFilterChange} />
      {selectedCount > 0 && (
        <motion.span
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 320, damping: 26 }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "5px 10px",
            fontSize: 10.5,
            color: "var(--aether-text-accent)",
            background: "var(--aether-hover-tint)",
            border: "1px solid var(--aether-border-accent)",
            borderRadius: 999,
            letterSpacing: "0.04em",
          }}
        >
          {selectedCount} selected
        </motion.span>
      )}
    </motion.div>
  );
});
