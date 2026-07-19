/**
 * Mind map model.
 *
 * Pure presentation. A radial tree where each branch node has sub-branches
 * and children. Mind maps are deterministic per seed.
 */

export interface MindBranch {
  id: string;
  name: string;
  /** Optional short note rendered below the title. */
  note?: string;
  /** Children of this branch. */
  children?: MindBranch[];
  /** Optional parent id (used when computing radial parents); not required at runtime. */
  parentId?: string;
}

export interface MindMapData {
  central: string;
  branches: MindBranch[];
}

export function buildSampleMindMap(): MindMapData {
  return {
    central: "Aether",
    branches: [
      {
        id: "b-knowledge",
        name: "Knowledge",
        note: "Curated memory of documents.",
        children: [
          { id: "b-knowledge-1", name: "Documents", note: "Indexed + chunked." },
          { id: "b-knowledge-2", name: "Embeddings", note: "Vector + BM25." },
          { id: "b-knowledge-3", name: "Sources", note: "Provenance chain." },
          { id: "b-knowledge-4", name: "Citations" },
        ],
      },
      {
        id: "b-cognition",
        name: "Cognition",
        note: "How Aether reasons.",
        children: [
          { id: "b-cognition-1", name: "Plan", note: "Decompose intent." },
          { id: "b-cognition-2", name: "Search", note: "Iterative retrieval." },
          { id: "b-cognition-3", name: "Verify", note: "Claim conflict." },
          { id: "b-cognition-4", name: "Compose", note: "Final response." },
        ],
      },
      {
        id: "b-interface",
        name: "Interface",
        note: "Floating glass panels.",
        children: [
          { id: "b-interface-1", name: "Shell" },
          { id: "b-interface-2", name: "Workspace" },
          { id: "b-interface-3", name: "Inspector" },
          { id: "b-interface-4", name: "Dock" },
        ],
      },
      {
        id: "b-ambient",
        name: "Ambient Presence",
        note: "Reactive AI core.",
        children: [
          { id: "b-ambient-1", name: "Idle" },
          { id: "b-ambient-2", name: "Typing" },
          { id: "b-ambient-3", name: "Thinking" },
          { id: "b-ambient-4", name: "Streaming" },
        ],
      },
      {
        id: "b-agents",
        name: "Agents",
        note: "Specialized collaborators.",
        children: [
          { id: "b-agents-1", name: "Researcher" },
          { id: "b-agents-2", name: "Editor" },
          { id: "b-agents-3", name: "Critic" },
          { id: "b-agents-4", name: "Synthesizer" },
        ],
      },
      {
        id: "b-decor",
        name: "Aether Aesthetic",
        note: "Visual signature.",
        children: [
          { id: "b-decor-1", name: "Volt accent" },
          { id: "b-decor-2", name: "Iris under-glow" },
          { id: "b-decor-3", name: "Glass + halo" },
          { id: "b-decor-4", name: "Spatial planes" },
        ],
      },
    ],
  };
}
