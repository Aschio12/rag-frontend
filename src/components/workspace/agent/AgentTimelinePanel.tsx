"use client";

/**
 * AgentTimelinePanel — cinematic Agent Timeline (workspace body).
 *
 * Composition:
 *  - Cinematic dial at top: total elapsed time + token progress.
 *  - Vertical timeline of phases. Each phase has a status arc, label,
 *    duration, confidence (when complete), token cost.
 *  - Expandable step rows: each phase can be unrolled to see sub-steps.
 *  - Per-phase skeletons for `pending` / `running`.
 */

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronRight,
  CircleDashed,
  CircleDot,
  CircleCheck,
  CircleAlert,
  Timer,
  Cpu,
  Hourglass,
} from "lucide-react";
import { useAetherMotion } from "@/design-system/motion";
import {
  buildSampleTimeline,
  type TimelinePhase,
  type TimelineRun,
  type TimelineStep,
} from "./timeline-model";

const TONE_COLOR: Record<TimelinePhase["tone"], string> = {
  iris: "#A48BFF",
  chrome: "#9BC5FF",
  mint: "#7AE0A2",
  amber: "#E8B86B",
  lime: "#E8FF6B",
};

export const AgentTimelinePanel = React.memo(function AgentTimelinePanel() {
  const { reduced } = useAetherMotion();
  const [run] = React.useState<TimelineRun>(() => buildSampleTimeline());
  const [openSteps, setOpenSteps] = React.useState<Set<string>>(() => {
    // auto-expand the running phase
    const next = new Set<string>();
    if (run.activeId) next.add(run.activeId);
    return next;
  });

  const toggleSteps = (id: string) => {
    setOpenSteps((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const total = run.tokensExpected;
  const consumed = run.tokensConsumed;

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.36, ease: [0.32, 0.72, 0, 1] }}
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "8px 16px 14px",
        gap: 14,
      }}
    >
      {/* Cinematic Dial */}
      <CinematicDial run={run} />

      {/* Token progress */}
      <div
        style={{
          padding: "10px 14px",
          borderRadius: 16,
          background: "var(--aether-surface-recessed)",
          border: "1px solid var(--aether-border-subtle)",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <Cpu size={13} strokeWidth={1.6} style={{ color: "var(--aether-text-tertiary)" }} />
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 11,
              color: "var(--aether-text-primary)",
              letterSpacing: "-0.005em",
              marginBottom: 6,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>
              <span style={{ color: "var(--aether-text-accent)" }}>{consumed}</span>
              <span style={{ color: "var(--aether-text-muted)", letterSpacing: "0.04em" }}>
                {" / "}
                {total} tokens
              </span>
            </span>
            <span
              style={{
                fontSize: 10,
                color: "var(--aether-text-tertiary)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              {Math.round(run.tokenProgress * 100)}%
            </span>
          </div>
          <div
            style={{
              position: "relative",
              height: 4,
              borderRadius: 2,
              background: "rgba(255,255,255,0.05)",
              overflow: "hidden",
            }}
          >
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: `${run.tokenProgress * 100}%` }}
              transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
              style={{
                height: "100%",
                background:
                  "linear-gradient(90deg, var(--aether-text-accent) 0%, var(--aether-text-iris) 100%)",
                boxShadow: "0 0 8px rgba(232,255,107,0.45)",
              }}
            />
          </div>
        </div>
      </div>

      {/* Phases */}
      <ul
        style={{
          listStyle: "none",
          margin: 0,
          padding: 0,
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {run.phases.map((phase, i) => (
          <PhaseRow
            key={phase.id}
            phase={phase}
            index={i}
            open={openSteps.has(phase.id)}
            onToggle={() => toggleSteps(phase.id)}
          />
        ))}
      </ul>
    </motion.div>
  );
});

function CinematicDial({ run }: { run: TimelineRun }) {
  const { reduced } = useAetherMotion();
  // Total elapsed: sum of completed durations + half of running + 0 for pending
  const elapsed = run.phases.reduce((acc, p) => {
    if (p.status === "complete") return acc + (p.duration ?? 0);
    if (p.status === "running") return acc + (p.duration ?? 0) / 2;
    return acc;
  }, 0);
  const total = run.phases.reduce((acc, p) => acc + (p.duration ?? 0), 0) + 0.5;

  const size = 92;
  const r = 38;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, total > 0 ? elapsed / total : 0));
  const dash = c * pct;
  const accent = "#E8FF6B";
  const iris = "#A48BFF";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "12px 14px",
        background: "var(--aether-surface-recessed)",
        border: "1px solid var(--aether-border-subtle)",
        borderRadius: 18,
      }}
    >
      <div
        style={{
          position: "relative",
          width: size,
          height: size,
          display: "grid",
          placeItems: "center",
        }}
      >
        <svg width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={3}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={iris}
            strokeWidth={3}
            strokeLinecap="round"
            strokeDasharray={`${c} ${c}`}
            strokeDashoffset={c}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            animate={reduced ? undefined : { strokeDashoffset: c - dash }}
            transition={
              reduced
                ? { duration: 0.2 }
                : { duration: 1.6, ease: [0.32, 0.72, 0, 1] }
            }
            style={{ filter: "drop-shadow(0 0 6px rgba(164,139,255,0.55))" }}
          />
        </svg>
        <motion.div
          animate={
            reduced
              ? { scale: 1 }
              : { scale: [1, 1.06, 1], opacity: [0.85, 1, 0.85] }
          }
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            color: accent,
          }}
        >
          <Timer size={18} strokeWidth={1.6} />
        </motion.div>
        <span
          style={{
            position: "absolute",
            bottom: -10,
            left: 0,
            right: 0,
            textAlign: "center",
            fontSize: 9.5,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--aether-text-tertiary)",
          }}
        >
          {elapsed.toFixed(2)}s elapsed
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
        <span
          style={{
            fontSize: 10.5,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--aether-text-tertiary)",
          }}
        >
          Agent execution
        </span>
        <span
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: "var(--aether-text-primary)",
            letterSpacing: "-0.01em",
          }}
        >
          Reasoning through five phases
        </span>
        <span
          style={{
            fontSize: 11,
            color: "var(--aether-text-tertiary)",
            letterSpacing: "-0.005em",
          }}
        >
          {run.phases.find((p) => p.status === "running")?.label ?? "Composable"} ·{" "}
          <span style={{ color: iris }}>{run.activeId ? "live" : "idle"}</span>
        </span>
      </div>
    </div>
  );
}

