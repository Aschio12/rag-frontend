"use client";

/**
 * Inspector v2 — concrete section panels (Sources, Timeline, Memory, Context,
 * Files, Token usage).
 */

import * as React from "react";
import { motion } from "framer-motion";
import {
  FileSearch2,
  Brain,
  Database,
  Folder,
  Files,
  BarChart3,
  Hash,
  CalendarClock,
} from "lucide-react";
import { useAetherMotion } from "@/design-system/motion";
import {
  sampleSources,
  sampleMemory,
  sampleFiles,
  sampleTokenUsageByDay,
  type InspectorSource,
  type TokenUsageByDay,
  type MemoryCard,
  type InspectorFile,
} from "./inspector-model";

/* ─── Sources panel ──────────────────────────────────────────────────── */

export const InspectorSources = React.memo(function InspectorSources() {
  return (
    <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
      {sampleSources.map((s, i) => (
        <SourceRow key={s.id} source={s} index={i} />
      ))}
    </ul>
  );
});

function SourceRow({ source, index }: { source: InspectorSource; index: number }) {
  const { reduced } = useAetherMotion();
  const tone = source.score > 0.8 ? "#7AE0A2" : source.score > 0.6 ? "#E8B86B" : "#9BC5FF";
  return (
    <motion.li
      initial={reduced ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay: index * 0.04, ease: [0.32, 0.72, 0, 1] }}
      style={{
        borderRadius: 14,
        padding: "10px 12px",
        background: "var(--aether-surface-recessed)",
        border: "1px solid var(--aether-border-subtle)",
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <FileSearch2 size={12} strokeWidth={1.6} style={{ color: "var(--aether-text-tertiary)" }} />
        <span style={{ fontSize: 12, color: "var(--aether-text-primary)", letterSpacing: "-0.005em", flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {source.document}
          {source.page !== undefined && (
            <span style={{ color: "var(--aether-text-muted)", marginLeft: 6 }}>· p.{source.page}</span>
          )}
        </span>
        <span style={{ fontSize: 10, color: tone, padding: "2px 8px", border: `1px solid ${tone}40`, borderRadius: 999 }}>
          {Math.round(source.score * 100)}%
        </span>
      </div>
      <p style={{ fontSize: 11, color: "var(--aether-text-secondary)", lineHeight: 1.55, letterSpacing: "-0.005em", margin: 0 }}>
        {source.excerpt}
      </p>
      <span style={{ fontSize: 9.5, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--aether-text-muted)" }}>
        collected {formatRel(source.collectedAt)}
      </span>
    </motion.li>
  );
}

/* ─── Timeline panel ─────────────────────────────────────────────────── */

export const InspectorTimeline = React.memo(function InspectorTimeline() {
  return (
    <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 6 }}>
      {sampleSources.map((s, i) => (
        <motion.li
          key={s.id}
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.32, delay: i * 0.04 }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 10px",
            borderRadius: 12,
            background: "rgba(255,255,255,0.02)",
            border: "1px solid var(--aether-border-subtle)",
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: 999,
              background: "var(--aether-text-accent)",
              boxShadow: "0 0 8px rgba(232,255,107,0.55)",
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontSize: 11.5,
                color: "var(--aether-text-primary)",
                margin: 0,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                letterSpacing: "-0.005em",
              }}
            >
              {s.document}
            </p>
            <p
              style={{
                fontSize: 9.5,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "var(--aether-text-muted)",
                margin: 0,
              }}
            >
              {formatRel(s.collectedAt)}
            </p>
          </div>
          <CalendarClock size={11} style={{ color: "var(--aether-text-tertiary)" }} />
        </motion.li>
      ))}
    </ul>
  );
});

/* ─── Memory panel ───────────────────────────────────────────────────── */

export const InspectorMemory = React.memo(function InspectorMemory() {
  return (
    <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
      {sampleMemory.map((m, i) => (
        <MemoryRow key={m.id} memory={m} index={i} />
      ))}
    </ul>
  );
});

