"use client";

/**
 * Inspector v2 — tab rail + section switcher.
 *
 * Pure presentation. Each tab maps to a section component defined in
 * ./InspectorSections.tsx. Tabs animate between states via the shared layoutId
 * pill pattern that lives across the design system.
 */

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileSearch2,
  Brain,
  Database,
  Folder,
  Files,
  BarChart3,
} from "lucide-react";
import { useAetherMotion } from "@/design-system/motion";

import {
  InspectorSources,
  InspectorTimeline,
  InspectorMemory,
  InspectorContext,
  InspectorFiles,
  InspectorTokenUsage,
} from "./InspectorSections";
import {
  inspectorSections,
  type InspectorSectionId,
} from "./inspector-model";
import { useWorkspace } from "@/components/workspace/primitives/useWorkspaceStore";

const SECTION_ICON: Record<InspectorSectionId, React.ComponentType<{ size?: number; strokeWidth?: number }>> = {
  sources: FileSearch2,
  timeline: BarChart3,
  memory: Brain,
  context: Database,
  files: Files,
  token: BarChart3,
};

interface InspectorV2Props {
  open: boolean;
  onClose: () => void;
  /** Optional explicit default tab; falls back to `sources` when not set. */
  defaultTab?: InspectorSectionId;
}

export const InspectorV2 = React.memo(function InspectorV2({
  open,
  onClose,
  defaultTab = "sources",
}: InspectorV2Props) {
  const [active, setActive] = React.useState<InspectorSectionId>(defaultTab);
  const { reduced } = useAetherMotion();
  const workspace = useWorkspace();

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          key="inspector-v2"
          initial={{ x: 32, opacity: 0, scale: 0.985 }}
          animate={{ x: 0, opacity: 1, scale: 1 }}
          exit={{ x: 24, opacity: 0, scale: 0.985 }}
          transition={
            reduced
              ? { duration: 0.2 }
              : { type: "spring", stiffness: 240, damping: 28 }
          }
          style={{ width: 380, flexShrink: 0 }}
        >
          <div
            style={{
              position: "sticky",
              top: 84,
              height: "calc(100dvh - 108px)",
              marginRight: 12,
              padding: 14,
              borderRadius: 24,
              background: "var(--aether-glass-strong)",
              border: "1px solid var(--aether-border-default)",
              backdropFilter: "blur(28px) saturate(180%)",
              WebkitBackdropFilter: "blur(28px) saturate(180%)",
              boxShadow: "0 32px 64px -16px rgba(0,0,0,0.55), 0 1px 0 rgba(255,255,255,0.05) inset",
              display: "flex",
              flexDirection: "column",
              gap: 10,
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 4,
              }}
            >
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "var(--aether-text-tertiary)",
                  }}
                >
                  Inspector
                </span>
                <span
                  style={{
                    fontSize: 14,
                    color: "var(--aether-text-primary)",
                    fontWeight: 500,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {"Aether"}
                </span>
              </div>
              <button
                aria-label="Close inspector"
                onClick={onClose}
                style={{
                  background: "transparent",
                  border: "1px solid var(--aether-border-subtle)",
                  color: "var(--aether-text-tertiary)",
                  width: 26,
                  height: 26,
                  borderRadius: 999,
                  cursor: "pointer",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                ×
              </button>
            </div>

            {/* Tabs */}
            <div
              role="tablist"
              aria-label="Inspector sections"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 6,
                padding: 4,
                background: "var(--aether-surface-recessed)",
                border: "1px solid var(--aether-border-subtle)",
                borderRadius: 14,
              }}
            >
              {inspectorSections.map((s) => {
                const Icon = SECTION_ICON[s.id];
                const isOn = active === s.id;
                return (
                  <motion.button
                    key={s.id}
                    role="tab"
                    aria-selected={isOn}
                    onClick={() => setActive(s.id)}
                    whileTap={{ scale: 0.96 }}
                    transition={{ type: "spring", stiffness: 280, damping: 22 }}
                    style={{
                      position: "relative",
                      display: "inline-flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 4,
                      padding: "8px 6px",
                      borderRadius: 10,
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      color: isOn ? "var(--aether-text-on-accent)" : "var(--aether-text-tertiary)",
                      zIndex: 1,
                      transition: "color 200ms ease",
                      fontSize: 10.5,
                      letterSpacing: "0.06em",
                        textTransform: "uppercase",
                    }}
                  >
                    <AnimatePresence>
                      {isOn && (
                        <motion.span
                          key="bg"
                          layoutId="inspector-pill-v2"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={
                            reduced
                              ? { duration: 0.16 }
                              : { type: "spring", stiffness: 320, damping: 28 }
                          }
                          style={{
                            position: "absolute",
                            inset: 0,
                            borderRadius: 10,
                            background: "var(--aether-text-accent)",
                            boxShadow: "0 0 14px rgba(232,255,107,0.45)",
                            zIndex: -1,
                          }}
                        />
                      )}
                    </AnimatePresence>
                    <Icon size={11} strokeWidth={1.6} />
                    <span>{s.label}</span>
                  </motion.button>
                );
              })}
            </div>

            {/* Section body */}
            <motion.div
              key={active}
              initial={reduced ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
              style={{
                flex: 1,
                minHeight: 0,
                overflowY: "auto",
                padding: "4px 0",
              }}
            >
              <ActiveSection
                id={active}
                onOpenWorkspace={(kind) =>
                  workspace.open(kind, { title: capitalize(kind) })
                }
              />
            </motion.div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
});

interface ActiveSectionProps {
  id: InspectorSectionId;
  onOpenWorkspace: (kind: "knowledge-graph" | "library" | "mind-map" | "agent-timeline") => void;
}

const ActiveSection = React.memo(function ActiveSection({
  id,
  onOpenWorkspace,
}: ActiveSectionProps) {
  const label = inspectorSections.find((s) => s.id === id)?.label ?? "Inspector";
  const description = inspectorSections.find((s) => s.id === id)?.description;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "4px 0 8px",
          borderBottom: "1px solid var(--aether-border-subtle)",
        }}
      >
        <div>
          <span
            style={{
              fontSize: 16,
              fontWeight: 500,
              letterSpacing: "-0.02em",
              color: "var(--aether-text-primary)",
            }}
          >
            {label}
          </span>
          {description && (
            <p
              style={{
                fontSize: 11,
                color: "var(--aether-text-tertiary)",
                margin: "2px 0 0",
              }}
            >
              {description}
            </p>
          )}
        </div>
      </div>
      {id === "sources" && (
        <InspectorSources />
      )}
      {id === "timeline" && (
        <InspectorTimeline />
      )}
      {id === "memory" && (
        <InspectorMemory />
      )}
      {id === "context" && (
        <>
          <InspectorContext />
          <button
            onClick={() => onOpenWorkspace("agent-timeline")}
            style={{
              alignSelf: "flex-start",
              padding: "6px 12px",
              fontSize: 10.5,
              letterSpacing: "0.04em",
              color: "var(--aether-text-secondary)",
              background: "transparent",
              border: "1px solid var(--aether-border-subtle)",
              borderRadius: 999,
              cursor: "pointer",
            }}
          >
            Open timeline →
          </button>
        </>
      )}
      {id === "files" && (
        <>
          <InspectorFiles />
          <button
            onClick={() => onOpenWorkspace("library")}
            style={{
              alignSelf: "flex-start",
              padding: "6px 12px",
              fontSize: 10.5,
              letterSpacing: "0.04em",
              color: "var(--aether-text-secondary)",
              background: "transparent",
              border: "1px solid var(--aether-border-subtle)",
              borderRadius: 999,
              cursor: "pointer",
            }}
          >
            Open library →
          </button>
        </>
      )}
      {id === "token" && (
        <>
          <InspectorTokenUsage />
        </>
      )}
    </div>
  );
});

function capitalize(s: string): string {
  return s
    .split("-")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}
