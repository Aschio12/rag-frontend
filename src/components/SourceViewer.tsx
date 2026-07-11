"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, FileText, ScrollText, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { getDocumentPreview } from "@/lib/api";

interface SourceViewerProps {
  sources: {
    doc_id: string;
    text: string;
    score: number;
    page_number?: number;
    filename?: string;
  }[];
  open: boolean;
  onClose: () => void;
}

export default function SourceViewer({ sources, open, onClose }: SourceViewerProps) {
  const [selectedSource, setSelectedSource] = useState<number | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imgLoading, setImgLoading] = useState(false);

  const handleSelect = async (idx: number) => {
    setSelectedSource(idx);
    setImgLoading(!!sources[idx]?.page_number);
    const src = sources[idx];
    if (src.page_number) {
      try {
        const url = await getDocumentPreview(src.doc_id, src.page_number - 1);
        setPreviewUrl(url);
      } catch {
        setPreviewUrl(null);
      }
    } else {
      setPreviewUrl(null);
    }
    setImgLoading(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed right-0 top-0 z-40 flex h-dvh w-full max-w-lg flex-col border-l bg-background shadow-xl"
        >
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">Source Viewer</h3>
              <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                {sources.length} sources
              </span>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Source list */}
            <div className="w-1/2 overflow-y-auto border-r p-2 space-y-1.5 scrollbar-thin">
              {sources.map((src, i) => (
                <button
                  key={i}
                  onClick={() => handleSelect(i)}
                  className={cn(
                    "w-full rounded-lg border p-2.5 text-left transition-colors",
                    selectedSource === i
                      ? "border-primary/30 bg-primary/5"
                      : "border-transparent hover:bg-accent/50",
                  )}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[11px] font-medium truncate">
                      {src.filename || src.doc_id.slice(0, 8)}
                    </span>
                    <span className="shrink-0 rounded bg-muted px-1 py-0.5 text-[9px] text-muted-foreground">
                      {(src.score * 100).toFixed(0)}%
                    </span>
                  </div>
                  {src.page_number ? (
                    <p className="mt-0.5 text-[10px] text-muted-foreground/60">Page {src.page_number}</p>
                  ) : null}
                  <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground/80 line-clamp-3">
                    {src.text}
                  </p>
                </button>
              ))}
            </div>

            {/* Preview pane */}
            <div className="flex w-1/2 flex-col">
              {previewUrl ? (
                <div className="flex-1 overflow-auto">
                  {imgLoading && (
                    <Skeleton className="h-48 w-full rounded-none" />
                  )}
                  <img
                    src={previewUrl}
                    alt="Document preview"
                    className={cn("w-full", imgLoading && "hidden")}
                    onLoad={() => setImgLoading(false)}
                  />
                </div>
              ) : selectedSource !== null ? (
                <div className="flex-1 overflow-y-auto p-3">
                  <div className="rounded-lg bg-muted/30 p-3">
                    <p className="text-[11px] leading-relaxed text-muted-foreground">
                      <mark className="rounded bg-yellow-200/30 px-0.5 text-foreground">
                        {sources[selectedSource]?.text}
                      </mark>
                    </p>
                  </div>
                  <a
                    href={previewUrl || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 flex items-center gap-1 text-[10px] text-blue-500 hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Open in new tab
                  </a>
                </div>
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center gap-2">
                  <ScrollText className="h-6 w-6 text-muted-foreground/20" />
                  <p className="text-xs text-muted-foreground/40">Select a source to preview</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
