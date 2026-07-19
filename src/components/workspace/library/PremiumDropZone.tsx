"use client";

/**
 * PremiumDropZone — drag-and-drop surface with rotating progress rings.
 *
 * Pure presentation. Internally tracks an optional progress via the
 * `upload` prop (0..1) to render sweep + count. Click-through is allowed
 * when `clickable` (the zone itself invokes onPick on click).
 */

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CloudUpload,
  Loader2,
  X,
  FileCheck2,
} from "lucide-react";
import { useAetherMotion } from "@/design-system/motion";

const ACCEPTED = ".pdf,.md,.mdx,.html,.htm,.txt";

export interface UploadTicket {
  id: string;
  name: string;
  sizeBytes: number;
  progress: number;
  status: "queued" | "uploading" | "indexing" | "done" | "error";
  message?: string;
}

interface PremiumDropZoneProps {
  tickets: UploadTicket[];
  dragActive: boolean;
  onDragChange: (active: boolean) => void;
  onFiles: (files: File[]) => void;
  onTicketsChange?: (next: UploadTicket[]) => void;
  compact?: boolean;
}

export const PremiumDropZone = React.memo(function PremiumDropZone({
  tickets,
  dragActive,
  onDragChange,
  onFiles,
  compact = false,
}: PremiumDropZoneProps) {
  const { reduced } = useAetherMotion();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const previewTicks = React.useMemo(
    () => tickets.filter((t) => t.status !== "done" && t.status !== "error"),
    [tickets],
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    onDragChange(false);
    const files = Array.from(e.dataTransfer.files ?? []);
    if (files.length > 0) onFiles(files);
  };

  const handlePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length > 0) onFiles(files);
    e.currentTarget.value = "";
  };

  return (
    <motion.div
      onDragOver={(e) => {
        e.preventDefault();
        onDragChange(true);
      }}
      onDragLeave={() => onDragChange(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      initial={reduced ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
      role="button"
      tabIndex={0}
      style={{
        position: "relative",
        cursor: "pointer",
        padding: compact ? 16 : 22,
        borderRadius: 22,
        border: `1.5px dashed ${
          dragActive ? "var(--aether-border-accent)" : "var(--aether-border-default)"
        }`,
        background: dragActive
          ? "linear-gradient(135deg, rgba(232,255,107,0.06), rgba(164,139,255,0.06))"
          : "var(--aether-glass-soft)",
        backdropFilter: "blur(14px) saturate(160%)",
        WebkitBackdropFilter: "blur(14px) saturate(160%)",
        boxShadow: dragActive
          ? "0 0 36px -8px rgba(232,255,107,0.5)"
          : "0 1px 0 rgba(255,255,255,0.04) inset, 0 14px 30px -16px rgba(0,0,0,0.45)",
        transition: "all 200ms ease",
        display: "flex",
        gap: 16,
        alignItems: "center",
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        multiple
        hidden
        onChange={handlePick}
      />
      <motion.div
        animate={dragActive ? { y: -3, scale: 1.04 } : { y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 320, damping: 22 }}
        style={{
          position: "relative",
          width: compact ? 48 : 60,
          height: compact ? 48 : 60,
          borderRadius: 999,
          display: "grid",
          placeItems: "center",
          background:
            "radial-gradient(circle, rgba(232,255,107,0.18) 0%, rgba(164,139,255,0.18) 60%, transparent 80%)",
          border: "1px solid var(--aether-border-subtle)",
          flexShrink: 0,
        }}
      >
        {dragActive ? (
          <CloudUpload
            size={compact ? 18 : 22}
            strokeWidth={1.6}
            style={{ color: "var(--aether-text-accent)" }}
          />
        ) : (
          <motion.span
            animate={
              reduced
                ? { scale: 1 }
                : { scale: [1, 1.05, 1], opacity: [0.85, 1, 0.85] }
            }
            transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
          >
            <CloudUpload
              size={compact ? 18 : 22}
              strokeWidth={1.6}
              style={{ color: "var(--aether-text-secondary)" }}
            />
          </motion.span>
        )}
      </motion.div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: compact ? 12 : 13.5,
            fontWeight: 500,
            color: "var(--aether-text-primary)",
            letterSpacing: "-0.01em",
            marginBottom: 3,
          }}
        >
          {dragActive ? "Release to add to the queue" : "Drop documents here"}
        </p>
        <p
          style={{
            fontSize: 11,
            color: "var(--aether-text-tertiary)",
            letterSpacing: "0.02em",
          }}
        >
          PDF · Markdown · HTML · Text · max 50MB
        </p>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 6,
          minWidth: 80,
          alignItems: "flex-end",
        }}
      >
        {previewTicks.length > 0 ? (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 10.5,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--aether-text-tertiary)",
            }}
          >
            <Loader2 size={11} className="animate-spin" style={{ animationDuration: "1.6s" }} />
            {previewTicks.length} uploading
          </motion.span>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              inputRef.current?.click();
            }}
            style={{
              padding: "6px 12px",
              fontSize: 11,
              color: "var(--aether-text-primary)",
              background: "rgba(232,255,107,0.12)",
              border: "1px solid var(--aether-border-accent)",
              borderRadius: 999,
              cursor: "pointer",
              letterSpacing: "0.04em",
            }}
          >
            Browse
          </button>
        )}
      </div>

      <AnimatePresence>
        {tickets.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
            style={{
              position: "absolute",
              left: 14,
              right: 14,
              bottom: -8,
              display: "flex",
              flexDirection: "row",
              overflowX: "auto",
              gap: 6,
              paddingTop: 6,
            }}
          >
            {tickets.map((t) => (
              <Ticket key={t.id} ticket={t} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

const Ticket = React.memo(function Ticket({ ticket }: { ticket: UploadTicket }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "5px 10px",
        fontSize: 10.5,
        background: "rgba(11,11,14,0.85)",
        border: "1px solid var(--aether-border-subtle)",
        borderRadius: 999,
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        color:
          ticket.status === "error"
            ? "#FF6E7A"
            : ticket.status === "done"
            ? "#7AE0A2"
            : "var(--aether-text-secondary)",
      }}
    >
      {ticket.status === "done" ? (
        <FileCheck2 size={10.5} />
      ) : ticket.status === "error" ? (
        <X size={10.5} />
      ) : (
        <Loader2 size={10.5} className="animate-spin" style={{ animationDuration: "1.6s" }} />
      )}
      <span
        style={{
          maxWidth: 130,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {ticket.name}
      </span>
    </motion.div>
  );
});
