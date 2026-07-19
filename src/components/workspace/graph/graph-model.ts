/**
 * Knowledge Graph data model.
 *
 * Pure presentation types matching the existing `components/KnowledgeGraphView.tsx`
 * payload shape. Re-usable across Phase 6 panels.
 */

export type ConceptKind = "concept" | "person" | "place" | "thing" | "event";

export interface ConceptNode {
  id: string;
  label: string;
  /** Optional short note. */
  summary?: string;
  kind: ConceptKind;
  /** 0..1 — derived weight from degree / relationships. */
  weight?: number;
}

export interface ConceptEdge {
  source: string;
  target: string;
  label?: string;
  /** 0..1 — strength. */
  weight?: number;
}

export interface ConceptGraph {
  nodes: ConceptNode[];
  edges: ConceptEdge[];
}

const KIND_COLOR: Record<ConceptKind, string> = {
  concept: "#A48BFF",
  person: "#E8FF6B",
  place: "#7AE0A2",
  thing: "#FFB68A",
  event: "#9BC5FF",
};

export function kindColor(kind: ConceptKind): string {
  return KIND_COLOR[kind];
}

/** Stable deterministic sample set across renders. */
export function buildSampleGraph(seed = "aether"): ConceptGraph {
  const core: ConceptNode[] = [
    { id: "c-aether", label: "Aether", kind: "concept", weight: 1, summary: "Operating concept. The room you think in." },
    { id: "c-knowledge", label: "Knowledge", kind: "concept", weight: 0.82, summary: "Curated memory." },
    { id: "c-cognition", label: "Cognition", kind: "concept", weight: 0.74 },
    { id: "c-interface", label: "Interface", kind: "concept", weight: 0.66 },
    { id: "c-documents", label: "Documents", kind: "thing", weight: 0.6 },
    { id: "c-agents", label: "Agents", kind: "thing", weight: 0.55 },
    { id: "c-ambient", label: "Ambient Presence", kind: "concept", weight: 0.7 },
    { id: "c-sources", label: "Sources", kind: "concept", weight: 0.5 },
  ];
  const persons: ConceptNode[] = [
    { id: "p-aschalew", label: "Aschalew", kind: "person", weight: 0.7, summary: "Owner · builder." },
    { id: "p-editorial", label: "Editorial", kind: "person", weight: 0.4 },
    { id: "p-researcher", label: "Researcher", kind: "person", weight: 0.4 },
  ];
  const places: ConceptNode[] = [
    { id: "l-room", label: "Workspace", kind: "place", weight: 0.6, summary: "Where the room lives." },
    { id: "l-library", label: "Library", kind: "place", weight: 0.5 },
    { id: "l-inspector", label: "Inspector", kind: "place", weight: 0.4 },
    { id: "l-dock", label: "Dock", kind: "place", weight: 0.4 },
  ];
  const events: ConceptNode[] = [
    { id: "e-ask", label: "Ask", kind: "event", weight: 0.45 },
    { id: "e-stream", label: "Stream", kind: "event", weight: 0.5 },
    { id: "e-commit", label: "Commit", kind: "event", weight: 0.4 },
  ];
  const nodes = [...core, ...persons, ...places, ...events];

  const edges: ConceptEdge[] = [
    { source: "c-aether", target: "c-knowledge", weight: 0.95 },
    { source: "c-aether", target: "c-cognition", weight: 0.8 },
    { source: "c-aether", target: "c-interface", weight: 0.78 },
    { source: "c-aether", target: "c-ambient", weight: 0.7 },

    { source: "c-knowledge", target: "c-documents", weight: 0.9 },
    { source: "c-knowledge", target: "c-sources", weight: 0.8 },
    { source: "c-knowledge", target: "c-agents", weight: 0.7 },

    { source: "c-cognition", target: "c-agents", weight: 0.75 },
    { source: "c-interface", target: "c-documents", weight: 0.6 },
    { source: "c-interface", target: "c-sources", weight: 0.6 },
    { source: "c-ambient", target: "c-interface", weight: 0.7 },

    { source: "p-aschalew", target: "c-aether", weight: 0.85, label: "authors" },
    { source: "p-aschalew", target: "c-knowledge", weight: 0.6 },
    { source: "p-editorial", target: "c-documents", weight: 0.5 },
    { source: "p-researcher", target: "c-sources", weight: 0.55 },

    { source: "l-room", target: "c-aether", weight: 0.7 },
    { source: "l-library", target: "c-documents", weight: 0.85 },
    { source: "l-inspector", target: "c-sources", weight: 0.7 },
    { source: "l-dock", target: "c-interface", weight: 0.55 },

    { source: "e-ask", target: "p-aschalew", weight: 0.55 },
    { source: "e-ask", target: "c-knowledge", weight: 0.6 },
    { source: "e-stream", target: "c-ambient", weight: 0.45 },
    { source: "e-stream", target: "c-agents", weight: 0.5 },
    { source: "e-commit", target: "c-documents", weight: 0.5 },
  ];

  // Tiny ghost rule so the file is uniquely tagged with seed (kept for parity)
  void seed;

  return { nodes, edges };
}

export const KIND_LABEL: Record<ConceptKind, string> = {
  concept: "Concepts",
  person: "People",
  place: "Places",
  thing: "Things",
  event: "Events",
};

export const KIND_BADGE: Record<ConceptKind, string> = {
  concept: "C",
  person: "P",
  place: "L",
  thing: "T",
  event: "E",
};
