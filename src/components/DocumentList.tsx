"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface Doc {
  id: string;
  filename: string;
  chunk_count: number;
  status: string;
}

interface Props {
  refreshKey?: number;
}

export default function DocumentList({ refreshKey }: Props) {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

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
    <div className="space-y-1">
      {docs.map((doc, i) => (
        <motion.div
          key={doc.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04 }}
          className="group flex items-center justify-between rounded-lg p-2.5 transition-colors hover:bg-muted/50"
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
          <Badge variant="secondary" className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">
            {doc.status}
          </Badge>
        </motion.div>
      ))}
    </div>
  );
}
