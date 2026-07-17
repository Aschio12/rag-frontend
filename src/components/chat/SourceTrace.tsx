"use client";

/**
 * SourceTrace — vertical glowing trace attached to assistant messages.
 *
 * The trace animates from 0% to its final proportional length once the
 * assistant response settles. Source chips attach at the trace's base.
 */

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import type { Source } from "@/lib/api";
import { useAetherMotion } from "@/design-system/motion";

interface SourceTraceProps {
  sources?: Source[];
  loading?: boolean;
  onOpenSource?: (i: number) => void;
}

export const SourceTrace = React.memo(function SourceTrace({
  sources,
  loading,
  onOpenSource,
}: SourceTraceProps) {
  const { reduced } = useAetherMotion();
  const list = sources ?? [];
  const visible = loading || list.length > 0;
  const targetLen = Math.min(list.length, 5); // cap chip count

  if (!visible) return null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "stretch",
        gap: 14,
        marginTop: 16,
        marginLeft: 4,
      }}
    >
      {/* Trace stem */}
      <div
        style={{
          position: "relative",
          flexShrink: 0,
          width: 2,
          minHeight: 36,
          marginTop: 6,
          marginBottom: 6,
          background:
            "linear-gradient(180deg, transparent, var(--aether-border-subtle) 8%, var(--aether-border-subtle) 92%, transparent)",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <motion.span
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={
            reduced
              ? { duration: 0.2 }
              : { duration: 0.6, ease: [0.32, 0.72, 0, 1] }
          }
          style={{
            position: "absolute",
            inset: 0,
            transformOrigin: "top",
            background:
              "linear-gradient(180deg, var(--aether-text-accent) 0%, var(--aether-text-iris) 100%)",
            boxShadow:
              "0 0 8px rgba(232,255,107,0.55), 0 0 14px rgba(164,139,255,0.45)",
          }}
        />
      </div>

      {/* Source chip rail */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 6,
          flex: 1,
          alignItems: "center",
        }}
      >
        <AnimatePresence>
          {loading && (
            <motion.span
              key="loading-chip"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "5px 10px",
                fontSize: 10.5,
                letterSpacing: "0.04em",
                color: "var(--aether-text-tertiary)",
                background: "var(--aether-surface-recessed)",
                border: "1px solid var(--aether-border-subtle)",
                borderRadius: 999,
              }}
            >
              <Sparkles size={11} style={{ color: "var(--aether-text-accent)" }} />
              Searching sources…
            </motion.span>
          )}
          {!loading &&
            list.slice(0, 5).map((s, i) => (
              <motion.button
                key={`${s.doc_id}-${i}`}
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: 0.28,
                  delay: i * 0.04,
                  ease: [0.32, 0.72, 0, 1],
                }}
                whileHover={{ y: -2, scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onOpenSource?.(i)}
                title={s.text}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 12px",
                  background: "var(--aether-glass-default)",
                  border: "1px solid var(--aether-border-subtle)",
                  borderRadius: 999,
                  color: "var(--aether-text-secondary)",
                  fontSize: 11,
                  letterSpacing: "0.02em",
                  cursor: "pointer",
                  transition:
                    "color 160ms ease, border-color 160ms ease",
                  backdropFilter: "blur(10px) saturate(160%)",
                  WebkitBackdropFilter: "blur(10px) saturate(160%)",
                  boxShadow:
                    "0 1px 0 rgba(255,255,255,0.04) inset, 0 6px 20px -12px rgba(0,0,0,0.45)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--aether-text-primary)";
                  e.currentTarget.style.borderColor = "var(--aether-border-accent)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--aether-text-secondary)";
                  e.currentTarget.style.borderColor = "var(--aether-border-subtle)";
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 999,
                    background:
                      s.score > 0.8
                        ? "#7AE0A2"
                        : s.score > 0.5
                        ? "#E8B86B"
                        : "#FF6E7A",
                    boxShadow: "0 0 6px currentColor",
                  }}
                />
                <span style={{ maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {s.filename || `Source ${i + 1}`}
                </span>
                {s.page_number ? (
                  <span style={{ color: "var(--aether-text-muted)", fontSize: 10 }}>
                    p.{s.page_number}
                  </span>
                ) : null}
              </motion.button>
            ))}
        </AnimatePresence>
      </div>
    </div>
  );
});