function MemoryRow({ memory, index }: { memory: MemoryCard; index: number }) {
  const { reduced } = useAetherMotion();
  const tone =
    memory.badge === "stable" ? "#7AE0A2" : memory.badge === "fresh" ? "#E8FF6B" : "#E8B86B";
  return (
    <motion.li
      initial={reduced ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay: index * 0.04 }}
      style={{
        borderRadius: 14,
        padding: "10px 12px",
        background: "var(--aether-surface-recessed)",
        border: "1px solid var(--aether-border-subtle)",
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Brain size={12} strokeWidth={1.6} style={{ color: "var(--aether-text-tertiary)" }} />
        <span style={{ fontSize: 11, color: "var(--aether-text-secondary)", letterSpacing: "0.06em", textTransform: "uppercase", flex: 1 }}>
          {memory.title}
        </span>
        {memory.badge && (
          <span
            style={{
              fontSize: 9,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: tone,
              border: `1px solid ${tone}40`,
              padding: "2px 6px",
              borderRadius: 999,
            }}
          >
            {memory.badge}
          </span>
        )}
      </div>
      <p style={{ fontSize: 12, color: "var(--aether-text-primary)", letterSpacing: "-0.005em", margin: 0 }}>
        {memory.value}
      </p>
      <span style={{ fontSize: 9.5, color: "var(--aether-text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
        updated {formatRel(memory.updatedAt)}
      </span>
    </motion.li>
  );
}

/* ─── Context panel ──────────────────────────────────────────────────── */

export const InspectorContext = React.memo(function InspectorContext() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <ContextCard
        label="Active conversation"
        value="OpenAI Workspace design · 12 messages"
        secondary="Editing last message"
      />
      <ContextCard
        label="Active agent"
        value="Multi-agent orchestrator"
        secondary="5 phases · reasoning live"
      />
      <ContextCard
        label="Knowledge base"
        value="Personal Workspace"
        secondary="12 documents · 2 collections"
      />
      <ContextCard
        label="Voice preference"
        value="Reserved, technical, never breathless."
        secondary="Inherited from Memory."
      />
    </div>
  );
});

function ContextCard({
  label,
  value,
  secondary,
}: {
  label: string;
  value: string;
  secondary: string;
}) {
  return (
    <div
      style={{
        borderRadius: 14,
        padding: "10px 12px",
        background: "var(--aether-surface-recessed)",
        border: "1px solid var(--aether-border-subtle)",
      }}
    >
      <span
        style={{
          fontSize: 9.5,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--aether-text-tertiary)",
        }}
      >
        {label}
      </span>
      <p
        style={{
          fontSize: 13,
          color: "var(--aether-text-primary)",
          letterSpacing: "-0.01em",
          margin: "2px 0 4px",
        }}
      >
        {value}
      </p>
      <span style={{ fontSize: 11, color: "var(--aether-text-tertiary)" }}>{secondary}</span>
    </div>
  );
}

/* ─── Files panel ────────────────────────────────────────────────────── */

export const InspectorFiles = React.memo(function InspectorFiles() {
  const [filter, setFilter] = React.useState<"all" | "pdf" | "md" | "html" | "txt">("all");
  const visible = sampleFiles.filter((f) => filter === "all" || f.type === filter);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {(["all", "pdf", "md", "html", "txt"] as const).map((kind) => {
          const isOn = filter === kind;
          return (
            <button
              key={kind}
              onClick={() => setFilter(kind)}
              aria-pressed={isOn}
              style={{
                padding: "5px 10px",
                fontSize: 10,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: isOn ? "var(--aether-text-on-accent)" : "var(--aether-text-tertiary)",
                background: isOn ? "var(--aether-text-accent)" : "transparent",
                border: "1px solid var(--aether-border-subtle)",
                borderRadius: 999,
                cursor: "pointer",
                transition: "all 160ms ease",
              }}
            >
              {kind === "all" ? "All" : kind.toUpperCase()}
            </button>
          );
        })}
      </div>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 6 }}>
        {visible.map((f, i) => (
          <FileRow key={f.id} file={f} index={i} />
        ))}
        {visible.length === 0 && (
          <li
            style={{
              padding: 12,
              textAlign: "center",
              fontSize: 11,
              color: "var(--aether-text-muted)",
              borderRadius: 12,
              border: "1px dashed var(--aether-border-subtle)",
            }}
          >
            No files yet in this filter.
          </li>
        )}
      </ul>
    </div>
  );
});

