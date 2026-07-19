"use client";

/**
 * DocumentPreviewModal — preview-before-commit.
 *
 * Shown when a drop completes so the user can review files BEFORE they
 * are committed as source. Pure presentation: it summarizes file
 * metadata, surfaces revue, and offers "Discard" or "Commit".
 */

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  FileCheck2,
  CheckCircle2,
  FileText,
  Clock,
  HardDrive,
} from "lucide-react";
import { useAetherMotion } from "@/design-system/motion";
import type { UploadTicket } from "./PremiumDropZone";

interface DocumentPreviewModalProps {
  tickets: UploadTicket[];
  open: boolean;
  onClose: () => void;
  onCommit: () => void;
  onDiscard: () => void;
}

function fmtBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

export const DocumentPreviewModal = React.memo(function DocumentPreviewModal({
  tickets,
  open,
  onClose,
  onCommit,
  onDiscard,
}: DocumentPreviewModalProps) {
  const { reduced } = useAetherMotion();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="preview-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 80,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            aria-hidden
            onClick={onClose}
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.55)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          />
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={reduced ? { duration: 0.2 } : { type: "spring", stiffness: 240, damping: 26 }}
            role="dialog"
            aria-modal
            aria-label="Review uploads"
            style={{
              position: "relative",
              width: 560,
              maxWidth: "92vw",
              maxHeight: "78dvh",
              display: "flex",
              flexDirection: "column",
              padding: 22,
              borderRadius: 24,
              background: "var(--aether-glass-strong)",
              border: "1px solid var(--aether-border-default)",
              backdropFilter: "blur(28px) saturate(180%)",
              WebkitBackdropFilter: "blur(28px) saturate(180%)",
              boxShadow: "0 32px 64px -16px rgba(0,0,0,0.6)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 14,
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "var(--aether-text-tertiary)",
                  }}
                >
                  Review
                </p>
                <h2
                  style={{
                    fontSize: 17,
                    fontWeight: 500,
                    color: "var(--aether-text-primary)",
                    letterSpacing: "-0.02em",
                    margin: 0,
                  }}
                >
                  {tickets.length} document{tickets.length !== 1 ? "s" : ""} ready
                </h2>
              </div>
              <button
                aria-label="Close"
                onClick={onClose}
                style={{
                  padding: 6,
                  background: "transparent",
                  border: "1px solid var(--aether-border-subtle)",
                  borderRadius: 999,
                  color: "var(--aether-text-tertiary)",
                  cursor: "pointer",
                }}
              >
                <X size={12.5} />
              </button>
            </div>
            <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
              {tickets.map((t) => (
                <div
                  key={t.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: 12,
                    background: "var(--aether-surface-recessed)",
                    border: "1px solid var(--aether-border-subtle)",
                    borderRadius: 14,
                  }}
                >
                  <FileText
                    size={20}
                    strokeWidth={1.5}
                    style={{ color: "var(--aether-text-secondary)" }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: 12.5,
                        color: "var(--aether-text-primary)",
                        margin: 0,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {t.name}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        gap: 12,
                        marginTop: 4,
                        fontSize: 10.5,
                        color: "var(--aether-text-tertiary)",
                        letterSpacing: "0.04em",
                      }}
                    >
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <HardDrive size={11} />
                        {fmtBytes(t.sizeBytes)}
                      </span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <Clock size={11} />
                        {t.status}
                      </span>
                    </div>
                  </div>
                  <CheckCircle2
                    size={18}
                    strokeWidth={1.6}
                    style={{ color: "var(--aether-text-accent)" }}
                  />
                </div>
              ))}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                justifyContent: "flex-end",
                marginTop: 18,
              }}
            >
              <button
                onClick={onDiscard}
                style={{
                  padding: "9px 16px",
                  fontSize: 12,
                  color: "var(--aether-text-secondary)",
                  background: "transparent",
                  border: "1px solid var(--aether-border-subtle)",
                  borderRadius: 999,
                  cursor: "pointer",
                }}
              >
                Discard
              </button>
              <motion.button
                onClick={onCommit}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 320, damping: 22 }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "9px 18px",
                  fontSize: 12,
                  color: "var(--aether-text-on-accent)",
                  background: "var(--aether-text-accent)",
                  border: "none",
                  borderRadius: 999,
                  cursor: "pointer",
                  letterSpacing: "0.04em",
                  boxShadow: "0 0 16px rgba(232,255,107,0.45)",
                }}
              >
                <FileCheck2 size={13} />
                Commit to knowledge base
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
