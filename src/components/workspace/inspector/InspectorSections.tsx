"use client";

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
import { useAgentRunStore } from "@/lib/agent-run-store";
import { useDocsFeed } from "@/lib/docs-feed";
import { useSelectedDocument } from "@/lib/selection-store";
import type { Source } from "@/lib/api";
import { formatRel, fmtTokens } from "./inspector-model";

/* ─── Sources panel ──────────────────────────────────────────────────── */

export const InspectorSources = React.memo(function InspectorSources() {
  const { completed } = useAgentRunStore();
  const sources = completed?.sources ?? [];
  if (sources.length === 0) {
    return <EmptySection message="No sources from the last run." />;
  }
  return (
    <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
      {sources.map((s, i) => (
        <SourceRow key={`${s.doc_id}-${i}`} source={s} index={i} />
      ))}
    </ul>
  );
});

function SourceRow({ source, index }: { source: Source; index: number }) {
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
          {source.filename ?? source.doc_id}
          {source.page_number !== undefined && (
            <span style={{ color: "var(--aether-text-muted)", marginLeft: 6 }}>· p.{source.page_number}</span>
          )}
        </span>
        <span style={{ fontSize: 10, color: tone, padding: "2px 8px", border: `1px solid ${tone}40`, borderRadius: 999 }}>
          {Math.round(source.score * 100)}%
        </span>
      </div>
      <p style={{ fontSize: 11, color: "var(--aether-text-secondary)", lineHeight: 1.55, letterSpacing: "-0.005em", margin: 0 }}>
        {source.text}
      </p>
    </motion.li>
  );
}

/* ─── Timeline panel ─────────────────────────────────────────────────── */

export const InspectorTimeline = React.memo(function InspectorTimeline() {
  const { events } = useAgentRunStore();
  if (events.length === 0) {
    return <EmptySection message="No agent activity yet. Start a conversation." />;
  }
  return (
    <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 6 }}>
      {events.map((ev, i) => (
        <motion.li
          key={`${ev.step ?? ev.event}-${i}`}
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
              background: ev.event === "step_error" ? "#FF6B6B" : "var(--aether-text-accent)",
              boxShadow: ev.event === "step_error"
                ? "0 0 8px rgba(255,107,107,0.55)"
                : "0 0 8px rgba(232,255,107,0.55)",
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
              {ev.label ?? ev.step ?? ev.event}
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
              {ev.duration ? `${(ev.duration / 1000).toFixed(1)}s` : ev.event}
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
  const { completed } = useAgentRunStore();
  if (!completed) {
    return <EmptySection message="No memory yet. Run an agent query first." />;
  }
  const cards: { title: string; value: string; badge: "stable" | "fresh" }[] = [];
  if (completed.plan) {
    cards.push({ title: "Plan", value: completed.plan, badge: "stable" });
  }
  if (completed.critique) {
    cards.push({ title: "Critique", value: completed.critique, badge: "fresh" });
  }
  if (completed.verification?.length) {
    cards.push({
      title: "Verification",
      value: `${completed.verification.filter(v => v.supported).length}/${completed.verification.length} claims supported`,
      badge: "stable",
    });
  }
  if (completed.searchQueries?.length) {
    cards.push({
      title: "Search queries",
      value: completed.searchQueries.join(", "),
      badge: "fresh",
    });
  }
  return (
    <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
      {cards.map((c, i) => (
        <MemoryRow key={c.title} entry={c} index={i} />
      ))}
    </ul>
  );
});

function MemoryRow({ entry, index }: { entry: { title: string; value: string; badge: "stable" | "drift" | "fresh" }; index: number }) {
  const { reduced } = useAetherMotion();
  const tone = entry.badge === "stable" ? "#7AE0A2" : entry.badge === "fresh" ? "#E8FF6B" : "#E8B86B";
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
          {entry.title}
        </span>
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
          {entry.badge}
        </span>
      </div>
      <p style={{ fontSize: 12, color: "var(--aether-text-primary)", letterSpacing: "-0.005em", margin: 0 }}>
        {entry.value}
      </p>
    </motion.li>
  );
}

/* ─── Context panel ──────────────────────────────────────────────────── */

export const InspectorContext = React.memo(function InspectorContext() {
  const { active: agentActive, completed } = useAgentRunStore();
  const selectedDoc = useSelectedDocument();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <ContextCard
        label="Active conversation"
        value={agentActive ? "Agent query in progress" : completed ? "Agent query complete" : "No active conversation"}
        secondary={agentActive ? "Reasoning live" : completed ? `${completed.sources.length} sources` : "Start typing to begin"}
      />
      <ContextCard
        label="Active agent"
        value={agentActive ? "Multi-agent orchestrator" : "Idle"}
        secondary={agentActive ? "Processing" : "Awaiting input"}
      />
      <ContextCard
        label="Selected document"
        value={selectedDoc ?? "None"}
        secondary={selectedDoc ? "Highlighted in Graph & Map" : "Open a document from Library"}
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
  const { docs, loading, error } = useDocsFeed();
  const [filter, setFilter] = React.useState<"all" | "pdf" | "md" | "html" | "txt">("all");
  const visible = docs.filter((f) => filter === "all" || f.type === filter);

  if (loading) {
    return <EmptySection message="Loading files…" />;
  }
  if (error) {
    return <EmptySection message={`Error: ${error}`} />;
  }
  if (docs.length === 0) {
    return <EmptySection message="No files yet. Upload a document." />;
  }

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
            No {filter === "all" ? "" : filter.toUpperCase()} files.
          </li>
        )}
      </ul>
    </div>
  );
});