interface PhaseRowProps {
  phase: TimelinePhase;
  index: number;
  open: boolean;
  onToggle: () => void;
}

const PhaseRow = React.memo(function PhaseRow({ phase, index, open, onToggle }: PhaseRowProps) {
  const { reduced } = useAetherMotion();
  const tone = TONE_COLOR[phase.tone];
  const StatusIcon =
    phase.status === "complete"
      ? CircleCheck
      : phase.status === "running"
      ? CircleDot
      : phase.status === "error"
      ? CircleAlert
      : CircleDashed;

  return (
    <motion.li
      initial={reduced ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay: index * 0.04, ease: [0.32, 0.72, 0, 1] }}
      style={{
        borderRadius: 14,
        background: "var(--aether-surface-recessed)",
        border: "1px solid var(--aether-border-subtle)",
        overflow: "hidden",
      }}
    >
      <button
        onClick={onToggle}
        aria-expanded={open}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "10px 12px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color: "var(--aether-text-primary)",
          textAlign: "left",
        }}
      >
        <PhaseStatusArc phase={phase} />
        <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: "-0.005em",
              color: "var(--aether-text-primary)",
            }}
          >
            {phase.label}
            <span
              style={{
                fontSize: 9,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--aether-text-muted)",
                border: "1px solid var(--aether-border-subtle)",
                padding: "2px 8px",
                borderRadius: 999,
              }}
            >
              {phase.status}
            </span>
          </span>
          {phase.description && (
            <span
              style={{
                fontSize: 10.5,
                color: "var(--aether-text-tertiary)",
                letterSpacing: "0.02em",
              }}
            >
              {phase.description}
            </span>
          )}
        </div>
        <div style={{ flex: 1 }} />
        {phase.duration !== undefined && (
          <span
            style={{
              fontSize: 11,
              letterSpacing: "0.04em",
              color: "var(--aether-text-secondary)",
            }}
          >
            {phase.duration.toFixed(2)}s
          </span>
        )}
        {phase.confidence !== undefined && (
          <span
            style={{
              fontSize: 10,
              letterSpacing: "0.06em",
              color: "var(--aether-text-tertiary)",
              padding: "2px 6px",
              border: "1px solid var(--aether-border-subtle)",
              borderRadius: 999,
            }}
          >
            {Math.round(phase.confidence * 100)}% conf
          </span>
        )}
        <motion.span
          animate={{ rotate: open ? 90 : 0 }}
          transition={{ duration: 0.18 }}
          style={{ display: "grid", placeItems: "center", color: "var(--aether-text-tertiary)" }}
        >
          <ChevronRight size={12} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && phase.steps.length > 0 && (
          <motion.div
            key="steps"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
            style={{ overflow: "hidden", borderTop: "1px solid var(--aether-border-subtle)" }}
          >
            <ul
              style={{
                listStyle: "none",
                margin: 0,
                padding: "8px 14px 10px",
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              {phase.steps.map((s, i) => (
                <StepRow key={s.id} step={s} index={i} accent={tone} />
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
});

function PhaseStatusArc({ phase }: { phase: TimelinePhase }) {
  const { reduced } = useAetherMotion();
  const tone = TONE_COLOR[phase.tone];
  const size = 24;
  const [completed, setCompleted] = React.useState(phase.status === "complete");
  React.useEffect(() => {
    setCompleted(phase.status === "complete");
  }, [phase.status]);

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        flexShrink: 0,
        display: "grid",
        placeItems: "center",
      }}
    >
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 2}
          fill="none"
          stroke={`${tone}22`}
          strokeWidth={2}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 2}
          fill="none"
          stroke={tone}
          strokeWidth={2}
          strokeLinecap="round"
          strokeDasharray={`${2 * Math.PI * (size / 2 - 2)}`}
          initial={false}
          animate={{
            strokeDashoffset: completed ? 0 : 2 * Math.PI * (size / 2 - 2),
          }}
          transition={
            reduced
              ? { duration: 0.2 }
              : { duration: 0.8, ease: [0.32, 0.72, 0, 1] }
          }
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ filter: `drop-shadow(0 0 4px ${tone}80)` }}
        />
        {phase.status === "running" && (
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - 2}
            fill="none"
            stroke={tone}
            strokeWidth={2}
            strokeLinecap="round"
            strokeDasharray="6 12"
            animate={reduced ? undefined : { rotate: 360 }}
            transition={{
              duration: 4,
              repeat: reduced ? 0 : Infinity,
              ease: "linear",
            }}
            style={{ transformOrigin: "center", opacity: 0.6 }}
          />
        )}
      </svg>
      {phase.status === "complete" && (
        <CheckTiny color={tone} />
      )}
      {phase.status === "running" && (
        <motion.span
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          style={{
            width: 6,
            height: 6,
            borderRadius: 999,
            background: tone,
            boxShadow: `0 0 8px ${tone}`,
          }}
        />
      )}
      {phase.status === "pending" && <Hourglass size={10} style={{ color: tone }} />}
      {phase.status === "error" && (
        <CircleAlert size={11} style={{ color: "#FF6E7A" }} />
      )}
    </div>
  );
}

