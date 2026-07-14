"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Network, Sparkles, X, Brain } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import KnowledgeGraphView, { GraphData } from "@/components/KnowledgeGraphView";
import MindMapView, { MindMapData } from "@/components/MindMapView";
import StudyToolsPanel from "@/components/StudyToolsPanel";
import { extractKnowledgeGraph, generateMindMap } from "@/lib/api";

interface Doc {
  id: string;
  filename: string;
  chunk_count: number;
  status: string;
}

interface Props {
  refreshKey?: number;
}

type ExploreMode = "knowledge-graph" | "mind-map" | "study-tools";

export default function DocumentList({ refreshKey }: Props) {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [exploreMode, setExploreMode] = useState<ExploreMode>("knowledge-graph");
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [mindMapData, setMindMapData] = useState<MindMapData | null>(null);
  const [exploreLoading, setExploreLoading] = useState(false);

  const loadDocs = useCallback(() => {
    let cancelled = false;
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/documents`,
    )
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (!cancelled) {
          setDocs(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => { loadDocs(); }, [refreshKey, loadDocs]);

  const handleExplore = async (docId: string, mode: ExploreMode) => {
    setSelectedDoc(docId);
    setExploreMode(mode);
    setExploreLoading(true);
    try {
      if (mode === "knowledge-graph") {
        const data = await extractKnowledgeGraph(docId);
        setGraphData(data);
        setMindMapData(null);
      } else if (mode === "mind-map") {
        const data = await generateMindMap(docId);
        setMindMapData(data);
        setGraphData(null);
      } else {
        setGraphData(null);
        setMindMapData(null);
      }
    } catch {
      setGraphData(null);
      setMindMapData(null);
    } finally {
      setExploreLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl p-3">
            <Skeleton className="h-9 w-9 rounded-xl" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (docs.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-white/10 py-14 text-center"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.03]">
          <FileText className="h-6 w-6 text-muted-foreground/20" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground/50">No documents yet</p>
          <p className="mt-1 text-xs text-muted-foreground/30">Upload a document above to get started</p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-2">
      <AnimatePresence mode="popLayout">
        {docs.map((doc, i) => (
          <motion.div
            key={doc.id}
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 25,
              delay: i * 0.04,
            }}
          >
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
            <div
              className="group flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.01] px-3 py-2.5 transition-all duration-300 cursor-pointer hover:border-[#7000ff]/30"
              onClick={() => handleExplore(doc.id, selectedDoc === doc.id ? exploreMode : "knowledge-graph")}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.03] group-hover:bg-white/[0.05] transition-colors">
                  <FileText className="h-4 w-4 text-muted-foreground/40" />
                </div>
                <div>
                  <p className="text-sm font-medium leading-tight text-foreground/80 group-hover:text-foreground transition-colors">
                    {doc.filename}
                  </p>
                  <p className="text-xs text-muted-foreground/40">
                    {doc.chunk_count} chunk{doc.chunk_count !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all duration-200">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleExplore(doc.id, "knowledge-graph"); }}
                    className="rounded-lg p-1.5 text-muted-foreground/40 hover:text-purple-400 hover:bg-purple-500/10 transition-all"
                    title="Knowledge Graph"
                  >
                    <Network className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleExplore(doc.id, "mind-map"); }}
                    className="rounded-lg p-1.5 text-muted-foreground/40 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                    title="Mind Map"
                  >
                    <Brain className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleExplore(doc.id, "study-tools"); }}
                    className="rounded-lg p-1.5 text-muted-foreground/40 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
                    title="Study Tools"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                  </button>
                </div>
                <Badge
                  variant="secondary"
                  className="ml-1 text-[9px] font-normal text-muted-foreground/40 bg-white/[0.03] border border-white/5"
                >
                  {doc.status}
                </Badge>
              </div>
            </div>
            </motion.div>

            <AnimatePresence>
              {selectedDoc === doc.id && (
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
                  className="overflow-hidden"
                >
                  <div className="ml-12 mt-2 space-y-2 pb-2">
                    {exploreMode === "study-tools" ? (
                      <StudyToolsPanel docId={doc.id} />
                    ) : exploreMode === "knowledge-graph" ? (
                      <div className="rounded-xl border border-white/5 overflow-hidden">
                        <div className="flex items-center justify-between border-b border-white/5 px-3 py-2">
                          <div className="flex items-center gap-1.5">
                            <Network className="h-3.5 w-3.5 text-purple-400" />
                            <span className="text-[11px] font-medium text-muted-foreground">Knowledge Graph</span>
                          </div>
                          <button
                            onClick={() => setSelectedDoc(null)}
                            className="rounded-lg p-1 text-muted-foreground/40 hover:text-foreground hover:bg-white/5 transition-all"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                        <KnowledgeGraphView data={graphData} loading={exploreLoading} />
                      </div>
                    ) : (
                      <div className="rounded-xl border border-white/5 overflow-hidden">
                        <div className="flex items-center justify-between border-b border-white/5 px-3 py-2">
                          <div className="flex items-center gap-1.5">
                            <Brain className="h-3.5 w-3.5 text-blue-400" />
                            <span className="text-[11px] font-medium text-muted-foreground">Mind Map</span>
                          </div>
                          <button
                            onClick={() => setSelectedDoc(null)}
                            className="rounded-lg p-1 text-muted-foreground/40 hover:text-foreground hover:bg-white/5 transition-all"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                        <MindMapView data={mindMapData} loading={exploreLoading} />
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
