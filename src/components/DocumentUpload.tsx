"use client";

import { type DragEvent, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, FileUp, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { uploadDocument } from "@/lib/api";

interface UploadResult {
  message: string;
  document: {
    id: string;
    filename: string;
    status: string;
    chunk_count: number;
  };
}

interface Props {
  onUploaded?: (result: UploadResult) => void;
}

const ACCEPTED = ".pdf,.md,.mdx,.html,.htm";

export default function DocumentUpload({ onUploaded }: Props) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setUploading(true);
    setResult(null);
    try {
      const res = (await uploadDocument(file)) as UploadResult;
      setResult(res);
      onUploaded?.(res);
    } catch {
      alert("Upload failed. Check console for details.");
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const resetUpload = () => {
    setResult(null);
  };

  return (
    <motion.div
      onDrop={onDrop}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onClick={() => !uploading && !result && inputRef.current?.click()}
      className={cn(
        "relative cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-300 overflow-hidden",
        dragging
          ? "border-purple-500/50 bg-purple-500/[0.03]"
          : result
            ? "border-emerald-500/30 bg-emerald-500/[0.02]"
            : "border-white/10 hover:border-white/20 hover:bg-white/[0.02]",
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      <AnimatePresence mode="wait">
        {uploading ? (
          <motion.div
            key="uploading"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            className="flex flex-col items-center gap-3"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="h-8 w-8 text-purple-400" />
            </motion.div>
            <p className="text-sm font-medium text-purple-300/80">Uploading and indexing...</p>
            <div className="h-1 w-48 overflow-hidden rounded-full bg-white/5">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-purple-400"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        ) : result ? (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            className="flex flex-col items-center gap-3"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.1 }}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10"
            >
              <Check className="h-6 w-6 text-emerald-400" />
            </motion.div>
            <div className="text-center">
              <p className="text-sm font-medium text-emerald-300">Uploaded successfully</p>
              <p className="mt-0.5 text-xs text-muted-foreground/60">
                {result.document.filename} &middot; {result.document.chunk_count} chunks
              </p>
            </div>
            <motion.button
              onClick={(e) => { e.stopPropagation(); resetUpload(); }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-1 rounded-full border border-white/10 px-4 py-1.5 text-[11px] text-muted-foreground/60 hover:text-foreground hover:border-white/20 transition-colors"
            >
              Upload another
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-3"
          >
            <motion.div
              animate={dragging ? { y: -4, scale: 1.05 } : { y: 0, scale: 1 }}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5"
            >
              <FileUp className="h-6 w-6 text-muted-foreground/40" />
            </motion.div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground/70">
                {dragging ? "Drop your file here" : "Drop a document here or click to browse"}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground/40">Supports PDF, Markdown, HTML</p>
            </div>
            <div className="flex gap-2">
              {ACCEPTED.split(",").map((ext) => (
                <span
                  key={ext}
                  className="rounded-md bg-white/[0.03] px-2 py-0.5 text-[10px] text-muted-foreground/30 font-mono"
                >
                  {ext.trim()}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
