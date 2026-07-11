"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface Node {
  id: string;
  label: string;
  type?: string;
}

interface Edge {
  source: string;
  target: string;
  label?: string;
}

interface GraphData {
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

    let network: any = null;
    let container = containerRef.current;

    async function render() {
      try {
        const { Network } = await import("vis-network");
        const { DataSet } = await import("vis-data");

        const nodes = new DataSet(
          data.nodes.map((n, i) => ({
            id: n.id,
            label: n.label,
            title: n.type || "",
            color: n.type === "concept" ? "#6366f1" : n.type === "person" ? "#f59e0b" : n.type === "place" ? "#10b981" : "#8b5cf6",
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
            color: { color: "#52525b", highlight: "#818cf8" },
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
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground/60" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border bg-muted/20">
        <p className="text-xs text-muted-foreground/60">Failed to render graph</p>
      </div>
    );
  }

  if (!data || data.nodes.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border bg-muted/20">
        <p className="text-xs text-muted-foreground/40">No knowledge graph available</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="overflow-hidden rounded-lg border"
    >
      <div ref={containerRef} style={{ height: 400, width: "100%" }} />
    </motion.div>
  );
}
