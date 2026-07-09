"use client";

import { useEffect, useState } from "react";

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
    return <p className="text-xs text-neutral-400">Loading documents...</p>;
  }

  if (docs.length === 0) {
    return <p className="text-xs text-neutral-400">No documents indexed yet.</p>;
  }

  return (
    <ul className="space-y-1">
      {docs.map((doc) => (
        <li
          key={doc.id}
          className="flex items-center justify-between rounded-lg bg-neutral-50 px-3 py-2 text-xs"
        >
          <span className="truncate font-medium text-neutral-700">{doc.filename}</span>
          <span className="shrink-0 text-neutral-400">{doc.chunk_count} chunks</span>
        </li>
      ))}
    </ul>
  );
}
