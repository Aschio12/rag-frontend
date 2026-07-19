"use client";

/**
 * ImportHistory — lightweight paper-tape of recent uploads.
 *
 * Pure presentation. Renders a tiny vertical timeline of past uploads.
 */

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileCheck2, AlertTriangle, Loader2, Clock } from "lucide-react";
import type { AppDocument } from "./document-model";

interface ImportHistoryProps {
  limit?: number;
  source?: AppDocument[];
}

function relative(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.UTC(2026, 0, 14);
  const diff = Math.max(0, now - then);
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `${days}d`;
}

export const ImportHistory = React.memo(function ImportHistory({
  limit = 6,
  source,
}: ImportHistoryProps) {
  const items: AppDocument[] = React.useMemo(() => {
    const base = source ?? defaultHistory();
    return base
      .slice()
      .sort(
        (a, b) =>
          new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
      )
      .slice(0, limit);
  }, [limit, source]);

  return (
    <ul
      style={{
        listStyle: "none",
        margin: 0,
        padding: 0,
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      <AnimatePresence>
        {items.map((d, i) => (
          <motion.li
            key={d.id}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.28,
              delay: i * 0.04,
              ease: [0.32, 0.72, 0, 1],
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 10px",
              borderRadius: 12,
              background: "var(--aether-surface-recessed)",
              border: "1px solid var(--aether-border-subtle)",
            }}
          >
            <Dot status={d.status} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  fontSize: 11.5,
                  color: "var(--aether-text-primary)",
                  margin: 0,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {d.filename}
              </p>
              <p
                style={{
                  fontSize: 9.5,
                  color: "var(--aether-text-muted)",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  margin: "2px 0 0",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Clock size={9} />
                {relative(d.uploadedAt)} ago · {d.chunkCount} chunks
              </p>
            </div>
            <span
              style={{
                fontSize: 10,
                color:
                  d.status === "indexed"
                    ? "#7AE0A2"
                    : d.status === "indexing"
                    ? "#E8B86B"
                    : d.status === "error"
                    ? "#FF6E7A"
                    : "var(--aether-text-tertiary)",
                letterSpacing: "0.04em",
              }}
            >
              {d.status}
            </span>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
});

function Dot({ status }: { status: AppDocument["status"] }) {
  const color =
    status === "indexed"
      ? "#7AE0A2"
      : status === "indexing"
      ? "#E8B86B"
      : status === "error"
      ? "#FF6E7A"
      : "#9BC5FF";
  return (
    <span
      style={{
        display: "grid",
        placeItems: "center",
        width: 22,
        height: 22,
        borderRadius: 999,
        background: "rgba(0,0,0,0.45)",
        border: "1px solid var(--aether-border-subtle)",
        color,
      }}
    >
      {status === "indexed" ? (
        <FileCheck2 size={11} />
      ) : status === "error" ? (
        <AlertTriangle size={11} />
      ) : status === "indexing" ? (
        <Loader2
          size={11}
          className="animate-spin"
          style={{ animationDuration: "1.6s" }}
        />
      ) : (
        <span style={{ width: 6, height: 6, borderRadius: 999, background: color }} />
      )}
    </span>
  );
}

function defaultHistory(): AppDocument[] {
  return [
    {
      id: "hist-1",
      filename: "Brand Voice Standards.md",
      type: "md",
      status: "indexed",
      chunkCount: 12,
      uploadedAt: new Date(Date.UTC(2026, 0, 14, 9, 25)).toISOString(),
      tokenCount: 3230,
      snippet: "Tone is direct. Sentences average 14 words…",
    },
    {
      id: "hist-2",
      filename: "Roadmap Q1.pdf",
      type: "pdf",
      status: "indexed",
      chunkCount: 21,
      uploadedAt: new Date(Date.UTC(2026, 0, 13, 14, 12)).toISOString(),
      tokenCount: 8120,
      snippet: "Spring release ships the new node editor…",
    },
    {
      id: "hist-3",
      filename: "Onboarding Scratch.html",
      type: "html",
      status: "indexing",
      chunkCount: 6,
      uploadedAt: new Date(Date.UTC(2026, 0, 13, 10, 7)).toISOString(),
      tokenCount: 1010,
      snippet: "Add a new collection, share it, refine…",
    },
    {
      id: "hist-4",
      filename: "Sales Playbook.md",
      type: "md",
      status: "indexed",
      chunkCount: 18,
      uploadedAt: new Date(Date.UTC(2026, 0, 12, 16, 14)).toISOString(),
      tokenCount: 6240,
      snippet: "First call: lead with the developer's pain…",
    },
  ];
}
