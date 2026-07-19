"use client";

/**
 * WorkspaceBridgeProvider — wraps the tree to provide the Dispatcher contract
 * that the Command Palette + Inspector v2 talk to.
 *
 * Created here (under primitives/) so it can be re-used by both the
 * page-level page.tsx and any future integration that opens the palette
 * or inspector.
 */

import * as React from "react";
import type { Dispatcher, DispatchedAction } from "../command/actions-model";

interface WorkspaceBridge {
  dispatch: Dispatcher;
}

const BridgeContext = React.createContext<WorkspaceBridge | null>(null);

export function useWorkspaceBridge(): WorkspaceBridge {
  const ctx = React.useContext(BridgeContext);
  if (!ctx) throw new Error("useWorkspaceBridge must be used within <WorkspaceBridgeProvider>");
  return ctx;
}

export function WorkspaceBridgeProvider({
  value,
  children,
}: {
  value: WorkspaceBridge;
  children: React.ReactNode;
}) {
  return <BridgeContext.Provider value={value}>{children}</BridgeContext.Provider>;
}

export type { Dispatcher, DispatchedAction };
