/**
 * Agent timeline data model.
 *
 * Pure presentation. Deterministic sample set mirroring the five canonical
 * reasoning phases (Read, Plan, Search, Verify, Compose). Each phase has
 * a list of sub-steps that may be expanded in the UI.
 */

export interface TimelineStep {
  /** Stable id (e.g. "search-3"). */
  id: string;
  /** Short label (e.g. "Search #1"). */
  label: string;
  /** Optional longer note. */
  note?: string;
  /** Optional duration in seconds. */
  duration?: number;
  /** Status of the step itself. */
  status: "pending" | "running" | "complete" | "error";
}

export interface TimelinePhase {
  id: string;
  label: string;
  description?: string;
  /** Color token used for accent + status. */
  tone: "iris" | "chrome" | "mint" | "amber" | "lime";
  status: "pending" | "running" | "complete" | "error" | "skipped";
  /** Total duration across all sub-steps, seconds. */
  duration?: number;
  /** 0..1 — confidence in the result of the phase. */
  confidence?: number;
  /** Optional per-step sub-rows; empty means "single step". */
  steps: TimelineStep[];
}

export interface TimelineRun {
  /** Token-level progress 0..1. */
  tokenProgress: number;
  /** Tokens consumed vs expected (~800–2400 for chat answers). */
  tokensConsumed: number;
  tokensExpected: number;
  /** Started time as ISO. */
  startedAt: string;
  /** Active phase index, if any. */
  activeId: string | null;
  phases: TimelinePhase[];
}

const PHASE_TONE: Record<string, TimelinePhase["tone"]> = {
  read: "iris",
  plan: "chrome",
  search: "mint",
  verify: "amber",
  compose: "lime",
};

let counter = 0;
function nextId(prefix: string): string {
  counter++;
  return `${prefix}-${counter}`;
}

export function buildSampleTimeline(): TimelineRun {
  counter = 0;
  const read = step("read", "Reading the question");
  const plan = {
    id: nextId("plan"),
    label: "Plan",
    description: "Decomposing intent",
    tone: PHASE_TONE.plan,
    status: "complete" as const,
    duration: 0.42,
    confidence: 0.92,
    steps: [
      step("plan-decompose", "Decompose into sub-goals"),
      step("plan-decide", "Decide retrieval strategy"),
    ],
  };
  const search = {
    id: nextId("search"),
    label: "Search",
    description: "Iterative retrieval",
    tone: PHASE_TONE.search,
    status: "complete" as const,
    duration: 1.18,
    confidence: 0.86,
    steps: [
      step("search-1", "vector hit · 6 candidates"),
      step("search-2", "BM25 expansion · 4 candidates"),
      step("search-3", "rerank · top 5"),
    ],
  };
  const verify = {
    id: nextId("verify"),
    label: "Verify",
    description: "Claim conflict check",
    tone: PHASE_TONE.verify,
    status: "running" as const,
    duration: 0.6,
    confidence: 0.7,
    steps: [
      step("verify-1", "claims: 12"),
      step("verify-2", "supporting: 9"),
      step("verify-3", "conflicts: 1"),
      step("verify-4", "out of scope: 2", "pending"),
    ],
  };
  const compose = {
    id: nextId("compose"),
    label: "Compose",
    description: "Form final answer",
    tone: PHASE_TONE.compose,
    status: "pending" as const,
    duration: 0,
    confidence: undefined,
    steps: [],
  };

  const phases: TimelinePhase[] = [read, plan, search, verify, compose];

  // tokens: rough estimate
  const tokensExpected = 1840;
  const consumed = Math.round(tokensExpected * 0.62);

  return {
    tokenProgress: 0.62,
    tokensConsumed: consumed,
    tokensExpected,
    startedAt: new Date(Date.UTC(2026, 0, 14, 12, 4)).toISOString(),
    activeId: verify.id,
    phases,
  };
}

function step(prefix: string, label: string, statusOverride?: TimelineStep["status"]): TimelinePhase {
  return {
    id: nextId(prefix),
    label: label,
    description: undefined,
    tone: PHASE_TONE.read ?? "iris",
    status: statusOverride ?? "complete",
    duration: statusOverride === "pending" ? undefined : 0.32,
    confidence: statusOverride === "pending" ? undefined : 0.9,
    steps: [],
  };
}
