"use client";

/**
 * MindMapPanel — radial mind map with animated SVG connections.
 *
 *  - Center node ("Aether") rotates slowly.
 *  - Branches orbit at fixed-radii; each has 4 sub-nodes.
 *  - Collapsed branches hide their children + connection lines.
 *  - Smooth zoom + pan via CSS transform (no external deps).
 *  - Gentle focus animation: clicking a branch dims others.
 */

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronRight,
  Maximize2,
  Minus,
  Plus,
  RotateCcw,
  Target,
} from "lucide-react";
import { useAetherMotion } from "@/design-system/motion";
import { buildSampleMindMap, type MindBranch } from "./mindmap-model";
import { generateMindMap } from "@/lib/api";
import { selectionStore } from "@/lib/selection-store";

const ROTATION_SECONDS = 80;

export const MindMapPanel = React.memo(function MindMapPanel() {
  const { reduced } = useAetherMotion();
  const sample = React.useRef(buildSampleMindMap());
  const [data, setData] = React.useState(sample.current);
  const [loading, setLoading] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState<Set<string>>(new Set());
  const [zoom, setZoom] = React.useState(1);
  const [pan, setPan] = React.useState({ x: 0, y: 0 });
  const [focusedId, setFocusedId] = React.useState<string | null>(null);

  const draggingRef = React.useRef<{ startX: number; startY: number; ox: number; oy: number } | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Live: load real mind map when a document is selected.
  React.useEffect(() => {
    let cancelled = false;
    const docId = selectionStore.get();
    if (!docId) {
      setData(sample.current);
      return;
    }
    setLoading(true);
    void (async () => {
      try {
        const raw = (await generateMindMap(docId)) as {
          central?: string;
          branches: Array<{
            id?: string;
            name: string;
            note?: string;
            children?: Array<{ id?: string; name: string; note?: string }>;
          }>;
        };
        if (cancelled) return;
        const branches = (raw.branches ?? []).map((b, i) => ({
          id: b.id || `live-${docId}-${i}`,
          name: b.name,
          note: b.note,
          children: b.children?.map((c, j) => ({
            id: c.id || `live-${docId}-${i}-${j}`,
            name: c.name,
            note: c.note,
          })),
        }));
        setData({
          central: raw.central || sample.current.central,
          branches,
        });
      } catch {
        if (cancelled) return;
        setData(sample.current);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    const id = selectionStore.subscribe(() => {
      const next = selectionStore.get();
      if (!next) setData(sample.current);
    });
    return () => {
      cancelled = true;
      id();
    };
  }, []);

  const toggleCollapse = (id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    draggingRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      ox: pan.x,
      oy: pan.y,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    const dx = e.clientX - draggingRef.current.startX;
    const dy = e.clientY - draggingRef.current.startY;
    setPan({ x: draggingRef.current.ox + dx, y: draggingRef.current.oy + dy });
  };
  const handlePointerUp = () => {
    draggingRef.current = null;
  };

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        height: "100%",
        position: "relative",
        overflow: "hidden",
        background:
          "radial-gradient(120% 100% at 50% 50%, rgba(164,139,255,0.06) 0%, transparent 60%)",
      }}
    >
      <motion.div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          position: "absolute",
          inset: 0,
          display: "grid",
          placeItems: "center",
          cursor: draggingRef.current ? "grabbing" : "grab",
          touchAction: "none",
          userSelect: "none",
        }}
        animate={{
          scale: zoom,
          x: pan.x,
          y: pan.y,
        }}
        transition={
          reduced
            ? { duration: 0.2 }
            : { type: "spring", stiffness: 200, damping: 28 }
        }
      >
        <svg width={1200} height={800} viewBox="-600 -400 1200 800">
          {/* Background rings */}
          <motion.g
            animate={reduced ? {} : { rotate: 360 }}
            transition={
              reduced
                ? undefined
                : { duration: ROTATION_SECONDS, ease: "linear", repeat: Infinity }
            }
            style={{ transformOrigin: "0 0" }}
          >
            <circle r={170} fill="none" stroke="rgba(164,139,255,0.20)" />
            <circle r={290} fill="none" stroke="rgba(232,255,107,0.10)" />
            <circle r={410} fill="none" stroke="rgba(164,139,255,0.08)" />
          </motion.g>

          {/* Connections */}
          <g>
            {data.branches.map((branch, i) => {
              const angle = (i / data.branches.length) * Math.PI * 2 - Math.PI / 2;
              const r = 240;
              const cx = Math.cos(angle) * r;
              const cy = Math.sin(angle) * r;
              return (
                <g key={branch.id}>
                  <AnimatedConnector from={{ x: 0, y: 0 }} to={{ x: cx, y: cy }} color="#A48BFF" />
                  {!collapsed.has(branch.id) &&
                    branch.children?.map((child, j) => {
                      const innerAngle = ((j + 0.5) / (branch.children?.length ?? 1)) * Math.PI - Math.PI / 2;
                      const cr = 110;
                      const ccx = cx + Math.cos(innerAngle) * cr;
                      const ccy = cy + Math.sin(innerAngle) * cr;
                      return (
                        <AnimatedConnector
                          key={child.id}
                          from={{ x: cx, y: cy }}
                          to={{ x: ccx, y: ccy }}
                          color="#7AE0A2"
                          delay={j * 0.05}
                        />
                      );
                    })}
                </g>
              );
            })}
          </g>

          {/* Center node */}
          <foreignObject x={-110} y={-46} width={220} height={92}>
            <CenterNode label={data.central} />
          </foreignObject>

          {/* Branch + child nodes */}
          {data.branches.map((branch, i) => {
            const angle = (i / data.branches.length) * Math.PI * 2 - Math.PI / 2;
            const r = 240;
            const cx = Math.cos(angle) * r;
            const cy = Math.sin(angle) * r;
            const isCollapsed = collapsed.has(branch.id);
            const isFocused = focusedId === branch.id || focusedId === null;
            const dim = !isFocused ? 0.45 : 1;
            return (
              <g key={branch.id} opacity={dim} style={{ transition: "opacity 320ms ease" }}>
                <foreignObject x={cx - 90} y={cy - 32} width={180} height={70}>
                  <BranchNode
                    branch={branch}
                    collapsed={isCollapsed}
                    onToggle={() => toggleCollapse(branch.id)}
                    onFocus={() => setFocusedId(branch.id)}
                  />
                </foreignObject>
                <AnimatePresence>
                  {!isCollapsed &&
                    branch.children?.map((child, j) => {
                      const innerAngle =
                        ((j + 0.5) / (branch.children?.length ?? 1)) * Math.PI - Math.PI / 2;
                      const cr = 110;
                      const ccx = cx + Math.cos(innerAngle) * cr;
                      const ccy = cy + Math.sin(innerAngle) * cr;
                      return (
                        <motion.foreignObject
                          key={child.id}
                          initial={{ opacity: 0, scale: 0.85 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.85 }}
                          transition={{
                            duration: 0.32,
                            delay: j * 0.04,
                            ease: [0.32, 0.72, 0, 1],
                          }}
                          x={ccx - 80}
                          y={ccy - 22}
                          width={160}
                          height={44}
                        >
                          <ChildNode node={child} />
                        </motion.foreignObject>
                      );
                    })}
                </AnimatePresence>
              </g>
            );
          })}
        </svg>
      </motion.div>

      {/* Controls */}
      <motion.div
        initial={reduced ? false : { opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
        style={{
          position: "absolute",
          top: 12,
          right: 12,
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
        <RailIcon onClick={() => setZoom((z) => Math.min(1.8, z + 0.1))} label="Zoom in">
          <Plus size={12} />
        </RailIcon>
        <RailIcon onClick={() => setZoom((z) => Math.max(0.45, z - 0.1))} label="Zoom out">
          <Minus size={12} />
        </RailIcon>
        <RailIcon onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} label="Reset view">
          <Target size={12} />
        </RailIcon>
        <RailIcon onClick={() => setFocusedId(null)} label="Clear focus">
          <RotateCcw size={12} />
        </RailIcon>
      </motion.div>

      {/* Hint */}
      <div
        style={{
          position: "absolute",
          bottom: 12,
          left: 12,
          fontSize: 10,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--aether-text-tertiary)",
        }}
      >
        {collapsed.size > 0
          ? `${collapsed.size} branch${collapsed.size !== 1 ? "es" : ""} folded`
          : "drag to pan · click to focus"}
      </div>
    </motion.div>
  );
});

