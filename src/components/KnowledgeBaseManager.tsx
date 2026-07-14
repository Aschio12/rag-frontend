"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Database, FolderKanban, Loader2, Plus, Trash2, X, FolderOpen, ChevronRight, ChevronDown } from "lucide-react";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  createCollection,
  createKnowledgeBase,
  deleteCollection,
  deleteKnowledgeBase,
  listCollections,
  listKnowledgeBases,
} from "@/lib/api";

interface Props {
  selectedKbId?: string | null;
  selectedColId?: string | null;
  onSelectKb: (id: string) => void;
  onSelectCol: (id: string) => void;
}

interface KnowledgeBase {
  id: string;
  name: string;
  collection_count?: number;
  document_count?: number;
}

interface Collection {
  id: string;
  name: string;
  document_count?: number;
}

function InlineInput({
  onSubmit,
  onCancel,
  placeholder,
}: {
  onSubmit: (value: string) => void;
  onCancel: () => void;
  placeholder: string;
}) {
  const [value, setValue] = useState("");
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  const handleSubmit = () => {
    if (value.trim()) {
      onSubmit(value.trim());
    }
  };

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="overflow-hidden"
    >
      <div className="flex gap-1 py-1">
        <input
          ref={ref}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
            if (e.key === "Escape") onCancel();
          }}
          placeholder={placeholder}
          className="flex-1 rounded-lg border border-purple-500/20 bg-purple-950/30 px-2.5 py-1.5 text-[11px] text-purple-200 outline-none placeholder:text-purple-400/30 focus:border-purple-500/40 transition-colors"
        />
        <button
          onClick={handleSubmit}
          className="rounded-lg bg-purple-500/20 px-2 py-1 text-[11px] text-purple-300 hover:bg-purple-500/30 transition-colors"
        >
          <Check className="h-3 w-3" />
        </button>
        <button
          onClick={onCancel}
          className="rounded-lg px-2 py-1 text-[11px] text-muted-foreground/50 hover:text-muted-foreground transition-colors"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </motion.div>
  );
}

