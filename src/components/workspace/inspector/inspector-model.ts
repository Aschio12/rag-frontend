"use client";

/**
 * Inspector v2 data model — deterministic samples for each section.
 *
 * No backend calls. All data here is reused across sessions and rendered.
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
  { id: "timeline", label: "Timeline", description: "When each source came in." },
  { id: "memory",   label: "Memory",   description: "Pinned context Aether carries across turns." },
  { id: "context",  label: "Context",  description: "Current conversation snapshot." },
  { id: "files",    label: "Files",    description: "Documents the room is aware of." },
  { id: "token",    label: "Token",    description: "Token usage, cost and budget." },
];

export interface InspectorSource {
  id: string;
  document: string;
  page?: number;
  score: number; // 0..1
  excerpt: string;
  collectedAt: string; // ISO
}

export const sampleSources: InspectorSource[] = [
  {
    id: "s1",
    document: "Brand Voice Standards.md",
    page: 4,
    score: 0.94,
    excerpt:
      "Tone is direct. Sentences average 14 words. Avoid corporate hedges.",
    collectedAt: "2026-01-14T12:04:11Z",
  },
  {
    id: "s2",
    document: "Linear Method.pdf",
    page: 12,
    score: 0.86,
    excerpt:
      "A culture of taste is not a culture of taste tests. It is a culture of decisions.",
    collectedAt: "2026-01-14T12:04:11Z",
  },
  {
    id: "s3",
    document: "Onboarding.html",
    score: 0.71,
    excerpt: "Add a new collection, share it with your team, refine retrieval…",
    collectedAt: "2026-01-14T12:04:25Z",
  },
  {
    id: "s4",
    document: "Apple Vision Pro UX.md",
    page: 3,
    score: 0.62,
    excerpt:
      "Vision Pro's translucent system surfaces read as light, not as glass.",
    collectedAt: "2026-01-14T12:04:32Z",
  },
];

export interface MemoryCard {
  id: string;
  title: string;
  value: string;
  updatedAt: string;
  badge?: "stable" | "drift" | "fresh";
}

export const sampleMemory: MemoryCard[] = [
  { id: "m1", title: "Audience", value: "Senior product & design leads.", updatedAt: "2026-01-13T18:21:01Z", badge: "stable" },
  { id: "m2", title: "Voice", value: "Reserved, technical, never breathless.", updatedAt: "2026-01-14T09:54:11Z", badge: "fresh" },
  { id: "m3", title: "Taboos", value: "Avoid marketing superlatives and emoji-leading summaries.", updatedAt: "2026-01-12T11:02:00Z", badge: "drift" },
];

export interface InspectorFile {
  id: string;
  filename: string;
  type: "pdf" | "md" | "html" | "txt";
  chunks: number;
  tokens: number;
  indexedAt: string;
}

export const sampleFiles: InspectorFile[] = [
  { id: "f1", filename: "Brand Voice Standards.md", type: "md",   chunks: 12, tokens: 3230, indexedAt: "2026-01-14T09:24:00Z" },
  { id: "f2", filename: "Linear Method.pdf",         type: "pdf",  chunks: 22, tokens: 8120, indexedAt: "2026-01-14T09:11:00Z" },
  { id: "f3", filename: "Onboarding.html",           type: "html", chunks:  6, tokens: 1010, indexedAt: "2026-01-14T09:13:00Z" },
  { id: "f4", filename: "Apple Vision Pro UX.md",    type: "md",   chunks:  8, tokens: 2100, indexedAt: "2026-01-13T20:01:00Z" },
];

export interface TokenUsageByDay {
  iso: string;
  label: string;
  consumed: number;
  budget: number;
}

export const sampleTokenUsageByDay: TokenUsageByDay[] = [
  { iso: "2026-01-09", label: "Thu", consumed: 11240, budget: 30000 },
  { iso: "2026-01-10", label: "Fri", consumed: 22810, budget: 30000 },
  { iso: "2026-01-11", label: "Sat", consumed:  4100, budget: 30000 },
  { iso: "2026-01-12", label: "Sun", consumed:  6080, budget: 30000 },
  { iso: "2026-01-13", label: "Mon", consumed: 18420, budget: 30000 },
  { iso: "2026-01-14", label: "Today", consumed: 7210, budget: 30000 },
];
