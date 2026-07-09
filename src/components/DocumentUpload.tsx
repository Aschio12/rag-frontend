"use client";

import { type DragEvent, useRef, useState } from "react";

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
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const result = (await uploadDocument(file)) as UploadResult;
      onUploaded?.(result);
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

  const onDragOver = (e: DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const onDragLeave = () => setDragging(false);

  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onClick={() => inputRef.current?.click()}
      className={`cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
        dragging
          ? "border-neutral-900 bg-neutral-100"
          : "border-neutral-300 hover:border-neutral-400"
      }`}
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
        <p className="text-sm text-neutral-500">Uploading and indexing...</p>
      ) : (
        <>
          <p className="text-sm font-medium text-neutral-700">
            Drop a document here or click to browse
          </p>
          <p className="mt-1 text-xs text-neutral-400">
            Supports PDF, Markdown, HTML
          </p>
        </>
      )}
    </div>
  );
}
