"use client";

/**
 * useDocsFeed — single source of truth for the real document library.
 *
 * Wraps `listDocuments`, exposes:
 *  - docs (the most recently fetched snapshot, normalized)
 *  - refresh() to refetch
 *  - addLocal() to optimistically prepend after a successful upload
 *  - removeLocal() after a successful delete
 *  - error / loading
 *
 * Subscribed by:
 *   DocumentLibraryPanel (Phase 5+)
 *   Inspector v2 / Files section
 *   Document-aware SearchAction (command palette)
 */

import * as React from "react";
import {
  listDocuments,
  deleteDocument,
  uploadDocument,
  type DocStatus,
} from "@/lib/api";

export type DocType = "pdf" | "md" | "html" | "txt";
export type DocStatusNorm = "indexed" | "indexing" | "queued" | "error";

export interface DocRecord {
  id: string;
  filename: string;
  type: DocType;
  status: DocStatusNorm;
  chunkCount: number;
  sizeBytes?: number;
  uploadedAt: string;
  indexedAt?: string;
  /** Optional long-form preview snippet (first page line). */
  snippet?: string;
}

export interface DocsFeedState {
  docs: DocRecord[];
  loading: boolean;
  error: string | null;
}

type Listener = (state: DocsFeedState) => void;

function normalize(raw: unknown): DocRecord[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((r) => {
      const obj = r as Record<string, unknown>;
      const id = String(obj.id ?? obj.doc_id ?? "");
      if (!id) return null;
      const filename = String(obj.filename ?? obj.name ?? "Untitled");
      const lower = filename.toLowerCase();
      const type: DocType = lower.endsWith(".pdf")
        ? "pdf"
        : lower.endsWith(".md") || lower.endsWith(".mdx")
        ? "md"
        : lower.endsWith(".html") || lower.endsWith(".htm")
        ? "html"
        : "txt";
      const status: DocStatusNorm = (
        ["indexed", "indexing", "queued", "error"] as const
      ).includes(obj.status as DocStatus)
        ? (obj.status as DocStatusNorm)
        : "indexed";
      return {
        id,
        filename,
        type,
        status,
        chunkCount: Number(obj.chunk_count ?? 0) || 0,
        sizeBytes: Number(obj.size_bytes ?? 0) || undefined,
        uploadedAt:
          (obj.uploaded_at as string) ||
          new Date().toISOString(),
        indexedAt: (obj.indexed_at as string) || undefined,
        snippet: (obj.snippet as string) || undefined,
      } satisfies DocRecord;
    })
    .filter((d): d is DocRecord => d !== null);
}

class DocsFeed {
  private state: DocsFeedState = { docs: [], loading: false, error: null };
  private listeners = new Set<Listener>();
  private inflight: Promise<void> | null = null;

  getState(): DocsFeedState {
    return this.state;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit(next: DocsFeedState) {
    this.state = next;
    this.listeners.forEach((l) => l(next));
  }

  async refresh(): Promise<void> {
    if (this.inflight) return this.inflight;
    this.inflight = (async () => {
      this.emit({ ...this.state, loading: true, error: null });
      try {
        const raw = await listDocuments();
        this.emit({ docs: normalize(raw), loading: false, error: null });
      } catch (e: unknown) {
        const err = e instanceof Error ? e.message : "Failed to load";
        this.emit({ docs: this.state.docs, loading: false, error: err });
      } finally {
        this.inflight = null;
      }
    })();
    return this.inflight;
  }

  addLocal(rec: DocRecord) {
    this.emit({
      docs: [rec, ...this.state.docs.filter((d) => d.id !== rec.id)],
      loading: false,
      error: null,
    });
  }

  patchLocal(id: string, patch: Partial<DocRecord>) {
    this.emit({
      docs: this.state.docs.map((d) => (d.id === id ? { ...d, ...patch } : d)),
      loading: false,
      error: null,
    });
  }

  async removeLocal(id: string): Promise<void> {
    try {
      await deleteDocument(id);
      this.emit({
        docs: this.state.docs.filter((d) => d.id !== id),
        loading: false,
        error: null,
      });
    } catch (e: unknown) {
      const err = e instanceof Error ? e.message : "Failed to remove";
      this.emit({ ...this.state, error: err });
    }
  }

  async uploadFile(file: File): Promise<DocRecord> {
    const pending: DocRecord = {
      id: `pending-${Math.random().toString(36).slice(2, 10)}`,
      filename: file.name,
      type: file.name.toLowerCase().endsWith(".pdf")
        ? "pdf"
        : file.name.toLowerCase().endsWith(".md") || file.name.toLowerCase().endsWith(".mdx")
        ? "md"
        : file.name.toLowerCase().endsWith(".html") || file.name.toLowerCase().endsWith(".htm")
        ? "html"
        : "txt",
      status: "indexing",
      chunkCount: 0,
      uploadedAt: new Date().toISOString(),
    };
    this.addLocal(pending);
    try {
      // Backend POSTs /api/v1/documents/upload via FormData
      const res = (await uploadDocument(file)) as {
        document?: { id?: string; filename?: string; status?: string };
      };
      const next: DocRecord = {
        ...pending,
        id:
          res?.document?.id ||
          // Fallback: refresh entirely so the new row is canonical.
          ((await listDocuments().then(normalize))?.find(
            (d) => d.filename === file.name,
          )?.id ??
          pending.id),
        status: (res?.document?.status === "indexed"
          ? "indexed"
          : "indexing") as DocStatusNorm,
        filename: res?.document?.filename ?? pending.filename,
      };
      this.patchLocal(pending.id, next);
      if (next.id !== pending.id) {
        // Reconcile — replace the temp id with the real id.
        this.emit({
          docs: this.state.docs.map((d) =>
            d.id === pending.id ? { ...d, id: next.id } : d,
          ),
          loading: false,
          error: null,
        });
      }
      // Eager refresh — backend may have associated other metadata.
      void this.refresh();
      return next;
    } catch (e: unknown) {
      const err = e instanceof Error ? e.message : "Upload failed";
      this.patchLocal(pending.id, { status: "error" });
      this.emit({ ...this.state, error: err });
      throw e;
    }
  }
}

export const docsFeed = new DocsFeed();

export function useDocsFeed(): DocsFeedState & {
  refresh: () => Promise<void>;
  uploadFile: (file: File) => Promise<DocRecord>;
  removeLocal: (id: string) => Promise<void>;
  patchLocal: (id: string, patch: Partial<DocRecord>) => void;
} {
  const [, force] = React.useReducer((x: number) => x + 1, 0);
  React.useEffect(() => {
    const id = docsFeed.subscribe(() => force());
    if (docsFeed.getState().docs.length === 0 && !docsFeed.getState().loading) {
      void docsFeed.refresh();
    }
    return () => {
      id();
    };
    // force() triggers subscriber flush on the singleton itself
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const s = docsFeed.getState();
  return {
    docs: s.docs,
    loading: s.loading,
    error: s.error,
    refresh: () => docsFeed.refresh(),
    uploadFile: (f) => docsFeed.uploadFile(f),
    removeLocal: (id) => docsFeed.removeLocal(id),
    patchLocal: (id, patch) => docsFeed.patchLocal(id, patch),
  };
}
