"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface MindMapData {
  central: string;
  branches: {
    name: string;
    children?: string[];
  }[];
}

interface Props {
  data: MindMapData | null;
  loading?: boolean;
}

export default function MindMapView({ data, loading }: Props) {
  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground/60" />
      </div>
    );
  }

  if (!data || !data.central) {
    return (
      <div className="flex h-48 items-center justify-center rounded-lg border bg-muted/20">
        <p className="text-xs text-muted-foreground/40">No mind map data</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-xl border bg-gradient-to-br from-background to-muted/20 p-4"
    >
      {/* Central node */}
      <div className="mx-auto mb-6 flex w-fit items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 px-6 py-3 shadow-lg">
        <span className="text-sm font-bold text-white">{data.central}</span>
      </div>

      {/* Branches */}
      <div className="grid gap-3 sm:grid-cols-2">
        {data.branches.map((branch, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-lg border bg-card p-3"
          >
            <p className="mb-2 text-xs font-semibold text-primary">{branch.name}</p>
            {branch.children && branch.children.length > 0 && (
              <ul className="space-y-1">
                {branch.children.map((child, ci) => (
                  <li key={ci} className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                    <span className="mt-0.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground/30" />
                    {child}
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
