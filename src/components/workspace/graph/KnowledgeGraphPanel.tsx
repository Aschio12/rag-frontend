"use client";

/**
 * KnowledgeGraphPanel — the workspace premium Knowledge Graph.
 *
 *  - Mounts an `@xyflow/react` ReactFlow.
 *  - Lays out nodes radially, draws animated gradient edges.
 *  - Filters per kind, semantic search, focus halo, smooth fit-view.
 *  - MiniMap with custom node shape.
 */

import * as React from "react";
import {
  ReactFlow,
  Background,
  MiniMap,
  Panel,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Edge,
  type EdgeMarker,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { motion } from "framer-motion";
import { ScanSearch, RefreshCw, Crosshair, Lock } from "lucide-react";

import { SoftGlassGraphNode, type GraphNodeData } from "./SoftGlassGraphNode";
import { AnimatedGraphEdge } from "./AnimatedGraphEdge";
import { GraphSearch } from "./GraphSearch";
import { GraphFilterRail } from "./GraphFilterRail";
import {
  buildSampleGraph,
  kindColor,
  type ConceptKind,
  type ConceptGraph,
  type ConceptNode,
  type ConceptEdge,
} from "./graph-model";
import { radialLayout } from "./radialLayout";
import { extractKnowledgeGraph } from "@/lib/api";
import { useSelectedDocument } from "@/lib/selection-store";


interface Props {
  docId?: string;
}

const nodeTypes = { glass: SoftGlassGraphNode as unknown as never };
const edgeTypes = { animated: AnimatedGraphEdge as unknown as never };

export const KnowledgeGraphPanel = React.memo(function KnowledgeGraphPanel({
  docId,
}: Props) {
  return (
    <ReactFlowProvider>
      <KnowledgeGraphInner docId={docId} />
    </ReactFlowProvider>
  );
});

function KnowledgeGraphInner(_: { docId?: string }) {
  const sample = React.useRef<ConceptGraph>(buildSampleGraph());
  const docId = useSelectedDocument();

  const [graph, setGraph] = React.useState<ConceptGraph>(() => sample.current);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Pull live graph when a document is selected.
  React.useEffect(() => {
    let cancelled = false;
    if (!docId) {
      setGraph(sample.current);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    void (async () => {
      try {
        const raw = (await extractKnowledgeGraph(docId)) as {
          nodes: Array<{ id: string; label?: string; type?: string; summary?: string }>;
          edges: Array<{ from: string; to: string; label?: string; weight?: number; source?: string; target?: string }>;
        };
        if (cancelled) return;
        const nodes: ConceptNode[] = (raw.nodes ?? []).map((n, i) => ({
          id: String(n.id),
          label: String(n.label ?? "(unnamed)"),
          summary: n.summary,
          kind: ((["concept", "person", "place", "thing", "event"] as ConceptKind[]).find(
            (k) => (n.type ?? "").toLowerCase().includes(k),
          ) ?? "concept") as ConceptKind,
          weight: Math.min(1, 0.5 + (i % 4) * 0.12),
        }));
        const edges: ConceptEdge[] = (raw.edges ?? []).map((e) => ({
          source: String(e.source ?? e.from ?? ""),
          target: String(e.target ?? e.to ?? ""),
          label: e.label,
          weight: typeof e.weight === "number" ? e.weight : 0.45,
        }));
        setGraph({ nodes, edges });
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to extract graph");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // feed reference exists but is unused; intentional — keeps the file hot
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docId]);

  const [query, setQuery] = React.useState("");
  const [activeKinds, setActiveKinds] = React.useState<Set<ConceptKind>>(
    () => new Set<ConceptKind>(["concept", "person", "place", "thing", "event"]),
  );

  const counts = React.useMemo(() => {
    const c: Record<ConceptKind, number> = {
      concept: 0,
      person: 0,
      place: 0,
      thing: 0,
      event: 0,
    };
    for (const n of graph.nodes) c[n.kind] += 1;
    return c;
  }, [graph]);

  const matchedIds = React.useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return new Set<string>();
    return new Set(
      graph.nodes
        .filter(
          (n) =>
            n.label.toLowerCase().includes(q) ||
            (n.summary ?? "").toLowerCase().includes(q) ||
            n.kind.toLowerCase().includes(q),
        )
        .map((n) => n.id),
    );
  }, [graph, query]);

  const { initialNodes, initialEdges } = React.useMemo(() => {
    const layout = radialLayout(graph);
    const nodes: Node[] = layout.nodes.map((n) => ({
      id: n.id,
      type: "glass",
      position: { x: n.x, y: n.y },
      data: {
        id: n.id,
        label: n.label,
        summary: n.summary,
        kind: n.kind,
        weight: n.weight,
        matched: matchedIds.has(n.id),
        focused: false,
      },
    }));
    const edgeList: Edge[] = graph.edges.map((e, i) => ({
      id: `e-${i}-${e.source}-${e.target}`,
      source: e.source,
      target: e.target,
      type: "animated",
      data: { weight: e.weight ?? 0.4, kind: "concept" as ConceptKind },
      markerEnd: { type: "arrowclosed" } as EdgeMarker,
    }));
    return { initialNodes: nodes, initialEdges: edgeList };
  }, [graph]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes as never);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges as never);
  const [focusedId, setFocusedId] = React.useState<string | null>(null);
  const { fitView, setCenter } = useReactFlow();

  // Sync filter / search into node data
  React.useEffect(() => {
    setNodes((prev) =>
      prev.map((n) => ({
        ...n,
        hidden: !activeKinds.has((n.data as unknown as GraphNodeData).kind as ConceptKind),
        data: {
          ...n.data,
          matched: matchedIds.has(n.id),
          focused: focusedId === n.id,
        },
      })),
    );
  }, [activeKinds, matchedIds, focusedId, setNodes]);

  // Smoothly recenter the focused node when it changes.
  React.useEffect(() => {
    if (!focusedId) return;
    const node = nodes.find((n) => n.id === focusedId);
    if (!node) return;
    const target = { x: node.position.x, y: node.position.y };
    setCenter(target.x, target.y, { zoom: 1.2, duration: 460 } as never);
  }, [focusedId, nodes, setCenter]);

  // Drop edges connected to hidden nodes for cleanliness.
  React.useEffect(() => {
    const liveNodes = new Map(nodes.map((n) => [n.id, !n.hidden]));
    setEdges((prev) =>
      prev.map((e) => ({
        ...e,
        hidden: !(liveNodes.get(e.source) && liveNodes.get(e.target)),
      })),
    );
  }, [nodes, setEdges]);

  const handleFit = React.useCallback(() => {
    fitView({ padding: 0.18, duration: 460 });
  }, [fitView]);

  const handleResetLayout = React.useCallback(() => {
    const layout = radialLayout(graph);
    setNodes((prev) =>
      prev.map((n) => {
        const placed = layout.nodes.find((x) => x.id === n.id);
        return placed ? { ...n, position: { x: placed.x, y: placed.y } } : n;
      }),
    );
    setTimeout(() => fitView({ padding: 0.18, duration: 460 }), 80);
  }, [graph, setNodes, fitView]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ height: "100%", position: "relative" }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes as unknown as never}
        edgeTypes={edgeTypes as unknown as never}
        onNodeClick={(_, node) => setFocusedId(node.id)}
        onPaneClick={() => setFocusedId(null)}
        fitView
        fitViewOptions={{ padding: 0.18 }}
        minZoom={0.25}
        maxZoom={1.8}
        proOptions={{ hideAttribution: true }}
        style={{ background: "transparent" }}
      >
        <Background gap={32} size={1} color="rgba(255,255,255,0.04)" />
        <MiniMap
          pannable
          zoomable
          nodeColor={(n) => kindColor((n.data?.kind ?? "concept") as ConceptKind)}
          maskColor="rgba(7,7,8,0.85)"
          style={{
            background: "rgba(11,11,14,0.7)",
            border: "1px solid var(--aether-border-subtle)",
            borderRadius: 12,
          }}
        />
        <Panel position="top-left" style={{ pointerEvents: "auto" }}>
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
            style={{ display: "flex", flexDirection: "column", gap: 8, width: 280 }}
          >
            <GraphSearch
              value={query}
              onChange={setQuery}
              matchCount={matchedIds.size}
              totalCount={graph.nodes.length}
            />
            <GraphFilterRail
              active={activeKinds}
              onChange={setActiveKinds}
              counts={counts}
            />
          </motion.div>
        </Panel>

        <Panel position="top-right">
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
            style={{
              display: "flex",
              gap: 6,
              padding: 6,
              background: "rgba(11,11,14,0.7)",
              border: "1px solid var(--aether-border-subtle)",
              borderRadius: 999,
              backdropFilter: "blur(14px) saturate(160%)",
              WebkitBackdropFilter: "blur(14px) saturate(160%)",
            }}
          >
            <RailIcon onClick={handleFit} label="Fit view">
              <Crosshair size={12} />
            </RailIcon>
            <RailIcon onClick={handleResetLayout} label="Reset layout">
              <RefreshCw size={12} />
            </RailIcon>
            <RailIcon onClick={() => setFocusedId(null)} label="Clear focus">
              <Lock size={12} />
            </RailIcon>
          </motion.div>
        </Panel>

        <Panel position="bottom-left">
          {focusedId ? (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
              style={{
                padding: "10px 14px",
                background: "rgba(11,11,14,0.7)",
                border: "1px solid var(--aether-border-subtle)",
                borderRadius: 14,
                backdropFilter: "blur(14px) saturate(160%)",
                WebkitBackdropFilter: "blur(14px) saturate(160%)",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <ScanSearch size={12} strokeWidth={1.6} style={{ color: kindColor(graph.nodes.find((n) => n.id === focusedId)?.kind ?? "concept") }} />
              <span style={{ fontSize: 11, color: "var(--aether-text-primary)" }}>
                {graph.nodes.find((n) => n.id === focusedId)?.label}
              </span>
              <span style={{ fontSize: 10, color: "var(--aether-text-tertiary)", letterSpacing: "0.04em" }}>
                {graph.nodes.find((n) => n.id === focusedId)?.summary ?? "—"}
              </span>
            </motion.div>
          ) : null}
        </Panel>
      </ReactFlow>
    </motion.div>
  );
}

const RailIcon = React.memo(function RailIcon({
  children,
  onClick,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.92 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      aria-label={label}
      style={{
        display: "grid",
        placeItems: "center",
        width: 28,
        height: 28,
        borderRadius: 999,
        color: "var(--aether-text-tertiary)",
        background: "transparent",
        border: "none",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = "var(--aether-text-primary)";
        e.currentTarget.style.background = "var(--aether-hover-tint)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = "var(--aether-text-tertiary)";
        e.currentTarget.style.background = "transparent";
      }}
    >
      {children}
    </motion.button>
  );
});
