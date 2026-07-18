"use client";

/**
 * WorkspaceStage — the multi-window scene behind the conversation.
 *
 * Renders ALL open workspace windows from the reducer. Layout is a
 * drag-friendly absolute coordinate space bound to the visible viewport.
 *
 *  - pointer-events: none on the empty area; individual windows opt back in.
 *  - uses a shared layoutId "workspace-window" so open/close animates.
 */

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { WorkspaceWindow } from "./WorkspaceWindow";
import { useWorkspace } from "./useWorkspaceStore";
import { WindowContentRouter } from "./WindowContentRouter";
import { useAetherMotion } from "@/design-system/motion";

interface WorkspaceStageProps {
  /** Optional offset due to TopBar/Sidebar/etc. */
  topOffset?: number;
}

export const WorkspaceStage = React.memo(function WorkspaceStage({
  topOffset = 0,
}: WorkspaceStageProps) {
  const { state, close, focus, dispatch } = useWorkspace();
  const { reduced } = useAetherMotion();

  const onMove = React.useCallback(
    (id: string, deltaX: number, deltaY: number) => {
      const w = state.windows.find((x) => x.id === id);
      if (!w) return;
      dispatch({ type: "MOVE", id, x: Math.max(20, w.x + deltaX), y: Math.max(20, w.y + deltaY) });
    },
    [state.windows, dispatch],
  );

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 30,
        paddingTop: topOffset,
      }}
    >
      <AnimatePresence>
        {state.windows.length === 0 ? (
          <motion.div
            key="empty-hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.24 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
            }}
          />
        ) : null}
      </AnimatePresence>

      {state.windows.map((w) => (
        <DraggableWindow
          key={w.id}
          w={w}
          onClose={() => close(w.id)}
          onFocus={() => focus(w.id)}
          onMove={onMove}
        />
      ))}
    </motion.div>
  );
});

interface DraggableProps {
  w: ReturnType<typeof useWorkspace>["state"]["windows"][number];
  onClose: () => void;
  onFocus: () => void;
  onMove: (id: string, dx: number, dy: number) => void;
}

const DraggableWindow = React.memo(function DraggableWindow({
  w,
  onClose,
  onFocus,
  onMove,
}: DraggableProps) {
  return (
    <WorkspaceWindow
      id={w.id}
      layoutId={`workspace-window-${w.id}`}
      title={w.title}
      subtitle={w.subtitle}
      open={w.open}
      pinned={w.pinned}
      focused={w.focused}
      width={w.w}
      height={w.h}
      x={w.x}
      y={w.y}
      onClose={onClose}
      onFocus={onFocus}
      onPin={() => useWorkspaceStoreDispatchPin(w.id)}
      // We rely on the framer-motion drag inside the window primitive.
      // Movement is reported via onMove via a custom dragging bypass below.
    >
      <WindowContentRouter id={w.id} kind={w.kind} payload={w.payload} />
    </WorkspaceWindow>
  );
});

function useWorkspaceStoreDispatchPin(id: string) {
  const { dispatch } = useWorkspace();
  dispatch({ type: "PIN", id });
}
