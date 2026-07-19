"use client";

/**
 * AnimatedGraphEdge — animated pearl-flow + lit path between two nodes.
 *
 * Custom SVG edge path with a translucent gradient and a small flowing
 * pearl that travels from source to target.
 */

import * as React from "react";
import { BaseEdge, EdgeProps, getSmoothStepPath } from "@xyflow/react";
import { motion } from "framer-motion";
import { kindColor } from "./graph-model";

interface EdgeData {
  sourceKind?: string;
  targetKind?: string;
  weight?: number;
  kind?: "concept" | "person" | "place" | "thing" | "event";
}

export const AnimatedGraphEdge = React.memo(function AnimatedGraphEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps) {
  const d = data as unknown as EdgeData | undefined;
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 16,
  });
  const tint =
    d?.kind ? kindColor(d.kind) : "#A48BFF";

  return (
    <g>
      <BaseEdge id={id} path={edgePath} style={{ display: "none" }} />
      <defs>
        <linearGradient id={`aether-edge-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={tint} stopOpacity={selected ? 0.9 : 0.35} />
          <stop offset="100%" stopColor={tint} stopOpacity={selected ? 0.9 : 0.45} />
        </linearGradient>
      </defs>
      <path
        d={edgePath}
        fill="none"
        stroke={`url(#aether-edge-${id})`}
        strokeWidth={selected ? 1.8 : Math.max(0.7, (d?.weight ?? 0.4) * 1.2)}
        strokeLinecap="round"
      />
      {/* flowing pearl */}
      <circle r={selected ? 3 : 2.2} fill={tint}>
        <animateMotion
          dur={`${Math.max(2.2, 6 - (d?.weight ?? 0.4) * 4)}s`}
          repeatCount="indefinite"
          path={edgePath}
        />
      </circle>
      {/* subtle hover-marker for selected edges */}
      {selected && (
        <motion.circle
          r={3}
          fill={tint}
          initial={{ opacity: 0.4 }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.6, repeat: Infinity }}
        >
          <animateMotion dur="2.4s" repeatCount="indefinite" path={edgePath} />
        </motion.circle>
      )}
    </g>
  );
});