function FileRow({ file, index }: { file: InspectorFile; index: number }) {
  const { reduced } = useAetherMotion();
  return (
    <motion.li
      initial={reduced ? false : { opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.03 }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 10px",
        borderRadius: 12,
        background: "rgba(255,255,255,0.02)",
        border: "1px solid var(--aether-border-subtle)",
      }}
    >
      <Folder size={11} strokeWidth={1.6} style={{ color: "var(--aether-text-tertiary)" }} />
      <Files size={11} strokeWidth={1.6} style={{ color: "var(--aether-text-accent)" }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: 11.5,
            color: "var(--aether-text-primary)",
            letterSpacing: "-0.005em",
            margin: 0,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {file.filename}
        </p>
        <p
          style={{
            fontSize: 9.5,
            color: "var(--aether-text-muted)",
            letterSpacing: "0.06em",
            margin: 0,
            textTransform: "uppercase",
          }}
        >
          {file.chunks} chunks · {file.tokens.toLocaleString()} tokens
        </p>
      </div>
    </motion.li>
  );
}

/* ─── Token usage panel ─────────────────────────────────────────────── */

export const InspectorTokenUsage = React.memo(function InspectorTokenUsage() {
  const total = sampleTokenUsageByDay.reduce((acc, d) => acc + d.consumed, 0);
  const budget = sampleTokenUsageByDay[0].budget * sampleTokenUsageByDay.length;
  const today = sampleTokenUsageByDay[sampleTokenUsageByDay.length - 1].consumed;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <StatRow label="Today" value={fmt(today)} secondary="of 30,000 budget" />
      <StatRow
        label="7-day total"
        value={fmt(total)}
        secondary={"capacity " + fmt(budget)}
      />
      <BarChart usageByDay={sampleTokenUsageByDay} />
      <p style={{ fontSize: 11, color: "var(--aether-text-tertiary)", margin: 0, letterSpacing: "0.02em" }}>
        Bars show daily token consumption vs your daily budget. Reading above
        70% lights the chart in lime.
      </p>
    </div>
  );
});

function StatRow({
  label,
  value,
  secondary,
}: {
  label: string;
  value: string;
  secondary?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: 10,
        padding: "10px 12px",
        borderRadius: 14,
        background: "var(--aether-surface-recessed)",
        border: "1px solid var(--aether-border-subtle)",
      }}
    >
      <span
        style={{
          fontSize: 10.5,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--aether-text-tertiary)",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 18,
          letterSpacing: "-0.02em",
          color: "var(--aether-text-primary)",
          marginLeft: "auto",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </span>
      {secondary && (
        <span style={{ fontSize: 10.5, color: "var(--aether-text-muted)" }}>
          {secondary}
        </span>
      )}
    </div>
  );
}

function BarChart({ usageByDay }: { usageByDay: TokenUsageByDay[] }) {
  const max = Math.max(...usageByDay.map((d) => d.consumed));
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: 6,
        height: 120,
        padding: "10px 12px",
        borderRadius: 14,
        background: "var(--aether-surface-recessed)",
        border: "1px solid var(--aether-border-subtle)",
      }}
    >
      {usageByDay.map((d, i) => {
        const pct = (d.consumed / max) * 100;
        const over = d.consumed / d.budget > 0.7;
        return (
          <div
            key={d.iso}
            style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}
          >
            <motion.div
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{
                duration: 0.6,
                delay: i * 0.04,
                ease: [0.32, 0.72, 0, 1],
              }}
              style={{
                transformOrigin: "bottom",
                width: "100%",
                height: `${Math.max(10, pct)}%`,
                borderRadius: 6,
                background: over
                  ? "linear-gradient(180deg, var(--aether-text-accent) 0%, var(--aether-text-iris) 100%)"
                  : "linear-gradient(180deg, rgba(164,139,255,0.6), rgba(164,139,255,0.2))",
                boxShadow: "0 0 8px rgba(164,139,255,0.25)",
              }}
            />
            <span
              style={{
                fontSize: 9.5,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "var(--aether-text-muted)",
              }}
            >
              {d.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ─── helpers ───────────────────────────────────────────────────────── */

function formatRel(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.UTC(2026, 0, 14, 12, 30);
  const diff = Math.max(0, now - then);
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function fmt(n: number): string {
  if (n < 1000) return `${n}`;
  if (n < 10000) return `${(n / 1000).toFixed(1)}k`;
  return `${Math.round(n / 1000)}k`;
}
