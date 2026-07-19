"use client";

/**
 * CommandPalette — Raycast-style cmdk-driven palette.
 *
 * Receives an `open` state from outside (typically opened via the TopBar
 * search trigger or ⌘K). Filters an Action list using cmdk's internal
 * fuzzy matcher. Each action runs through the supplied dispatcher.
 */

import * as React from "react";
import { Command } from "cmdk";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Search,
  X,
  CornerDownLeft,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { useAetherMotion } from "@/design-system/motion";
import { buildActions, type ActionDef, type Dispatcher } from "./actions";
import type { ActionGroup } from "./actions-model";

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  dispatch: Dispatcher;
}

const GROUP_ORDER: ActionGroup[] = ["Workspace", "Documents", "Knowledge", "Theme", "Quick"];

const GROUP_LABEL: Record<ActionGroup, string> = {
  Workspace: "Workspace",
  Documents: "Documents",
  Knowledge: "Knowledge",
  Theme: "Theme",
  Quick: "Quick",
};

export const CommandPalette = React.memo(function CommandPalette({
  open,
  onClose,
  dispatch,
}: CommandPaletteProps) {
  const { reduced } = useAetherMotion();
  const [actions] = React.useState<ActionDef[]>(() => buildActions(dispatch));

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="cmdk-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 110,
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            paddingTop: "12dvh",
          }}
          onClick={onClose}
          role="dialog"
          aria-modal
          aria-label="Command palette"
        >
          <motion.div
            key="cmdk-card"
            initial={{ opacity: 0, y: -12, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.985 }}
            transition={
              reduced
                ? { duration: 0.2 }
                : { type: "spring", stiffness: 280, damping: 26 }
            }
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(640px, 92vw)",
              borderRadius: 22,
              background: "var(--aether-glass-strong)",
              border: "1px solid var(--aether-border-default)",
              backdropFilter: "blur(28px) saturate(180%)",
              WebkitBackdropFilter: "blur(28px) saturate(180%)",
              boxShadow:
                "0 1px 0 rgba(255,255,255,0.06) inset, 0 36px 80px -16px rgba(0,0,0,0.65)",
              overflow: "hidden",
              color: "var(--aether-text-primary)",
            }}
          >
            <Command
              label="Aether command palette"
              loop
              shouldFilter
              className="aether-cmdk-root"
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 16px",
                  borderBottom: "1px solid var(--aether-border-subtle)",
                }}
              >
                <Sparkles size={14} strokeWidth={1.6} style={{ color: "var(--aether-text-accent)" }} />
                <Command.Input
                  placeholder="What would you like to do?"
                  autoFocus
                  style={{
                    flex: 1,
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    color: "var(--aether-text-primary)",
                    fontSize: 14,
                    letterSpacing: "-0.005em",
                  }}
                />
                <span
                  style={{
                    fontSize: 9.5,
                    color: "var(--aether-text-muted)",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                  }}
                >
                  Aether
                </span>
                <button
                  onClick={onClose}
                  aria-label="Close"
                  style={{
                    padding: 6,
                    background: "transparent",
                    border: "1px solid var(--aether-border-subtle)",
                    borderRadius: 999,
                    color: "var(--aether-text-tertiary)",
                    cursor: "pointer",
                  }}
                >
                  <X size={12} />
                </button>
              </div>

              <Command.List
                style={{
                  maxHeight: "60vh",
                  overflowY: "auto",
                  padding: "6px 0 10px",
                }}
              >
                <Command.Empty
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    padding: "36px 16px",
                    textAlign: "center",
                    color: "var(--aether-text-tertiary)",
                  }}
                >
                  <Search size={18} strokeWidth={1.6} />
                  <p style={{ fontSize: 13, color: "var(--aether-text-secondary)", margin: 0 }}>
                    Nothing matches that search.
                  </p>
                </Command.Empty>
                {GROUP_ORDER.map((group) => {
                  const inGroup = actions.filter((a) => a.group === group);
                  if (inGroup.length === 0) return null;
                  return (
                    <Command.Group
                      key={group}
                      heading={GROUP_LABEL[group]}
                      style={{ padding: "6px 0" }}
                    >
                      <GroupHeader>{GROUP_LABEL[group]}</GroupHeader>
                      {inGroup.map((a) => (
                        <Command.Item
                          value={a.label + " " + (a.keywords ?? []).join(" ")}
                          key={a.id}
                          onSelect={() => {
                            void a.run({ dispatchAction: (k) => dispatch(k as never) });
                            onClose();
                          }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "8px 16px",
                            margin: "0 8px",
                            borderRadius: 10,
                            transition: "all 120ms ease",
                            cursor: "pointer",
                          }}
                          className="aether-cmdk-item"
                        >
                          <Sparkles
                            size={11}
                            strokeWidth={1.6}
                            style={{ color: "var(--aether-text-muted)" }}
                          />
                          <span
                            style={{
                              fontSize: 12.5,
                              flex: 1,
                              minWidth: 0,
                              letterSpacing: "-0.005em",
                              color: "var(--aether-text-primary)",
                            }}
                          >
                            {a.label}
                          </span>
                          {a.hint && (
                            <span
                              style={{
                                fontSize: 10,
                                letterSpacing: "0.06em",
                                textTransform: "uppercase",
                                color: "var(--aether-text-muted)",
                              }}
                            >
                              {a.hint}
                            </span>
                          )}
                          {a.shortcut && (
                            <kbd
                              aria-hidden
                              style={{
                                padding: "2px 6px",
                                fontSize: 10,
                                background: "var(--aether-surface-recessed)",
                                color: "var(--aether-text-tertiary)",
                                border: "1px solid var(--aether-border-subtle)",
                                borderRadius: 6,
                                letterSpacing: "0.04em",
                              }}
                            >
                              {a.shortcut}
                            </kbd>
                          )}
                        </Command.Item>
                      ))}
                    </Command.Group>
                  );
                })}
              </Command.List>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 16px",
                  borderTop: "1px solid var(--aether-border-subtle)",
                  fontSize: 10,
                  color: "var(--aether-text-muted)",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <ArrowUp size={10} /> <ArrowDown size={10} /> navigate
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <CornerDownLeft size={10} /> open
                </span>
                <span style={{ marginLeft: "auto" }}>escapes</span>
              </div>
            </Command>
            <PaletteStyles />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

function GroupHeader({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        padding: "6px 18px 4px",
        fontSize: 9.5,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "var(--aether-text-muted)",
      }}
    >
      {children}
    </div>
  );
}

/* Local cmdk style overrides — keeps the palette token-based. */
function PaletteStyles() {
  return (
    <style>{`
      .aether-cmdk-root [cmdk-group-heading] {
        background: transparent !important;
        padding: 0 !important;
      }
      .aether-cmdk-root [cmdk-input] {
        outline: none !important;
      }
      .aether-cmdk-item[data-selected="true"] {
        background: var(--aether-hover-tint);
        color: var(--aether-text-primary);
        outline: 1px solid var(--aether-border-accent);
      }
      .aether-cmdk-item[data-selected="true"] span,
      .aether-cmdk-item[data-selected="true"] kbd {
        color: var(--aether-text-primary);
      }
      .aether-cmdk-item[data-selected="true"] svg {
        color: var(--aether-text-accent) !important;
      }
      .aether-cmdk-item {
        color: var(--aether-text-primary);
      }
    `}</style>
  );
}
