/**
 * Document model — backing types only.
 *
 * Live data is sourced from `lib/docs-feed.ts`. Deterministic builders
 * were removed in Phase 7.
 */

export type DocType = "pdf" | "md" | "html" | "txt";

export interface AppDocument {
  id: string;
  filename: string;
  type: DocType;
  status: "indexed" | "indexing" | "queued" | "error";
  chunkCount: number;
  sizeBytes?: number;
  pinned?: boolean;
  uploadedAt: string;
  indexedAt?: string;
  embeddingProgress?: number;
  tokenCount?: number;
  snippet?: string;
  tags?: string[];
}
