"use client";

/**
 * PremiumEmpty — reusable premium empty state illustration + body.
 *
 * Pure presentation. The "shape" prop swaps the rendered glyph; the rest
 * is consistent premium chrome (calm icon + headline + guidance + optional
 * action).
 */

import * as React from "react";
import { motion } from "framer-motion";
import { Box } from "lucide-react";
import { useAetherMotion } from "@/design-system/motion";

export interface PremiumEmptyProps {
  shape?: "shelves" | "graph" | "spiral" | "trail" | "panel" | "loop";
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
  /** Smaller version for compact panels. */
  compact?: boolean;
}

export const PremiumEmpty = React.memo(function PremiumEmpty({
  shape = "shelves",
  title,
  description,
  action,
  compact = false,
}: PremiumEmptyProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, ease: [0.32, 0.72, 0, 1] }}
      role="status"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: compact ? 8 : 12,
        padding: compact ? "20px 16px" : "36px 16px",
      }}
    >
      <EmptyShape shape={shape} compact={compact} />
      ...
      <p
        style={{
          fontSize: compact ? 12.5 : 14,
          color: "var(--aether-text-primary)",
          letterSpacing: "-0.01em",
          margin: 0,
          fontWeight: 500,
        }}
      >
        {title}
      </p>
      <p
        style={{
          fontSize: compact ? 11 : 12,
          color: "var(--aether-text-tertiary)",
          maxWidth: compact ? 240 : 320,
          lineHeight: 1.55,
          letterSpacing: "0.01em",
          margin: 0,
        }}
      >
        {description}
      </p>
      {action && (
        <motion.button
          onClick={action.onClick}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 280, damping: 22 }}
          style={{
            marginTop: 6,
            padding: "7px 14px",
            fontSize: 11,
            color: "var(--aether-text-on-accent)",
            background: "var(--aether-text-accent)",
            border: "none",
            borderRadius: 999,
            cursor: "pointer",
            letterSpacing: "0.04em",
            boxShadow: "0 0 14px rgba(232,255,107,0.45)",
          }}
        >
          {action.label}
        </motion.button>
      )}
    </motion.div>
  );
});

function EmptyShape({ shape, compact }: { shape: PremiumEmptyProps["shape"]; compact: boolean }) {
  const resolved: Required<PremiumEmptyProps>["shape"] = shape ?? "shelves";
  const size = compact ? 84 : 120;
  return (
    <motion.div
      animate={{
        y: compact ? [0, -1.5, 0] : [0, -2.5, 0],
      }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      style={{
        position: "relative",
        width: size,
        height: size,
        borderRadius: compact ? 16 : 22,
        display: "grid",
        placeItems: "center",
        background:
          "radial-gradient(circle, rgba(232,255,107,0.16) 0%, rgba(164,139,255,0.18) 55%, transparent 80%)",
        border: "1px solid var(--aether-border-subtle)",
      }}
    >
      <Shape svg={shapeShape((shape ?? "shelves") as NonNullable<PremiumEmptyProps["shape"]>)} />
      <LiteStar top={4} left={4} />
      <LiteStar bottom={4} right={4} color="#A48BFF" />
    </motion.div>
  );
}

function LiteStar({
  top,
  left,
  bottom,
  right,
  color = "#E8FF6B",
}: {
  top?: number;
  left?: number;
  bottom?: number;
  right?: number;
  color?: string;
}) {
  return (
    <span
      aria-hidden
      style={{
        position: "absolute",
        top,
        left,
        bottom,
        right,
        width: 4,
        height: 4,
        borderRadius: 999,
        background: color,
        boxShadow: `0 0 8px ${color}`,
      }}
    />
  );
}

function Shape({ svg }: { svg: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.36, ease: [0.32, 0.72, 0, 1] }}
      style={{ display: "grid", placeItems: "center", color: "var(--aether-text-accent)" }}
    >
      {svg}
    </motion.div>
  );
}

/* Each "shape" is a hand-drawn CSS / SVG illustration appropriate to the
   empty state. No emojis, no stock images, no third-party assets. */

