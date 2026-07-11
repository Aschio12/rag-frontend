"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Network, Sparkles, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import KnowledgeGraphView from "@/components/KnowledgeGraphView";
import MindMapView from "@/components/MindMapView";
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
  const [graphData, setGraphData] = useState<any>(null);
  const [mindMapData, setMindMapData] = useState<any>(null);
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
          <div key={i} className="flex items-center gap-3 rounded-lg p-3">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-2/3" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (docs.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-muted-foreground/20 py-8 text-center">
        <FileText className="h-6 w-6 text-muted-foreground/30" />
        <p className="text-xs text-muted-foreground">No documents indexed yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        {docs.map((doc, i) => (
          <motion.div
            key={doc.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <div
              className="group flex items-center justify-between rounded-lg p-2.5 transition-colors hover:bg-muted/50 cursor-pointer"
              onClick={() => handleExplore(doc.id, selectedDoc === doc.id ? exploreMode : "knowledge-graph")}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium leading-tight">{doc.filename}</p>
                  <p className="text-xs text-muted-foreground">
                    {doc.chunk_count} chunk{doc.chunk_count !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => { e.stopPropagation(); handleExplore(doc.id, "knowledge-graph"); }}
                  className="rounded p-1 text-muted-foreground/50 hover:text-foreground transition-colors"
                  title="Knowledge Graph"
                >
                  <Network className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleExplore(doc.id, "mind-map"); }}
                  className="rounded p-1 text-muted-foreground/50 hover:text-foreground transition-colors"
                  title="Mind Map"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleExplore(doc.id, "study-tools"); }}
                  className="rounded p-1 text-muted-foreground/50 hover:text-foreground transition-colors"
                  title="Study Tools"
                >
                  <FileText className="h-3.5 w-3.5" />
                </button>
              </div>
              <Badge variant="secondary" className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">
                {doc.status}
              </Badge>
            </div>

            {/* Explore panel */}
            <AnimatePresence>
              {selectedDoc === doc.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="ml-10 mt-2 space-y-2 pb-2">
                    {exploreMode === "study-tools" ? (
                      <StudyToolsPanel docId={doc.id} />
                    ) : exploreMode === "knowledge-graph" ? (
                      <div className="rounded-lg border">
                        <div className="flex items-center justify-between border-b px-3 py-1.5">
                          <span className="text-[10px] font-medium text-muted-foreground">Knowledge Graph</span>
                          <button
                            onClick={() => setSelectedDoc(null)}
                            className="rounded p-0.5 text-muted-foreground/40 hover:text-foreground"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                        <KnowledgeGraphView data={graphData} loading={exploreLoading} />
                      </div>
                    ) : (
                      <div className="rounded-lg border">
                        <div className="flex items-center justify-between border-b px-3 py-1.5">
                          <span className="text-[10px] font-medium text-muted-foreground">Mind Map</span>
                          <button
                            onClick={() => setSelectedDoc(null)}
                            className="rounded p-0.5 text-muted-foreground/40 hover:text-foreground"
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
      </div>
    </div>
  );
}
