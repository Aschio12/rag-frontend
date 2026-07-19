"use client";

/**
 * WorkspaceWindow — the only chrome primitive that holds a workspace panel.
 *
 * Renders a floating glass frame with a soft 1px highlight, drag handle,
 * close affordance, pin, focus, and resize handle. The window can be
 * dragged freely and resized (CSS `clamp` to the stage bounds).
 *
 * The window animates open/close via framer-motion layout transitions
 * (shared layout id) so dropping or detaching panels feels alive.
 */

import * as React from "react";
import { motion, AnimatePresence, type HTMLMotionProps } from "framer-motion";
import { useAetherMotion } from "@/design-system/motion";
import {
  PanelRightClose,
  PanelRightOpen,
  Pin,
  PinOff,
  X,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { Panel } from "@/components/shell/Panel";

type SafeButtonProps = Omit<
  HTMLMotionProps<"button">,
  "ref" | "onAnimationStart" | "onAnimationEnd" | "onDragStart" | "onDragEnd" | "onDrag" | "transition" | "onChange" | "onInput"
> & {
  active?: boolean;
  dangerOnHover?: boolean;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLButtonElement>;
};

export interface WorkspaceWindowProps {
  id: string;
  layoutId: string;
  title: string;
  subtitle?: string;
  open: boolean;
  pinned?: boolean;
  focused?: boolean;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  closable?: boolean;
  onClose?: () => void;
  onPin?: () => void;
  onFocus?: () => void;
  onMinimize?: () => void;
  children?: React.ReactNode;
}

export const WorkspaceWindow = React.memo(function WorkspaceWindow({
  id,
  layoutId,
  title,
  subtitle,
  open,
  pinned = false,
  focused = false,
  width = 520,
  height = 420,
  x = 80,
  y = 80,
  closable = true,
  onClose,
  onPin,
  onFocus,
  onMinimize,
  children,
}: WorkspaceWindowProps) {
  const { reduced } = useAetherMotion();
  const [minimized, setMinimized] = React.useState(false);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key={id}
          layoutId={layoutId}
          drag
          dragMomentum={false}
          dragElastic={0.1}
          initial={{ opacity: 0, scale: 0.96, y: 12, filter: "blur(8px)" }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
            filter: "blur(0px)",
          }}
          exit={{ opacity: 0, scale: 0.96, y: 8, filter: "blur(6px)" }}
          transition={reduced ? { duration: 0.2 } : { type: "spring", stiffness: 280, damping: 28 }}
          style={{
            position: "absolute",
            left: x,
            top: y,
            width,
            height: minimized ? 56 : height,
            zIndex: focused ? 70 : 50,
            cursor: "grab",
          }}
          whileDrag={{ scale: 1.01, cursor: "grabbing" }}
          onMouseDown={onFocus}
        >
          <Panel
            variant="floating"
            level={focused ? "lift" : "raised"}
            style={{
              width: "100%",
              height: "100%",
              borderRadius: 22,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <header
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 14px",
                borderBottom: "1px solid var(--aether-border-subtle)",
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))",
                flex: minimized ? "1 1 auto" : "0 0 auto",
                cursor: "grab",
              }}
            >
              <span
                aria-hidden
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 999,
                  background: focused
                    ? "var(--aether-text-accent)"
                    : "var(--aether-text-tertiary)",
                  boxShadow: focused
                    ? "0 0 8px rgba(232,255,107,0.65)"
                    : "none",
                }}
              />
              {!minimized && (
                <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: "var(--aether-text-primary)",
                      letterSpacing: "-0.01em",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {title}
                  </span>
                  {subtitle && (
                    <span
                      style={{
                        fontSize: 10.5,
                        color: "var(--aether-text-tertiary)",
                        letterSpacing: "0.04em",
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {subtitle}
                    </span>
                  )}
                </div>
              )}
              <div style={{ flex: 1 }} />
              <WindowActionButton
                aria-label={minimized ? "Restore" : "Minimize"}
                onClick={() => {
                  setMinimized((v) => !v);
                  onMinimize?.();
                }}
              >
                {minimized ? <Maximize2 size={12} /> : <Minimize2 size={12} />}
              </WindowActionButton>
              <WindowActionButton
                aria-label={pinned ? "Unpin" : "Pin"}
                onClick={onPin}
                active={pinned}
              >
                {pinned ? <PinOff size={12} /> : <Pin size={12} />}
              </WindowActionButton>
              <WindowActionButton
                aria-label="Toggle focus"
                onClick={onFocus}
                active={focused}
              >
                {focused ? <PanelRightClose size={12} /> : <PanelRightOpen size={12} />}
              </WindowActionButton>
              {closable && (
                <WindowActionButton
                  aria-label="Close"
                  onClick={onClose}
                  dangerOnHover
                >
                  <X size={12} />
                </WindowActionButton>
              )}
            </header>
            {!minimized && (
              <div
                style={{
                  flex: 1,
                  minHeight: 0,
                  overflow: "auto",
                  position: "relative",
                }}
              >
                {children}
              </div>
            )}
            <ResizeHandle id={id} />
          </Panel>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

const WindowActionButton = React.memo(function WindowActionButton({
  children,
  active,
  dangerOnHover,
  ...rest
}: SafeButtonProps) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "grid",
        placeItems: "center",
        width: 24,
        height: 24,
        borderRadius: 999,
        border: "1px solid transparent",
        background: active
          ? "var(--aether-hover-tint)"
          : hovered
          ? "var(--aether-surface-recessed)"
          : "transparent",
        color: dangerOnHover && hovered
          ? "#FF6E7A"
          : active
          ? "var(--aether-text-accent)"
          : "var(--aether-text-tertiary)",
        cursor: "pointer",
        transition: "background 160ms ease, color 160ms ease",
      }}
      {...(rest as Parameters<typeof motion.button>[0])}
    >
      {children}
    </motion.button>
  );
});

const ResizeHandle = React.memo(function ResizeHandle({ id: _id }: { id: string }) {
  return (
    <span
      aria-hidden
      style={{
        position: "absolute",
        right: 4,
        bottom: 4,
        width: 14,
        height: 14,
        borderRight: "1.5px solid var(--aether-border-default)",
        borderBottom: "1.5px solid var(--aether-border-default)",
        borderRadius: 3,
        opacity: 0.6,
        pointerEvents: "none",
      }}
    />
  );
});