function shapeShape(shape: Required<PremiumEmptyProps>["shape"]) {
  switch (shape) {
    case "shelves":
      return <ShelvesSvg />;
    case "graph":
      return <MapSvg />;
    case "spiral":
      return <SpiralSvg />;
    case "trail":
      return <TrailSvg />;
    case "panel":
      return <PanelSvg />;
    case "loop":
      return <LoopSvg />;
    default:
      return <Box size={28} strokeWidth={1.6} />;
  }
}

function ShelvesSvg() {
  return (
    <svg width={64} height={64} viewBox="0 0 64 64" fill="none">
      <rect x="10" y="14" width="44" height="42" rx="6" stroke="currentColor" strokeWidth="1.4" opacity="0.32" />
      <line x1="10" y1="28" x2="54" y2="28" stroke="currentColor" strokeWidth="1.2" opacity="0.45" />
      <line x1="10" y1="40" x2="54" y2="40" stroke="currentColor" strokeWidth="1.2" opacity="0.45" />
    </svg>
  );
}

function MapSvg() {
  return (
    <svg width={64} height={64} viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="14" stroke="currentColor" strokeWidth="1.2" opacity="0.32" />
      <circle cx="32" cy="32" r="22" stroke="currentColor" strokeWidth="1.1" opacity="0.18" strokeDasharray="2 4" />
      <circle cx="14" cy="22" r="2" fill="currentColor" opacity="0.7" />
      <circle cx="48" cy="20" r="2" fill="currentColor" opacity="0.7" />
      <circle cx="22" cy="46" r="2" fill="currentColor" opacity="0.7" />
      <circle cx="44" cy="46" r="2" fill="currentColor" opacity="0.7" />
      <path d="M14 22 L32 32 L48 20" stroke="currentColor" strokeWidth="1" opacity="0.55" />
      <path d="M22 46 L32 32 L44 46" stroke="currentColor" strokeWidth="1" opacity="0.55" />
    </svg>
  );
}

function SpiralSvg() {
  return (
    <svg width={64} height={64} viewBox="0 0 64 64" fill="none">
      <path
        d="M32 32 m -22 0 a 22 22 0 1 1 44 0 a 17 17 0 1 1 -34 0 a 12 12 0 1 1 24 0 a 7 7 0 1 1 -14 0 a 4 4 0 1 1 8 0"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.45"
      />
    </svg>
  );
}

function TrailSvg() {
  return (
    <svg width={64} height={64} viewBox="0 0 64 64" fill="none">
      <path
        d="M8 50 C 16 40, 22 36, 28 32 S 40 16, 56 12"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeDasharray="3 4"
        opacity="0.45"
      />
      <circle cx="8"  cy="50" r="2.4" fill="currentColor" />
      <circle cx="28" cy="32" r="2.4" fill="currentColor" />
      <circle cx="56" cy="12" r="2.4" fill="currentColor" />
    </svg>
  );
}

function PanelSvg() {
  return (
    <svg width={64} height={64} viewBox="0 0 64 64" fill="none">
      <rect x="8" y="10" width="48" height="44" rx="8" stroke="currentColor" strokeWidth="1.2" opacity="0.32" />
      <line x1="8" y1="22" x2="56" y2="22" stroke="currentColor" strokeWidth="1.1" opacity="0.4" />
      <rect x="14" y="14" width="20" height="4" rx="2" fill="currentColor" opacity="0.4" />
      <circle cx="48" cy="16" r="1.4" fill="currentColor" />
      <circle cx="44" cy="16" r="1.4" fill="currentColor" />
    </svg>
  );
}

function LoopSvg() {
  return (
    <svg width={64} height={64} viewBox="0 0 64 64" fill="none">
      <path
        d="M16 32 a 16 16 0 1 1 32 0 a 12 12 0 1 1 -24 0 a 8 8 0 1 1 16 0 a 4 4 0 1 1 -8 0"
        stroke="currentColor"
        strokeWidth="1.2"
        opacity="0.45"
      />
      <circle cx="48" cy="32" r="2.4" fill="currentColor" />
    </svg>
  );
}
