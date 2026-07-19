"use client";

/**
 * WindowContentRouter — picks the right panel body for a window kind.
 *
 * Document kinds route to the Library system. Other kinds (graph, mindmap,
 * timeline, etc.) are deferred to later phases and render a premium
 * "ComingSoonPanel" until they're built (preserves the workspace
 * composition without claiming backlog work as done).
 */

import * as React from "react";
import type { WorkspaceWindowKind } from "./useWorkspaceStore";
import { DocumentLibraryPanel } from "../library/DocumentLibraryPanel";
import { ComingSoonPanel } from "./ComingSoonPanel";

interface Props {
  id: string;
  kind: WorkspaceWindowKind;
  payload?: Record<string, unknown>;
}

export const WindowContentRouter = React.memo(function WindowContentRouter({
  id,
  kind,
  payload: _payload,
}: Props) {
  switch (kind) {
    case "library":
    case "import":
      return <DocumentLibraryPanel />;

    case "knowledge-graph":
      return (
        <ComingSoonPanel
          kind="knowledge-graph"
          title="Knowledge Graph (deferred)"
          message="xyflow-based soft cards will arrive in a later phase."
        />
      );
    case "mind-map":
      return (
        <ComingSoonPanel
          kind="mind-map"
          title="Mind Map (deferred)"
          message="Radial SVG mind map is queued for a later phase."
        />
      );
    case "agent-timeline":
      return (
        <ComingSoonPanel
          kind="agent-timeline"
          title="Agent Timeline (deferred)"
          message="Cinematic timeline with phase completion dial is queued for a later phase."
        />
      );
    case "conversation":
      return (
        <ComingSoonPanel
          kind="conversation"
          title="Conversation (deferred)"
          message="Inline conversation window — body lifted from existing chat in a later phase."
        />
      );
    case "notes":
      return (
        <ComingSoonPanel
          kind="notes"
          title="Notes (deferred)"
          message="Smart notes with markdown memory are queued for a later phase."
        />
      );
    case "canvas":
      return (
        <ComingSoonPanel
          kind="canvas"
          title="Canvas (deferred)"
          message="Free-form intelligence canvas is queued for a later phase."
        />
      );
    case "preview":
      return (
        <ComingSoonPanel
          kind="preview"
          title="Preview (deferred)"
          message="In-place document preview is queued for a later phase."
        />
      );
    default:
      return (
        <ComingSoonPanel
          kind="conversation"
          title="Workspace window"
          message="Awaiting configuration."
        />
      );
  }
});
