/**
 * Command Palette actions registry.
 *
 * Pure data layer. Each action declares an `id`, owner `group`, label,
 * optional keywords, and a `run(ctx)` callback. Different owners (theme,
 * workspace, docs, etc.) call `run` with their own context object.
 */

export type ActionGroup =
  | "Workspace"
  | "Documents"
  | "Knowledge"
  | "Theme"
  | "Quick";

export type ActionContext = {
  dispatchAction: (action: DispatchedAction) => void;
};

export interface ActionDef {
  id: string;
  group: ActionGroup;
  label: string;
  /** Hint shown on the right in the palette. */
  hint?: string;
  /** Shortcut (display only). */
  shortcut?: string;
  /** Extra words for fuzzy match (label is always searched). */
  keywords?: string[];
  /** Synchronous; UI updates via context. */
  run: (ctx: ActionContext) => void | Promise<void>;
}

/** A category dispatched from the palette, handlers live in their owner. */
export type DispatchedAction =
  | { kind: "workspace.open"; payload: { kind: string; title?: string } }
  | { kind: "workspace.close-all" }
  | { kind: "workspace.focus"; payload: { section: "sources" | "memory" | "context" | "files" } }
  | { kind: "theme.toggle" }
  | { kind: "documents.clear-filter" }
  | { kind: "documents.search"; payload: { q: string } }

export interface Dispatcher {
  (action: DispatchedAction): void;
}