function CheckTiny({ color }: { color: string }) {
  return (
    <svg width={11} height={11} viewBox="0 0 24 24" style={{ color }}>
      <path
        d="M5 12.5l4.5 4.5L19 7"
        stroke="currentColor"
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

function StepRow({
  step,
  index,
  accent,
}: {
  step: TimelineStep;
  index: number;
  accent: string;
}) {
  const { reduced } = useAetherMotion();
  return (
    <motion.li
      initial={reduced ? false : { opacity: 0, x: -4 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.24, delay: index * 0.02 }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "6px 8px",
        borderRadius: 8,
        background: "rgba(255,255,255,0.02)",
        border: "1px solid var(--aether-border-subtle)",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: 999,
          background:
            step.status === "complete"
              ? accent
              : step.status === "running"
              ? accent
              : step.status === "error"
              ? "#FF6E7A"
              : "rgba(255,255,255,0.15)",
        }}
      />
      <span
        style={{
          fontSize: 11,
          color:
            step.status === "pending"
              ? "var(--aether-text-muted)"
              : "var(--aether-text-primary)",
          letterSpacing: "-0.005em",
          flex: 1,
        }}
      >
        {step.label}
      </span>
      {step.duration !== undefined && (
        <span
          style={{
            fontSize: 10,
            color: "var(--aether-text-tertiary)",
            letterSpacing: "0.04em",
          }}
        >
          {step.duration.toFixed(2)}s
        </span>
      )}
      <StepStatusIcon status={step.status} />
    </motion.li>
  );
}

function StepStatusIcon({ status }: { status: TimelineStep["status"] }) {
  const Icon =
    status === "complete"
      ? CircleCheck
      : status === "running"
      ? CircleDot
      : status === "error"
      ? CircleAlert
      : CircleDashed;
  return <Icon size={11} style={{ color: "var(--aether-text-tertiary)" }} />;
}
