"use client";

/**
 * useWorkspaceStore — single source of truth for which workspace windows
 * are open, focused, pinned, and where they live.
 *
 * Use `useWorkspace()` inside the provider to read+write. Each window has:
 *   id, kind (one of the registered panel types), focus, pinned,
 *   position {x, y}, size {w, h}, payload (optional data passed to body)
 *
 * The reducer handles ADD, REMOVE, TOGGLE, FOCUS, MOVE, RESIZE, PIN.
 */

import * as React from "react";

export type WorkspaceWindowKind =
  | "conversation"
  | "library"
  | "knowledge-graph"
  | "mind-map"
  | "agent-timeline"
  | "canvas"
  | "notes"
  | "preview"
  | "import";

export interface WorkspaceWindowInstance {
  id: string;
  kind: WorkspaceWindowKind;
  title: string;
  subtitle?: string;
  open: boolean;
  pinned: boolean;
  focused: boolean;
  x: number;
  y: number;
  w: number;
  h: number;
  zIndex: number;
  payload?: Record<string, unknown>;
}

interface WorkspaceState {
  windows: WorkspaceWindowInstance[];
  topZ: number;
}

type Action =
  | { type: "ADD"; window: WorkspaceWindowInstance }
  | { type: "REMOVE"; id: string }
  | { type: "TOGGLE"; window: WorkspaceWindowInstance }
  | { type: "FOCUS"; id: string }
  | { type: "MOVE"; id: string; x: number; y: number }
  | { type: "RESIZE"; id: string; w: number; h: number }
  | { type: "PIN"; id: string }
  | { type: "CLOSE_ALL" };

const DEFAULT_W = 560;
const DEFAULT_H = 460;

function reducer(state: WorkspaceState, action: Action): WorkspaceState {
  switch (action.type) {
    case "ADD":
      return {
        topZ: state.topZ + 1,
        windows: [
          ...state.windows.map((w) => ({ ...w, focused: false })),
          { ...action.window, zIndex: state.topZ + 1, focused: true },
        ],
      };
    case "REMOVE":
      return { ...state, windows: state.windows.filter((w) => w.id !== action.id) };
    case "TOGGLE": {
      const found = state.windows.find((w) => w.id === action.window.id);
      if (found) {
        return reducer(state, { type: "REMOVE", id: action.window.id });
      }
      return reducer(state, { type: "ADD", window: action.window });
    }
    case "FOCUS": {
      const top = state.topZ + 1;
      return {
        topZ: top,
        windows: state.windows.map((w) =>
          w.id === action.id
            ? { ...w, focused: true, zIndex: top }
            : { ...w, focused: false },
        ),
      };
    }
    case "MOVE":
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.id === action.id ? { ...w, x: action.x, y: action.y } : w,
        ),
      };
    case "RESIZE":
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.id === action.id ? { ...w, w: action.w, h: action.h } : w,
        ),
      };
    case "PIN":
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.id === action.id ? { ...w, pinned: !w.pinned } : w,
        ),
      };
    case "CLOSE_ALL":
      return { ...state, windows: state.windows.filter((w) => w.pinned) };
    default:
      return state;
  }
}

const initialState: WorkspaceState = { windows: [], topZ: 0 };

export function nextWindowId(kind: WorkspaceWindowKind): string {
  return `${kind}-${Math.random().toString(36).slice(2, 9)}`;
}

export function makeWindow(
  kind: WorkspaceWindowKind,
  partial: Partial<WorkspaceWindowInstance> = {},
): WorkspaceWindowInstance {
  return {
    id: partial.id ?? nextWindowId(kind),
    kind,
    title: partial.title ?? kind,
    subtitle: partial.subtitle,
    open: true,
    pinned: partial.pinned ?? false,
    focused: partial.focused ?? false,
    x: partial.x ?? 90 + Math.random() * 80,
    y: partial.y ?? 80 + Math.random() * 60,
    w: partial.w ?? DEFAULT_W,
    h: partial.h ?? DEFAULT_H,
    zIndex: 0,
    payload: partial.payload,
  };
}

interface ContextValue {
  state: WorkspaceState;
  dispatch: React.Dispatch<Action>;
  open: (kind: WorkspaceWindowKind, partial?: Partial<WorkspaceWindowInstance>) => string;
  close: (id: string) => void;
  toggle: (kind: WorkspaceWindowKind, partial?: Partial<WorkspaceWindowInstance>) => void;
  focus: (id: string) => void;
}

const WorkspaceContext = React.createContext<ContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(reducer, initialState);

  const open = React.useCallback(
    (kind: WorkspaceWindowKind, partial: Partial<WorkspaceWindowInstance> = {}) => {
      const id = partial.id ?? nextWindowId(kind);
      const win = makeWindow(kind, { ...partial, id, open: true });
      dispatch({ type: "ADD", window: win });
      return id;
    },
    [],
  );

  const close = React.useCallback((id: string) => dispatch({ type: "REMOVE", id }), []);
  const toggle = React.useCallback(
    (kind: WorkspaceWindowKind, partial: Partial<WorkspaceWindowInstance> = {}) => {
      const id = partial.id ?? nextWindowId(kind);
      const match = state.windows.find((w) => w.id === id || (w.kind === kind && !w.pinned));
      if (match) {
        dispatch({ type: "REMOVE", id: match.id });
      } else {
        const win = makeWindow(kind, { ...partial, id, open: true });
        dispatch({ type: "ADD", window: win });
      }
      return id;
    },
    [state.windows],
  );
  const focus = React.useCallback((id: string) => dispatch({ type: "FOCUS", id }), []);

  return (
    <WorkspaceContext.Provider value={{ state, dispatch, open, close, toggle, focus }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace(): ContextValue {
  const ctx = React.useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used within <WorkspaceProvider>");
  return ctx;
}
