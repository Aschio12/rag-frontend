/**
 * Build the Action registry at runtime.
 *
 * The registry is the only place where DOM-mutating closures live — every
 * action knows how to ask the page to do something (open a workspace,
 * toggle the theme, etc.) and the page wires those dispatch calls.
 */

import {
  type ActionDef,
  type DispatchedAction,
  type Dispatcher,
} from "./actions-model";

export type { ActionDef, Dispatcher, DispatchedAction };

export function buildActions(dispatch: Dispatcher): ActionDef[] {
  const a: ActionDef[] = [
    {
      id: "ws.library",
      group: "Workspace",
      label: "Open Library",
      hint: "Documents",
      keywords: ["library", "docs", "files"],
      shortcut: "L",
      run: () => dispatch({ kind: "workspace.open", payload: { kind: "library", title: "Library" } }),
    },
    {
      id: "ws.knowledge",
      group: "Knowledge",
      label: "Open Knowledge Graph",
      hint: "Concepts · People · Places",
      shortcut: "K",
      keywords: ["graph", "concepts", "knowledge"],
      run: () => dispatch({ kind: "workspace.open", payload: { kind: "knowledge-graph", title: "Knowledge Graph" } }),
    },
    {
      id: "ws.mindmap",
      group: "Knowledge",
      label: "Open Mind Map",
      hint: "Radial branches",
      shortcut: "M",
      keywords: ["mindmap", "branches", "map"],
      run: () => dispatch({ kind: "workspace.open", payload: { kind: "mind-map", title: "Mind Map" } }),
    },
    {
      id: "ws.timeline",
      group: "Knowledge",
      label: "Open Agent Timeline",
      hint: "Reasoning phases",
      shortcut: "T",
      keywords: ["timeline", "agent", "phases"],
      run: () => dispatch({ kind: "workspace.open", payload: { kind: "agent-timeline", title: "Agent Timeline" } }),
    },
    {
      id: "ws.close-all",
      group: "Workspace",
      label: "Close all workspace windows",
      hint: "Cleanup",
      keywords: ["close", "all", "workspace"],
      run: () => dispatch({ kind: "workspace.close-all" }),
    },
    {
      id: "ws.inspector.sources",
      group: "Workspace",
      label: "Open Inspector · Sources",
      hint: "Citations",
      keywords: ["inspector", "sources", "citations"],
      run: () => dispatch({ kind: "workspace.focus", payload: { section: "sources" } }),
    },
    {
      id: "ws.inspector.memory",
      group: "Workspace",
      label: "Open Inspector · Memory",
      hint: "Pinned context",
      keywords: ["inspector", "memory"],
      run: () => dispatch({ kind: "workspace.focus", payload: { section: "memory" } }),
    },
    {
      id: "ws.inspector.context",
      group: "Workspace",
      label: "Open Inspector · Context",
      hint: "Snapshot",
      keywords: ["inspector", "context"],
      run: () => dispatch({ kind: "workspace.focus", payload: { section: "context" } }),
    },
    {
      id: "ws.inspector.files",
      group: "Workspace",
      label: "Open Inspector · Files",
      hint: "Knowledge files",
      keywords: ["inspector", "files", "library"],
      run: () => dispatch({ kind: "workspace.focus", payload: { section: "files" } }),
    },
    {
      id: "theme.toggle",
      group: "Theme",
      label: "Toggle theme",
      hint: "Dark · Light",
      shortcut: "T",
      keywords: ["theme", "dark", "light", "toggle"],
      run: () => dispatch({ kind: "theme.toggle" }),
    },
    {
      id: "docs.view",
      group: "Documents",
      label: "View all documents",
      hint: "Library",
      keywords: ["documents", "library", "view"],
      run: () => dispatch({ kind: "workspace.open", payload: { kind: "library", title: "Library" } }),
    },
    {
      id: "docs.search",
      group: "Documents",
      label: "Search documents",
      hint: "Filter by name",
      keywords: ["search", "find", "documents", "filter", "query"],
      run: () => dispatch({ kind: "documents.search", payload: { q: "" } }),
    },
    {
      id: "docs.clear-filter",
      group: "Documents",
      label: "Clear document filters",
      keywords: ["clear", "filter", "documents"],
      run: () => dispatch({ kind: "documents.clear-filter" }),
    },
    {
      id: "quick.new-chat",
      group: "Quick",
      label: "New chat",
      hint: "⌘ K",
      keywords: ["new", "chat", "session"],
      run: () => dispatch({ kind: "workspace.open", payload: { kind: "library", title: "Library" } }),
    },
    {
      id: "quick.theme-dark",
      group: "Theme",
      label: "Switch to Dark theme",
      keywords: ["dark", "night", "theme"],
      run: () => dispatch({ kind: "theme.toggle" }),
    },
    {
      id: "quick.theme-light",
      group: "Theme",
      label: "Switch to Light theme",
      keywords: ["light", "day", "theme"],
      run: () => dispatch({ kind: "theme.toggle" }),
    },
  ];
  return a;
}
