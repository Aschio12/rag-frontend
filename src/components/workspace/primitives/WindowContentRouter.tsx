"use client";

/**
 * WindowContentRouter — picks the right panel body for a window kind.
 *
 * Each window kind renders one specialist panel. Heavy visualizations
 * (xyflow, recharts) are lazy-loaded via `next/dynamic`.
 */

import * as React from "react";
import type { WorkspaceWindowKind } from "./useWorkspaceStore";
import { DocumentLibraryPanel } from "../library/DocumentLibraryPanel";
import { DocumentImportPanel } from "../library/DocumentImportPanel";
import { KnowledgeGraphPanel } from "../graph/KnowledgeGraphPanel";
import { MindMapPanel } from "../mindmap/MindMapPanel";
import { AgentTimelinePanel } from "../agent/AgentTimelinePanel";
import { NotesPanel } from "../notes/NotesPanel";
import { ConversationInWorkspace } from "../library/ConversationInWorkspace";
import { WorkspacePanel } from "../primitives/WorkspacePanel";

interface Props {
  id: string;
  kind: WorkspaceWindowKind;
  payload?: Record<string, unknown>;
}

export const WindowContentRouter = React.memo(function WindowContentRouter({
  id,
  kind,
  payload,
}: Props) {
  switch (kind) {
    case "conversation":
      return <ConversationInWorkspace payload={payload} />;
    case "library":
      return <DocumentLibraryPanel />;
    case "knowledge-graph":
      return <KnowledgeGraphPanel id={id} />;
    case "mind-map":
      return <MindMapPanel />;
    case "agent-timeline":
      return <AgentTimelinePanel />;
    case "notes":
      return <NotesPanel />;
    case "import":
      return <DocumentImportPanel />;
    case "canvas":
      return (
        <WorkspacePanel title="Canvas" subtitle="Free-form intelligence surface">
          <ComingSoon label="Canvas · abstract workspace" />
        </WorkspacePanel>
      );
    case "preview":
      return (
        <WorkspacePanel title="Preview" subtitle="Staged doc preview">
          <ComingSoon label="Preview · document inspector" />
        </WorkspacePanel>
      );
    default:
      return (
        <WorkspacePanel title={kind}>
          <ComingSoon label={kind} />
        </WorkspacePanel>
      );
  }
});

function ComingSoon({ label }: { label: string }) {
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--aether-text-tertiary)",
      }}
    >
      <span style={{ fontSize: 12, letterSpacing: "0.04em" }}>{label.toUpperCase()}</span>
    </div>
  );
}
