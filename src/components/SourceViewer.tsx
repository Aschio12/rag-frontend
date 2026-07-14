"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, FileText, ScrollText, X, ChevronRight } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { getDocumentPreview } from "@/lib/api";
import { SourceViewerAnimation } from "@/components/animations/SourceViewerAnimation";

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
    <SourceViewerAnimation
      isOpen={open}
      className="fixed right-0 top-0 z-40 flex h-dvh w-full max-w-2xl flex-col border-l border-white/5 cyber-glass rounded-l-2xl overflow-hidden"
    >
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/10">
            <FileText className="h-3.5 w-3.5 text-purple-400" />
          </div>
          <h3 className="text-sm font-medium text-foreground/80">Source Viewer</h3>
          <span className="rounded-md bg-[#7000ff]/10 px-1.5 py-0.5 text-[10px] font-mono text-purple-400/80 border border-[#7000ff]/10">
            {sources.length}
          </span>
        </div>
        <motion.button
          onClick={onClose}
          whileHover={{ scale: 1.05, rotate: 90 }}
          whileTap={{ scale: 0.95 }}
          className="rounded-lg p-1.5 text-muted-foreground/40 hover:text-foreground hover:bg-white/5 transition-all"
        >
          <X className="h-4 w-4" />
        </motion.button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/2 overflow-y-auto border-r border-white/5 p-2 space-y-1 scrollbar-thin">
          {sources.map((src, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => handleSelect(i)}
              className={cn(
                "w-full rounded-xl border p-3 text-left transition-all duration-300",
                selectedSource === i
                  ? "border-purple-500/30 bg-purple-500/10"
                  : "border-white/5 bg-white/[0.01] hover:border-[#7000ff]/30 hover:bg-white/[0.02]",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <FileText className="h-3 w-3 shrink-0 text-muted-foreground/30" />
                  <span className="text-[11px] font-medium truncate text-foreground/70">
                    {src.filename || src.doc_id.slice(0, 8)}
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span
                    className={cn(
                      "rounded-md px-1 py-0.5 text-[9px] font-mono",
                      src.score > 0.8
                        ? "bg-emerald-500/10 text-emerald-400"
                        : src.score > 0.5
                          ? "bg-amber-500/10 text-amber-400"
                          : "bg-red-500/10 text-red-400",
                    )}
                  >
                    {(src.score * 100).toFixed(0)}%
                  </span>
                  {selectedSource === i && <ChevronRight className="h-3 w-3 text-purple-400" />}
                </div>
              </div>
              {src.page_number ? (
                <p className="mt-1 text-[10px] text-muted-foreground/40">Page {src.page_number}</p>
              ) : null}
              <p className="mt-1.5 text-[10px] leading-relaxed text-muted-foreground/50 line-clamp-3">
                {src.text}
              </p>
            </motion.button>
          ))}
        </div>

        <div className="flex w-1/2 flex-col bg-white/[0.01]">
          <AnimatePresence mode="wait">
            {previewUrl ? (
              <motion.div
                key="preview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 overflow-auto"
              >
                {imgLoading && <Skeleton className="h-48 w-full rounded-none" />}
                <Image
                  src={previewUrl}
                  alt="Document preview"
                  width={800}
                  height={600}
                  className={cn("w-full h-auto", imgLoading && "hidden")}
                  onLoad={() => setImgLoading(false)}
                  unoptimized
                />
              </motion.div>
            ) : selectedSource !== null ? (
              <motion.div
                key="text"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 overflow-y-auto p-4"
              >
                <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4 overflow-hidden relative">
                  <div className="pointer-events-none absolute -inset-40 bg-gradient-to-br from-[#00f2fe]/[0.02] to-transparent" />
                  <p className="text-[11px] leading-relaxed text-foreground/70 relative">
                    <mark className="rounded bg-purple-500/10 px-0.5 text-foreground/90">
                      {sources[selectedSource]?.text}
                    </mark>
                  </p>
                </div>
                <a
                  href={previewUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 flex items-center gap-1 text-[10px] text-purple-400/60 hover:text-purple-400 transition-colors"
                >
                  <ExternalLink className="h-3 w-3" />
                  Open in new tab
                </a>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-1 flex-col items-center justify-center gap-3"
              >
                <ScrollText className="h-8 w-8 text-muted-foreground/10" />
                <p className="text-xs text-muted-foreground/25">Select a source to preview</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </SourceViewerAnimation>
  );
}
