"use client";

/**
 * DocumentCard — premium library card.
 *
 * Shows an impressionistic first-page thumbnail (CSS only — no network),
 * an indexed badge with chunk count, type glyph, hover-lift, parallax-tilt.
 */

import * as React from "react";
import { motion } from "framer-motion";
import { FileText, FileCode, FileType, Files } from "lucide-react";
import { useAetherMotion } from "@/design-system/motion";

export interface DocumentCardData {
  id: string;
  filename: string;
  chunkCount: number;
  status: "indexed" | "indexing" | "queued" | "error";
  sizeBytes?: number;
  type?: "pdf" | "md" | "html" | "txt";
}

interface DocumentCardProps {
  doc: DocumentCardData;
  onOpen?: (id: string) => void;
  onExplore?: (id: string) => void;
}

const PALETTE = [
  ["#A48BFF", "#7AE0A2"],
  ["#E8FF6B", "#A48BFF"],
  ["#7AE0A2", "#E8FF6B"],
  ["#FFB68A", "#A48BFF"],
] as const;

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const ICON_FOR: Record<Required<DocumentCardData>["type"], React.ComponentType<{ size?: number }>> = {
  pdf: FileText,
  md: FileCode,
  html: FileType,
  txt: Files,
};

export const DocumentCard = React.memo(function DocumentCard({
  doc,
  onOpen,
  onExplore,
}: DocumentCardProps) {
  const { reduced } = useAetherMotion();
  const [tilt, setTilt] = React.useState({ x: 0, y: 0 });
  const idx = hash(doc.id) % PALETTE.length;
  const [a, b] = PALETTE[idx];
  const Icon = ICON_FOR[doc.type ?? "pdf"];

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reduced) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: x * -1.6, y: y * 1.6 });
  }

  return (
    <motion.button
      onClick={() => onOpen?.(doc.id)}
      onMouseMove={handleMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        padding: 12,
        background: "var(--aether-glass-default)",
        border: "1px solid var(--aether-border-subtle)",
        borderRadius: 18,
        textAlign: "left",
        cursor: "pointer",
        backdropFilter: "blur(16px) saturate(160%)",
        WebkitBackdropFilter: "blur(16px) saturate(160%)",
        boxShadow:
          "0 1px 0 rgba(255,255,255,0.05) inset, 0 18px 40px -22px rgba(0,0,0,0.55)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          transform: reduced
            ? undefined
            : `perspective(900px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
          transformStyle: "preserve-3d",
          transition: "transform 200ms ease-out",
          background: `linear-gradient(140deg, ${a}22 0%, ${b}11 60%, transparent 100%)`,
          border: "1px solid var(--aether-border-subtle)",
          borderRadius: 14,
          aspectRatio: "4 / 5",
          padding: 12,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* impressionistic content lines */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 18 }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <span
              key={i}
              style={{
                display: "block",
                height: 2,
                width: `${60 + ((i * 7) % 35)}%`,
                background: `linear-gradient(90deg, ${a} 0%, ${b} 100%)`,
                opacity: 0.18 + ((i * 13) % 7) * 0.04,
                borderRadius: 2,
              }}
            />
          ))}
        </div>
        {/* type glyph */}
        <span
          aria-hidden
          style={{
            position: "absolute",
            top: 10,
            left: 12,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "3px 8px",
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            border: "1px solid var(--aether-border-subtle)",
            borderRadius: 999,
            fontSize: 10,
            color: "var(--aether-text-primary)",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          <Icon size={11} />
          {doc.type ?? "pdf"}
        </span>
        {/* status badge */}
        <span
          aria-hidden
          style={{
            position: "absolute",
            top: 10,
            right: 12,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "3px 8px",
            background: "rgba(0,0,0,0.55)",
            border: "1px solid var(--aether-border-subtle)",
            borderRadius: 999,
            color:
              doc.status === "indexed"
                ? "#7AE0A2"
                : doc.status === "indexing"
                ? "#E8B86B"
                : "#FF6E7A",
            fontSize: 10,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: 999,
              background: "currentColor",
              boxShadow: "0 0 6px currentColor",
            }}
          />
          {doc.status}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <span
          style={{
            fontSize: 13.5,
            color: "var(--aether-text-primary)",
            letterSpacing: "-0.01em",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: "100%",
          }}
        >
          {doc.filename}
        </span>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 11,
            color: "var(--aether-text-tertiary)",
            letterSpacing: "0.04em",
          }}
        >
          <span>{doc.chunkCount} chunks</span>
          {doc.sizeBytes !== undefined && (
            <>
              <span style={{ width: 3, height: 3, borderRadius: 999, background: "currentColor" }} />
              <span>{kb(doc.sizeBytes)}</span>
            </>
          )}
          <div style={{ flex: 1 }} />
          {onExplore && (
            <span
              role="button"
              aria-label="Explore"
              onClick={(e) => {
                e.stopPropagation();
                onExplore(doc.id);
              }}
              style={{
                padding: "3px 8px",
                color: "var(--aether-text-secondary)",
                borderRadius: 999,
                border: "1px solid var(--aether-border-subtle)",
                transition: "color 160ms ease, border-color 160ms ease",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--aether-text-accent)";
                e.currentTarget.style.borderColor = "var(--aether-border-accent)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--aether-text-secondary)";
                e.currentTarget.style.borderColor = "var(--aether-border-subtle)";
              }}
            >
              explore
            </span>
          )}
        </div>
      </div>
    </motion.button>
  );
});

function kb(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}
