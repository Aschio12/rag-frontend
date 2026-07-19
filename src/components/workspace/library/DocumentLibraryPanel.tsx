"use client";

/**
 * DocumentLibraryPanel — the main "library" workspace panel.
 *
 * Wires together:
 *   - DocumentLibraryToolbar (search + filter)
 *   - BulkActionBar
 *   - VirtualList
 *   - LazyCard (per-card)
 *   - PremiumDropZone
 *   - DocumentPreviewModal (preview-before-commit)
 *   - ImportHistory
 *
 * The component owns the document set, the selection set, the drag state,
 * and the upload queue. All state is purely local; nothing protrudes to
 * the rest of the workspace beyond callbacks.
 */

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Files,
  Library,
  Plus,
  Sparkles,
} from "lucide-react";

import { DocumentCard } from "./DocumentCard";
import { DocumentLibraryToolbar } from "./DocumentLibraryToolbar";
import { BulkActionBar, DEFAULT_BULK_ACTIONS } from "./BulkActionBar";
import { PremiumDropZone, type UploadTicket } from "./PremiumDropZone";
import { DocumentPreviewModal } from "./DocumentPreviewModal";
import { ImportHistory } from "./ImportHistory";
import { LazyCard } from "./LazyCard";
import { FilterChipStrip, type FilterChip } from "./FilterChipStrip";

import { AppDocument, DocType, buildSampleLibrary } from "./document-model";
import { useAetherMotion } from "@/design-system/motion";
import { useAetherTheme } from "@/design-system/themes";
import { useToast } from "@/components/Toast";

const ALL_TYPES: DocType[] = ["pdf", "md", "html", "txt"];
const COLUMNS_BREAKPOINTS = [
  { min: 0, cols: 1 },
  { min: 480, cols: 2 },
  { min: 720, cols: 3 },
  { min: 1024, cols: 4 },
];

function useColumnCount(): number {
  const [cols, setCols] = React.useState(2);
  React.useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      let next = cols;
      for (const b of COLUMNS_BREAKPOINTS) {
        if (w >= b.min) next = b.cols;
      }
      setCols(next);
    };
    update();
    window.addEventListener("resize", update, { passive: true });
    return () => window.removeEventListener("resize", update);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return cols;
}

const initialTickets: UploadTicket[] = [];

