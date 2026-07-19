/**
 * Radial orbital layout.
 *
 * Distributes a graph around a glowing center. Anchor concepts orbit
 * closest; non-anchor concepts are pushed to concentric rings, weighted
 * by their `weight` field.
 */
import type { ConceptGraph, ConceptNode } from "./graph-model";

export interface LaidOutNode extends ConceptNode {
  x: number;
  y: number;
}

export interface PositionedGraph {
  nodes: LaidOutNode[];
}

/**
 * Spread the graph radially.
 *
 *  - Anchor node(s) (weight === 1) sit at the center.
 *  - High-weight (0.6..1) nodes form the inner ring.
 *  - Mid/lower-weight nodes populate outer rings ascending by kind.
 */
export function radialLayout(graph: ConceptGraph): PositionedGraph {
  const cx = 0;
  const cy = 0;
  const determineAnchor = (): ConceptNode | null => {
    const exact = graph.nodes.find((n) => (n.weight ?? 0) >= 1);
    if (exact) return exact;
    return graph.nodes.reduce<ConceptNode | null>(
      (best, cur) => (!best || cur.weight! > (best.weight ?? 0) ? cur : best),
      null,
    );
  };
  const anchor = determineAnchor();

  const sorted = [...graph.nodes]
    .filter((n) => n.id !== anchor?.id)
    .sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0));

  const radiusFor = (idx: number, total: number): number => {
    if (total <= 6) return 220;
    if (idx < total * 0.25) return 200;
    if (idx < total * 0.55) return 300;
    if (idx < total * 0.8) return 400;
    return 500;
  };

  const placed: LaidOutNode[] = [];
  if (anchor) {
    placed.push({ ...anchor, x: cx, y: cy });
  }

  let ringIdx = 0;
  let lastRadius = 0;
  sorted.forEach((node) => {
    let radius = radiusFor(ringIdx, sorted.length);
    if (Math.abs(radius - lastRadius) < 90) radius += 90;
    const angle = (ringIdx / Math.max(1, sorted.length)) * Math.PI * 2;
    placed.push({ ...node, x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius });
    lastRadius = radius;
    ringIdx++;
  });

  return { nodes: placed };
}