function RailIcon({
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
        transition: "all 160ms ease",
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
}

function AnimatedConnector({
  from,
  to,
  color,
  delay = 0,
}: {
  from: { x: number; y: number };
  to: { x: number; y: number };
  color: string;
  delay?: number;
}) {
  return (
    <g>
      <motion.line
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        stroke="rgba(255,255,255,0.04)"
        strokeWidth={1}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay, ease: [0.32, 0.72, 0, 1] }}
      />
      <motion.line
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        stroke={color}
        strokeWidth={1}
        strokeDasharray="4 6"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.85 }}
        transition={{ duration: 0.6, delay: delay + 0.05, ease: [0.32, 0.72, 0, 1] }}
        style={{ filter: `drop-shadow(0 0 4px ${color}80)` }}
      />
      <circle r={2.4} fill={color}>
        <animateMotion
          dur="3s"
          repeatCount="indefinite"
          begin={`${1 + delay}s`}
          path={`M ${from.x} ${from.y} L ${to.x} ${to.y}`}
        />
      </circle>
    </g>
  );
}

function CenterNode({ label }: { label: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.42, ease: [0.32, 0.72, 0, 1] }}
      style={{
        width: "100%",
        height: "100%",
        display: "grid",
        placeItems: "center",
        borderRadius: 18,
        background:
          "linear-gradient(180deg, var(--aether-glass-strong), var(--aether-glass-default))",
        border: "1px solid var(--aether-border-accent)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        boxShadow: "0 0 30px -6px rgba(232,255,107,0.45)",
        color: "var(--aether-text-primary)",
        fontWeight: 500,
        letterSpacing: "-0.04em",
        fontSize: 16,
      }}
    >
      {label}
    </motion.div>
  );
}

