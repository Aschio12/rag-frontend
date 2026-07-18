"use client";

/**
 * Document model + sample data shared across the Library views.
 *
 * Pure presentation layer. No backend calls. Sample documents mimic
 * the shapes returned by `/api/v1/documents` so future real integrations
 * are drop-in.
 */

export type DocType = "pdf" | "md" | "html" | "txt";
export type DocStatus = "indexed" | "indexing" | "queued" | "error";

export interface AppDocument {
  id: string;
  filename: string;
  type: DocType;
  status: DocStatus;
  chunkCount: number;
  /** Approximate byte size when known. */
  sizeBytes?: number;
  /** Pinned at top of the library. */
  pinned?: boolean;
  /** ISO date string. */
  uploadedAt: string;
  /** ISO date string. */
  indexedAt?: string;
  /** Embedding job progress fraction (0..1). */
  embeddingProgress?: number;
  /** Approx tokens for the indexed content. */
  tokenCount?: number;
  /** Optional small preview bytes (for the impressionistic preview). */
  snippet?: string;
  /** Tags derived from content — used by filter chips. */
  tags?: string[];
}

const sampleTitles = [
  "Product Strategy 2026.pdf",
  "Quarterly Earnings.md",
  "OpenAI Cookbook.html",
  "Linear Method.pdf",
  "Apple Vision Pro UX.md",
  "TS Handbook.pdf",
  "AGENTS.md",
  "Notes on Calm.md",
  "Engineering Onboarding.html",
  "Distribution Channels.txt",
  "Brand Voice Standards.md",
  "Style Tokens Reference.pdf",
];

const sampleTypes: DocType[] = ["pdf", "md", "html", "txt"];
const sampleSnippets = [
  "Goal of Q1: align product, marketing and engineering on a single release plan...",
  "Revenue grew 21% YoY driven by adoption in the developer segment...",
  "Apple's privacy stance reframes how modal dialogs should be designed; always...",
  "A culture of taste is not a culture of taste tests. It is a culture of...",
  "Vision Pro's translucent system surfaces read as light, not as glass...",
  "Type inference is invisible work — yet it shapes nearly every call site...",
  "Agents should live in the same coordinate space as the user, not in tabs...",
];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function pick<T>(arr: T[], seed: number, offset = 0): T {
  return arr[(seed + offset) % arr.length];
}

function isoOffset(daysAgo: number): string {
  const date = new Date(Date.UTC(2026, 0, 14));
  date.setUTCDate(date.getUTCDate() - daysAgo);
  return date.toISOString();
}

/** Deterministic sample set. Stable across renders. */
export function buildSampleLibrary(): AppDocument[] {
  return sampleTitles.map((title, i) => {
    const seed = hash(title + i);
    return {
      id: `doc-${i}`,
      filename: title,
      type: pick(sampleTypes, seed, 0),
      status:
        seed % 11 === 0
          ? "indexing"
          : seed % 13 === 0
          ? "queued"
          : seed % 23 === 0
          ? "error"
          : "indexed",
      chunkCount: 8 + (seed % 90),
      sizeBytes: 16_000 + (seed % 9_000_000),
      pinned: i === 1 || i === 4,
      uploadedAt: isoOffset((i * 3) % 90),
      indexedAt: isoOffset((i * 3) % 90 - 1),
      embeddingProgress: i % 5 === 0 ? 0.42 : 1,
      tokenCount: 800 + (seed % 40_000),
      snippet: pick(sampleSnippets, seed),
      tags: title.includes(".pdf")
        ? ["pdf"]
        : title.endsWith(".md")
        ? ["markdown"]
        : title.endsWith(".html")
        ? ["web"]
        : ["txt"],
    } satisfies AppDocument;
  });
}
