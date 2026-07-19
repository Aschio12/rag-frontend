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
  const read: TimelinePhase = {
    id: nextId("read"),
    label: "Read",
    description: "Read the question",
    tone: PHASE_TONE.read ?? "iris",
    status: "complete",
    duration: 0.32,
    confidence: 0.9,
    steps: [],
  };
  const plan: TimelinePhase = {
    id: nextId("plan"),
    label: "Plan",
    description: "Decomposing intent",
    tone: PHASE_TONE.plan,
    status: "complete",
    duration: 0.42,
    confidence: 0.92,
    steps: [
      { id: nextId("plan-decompose"), label: "Decompose into sub-goals", status: "complete", duration: 0.2 },
      { id: nextId("plan-decide"), label: "Decide retrieval strategy", status: "complete", duration: 0.22 },
    ],
  };
  const search: TimelinePhase = {
    id: nextId("search"),
    label: "Search",
    description: "Iterative retrieval",
    tone: PHASE_TONE.search,
    status: "complete",
    duration: 1.18,
    confidence: 0.86,
    steps: [
      { id: nextId("search-1"), label: "vector hit · 6 candidates", status: "complete", duration: 0.4 },
      { id: nextId("search-2"), label: "BM25 expansion · 4 candidates", status: "complete", duration: 0.38 },
      { id: nextId("search-3"), label: "rerank · top 5", status: "complete", duration: 0.4 },
    ],
  };
  const verify: TimelinePhase = {
    id: nextId("verify"),
    label: "Verify",
    description: "Claim conflict check",
    tone: PHASE_TONE.verify,
    status: "running",
    duration: 0.6,
    confidence: 0.7,
    steps: [
      { id: nextId("verify-1"), label: "claims: 12", status: "complete", duration: 0.16 },
      { id: nextId("verify-2"), label: "supporting: 9", status: "complete", duration: 0.18 },
      { id: nextId("verify-3"), label: "conflicts: 1", status: "running", duration: 0.18 },
      { id: nextId("verify-4"), label: "out of scope: 2", status: "pending" },
    ],
  };
  const compose: TimelinePhase = {
    id: nextId("compose"),
    label: "Compose",
    description: "Form final answer",
    tone: PHASE_TONE.compose,
    status: "pending",
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

function step(prefix: string, label: string): TimelineStep {
  return {
    id: nextId(prefix),
    label,
    status: "complete",
    duration: 0.32,
  };
}
