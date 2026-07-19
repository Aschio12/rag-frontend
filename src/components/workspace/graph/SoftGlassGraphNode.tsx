"use client";

/**
 * SoftGlassGraphNode — premium node for the Knowledge Graph.
 *
 * Pure-card style: rounded glass, top corner glyph, focus halo,
 * hover lift. The node is the visual equivalent of a constrained card.
 */

import * as React from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { motion } from "framer-motion";
import { useAetherMotion } from "@/design-system/motion";
import { kindColor, KIND_BADGE, type ConceptNode } from "./graph-model";

export interface GraphNodeData extends ConceptNode {
  focused?: boolean;
  matched?: boolean;
  selected?: boolean;
}

export const SoftGlassGraphNode = React.memo(function SoftGlassGraphNode({
  data,
}: NodeProps) {
  const { reduced } = useAetherMotion();
  const d = data as unknown as GraphNodeData;
  const color = kindColor(d.kind);
  const radius = 14 + (d.weight ?? 0.5) * 14;

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, scale: 0.94, filter: "blur(6px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      whileHover={{ y: -2, scale: 1.025 }}
      transition={{ type: "spring", stiffness: 200, damping: 22 }}
      className={["aether-graph-node", d.focused && "focused"].filter(Boolean).join(" ")}
      style={{
        position: "relative",
        transform: "translate(-50%, -50%)",
        padding: "10px 14px",
        width: Math.max(110, Math.min(220, (d.label?.length ?? 6) * 8)),
        background: "var(--aether-glass-default)",
        border: `1px solid ${d.focused ? color : "var(--aether-border-subtle)"}`,
        borderRadius: radius,
        backdropFilter: "blur(16px) saturate(160%)",
        WebkitBackdropFilter: "blur(16px) saturate(160%)",
        boxShadow: d.focused
          ? `0 1px 0 rgba(255,255,255,0.06) inset, 0 16px 32px -16px rgba(0,0,0,0.55), 0 0 24px -4px ${color}80`
          : "0 1px 0 rgba(255,255,255,0.04) inset, 0 12px 28px -16px rgba(0,0,0,0.45)",
        cursor: "pointer",
      }}
    >
      <Handle type="target" position={Position.Left} className="aether-graph-handle" />
      <Handle type="source" position={Position.Right} className="aether-graph-handle" />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span
          style={{
            width: 22,
            height: 22,
            borderRadius: 8,
            display: "grid",
            placeItems: "center",
            background: `${color}22`,
            border: `1px solid ${color}40`,
            color,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.04em",
          }}
        >
          {KIND_BADGE[d.kind] ?? "•"}
        </span>
        <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
          <span
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: "var(--aether-text-primary)",
              letterSpacing: "-0.01em",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {d.label}
          </span>
          {d.summary && (
            <span
              style={{
                fontSize: 10,
                color: "var(--aether-text-tertiary)",
                letterSpacing: "0.02em",
                marginTop: 2,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {d.summary}
            </span>
          )}
        </div>
      </div>
      {d.matched && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          style={{
            position: "absolute",
            inset: -4,
            borderRadius: radius + 4,
            border: `1.5px dashed ${color}`,
            boxShadow: `0 0 18px -2px ${color}80`,
            pointerEvents: "none",
          }}
        />
      )}
    </motion.div>
  );
});
