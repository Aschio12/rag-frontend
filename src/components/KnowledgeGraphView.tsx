"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import type { Network } from "vis-network";

export interface Node {
  id: string;
  label: string;
  type?: string;
}

export interface Edge {
  source: string;
  target: string;
  label?: string;
}

export interface GraphData {
  nodes: Node[];
  edges: Edge[];
}

interface Props {
  data: GraphData | null;
  loading?: boolean;
}

export default function KnowledgeGraphView({ data, loading }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!data || !containerRef.current || data.nodes.length === 0) return;

    let network: Network | null = null;
    const container = containerRef.current;

    async function render() {
      try {
        const { Network } = await import("vis-network");
        const { DataSet } = await import("vis-data");

        const nodes = new DataSet(
          data.nodes.map((n) => ({
            id: n.id,
            label: n.label,
            title: n.type || "",
            color: n.type === "concept" ? "#00f2fe" : n.type === "person" ? "#7000ff" : n.type === "place" ? "#00ff87" : "#8b5cf6",
            borderWidth: 0,
            size: 20,
            font: { color: "#e4e4e7", size: 11 },
          })),
        );

        const edges = new DataSet(
          data.edges.map((e) => ({
            from: e.source,
            to: e.target,
            label: e.label || "",
            arrows: "to",
            color: { color: "#7000ff", highlight: "#00f2fe" },
            font: { size: 9, color: "#a1a1aa", strokeWidth: 0 },
            width: 1,
          })),
        );

        const options = {
          physics: {
            solver: "forceAtlas2Based",
            forceAtlas2Based: { gravitationalConstant: -40, springLength: 150 },
            stabilization: { iterations: 100 },
          },
          interaction: {
            hover: true,
            tooltipDelay: 200,
            zoomView: true,
          },
          background: "transparent",
        };

        network = new Network(container, { nodes, edges }, options);
      } catch {
        setError(true);
      }
    }

    render();
    return () => {
      if (network) network.destroy();
    };
  }, [data]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center cyber-glass bg-[#030307]/50 rounded-xl border border-white/5">
        <Loader2 className="h-5 w-5 animate-spin text-[#00f2fe]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center cyber-glass bg-[#030307]/50 rounded-xl border border-white/5">
        <p className="text-xs text-muted-foreground/60">Failed to render graph</p>
      </div>
    );
  }

  if (!data || data.nodes.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center cyber-glass bg-[#030307]/50 rounded-xl border border-white/5">
        <p className="text-xs text-muted-foreground/40">Select a document to explore its knowledge graph</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="cyber-glass bg-[#030307]/50 rounded-xl p-5 border border-white/5 glow-violet/5"
    >
      <div ref={containerRef} style={{ height: 360, width: "100%" }} />
    </motion.div>
  );
}
