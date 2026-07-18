"use client";

/**
 * WorkspaceStage — the multi-window scene behind the conversation.
 *
 * Renders ALL open workspace windows from the reducer. Layout is an
 * absolute coordinate space bound to the visible viewport. Each window is
 * draggable; movement is committed via the reducer.
 *
 * pointer-events: none on the empty area; individual windows opt back in.
 */

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { WorkspaceWindow } from "./WorkspaceWindow";
import {
  useWorkspace,
  type WorkspaceWindowInstance,
  type WorkspaceWindowKind,
} from "./useWorkspaceStore";
import { WindowContentRouter } from "./WindowContentRouter";
import { useAetherMotion } from "@/design-system/motion";

interface WorkspaceStageProps {
  topOffset?: number;
}

export const WorkspaceStage = React.memo(function WorkspaceStage({
  topOffset = 0,
}: WorkspaceStageProps) {
  const { state, close, focus } = useWorkspace();
  const { reduced } = useAetherMotion();

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
        {state.windows.length === 0 && (
          <motion.div
            key="empty-hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.24 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
            }}
          />
        )}
      </AnimatePresence>

      {state.windows.map((w) => (
        <WindowRow
          key={w.id}
          win={w}
          onClose={() => close(w.id)}
          onFocus={() => focus(w.id)}
        />
      ))}
    </motion.div>
  );
});

interface WindowRowProps {
  win: WorkspaceWindowInstance;
  onClose: () => void;
  onFocus: () => void;
}

const WindowRow = React.memo(function WindowRow({
  win,
  onClose,
  onFocus,
}: WindowRowProps) {
  const { dispatch } = useWorkspace();
  const kind: WorkspaceWindowKind = win.kind;

  return (
    <WorkspaceWindow
      id={win.id}
      layoutId={`workspace-window-${win.id}`}
      title={win.title}
      subtitle={win.subtitle}
      open={win.open}
      pinned={win.pinned}
      focused={win.focused}
      width={win.w}
      height={win.h}
      x={win.x}
      y={win.y}
      onClose={onClose}
      onFocus={onFocus}
      onPin={() => dispatch({ type: "PIN", id: win.id })}
    >
      <WindowContentRouter id={win.id} kind={kind} payload={win.payload} />
    </WorkspaceWindow>
  );
});
