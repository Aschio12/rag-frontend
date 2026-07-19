"use client";

/**
 * Inspector data model — types only.
 *
 * Sections panel pulls live values from the runtime stores
 * (`useAgentRunStore`, `useDocsFeed`, `selectionStore`).
 *
 * Each section interprets these:
 *  - Sources  → AgentRunStore.completed.sources
 *  - Timeline → AgentRunStore.events timeline
 *  - Memory   → last memory entry of the active conversation + persisted Memory table (page.tsx)
 *  - Context  → active view + conversation snapshot
 *  - Files    → docsFeed snapshot
 *  - Token    → run totals (consumed / expected), real timeline
 */

export type InspectorSectionId =
  | "sources"
  | "timeline"
  | "memory"
  | "context"
  | "files"
  | "token";

export interface InspectorSection {
  id: InspectorSectionId;
  label: string;
  description?: string;
}

export const inspectorSections: InspectorSection[] = [
  { id: "sources",  label: "Sources",  description: "Citations used in the last answer." },
  { id: "timeline", label: "Timeline", description: "When each step happened." },
  { id: "memory",   label: "Memory",   description: "Pinned context Aether carries across turns." },
  { id: "context",  label: "Context",  description: "Current conversation snapshot." },
  { id: "files",    label: "Files",    description: "Documents the room is aware of." },
  { id: "token",    label: "Token",    description: "Token usage, cadence and budget." },
];

export type InspectorSource = {
  id: string;
  document: string;
  page?: number;
  score: number;
  excerpt: string;
  collectedAt: string;
};

export type InspectorMemoryCard = {
  id: string;
  title: string;
  value: string;
  updatedAt: string;
  badge?: "stable" | "drift" | "fresh";
};

export type InspectorFile = {
  id: string;
  filename: string;
  type: "pdf" | "md" | "html" | "txt";
  chunks: number;
  tokens: number;
  indexedAt: string;
};

export type InspectorTimelineEvent = {
  id: string;
  at: number;
  label: string;
  description?: string;
  status: "complete" | "running" | "pending" | "error";
};

export function formatRel(iso: string, now = Date.now()): string {
  const then = new Date(iso).getTime();
  const diff = Math.max(0, now - then);
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function fmtTokens(n: number): string {
  if (n < 1000) return `${n}`;
  if (n < 10000) return `${(n / 1000).toFixed(1)}k`;
  return `${Math.round(n / 1000)}k`;
}