export default function KnowledgeBaseManager({ selectedKbId, selectedColId, onSelectKb, onSelectCol }: Props) {
  const [kbs, setKbs] = useState<KnowledgeBase[]>([]);
  const [cols, setCols] = useState<Collection[]>([]);
  const [expandedKb, setExpandedKb] = useState<string | null>(null);
  const [selectedKb, setSelectedKb] = useState<string | null>(null);
  const [loadingKbs, setLoadingKbs] = useState(false);
  const [loadingCols, setLoadingCols] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [showNewKbInput, setShowNewKbInput] = useState(false);
  const [showNewColInput, setShowNewColInput] = useState(false);

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 2500);
  };

  const loadKbs = useCallback(async () => {
    setLoadingKbs(true);
    try {
      const data = await listKnowledgeBases();
      setKbs(data);
    } catch {
      showFeedback("error", "Failed to load knowledge bases");
    } finally {
      setLoadingKbs(false);
    }
  }, []);

  const loadCols = useCallback(async (kbId: string) => {
    setLoadingCols(true);
    try {
      const data = await listCollections(kbId);
      setCols(data);
    } catch {
      showFeedback("error", "Failed to load collections");
    } finally {
      setLoadingCols(false);
    }
  }, []);

  useEffect(() => { queueMicrotask(() => loadKbs()); }, [loadKbs]);

  const handleCreateKb = useCallback(async (name: string) => {
    setShowNewKbInput(false);
    try {
      await createKnowledgeBase(name);
      showFeedback("success", "Knowledge base created");
      loadKbs();
    } catch {
      showFeedback("error", "Failed to create knowledge base");
    }
  }, [loadKbs]);

  const handleCreateCol = useCallback(async (kbId: string, name: string) => {
    setShowNewColInput(false);
    try {
      await createCollection(kbId, name);
      showFeedback("success", "Collection created");
      loadCols(kbId);
    } catch {
      showFeedback("error", "Failed to create collection");
    }
  }, [loadCols]);

  const handleDeleteKb = useCallback(async (kbId: string) => {
    try {
      await deleteKnowledgeBase(kbId);
      showFeedback("success", "Knowledge base deleted");
      loadKbs();
      if (selectedKbId === kbId) onSelectKb("");
      if (selectedKb === kbId) setSelectedKb(null);
      setCols([]);
    } catch {
      showFeedback("error", "Failed to delete knowledge base");
    }
  }, [loadKbs, selectedKbId, onSelectKb, selectedKb]);

  const handleDeleteCol = useCallback(async (colId: string) => {
    try {
      await deleteCollection(colId);
      showFeedback("success", "Collection deleted");
      if (expandedKb) loadCols(expandedKb);
      if (selectedColId === colId) onSelectCol("");
    } catch {
      showFeedback("error", "Failed to delete collection");
    }
  }, [loadCols, expandedKb, selectedColId, onSelectCol]);

  const toggleExpand = (kbId: string) => {
    setSelectedKb(kbId);
    if (expandedKb === kbId) {
      setExpandedKb(null);
      setCols([]);
    } else {
      setExpandedKb(kbId);
      loadCols(kbId);
    }
  };

  return (
    <div className="space-y-2">
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[10px]",
              feedback.type === "success" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400",
            )}
          >
            {feedback.type === "success" ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
            {feedback.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
          <Database className="h-3 w-3" />
          Knowledge Bases
        </h3>
        <button
          onClick={() => setShowNewKbInput(!showNewKbInput)}
          className="rounded-lg p-1 text-muted-foreground/40 hover:text-purple-400 hover:bg-purple-500/10 transition-all"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      <AnimatePresence>
        {showNewKbInput && (
          <InlineInput
            onSubmit={handleCreateKb}
            onCancel={() => setShowNewKbInput(false)}
            placeholder="Knowledge base name..."
          />
        )}
      </AnimatePresence>

      <div className="space-y-0.5">
        {loadingKbs ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground/30" />
          </div>
        ) : kbs.length === 0 ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-2 py-3 text-[10px] text-muted-foreground/30 text-center"
          >
            No knowledge bases. Create one to get started.
          </motion.p>
        ) : (
          kbs.map((kb) => (
            <motion.div
              key={kb.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div
                className={cn(
                  "group flex items-center gap-1 rounded-lg px-2.5 py-2 text-xs cursor-pointer transition-all duration-200",
                  selectedKb === kb.id
                    ? "bg-[#7000ff]/10 text-[#00f2fe] border border-[#7000ff]/20"
                    : "text-muted-foreground/70 hover:bg-white/[0.02] hover:text-muted-foreground border border-transparent",
                )}
                onClick={() => toggleExpand(kb.id)}
              >
                {expandedKb === kb.id ? (
                  <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground/40" />
                ) : (
                  <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground/40" />
                )}
                <FolderKanban className="h-3.5 w-3.5 shrink-0" />
                <span className="flex-1 truncate">{kb.name}</span>
                {(kb.collection_count !== undefined || kb.document_count !== undefined) && (
                  <div className="flex items-center gap-1 mr-1">
                    {kb.collection_count !== undefined && (
                        <span className="rounded-md bg-[#00f2fe]/10 px-1.5 py-0.5 text-[9px] font-mono text-[#00f2fe]/60 border border-[#00f2fe]/10">
                          {kb.collection_count} col
                        </span>
                    )}
                  </div>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteKb(kb.id); }}
                  className="opacity-0 group-hover:opacity-100 rounded-lg p-1 text-muted-foreground/30 hover:text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>

              <AnimatePresence>
                {expandedKb === kb.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{
                      height: "auto",
                      opacity: 1,
                      transition: {
                        height: { type: "spring", stiffness: 200, damping: 25 },
                        opacity: { duration: 0.2 },
                      },
                    }}
                    exit={{
                      height: 0,
                      opacity: 0,
                      transition: {
                        height: { duration: 0.2 },
                        opacity: { duration: 0.1 },
                      },
                    }}
                    className="ml-5 space-y-0.5 overflow-hidden"
                  >
                    <div className="flex items-center justify-between px-2 py-1">
                      {loadingCols ? (
                        <Loader2 className="h-3 w-3 animate-spin text-muted-foreground/30" />
                      ) : (
                        <span className="text-[10px] text-muted-foreground/40">Collections</span>
                      )}
                      <button
                        onClick={() => setShowNewColInput(!showNewColInput)}
                        className="rounded-lg p-0.5 text-muted-foreground/30 hover:text-purple-400 hover:bg-purple-500/10 transition-all"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    <AnimatePresence>
                      {showNewColInput && (
                        <InlineInput
                          onSubmit={(name) => handleCreateCol(kb.id, name)}
                          onCancel={() => setShowNewColInput(false)}
                          placeholder="Collection name..."
                        />
                      )}
                    </AnimatePresence>

                    {cols.map((col) => (
                      <div
                        key={col.id}
                        className={cn(
                          "group flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[11px] cursor-pointer transition-all duration-200",
                          selectedColId === col.id
                            ? "bg-[#7000ff]/10 text-[#00f2fe] font-medium border border-[#7000ff]/20"
                            : "text-muted-foreground/60 hover:bg-white/[0.02] hover:text-muted-foreground/80 border border-transparent",
                        )}
                        onClick={() => onSelectCol(col.id)}
                      >
                        <FolderOpen className="h-3 w-3 shrink-0 text-muted-foreground/30" />
                        <span className="flex-1 truncate">{col.name}</span>
                        {col.document_count !== undefined && (
                          <span className="text-[9px] font-mono text-muted-foreground/30">
                            {col.document_count}
                          </span>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteCol(col.id); }}
                          className="opacity-0 group-hover:opacity-100 rounded p-0.5 text-muted-foreground/30 hover:text-red-400 transition-all"
                        >
                          <Trash2 className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    ))}
                    {!loadingCols && cols.length === 0 && (
                      <p className="px-2.5 py-2 text-[10px] text-muted-foreground/25">No collections yet</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