function FileRow({ file, index }: { file: { id: string; filename: string; type: string; chunkCount: number; sizeBytes?: number; uploadedAt: string }; index: number }) {
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
          {file.chunkCount} chunks{file.sizeBytes ? ` · ${fmtTokens(file.sizeBytes)}B` : ""}
        </p>
      </div>
    </motion.li>
  );
}

/* ─── Token usage panel ─────────────────────────────────────────────── */

export const InspectorTokenUsage = React.memo(function InspectorTokenUsage() {
  const { events, completed } = useAgentRunStore();

  const dailyData = React.useMemo(() => {
    if (!completed || events.length === 0) {
      return [];
    }

    const groups = new Map<string, { consumed: number; budget: number; label: string; iso: string }>();

    const baseBudget = 30000;

    events.forEach((ev) => {
      const date = new Date();
      const iso = date.toISOString().slice(0, 10);
      if (!groups.has(iso)) {
        groups.set(iso, { consumed: 0, budget: baseBudget, label: date.toLocaleDateString("en", { weekday: "short" }), iso });
      }
      const g = groups.get(iso)!;
      g.consumed += Math.round((ev.duration ?? 100) / 10);
    });

    return Array.from(groups.values()).slice(-7);
  }, [events, completed]);

  const total = dailyData.reduce((acc, d) => acc + d.consumed, 0);
  const budget = dailyData.length * (dailyData[0]?.budget ?? 30000);
  const today = dailyData[dailyData.length - 1]?.consumed ?? 0;

  if (dailyData.length === 0) {
    return <EmptySection message="No token data yet. Run an agent query." />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <StatRow label="Today" value={fmtTokens(today)} secondary={`of ${fmtTokens(30000)} budget`} />
      <StatRow
        label="Session total"
        value={fmtTokens(total)}
        secondary={"capacity " + fmtTokens(budget)}
      />
      <BarChart usageByDay={dailyData} />
      <p style={{ fontSize: 11, color: "var(--aether-text-tertiary)", margin: 0, letterSpacing: "0.02em" }}>
        Bars show estimated per-day token consumption vs daily budget.
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

function BarChart({ usageByDay }: { usageByDay: { consumed: number; budget: number; label: string; iso: string }[] }) {
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

/* ─── Empty state ────────────────────────────────────────────────────── */

function EmptySection({ message }: { message: string }) {
  return (
    <div
      style={{
        padding: "24px 16px",
        textAlign: "center",
        fontSize: 12,
        color: "var(--aether-text-muted)",
        borderRadius: 14,
        border: "1px dashed var(--aether-border-subtle)",
        letterSpacing: "-0.005em",
      }}
    >
      {message}
    </div>
  );
}
