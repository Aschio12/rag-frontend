"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Database, FolderKanban, Loader2, Plus, Trash2, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
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

export default function KnowledgeBaseManager({ selectedKbId, selectedColId, onSelectKb, onSelectCol }: Props) {
  const [kbs, setKbs] = useState<KnowledgeBase[]>([]);
  const [cols, setCols] = useState<Collection[]>([]);
  const [expandedKb, setExpandedKb] = useState<string | null>(null);
  const [selectedKb, setSelectedKb] = useState<string | null>(null);
  const [loadingKbs, setLoadingKbs] = useState(false);
  const [loadingCols, setLoadingCols] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

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

  const handleCreateKb = useCallback(async () => {
    const name = prompt("Knowledge base name:");
    if (!name?.trim()) return;
    try {
      await createKnowledgeBase(name.trim());
      showFeedback("success", "Knowledge base created");
      loadKbs();
    } catch {
      showFeedback("error", "Failed to create knowledge base");
    }
  }, [loadKbs]);

  const handleCreateCol = useCallback(async (kbId: string) => {
    const name = prompt("Collection name:");
    if (!name?.trim()) return;
    try {
      await createCollection(kbId, name.trim());
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
      {feedback && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[10px]",
            feedback.type === "success" ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600",
          )}
        >
          {feedback.type === "success" ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
          {feedback.message}
        </motion.div>
      )}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
          <Database className="h-3 w-3" />
          Knowledge Bases
        </h3>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={handleCreateKb} className="rounded p-0.5 text-muted-foreground/50 hover:text-foreground transition-colors">
                <Plus className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-[10px]">New KB</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="space-y-0.5">
        {loadingKbs ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground/40" />
          </div>
        ) : kbs.length === 0 ? (
          <p className="px-2 text-[10px] text-muted-foreground/40">No knowledge bases. Create one to get started.</p>
        ) : (
          kbs.map((kb) => (
          <div key={kb.id}>
            <div
              className={cn(
                "group flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs cursor-pointer transition-colors",
                selectedKb === kb.id ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent/50",
              )}
              onClick={() => toggleExpand(kb.id)}
            >
              <FolderKanban className="h-3 w-3 shrink-0" />
              <span className="flex-1 truncate">{kb.name}</span>
              {(kb.collection_count !== undefined || kb.document_count !== undefined) && (
                <div className="flex items-center gap-1">
                  {kb.collection_count !== undefined && (
                    <Badge variant="secondary" className="h-4 px-1 text-[9px] font-normal">
                      {kb.collection_count}
                    </Badge>
                  )}
                  {kb.document_count !== undefined && (
                    <Badge variant="outline" className="h-4 px-1 text-[9px] font-normal">
                      {kb.document_count}
                    </Badge>
                  )}
                </div>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); handleDeleteKb(kb.id); }}
                className="hidden group-hover:block rounded p-0.5 text-muted-foreground/40 hover:text-destructive transition-colors"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>

            <AnimatePresence>
              {expandedKb === kb.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="ml-3 space-y-0.5 overflow-hidden"
                >
                  <div className="flex items-center justify-between px-2 py-1">
                    {loadingCols ? (
                      <Loader2 className="h-3 w-3 animate-spin text-muted-foreground/40" />
                    ) : (
                      <span className="text-[10px] text-muted-foreground/50">Collections</span>
                    )}
                    <button
                      onClick={() => handleCreateCol(kb.id)}
                      className="rounded p-0.5 text-muted-foreground/40 hover:text-foreground transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  {cols.map((col) => (
                    <div
                      key={col.id}
                      className={cn(
                        "group flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] cursor-pointer transition-colors",
                        selectedColId === col.id
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground/70 hover:bg-accent/50",
                      )}
                      onClick={() => onSelectCol(col.id)}
                    >
                      <span className="flex-1 truncate">{col.name}</span>
                      {col.document_count !== undefined && (
                        <Badge variant="outline" className="h-3.5 px-1 text-[8px] font-normal">
                          {col.document_count}
                        </Badge>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteCol(col.id); }}
                        className="hidden group-hover:block rounded p-0.5 text-muted-foreground/30 hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-2.5 w-2.5" />
                      </button>
                    </div>
                  ))}
                  {!loadingCols && cols.length === 0 && (
                    <p className="px-2 text-[10px] text-muted-foreground/30">No collections</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))
      )}
      </div>
    </div>
  );
}