export const DocumentLibraryPanel = React.memo(function DocumentLibraryPanel() {
  const { reduced } = useAetherMotion();
  const { toggle: _toggle } = useAetherTheme(); // keep import alive for future use
  void _toggle;
  const { showToast } = useToast();
  const [docs, setDocs] = React.useState<AppDocument[]>(() => buildSampleLibrary());
  const [query, setQuery] = React.useState("");
  const [filterId, setFilterId] = React.useState<string>("all");
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [dragActive, setDragActive] = React.useState(false);
  const [tickets, setTickets] = React.useState<UploadTicket[]>(initialTickets);
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [pendingTickets, setPendingTickets] = React.useState<UploadTicket[]>([]);
  const fmtSize = 240; // estimate row height px for virtual list (card aspect 4:5 + meta)
  const cardH = 280;
  const cols = useColumnCount();

  const filterChips: FilterChip[] = React.useMemo(() => {
    const counts: Record<string, number> = { all: docs.length, pdf: 0, md: 0, html: 0, txt: 0, recent: 0, indexed: 0 };
    const now = Date.UTC(2026, 0, 14);
    for (const d of docs) {
      counts[d.type] = (counts[d.type] ?? 0) + 1;
      if (now - new Date(d.uploadedAt).getTime() <= 7 * 24 * 60 * 60 * 1000) {
        counts.recent += 1;
      }
      if (d.status === "indexed") counts.indexed += 1;
    }
    return [
      { id: "all",     label: "All",     count: counts.all },
      { id: "pdf",     label: "PDF",     count: counts.pdf },
      { id: "md",      label: "MD",      count: counts.md },
      { id: "html",    label: "HTML",    count: counts.html },
      { id: "txt",     label: "TXT",     count: counts.txt },
      { id: "recent",  label: "Recent",  count: counts.recent },
      { id: "indexed", label: "Indexed", count: counts.indexed },
    ];
  }, [docs]);

  const filtered = React.useMemo(() => {
    const q = query.toLowerCase().trim();
    return docs.filter((d) => {
      if (filterId === "recent") {
        const days = Math.max(0, Date.UTC(2026, 0, 14) - new Date(d.uploadedAt).getTime()) / 86400000;
        if (days > 7) return false;
      } else if (filterId === "indexed") {
        if (d.status !== "indexed") return false;
      } else if (ALL_TYPES.includes(filterId as DocType)) {
        if (d.type !== (filterId as DocType)) return false;
      }
      if (q.length > 0) {
        return (
          d.filename.toLowerCase().includes(q) ||
          (d.snippet ?? "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [docs, query, filterId]);

  const toggleSelection = React.useCallback((id: string, next: boolean) => {
    setSelected((prev) => {
      const set = new Set(prev);
      if (next) set.add(id);
      else set.delete(id);
      return set;
    });
  }, []);

  const handleFiles = React.useCallback(
    (files: File[]) => {
      const newTickets: UploadTicket[] = files.map((f) => ({
        id: `t-${Math.random().toString(36).slice(2)}-${Date.now()}`,
        name: f.name,
        sizeBytes: f.size,
        progress: 0,
        status: "uploading",
      }));
      setPendingTickets(newTickets);
      setTickets((prev) => [...newTickets, ...prev]);
      setPreviewOpen(true);
      // simulate progress
      newTickets.forEach((t) => {
        let prog = 0;
        const id = setInterval(() => {
          prog = Math.min(1, prog + 0.18 + Math.random() * 0.08);
          setTickets((prev) =>
            prev.map((p) =>
              p.id === t.id
                ? {
                    ...p,
                    progress: prog,
                    status: prog >= 1 ? "indexing" : "uploading",
                  }
                : p,
            ),
          );
          if (prog >= 1) {
            clearInterval(id);
            const id2 = setTimeout(() => {
              setTickets((prev) =>
                prev.map((p) =>
                  p.id === t.id ? { ...p, status: "done" } : p,
                ),
              );
            }, 700);
            // cleanup
            return () => clearTimeout(id2);
          }
        }, 220);
      });
    },
    [],
  );

  const handleCommit = React.useCallback(() => {
    if (pendingTickets.length === 0) {
      setPreviewOpen(false);
      return;
    }
    const created: AppDocument[] = pendingTickets.map((t) => ({
      id: `doc-${t.id}`,
      filename: t.name,
      type:
        t.name.endsWith(".pdf")
          ? "pdf"
          : t.name.endsWith(".md")
          ? "md"
          : t.name.endsWith(".html") || t.name.endsWith(".htm")
          ? "html"
          : "txt",
      status: "indexing",
      chunkCount: 0,
      sizeBytes: t.sizeBytes,
      uploadedAt: new Date().toISOString(),
      tokenCount: 0,
      snippet: "Recently imported — processing…",
      tags: [],
    }));
    setDocs((prev) => [...created, ...prev]);
    setPendingTickets([]);
    setPreviewOpen(false);
    showToast(`Committed ${created.length} document${created.length !== 1 ? "s" : ""}`, "success");
  }, [pendingTickets, showToast]);

  const handleDiscard = React.useCallback(() => {
    if (pendingTickets.length === 0) {
      setPreviewOpen(false);
      return;
    }
    setTickets((prev) => prev.filter((t) => !pendingTickets.some((p) => p.id === t.id)));
    setPendingTickets([]);
    setPreviewOpen(false);
    showToast("Upload discarded", "info");
  }, [pendingTickets, showToast]);

  const handleBulk = React.useCallback(
    (id: string) => {
      showToast(`${id.toUpperCase()} applied to ${selected.size} document${selected.size !== 1 ? "s" : ""}`, "success");
      if (id === "delete") {
        setDocs((prev) => prev.filter((d) => !selected.has(d.id)));
        setSelected(new Set());
      }
    },
    [selected, showToast],
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        gap: 14,
      }}
    >
      {/* Header band */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "14px 16px 6px",
        }}
      >
        <span
          style={{
            display: "grid",
            placeItems: "center",
            width: 28,
            height: 28,
            borderRadius: 10,
            background: "var(--aether-hover-tint)",
            border: "1px solid var(--aether-border-subtle)",
            color: "var(--aether-text-accent)",
          }}
        >
          <Library size={13} />
        </span>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span
            style={{
              fontSize: 11,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--aether-text-tertiary)",
            }}
          >
            Knowledge
          </span>
          <span
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: "var(--aether-text-primary)",
              letterSpacing: "-0.01em",
            }}
          >
            Documents
          </span>
        </div>
        <div style={{ flex: 1 }} />
        <motion.button
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 280, damping: 22 }}
          onClick={() => setPreviewOpen(true)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 13px",
            fontSize: 11,
            color: "var(--aether-text-on-accent)",
            background: "var(--aether-text-accent)",
            border: "none",
            borderRadius: 999,
            cursor: "pointer",
            boxShadow: "0 0 16px rgba(232,255,107,0.4)",
            letterSpacing: "0.04em",
          }}
        >
          <Plus size={12.5} />
          Import
        </motion.button>
      </div>

      {/* Toolbar */}
      <div style={{ padding: "0 16px" }}>
        <DocumentLibraryToolbar
          query={query}
          onQueryChange={setQuery}
          filterChip={{ id: filterId, label: filterChips.find((c) => c.id === filterId)?.label ?? "All" }}
          onFilterChange={setFilterId}
          chips={filterChips}
          selectedCount={selected.size}
        />
      </div>

      {/* Bulk bar */}
      <div style={{ padding: "0 16px", display: "flex", justifyContent: "center" }}>
        <AnimatePresence>
          {selected.size > 0 && (
            <motion.div layout>
              <BulkActionBar
                open
                selectedCount={selected.size}
                actions={DEFAULT_BULK_ACTIONS}
                onAction={handleBulk}
                onClear={() => setSelected(new Set())}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Drop zone */}
      <div style={{ padding: "4px 16px 0" }}>
        <PremiumDropZone
          tickets={tickets}
          dragActive={dragActive}
          onDragChange={setDragActive}
          onFiles={handleFiles}
        />
      </div>

      {/* Cards */}
      <div style={{ flex: 1, minHeight: 0, padding: "12px 16px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))`, gap: 14 }}>
          {filtered.map((d, i) => (
            <LazyCard key={d.id} eager={i < cols * 2}>
              <DocumentCard
                doc={d}
                selected={selected.has(d.id)}
                onSelect={toggleSelection}
                onOpen={(id) => {
                  showToast(`Opened ${id}`, "info");
                }}
                onExplore={(id) => {
                  showToast(`Exploring ${id}`, "info");
                }}
              />
            </LazyCard>
          ))}
        </div>
        {filtered.length === 0 && (
          <EmptyState
            searching={query.length > 0 || filterId !== "all"}
            onReset={() => {
              setQuery("");
              setFilterId("all");
            }}
          />
        )}
      </div>

      {/* History footer */}
      <div
        style={{
          padding: "10px 16px 18px",
          borderTop: "1px solid var(--aether-border-subtle)",
          background:
            "linear-gradient(180deg, transparent, rgba(255,255,255,0.02))",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 6,
            color: "var(--aether-text-tertiary)",
          }}
        >
          <Sparkles size={11} />
          <span
            style={{
              fontSize: 10.5,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            Recent
          </span>
        </div>
        <ImportHistory limit={4} source={docs} />
      </div>

      {/* Preview modal */}
      <DocumentPreviewModal
        tickets={tickets}
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        onCommit={handleCommit}
        onDiscard={handleDiscard}
      />
    </div>
  );
});

function EmptyState({ searching, onReset }: { searching: boolean; onReset: () => void }) {
  const { reduced } = useAetherMotion();
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "40px 18px",
        gap: 12,
        border: "1px dashed var(--aether-border-subtle)",
        borderRadius: 22,
        background: "var(--aether-surface-recessed)",
      }}
    >
      <span
        style={{
          display: "grid",
          placeItems: "center",
          width: 56,
          height: 56,
          borderRadius: 18,
          background:
            "radial-gradient(circle, rgba(232,255,107,0.16) 0%, rgba(164,139,255,0.20) 60%, transparent 80%)",
          border: "1px solid var(--aether-border-subtle)",
        }}
      >
        <Files size={20} strokeWidth={1.6} style={{ color: "var(--aether-text-accent)" }} />
      </span>
      <div>
        <p
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: "var(--aether-text-primary)",
            letterSpacing: "-0.01em",
            margin: 0,
          }}
        >
          {searching ? "No matches" : "Library is hushed early"}
        </p>
        <p
          style={{
            fontSize: 12,
            color: "var(--aether-text-tertiary)",
            margin: "4px 0 12px",
          }}
        >
          {searching
            ? "Try a different filter or a wider query."
            : "Drop documents to populate the knowledge base."}
        </p>
        {searching && (
          <motion.button
            onClick={onReset}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 320, damping: 22 }}
            style={{
              padding: "6px 12px",
              fontSize: 11,
              color: "var(--aether-text-primary)",
              background: "rgba(232,255,107,0.12)",
              border: "1px solid var(--aether-border-accent)",
              borderRadius: 999,
              cursor: "pointer",
              letterSpacing: "0.04em",
            }}
          >
            Reset filters
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

/** Re-export minimal types to keep file cohesion. */
export type { AppDocument } from "./document-model";

// keep stub
export const _types: DocType[] = ALL_TYPES;