function BranchNode({
  branch,
  collapsed,
  onToggle,
  onFocus,
}: {
  branch: MindBranch;
  collapsed: boolean;
  onToggle: () => void;
  onFocus: () => void;
}) {
  return (
    <motion.div
      onClick={(e) => {
        e.stopPropagation();
        onFocus();
      }}
      whileHover={{ y: -1, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 200, damping: 22 }}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        padding: "8px 12px",
        borderRadius: 14,
        background: "var(--aether-glass-default)",
        border: "1px solid var(--aether-border-subtle)",
        backdropFilter: "blur(14px) saturate(160%)",
        WebkitBackdropFilter: "blur(14px) saturate(160%)",
        boxShadow:
          "0 1px 0 rgba(255,255,255,0.04) inset, 0 12px 28px -16px rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        gap: 10,
        cursor: "pointer",
      }}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        aria-label={collapsed ? "Expand branch" : "Collapse branch"}
        style={{
          display: "grid",
          placeItems: "center",
          width: 22,
          height: 22,
          borderRadius: 6,
          color: "var(--aether-text-tertiary)",
          background: "var(--aether-surface-recessed)",
          border: "1px solid var(--aether-border-subtle)",
          cursor: "pointer",
          transition: "all 160ms ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "var(--aether-text-accent)";
          e.currentTarget.style.borderColor = "var(--aether-border-accent)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "var(--aether-text-tertiary)";
          e.currentTarget.style.borderColor = "var(--aether-border-subtle)";
        }}
      >
        {collapsed ? (
          <ChevronRight size={11} strokeWidth={1.6} />
        ) : (
          <ChevronDown size={11} strokeWidth={1.6} />
        )}
      </button>
      <div style={{ display: "flex", flexDirection: "column", gap: 1, minWidth: 0 }}>
        <span
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: "var(--aether-text-primary)",
            letterSpacing: "-0.01em",
            whiteSpace: "nowrap",
          }}
        >
          {branch.name}
        </span>
        {branch.note && (
          <span
            style={{
              fontSize: 10,
              color: "var(--aether-text-tertiary)",
              letterSpacing: "0.02em",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {branch.note}
          </span>
        )}
      </div>
    </motion.div>
  );
}

function ChildNode({ node }: { node: MindBranch }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "6px 10px",
        borderRadius: 10,
        background: "var(--aether-surface-recessed)",
        border: "1px solid var(--aether-border-subtle)",
        color: "var(--aether-text-secondary)",
        fontSize: 11,
        letterSpacing: "-0.005em",
        whiteSpace: "nowrap",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
      }}
    >
      {node.name}
    </div>
  );
}
