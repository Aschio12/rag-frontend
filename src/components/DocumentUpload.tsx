"use client";

import { type DragEvent, useRef, useState } from "react";
import { motion } from "framer-motion";
import { FileUp, Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
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

  return (
    <div>
      <motion.div
        onDrop={onDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onClick={() => inputRef.current?.click()}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className={cn(
          "cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all duration-200",
          dragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/20 hover:border-muted-foreground/40 hover:bg-muted/30",
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

        {uploading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-2"
          >
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Uploading and indexing...</p>
          </motion.div>
        ) : result ? (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-2"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
              <FileUp className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-emerald-700">Uploaded successfully</p>
              <p className="text-xs text-muted-foreground">
                {result.document.filename} &middot; {result.document.chunk_count} chunks
              </p>
            </div>
            <Badge variant="secondary" className="mt-1 text-xs">
              Upload another
            </Badge>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <FileUp className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">
              Drop a document here or click to browse
            </p>
            <p className="text-xs text-muted-foreground">Supports PDF, Markdown, HTML</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
