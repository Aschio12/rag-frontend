"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export interface MindMapData {
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
      <div className="flex h-48 items-center justify-center cyber-glass bg-[#030307]/50 rounded-xl border border-white/5">
        <Loader2 className="h-5 w-5 animate-spin text-[#00f2fe]" />
      </div>
    );
  }

  if (!data || !data.central) {
    return (
      <div className="flex h-48 items-center justify-center cyber-glass bg-[#030307]/50 rounded-xl border border-white/5">
        <p className="text-xs text-muted-foreground/40">No mind map data</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="cyber-glass bg-[#030307]/50 rounded-xl p-5 border border-white/5 glow-violet/5"
    >
      {/* Central node */}
      <div className="mx-auto mb-6 flex w-fit items-center justify-center rounded-2xl bg-gradient-to-br from-[#00f2fe] to-[#7000ff] px-6 py-3 shadow-lg shadow-[#7000ff]/20">
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
            className="rounded-lg border border-white/5 bg-white/[0.02] p-3"
          >
            <p className="mb-2 text-xs font-semibold text-[#00f2fe]">{branch.name}</p>
            {branch.children && branch.children.length > 0 && (
              <ul className="space-y-1">
                {branch.children.map((child, ci) => (
                  <li key={ci} className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                    <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#00f2fe] shadow-[0_0_6px_rgba(0,242,254,0.4)]" />
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
