"use client";

/**
 * DocumentCard v2 — premium library card.
 *
 * Features:
 *   - Cursor-following rim light via CSS variable updated on mouse move.
 *   - Animated 1px emerald border that types-on when selected.
 *   - Impressionistic preview (CSS-only, no network).
 *   - Status badge, chunk count, token count, upload date.
 *   - Animated progress ring for "indexing" / "queued".
 *   - Parallax tilt within card using transform-perspective.
 */

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  FileCode,
  FileType,
  Files,
  Pin,
} from "lucide-react";
import { useAetherMotion } from "@/design-system/motion";
import type { AppDocument } from "./document-model";

export interface DocumentCardProps {
  doc: AppDocument;
  selected?: boolean;
  onSelect?: (id: string, next: boolean) => void;
  onOpen?: (id: string) => void;
  onExplore?: (id: string) => void;
}

const PALETTE = [
  ["#A48BFF", "#7AE0A2"],
  ["#E8FF6B", "#A48BFF"],
  ["#7AE0A2", "#E8FF6B"],
  ["#FFB68A", "#A48BFF"],
  ["#E8FF6B", "#7AE0A2"],
] as const;

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const ICON_FOR: Record<AppDocument["type"], React.ComponentType<{ size?: number }>> = {
  pdf: FileText,
  md: FileCode,
  html: FileType,
  txt: Files,
};

const STATUS_COLOR: Record<AppDocument["status"], string> = {
  indexed: "#7AE0A2",
  indexing: "#E8B86B",
  queued: "#9BC5FF",
  error: "#FF6E7A",
};

