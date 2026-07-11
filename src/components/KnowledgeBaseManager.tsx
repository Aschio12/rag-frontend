"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Database, FolderKanban, Plus, Trash2 } from "lucide-react";

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
}

interface Collection {
  id: string;
  name: string;
}

export default function KnowledgeBaseManager({ selectedKbId, selectedColId, onSelectKb, onSelectCol }: Props) {
  const [kbs, setKbs] = useState<KnowledgeBase[]>([]);
  const [cols, setCols] = useState<Collection[]>([]);
  const [expandedKb, setExpandedKb] = useState<string | null>(null);

  const loadKbs = useCallback(async () => {
    try {
      const data = await listKnowledgeBases();
      setKbs(data);
    } catch {}
  }, []);

  const loadCols = useCallback(async (kbId: string) => {
    try {
      const data = await listCollections(kbId);
      setCols(data);
    } catch {}
  }, []);

  useEffect(() => { queueMicrotask(() => loadKbs()); }, [loadKbs]);

  const handleCreateKb = useCallback(async () => {
    const name = prompt("Knowledge base name:");
    if (!name?.trim()) return;
    try {
      await createKnowledgeBase(name.trim());
      loadKbs();
    } catch {}
  }, [loadKbs]);

  const handleCreateCol = useCallback(async (kbId: string) => {
    const name = prompt("Collection name:");
    if (!name?.trim()) return;
    try {
      await createCollection(kbId, name.trim());
      loadCols(kbId);
    } catch {}
  }, [loadCols]);

  const handleDeleteKb = useCallback(async (kbId: string) => {
    try {
      await deleteKnowledgeBase(kbId);
      loadKbs();
      if (selectedKbId === kbId) onSelectKb("");
      setCols([]);
    } catch {}
  }, [loadKbs, selectedKbId, onSelectKb]);

  const handleDeleteCol = useCallback(async (colId: string) => {
    try {
      await deleteCollection(colId);
      if (expandedKb) loadCols(expandedKb);
      if (selectedColId === colId) onSelectCol("");
    } catch {}
  }, [loadCols, expandedKb, selectedColId, onSelectCol]);

  const toggleExpand = (kbId: string) => {
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
        {kbs.map((kb) => (
          <div key={kb.id}>
            <div
              className={cn(
                "group flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs cursor-pointer transition-colors",
                expandedKb === kb.id ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent/50",
              )}
              onClick={() => toggleExpand(kb.id)}
            >
              <FolderKanban className="h-3 w-3 shrink-0" />
              <span className="flex-1 truncate">{kb.name}</span>
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
                    <span className="text-[10px] text-muted-foreground/50">Collections</span>
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
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteCol(col.id); }}
                        className="hidden group-hover:block rounded p-0.5 text-muted-foreground/30 hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-2.5 w-2.5" />
                      </button>
                    </div>
                  ))}
                  {cols.length === 0 && (
                    <p className="px-2 text-[10px] text-muted-foreground/30">No collections</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
        {kbs.length === 0 && (
          <p className="px-2 text-[10px] text-muted-foreground/40">No knowledge bases. Create one to get started.</p>
        )}
      </div>
    </div>
  );
}
