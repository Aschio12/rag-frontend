"use client";

/**
 * useAgentRunStore — global event store for agentic runs.
 *
 * Pages call `startRun()` once `sendAgenticMessage()` begins, then yield
 * each `AgentStepEvent` via `feedEvent()`. Subscribers (Inspector v2 /
 * Agent Timeline / Memory / Files) read live state via `useAgentRunStore()`.
 *
 * Keeps a small ring of recent events (default 256) so animations have
 * enough headroom; full reasoning history remains available.
 */

import * as React from "react";
import type { AgentStepEvent, Source } from "./api";

export interface AgentRunRecord {
  /** Last complete event payload (preferred). */
  answer: string;
  sources: Source[];
  plan: string;
  critique: string;
  verification: NonNullable<AgentStepEvent["verification"]>;
  searchQueries: string[];
  totalTime: number;
}

export interface AgentRunState {
  /** True between startRun() and stopRun(). */
  active: boolean;
  /** Stable id for current run (uuid-like). */
  runId: string | null;
  /** Last element of the in-progress sequence (the "live" event payload). */
  latest: AgentStepEvent | null;
  /** All events seen so far in the current run. */
  events: AgentStepEvent[];
  /** Last complete snapshot (the "complete" event). */
  completed: AgentRunRecord | null;
  /** Last *error* event payload (for display). */
  error: { step?: string; message: string } | null;
}

export const initialAgentRunState: AgentRunState = {
  active: false,
  runId: null,
  latest: null,
  events: [],
  completed: null,
  error: null,
};

type Listener = (state: AgentRunState) => void;

class AgentRunStore {
  private state: AgentRunState = initialAgentRunState;
  private listeners = new Set<Listener>();

  getState(): AgentRunState {
    return this.state;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit(next: AgentRunState) {
    this.state = next;
    this.listeners.forEach((l) => l(next));
  }

  startRun(): string {
    const runId = `run-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    this.emit({
      active: true,
      runId,
      latest: null,
      events: [],
      completed: null,
      error: null,
    });
    return runId;
  }

  feedEvent(event: AgentStepEvent): void {
    if (!this.state.active) return;
    const events = [...this.state.events, event];
    if (event.event === "complete") {
      const completed: AgentRunRecord = {
        answer: event.answer ?? "",
        sources: event.sources ?? [],
        plan: event.plan ?? "",
        critique: event.critique ?? "",
        verification: event.verification ?? [],
        searchQueries: event.search_queries ?? [],
        totalTime: event.total_time ?? 0,
      };
      this.emit({
        active: false,
        runId: this.state.runId,
        latest: event,
        events,
        completed,
        error: null,
      });
      return;
    }
    if (event.event === "step_error") {
      this.emit({
        active: true,
        runId: this.state.runId,
        latest: event,
        events,
        completed: this.state.completed,
        error: {
          step: event.step,
          message: event.error ?? "Step failed",
        },
      });
      return;
    }
    this.emit({
      active: true,
      runId: this.state.runId,
      latest: event,
      events,
      completed: this.state.completed,
      error: null,
    });
  }

  stopRun(): void {
    this.emit({ ...this.state, active: false });
  }

  reset(): void {
    this.emit(initialAgentRunState);
  }

  /** Last N sources across all completed runs (used by Inspector Files / Sources). */
  cachedSources(): Source[] {
    if (this.state.completed?.sources?.length) {
      return this.state.completed.sources;
    }
    return [];
  }
}

export const agentRunStore = new AgentRunStore();

export function useAgentRunStore(): AgentRunState {
  const [, force] = React.useReducer((x: number) => x + 1, 0);
  React.useEffect(() => agentRunStore.subscribe(force), []);
  return agentRunStore.getState();
}