function formatDate(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.UTC(2026, 0, 14);
  const diff = Math.max(0, now - then);
  const day = 1000 * 60 * 60 * 24;
  const days = Math.floor(diff / day);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

function formatTokens(n: number): string {
  if (n < 1000) return `${n}`;
  if (n < 10000) return `${(n / 1000).toFixed(1)}k`;
  if (n < 100000) return `${Math.round(n / 1000)}k`;
  return `${(n / 1000).toFixed(0)}k`;
}

function formatBytes(n: number | undefined): string {
  if (!n) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export const DocumentCard = React.memo(function DocumentCard({
  doc,
  selected,
  onSelect,
  onOpen,
  onExplore,
}: DocumentCardProps) {
  const { reduced } = useAetherMotion();
  const ref = React.useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = React.useState({ x: 0, y: 0 });
  const [hovered, setHovered] = React.useState(false);
  const idx = hash(doc.id) % PALETTE.length;
  const [a, b] = PALETTE[idx];
  const Icon = ICON_FOR[doc.type];
  const statusColor = STATUS_COLOR[doc.status];
  const inProgress = doc.status === "indexing" || doc.status === "queued";

  React.useEffect(() => {
    if (reduced) return;
    let rafId = 0;
    const tick = () => {
      const node = ref.current?.querySelector<HTMLDivElement>("[data-rim]");
      if (node && ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const target = lastPointerRef.current;
        if (target) {
          const x = ((target.x - rect.left) / rect.width) * 100;
          const y = ((target.y - rect.top) / rect.height) * 100;
          node.style.setProperty("--rim-x", `${x}%`);
          node.style.setProperty("--rim-y", `${y}%`);
        }
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [reduced]);

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reduced) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: x * -1.6, y: y * 1.6 });
    lastPointerRef.current = { x: e.clientX, y: e.clientY };
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setTilt({ x: 0, y: 0 });
        lastPointerRef.current = null;
      }}
      onClick={() => onOpen?.(doc.id)}
      whileHover={reduced ? undefined : { y: -4 }}
      transition={{ type: "spring", stiffness: 280, damping: 24 }}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        padding: 12,
        background: "var(--aether-glass-default)",
        border: `1px solid ${selected ? "var(--aether-border-accent)" : "var(--aether-border-subtle)"}`,
        borderRadius: 18,
        cursor: "pointer",
        backdropFilter: "blur(16px) saturate(160%)",
        WebkitBackdropFilter: "blur(16px) saturate(160%)",
        boxShadow: selected
          ? "0 1px 0 rgba(255,255,255,0.06) inset, 0 24px 50px -22px rgba(0,0,0,0.55), 0 0 30px -8px rgba(232,255,107,0.55)"
          : "0 1px 0 rgba(255,255,255,0.05) inset, 0 18px 40px -22px rgba(0,0,0,0.55)",
        overflow: "hidden",
        transformStyle: "preserve-3d",
      }}
    >
      <div
        aria-hidden
        data-rim
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          opacity: hovered ? 1 : 0,
          transition: "opacity 200ms ease",
          background:
            "radial-gradient(240px circle at var(--rim-x, 50%) var(--rim-y, 50%), rgba(232,255,107,0.18) 0%, transparent 60%)",
          mixBlendMode: "screen",
        }}
      />
      {selected && (
        <motion.span
          aria-hidden
          initial={{ scale: 0.94, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 320, damping: 24 }}
          style={{
            position: "absolute",
            inset: -1,
            pointerEvents: "none",
            borderRadius: 18,
            border: "1.5px solid var(--aether-text-accent)",
            boxShadow: "0 0 16px rgba(232,255,107,0.45)",
          }}
        />
      )}
      <div
        style={{
          position: "relative",
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
          overflow: "hidden",
        }}
      >
        {doc.snippet && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              paddingTop: 18,
              transform: hovered ? "translateZ(8px)" : "translateZ(0)",
              transition: "transform 200ms ease-out",
            }}
          >
            {Array.from({ length: 10 }).map((_, i) => (
              <span
                key={i}
                style={{
                  display: "block",
                  height: 2,
                  width: `${55 + ((i * 11 + hash(doc.id + i)) % 45)}%`,
                  background: `linear-gradient(90deg, ${a} 0%, ${b} 100%)`,
                  opacity: 0.22 + ((i * 13) % 7) * 0.05,
                  borderRadius: 2,
                }}
              />
            ))}
            <span
              style={{
                marginTop: 6,
                fontSize: 10,
                color: "var(--aether-text-secondary)",
                lineHeight: 1.4,
                letterSpacing: "0.02em",
                opacity: 0.85,
              }}
            >
              {doc.snippet.slice(0, 90)}…
            </span>
          </div>
        )}
        <span
          aria-hidden
          style={{
            position: "absolute",
            top: 10,
            left: 12,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "3px 9px",
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            border: "1px solid var(--aether-border-subtle)",
            borderRadius: 999,
            fontSize: 10,
            color: "var(--aether-text-primary)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          <Icon size={11} />
          {doc.type}
        </span>
        {doc.pinned && (
          <span
            aria-hidden
            style={{
              position: "absolute",
              top: 10,
              right: 12,
              display: "inline-flex",
              alignItems: "center",
              padding: 4,
              background: "rgba(0,0,0,0.55)",
              border: "1px solid var(--aether-border-subtle)",
              borderRadius: 999,
              color: "#E8B86B",
            }}
          >
            <Pin size={11} />
          </span>
        )}
        {inProgress ? (
          <div
            aria-hidden
            style={{ position: "absolute", right: 10, top: 44, width: 30, height: 30 }}
          >
            <ProgressRing progress={doc.embeddingProgress ?? 0} color={statusColor} />
          </div>
        ) : (
          <span
            aria-hidden
            style={{
              position: "absolute",
              top: 10,
              right: 12,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "3px 9px",
              background: "rgba(0,0,0,0.55)",
              border: "1px solid var(--aether-border-subtle)",
              borderRadius: 999,
              color: statusColor,
              fontSize: 10,
              letterSpacing: "0.08em",
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
        )}
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
          <span style={{ width: 3, height: 3, borderRadius: 999, background: "currentColor" }} />
          <span>{formatTokens(doc.tokenCount ?? 0)} tokens</span>
          <span style={{ width: 3, height: 3, borderRadius: 999, background: "currentColor" }} />
          <span>{formatDate(doc.uploadedAt)}</span>
          <span style={{ width: 3, height: 3, borderRadius: 999, background: "currentColor" }} />
          <span>{formatBytes(doc.sizeBytes)}</span>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          top: 8,
          left: 8,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <SelectionToggle
          selected={!!selected}
          onToggle={() => onSelect?.(doc.id, !selected)}
          aria-label={selected ? "Deselect" : "Select"}
        />
      </div>
      <AnimatePresence>
        {hovered && onExplore && (
          <motion.button
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => {
              e.stopPropagation();
              onExplore(doc.id);
            }}
            style={{
              position: "absolute",
              right: 12,
              bottom: 12,
              padding: "5px 10px",
              fontSize: 11,
              color: "var(--aether-text-secondary)",
              background: "rgba(0,0,0,0.55)",
              border: "1px solid var(--aether-border-subtle)",
              borderRadius: 999,
              cursor: "pointer",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              transition: "all 160ms ease",
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
            Explore
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

const lastPointerRef: { current: { x: number; y: number } | null } = { current: null };

const SelectionToggle = React.memo(function SelectionToggle({
  selected,
  onToggle,
  ...rest
}: {
  selected: boolean;
  onToggle: () => void;
  "aria-label"?: string;
}) {
  return (
    <motion.button
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      whileTap={{ scale: 0.92 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      aria-label={rest["aria-label"]}
      style={{
        display: "grid",
        placeItems: "center",
        width: 22,
        height: 22,
        borderRadius: 6,
        background: selected
          ? "var(--aether-text-accent)"
          : "rgba(0,0,0,0.55)",
        border: `1px solid ${selected ? "var(--aether-text-accent)" : "var(--aether-border-default)"}`,
        color: selected ? "var(--aether-text-on-accent)" : "var(--aether-text-secondary)",
        cursor: "pointer",
        transition: "all 180ms ease",
        boxShadow: selected ? "0 0 12px rgba(232,255,107,0.45)" : "none",
      }}
    >
      {selected ? (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <path
            d="M5 12.5l4.5 4.5L19 7"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <span style={{ width: 10, height: 10, display: "block", borderRadius: 3 }} />
      )}
    </motion.button>
  );
});

const ProgressRing = React.memo(function ProgressRing({
  progress,
  color,
}: {
  progress: number;
  color: string;
}) {
  const r = 11;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 28 28" width="28" height="28">
      <circle
        cx="14"
        cy="14"
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="2"
      />
      <motion.circle
        cx="14"
        cy="14"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray={`${(c * progress).toFixed(2)} ${c.toFixed(2)}`}
        transform="rotate(-90 14 14)"
        initial={false}
        animate={{ strokeDasharray: `${(c * progress).toFixed(2)} ${c.toFixed(2)}` }}
        transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
        style={{ filter: `drop-shadow(0 0 4px ${color})` }}
      />
    </svg>
  );
});
