"use client";

/**
 * Inspector — right floating panel, 380px.
 *
 * Collapsed by default; slides open with a shared layout animation.
 * Layout-only placeholders for Sources / Thinking / Memory / Context / Files.
 */

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAetherMotion } from "@/design-system/motion";
import {
  FileSearch2,
  Brain,
  Database,
  Folder,
  Files,
  PanelRight,
  X,
} from "lucide-react";
import { Panel } from "./Panel";

interface InspectorTab {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
}

const tabs: InspectorTab[] = [
  { id: "sources",  label: "Sources",  icon: FileSearch2 },
  { id: "thinking", label: "Thinking", icon: Brain },
  { id: "memory",   label: "Memory",   icon: Database },
  { id: "context",  label: "Context",  icon: Folder },
  { id: "files",    label: "Files",    icon: Files },
];

interface InspectorProps {
  open: boolean;
  onClose: () => void;
}

export default function Inspector({ open, onClose }: InspectorProps) {
  const { reduced } = useAetherMotion();
  const [active, setActive] = React.useState<string>("sources");

  return (
    <AnimatePresence initial={false} mode="wait">
      {open && (
        <motion.aside
          key="inspector"
          initial={{ x: 24, opacity: 0, scale: 0.985 }}
          animate={{ x: 0, opacity: 1, scale: 1 }}
          exit={{ x: 16, opacity: 0, scale: 0.985 }}
          transition={reduced ? { duration: 0.2 } : { type: "spring", stiffness: 280, damping: 28 }}
          style={{ width: 380, flexShrink: 0 }}
        >
          <Panel
            variant="floating"
            level="raised"
            style={{
              position: "sticky",
              top: 84,
              height: "calc(100dvh - 108px)",
              marginRight: 12,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <InspectorHeader onClose={onClose} />
            <Tabs tabs={tabs} active={active} onSelect={setActive} />
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 14px 18px" }}>
              <Placeholder label={tabs.find((t) => t.id === active)?.label ?? ""} />
            </div>
          </Panel>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

function InspectorHeader({ onClose }: { onClose: () => void }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 14px 6px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <PanelRight size={14} strokeWidth={1.6} style={{ color: "var(--aether-text-tertiary)" }} />
        <span
          style={{
            fontSize: 11.5,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--aether-text-tertiary)",
            fontWeight: 500,
          }}
        >
          Inspector
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
          display: "grid",
          placeItems: "center",
          cursor: "pointer",
          transition: "all 160ms ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "var(--aether-text-primary)";
          e.currentTarget.style.borderColor = "var(--aether-border-default)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "var(--aether-text-tertiary)";
          e.currentTarget.style.borderColor = "var(--aether-border-subtle)";
        }}
      >
        <X size={12} strokeWidth={1.6} />
      </button>
    </div>
  );
}

interface TabsProps {
  tabs: InspectorTab[];
  active: string;
  onSelect: (id: string) => void;
}

function Tabs({ tabs, active, onSelect }: TabsProps) {
  return (
    <div
      role="tablist"
      style={{
        display: "flex",
        gap: 4,
        padding: "0 10px 10px",
        overflowX: "auto",
      }}
    >
      <motion.div
        layout
        style={{
          display: "flex",
          gap: 2,
          padding: 3,
          background: "var(--aether-surface-recessed)",
          border: "1px solid var(--aether-border-subtle)",
          borderRadius: 999,
        }}
      >
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = t.id === active;
          return (
            <motion.button
              key={t.id}
              onClick={() => onSelect(t.id)}
              role="tab"
              aria-selected={isActive}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 280, damping: 24 }}
              style={{
                position: "relative",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "5px 11px",
                fontSize: 11.5,
                fontWeight: 500,
                color: isActive
                  ? "var(--aether-text-on-accent)"
                  : "var(--aether-text-tertiary)",
                background: isActive ? "var(--aether-text-accent)" : "transparent",
                border: "none",
                borderRadius: 999,
                cursor: "pointer",
                transition: "color 200ms ease",
                zIndex: 1,
              }}
            >
              {isActive && (
                <motion.span
                  layoutId="inspector-pill"
                  aria-hidden
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "var(--aether-text-accent)",
                    borderRadius: 999,
                    zIndex: -1,
                    boxShadow: "0 0 14px rgba(232,255,107,0.45)",
                  }}
                  transition={{ type: "spring", stiffness: 320, damping: 28 }}
                />
              )}
              <Icon size={11.5} strokeWidth={1.7} />
              <span>{t.label}</span>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}

function Placeholder({ label }: { label: string }) {
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: 12,
        color: "var(--aether-text-tertiary)",
      }}
    >
      <motion.div
        animate={{ y: [0, -2, 0] }}
        transition={{ duration: 5, ease: "easeInOut", repeat: Infinity }}
        style={{
          width: 56,
          height: 56,
          borderRadius: 18,
          background: "var(--aether-surface-recessed)",
          border: "1px solid var(--aether-border-subtle)",
          display: "grid",
          placeItems: "center",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        <span
          style={{
            width: 12,
            height: 12,
            borderRadius: 999,
            background: "var(--aether-text-accent)",
            boxShadow: "0 0 12px rgba(232,255,107,0.55)",
          }}
        />
      </motion.div>
      <div>
        <p
          style={{
            fontSize: 13,
            color: "var(--aether-text-secondary)",
            marginBottom: 4,
            letterSpacing: "-0.01em",
          }}
        >
          {label}
        </p>
        <p style={{ fontSize: 12, color: "var(--aether-text-muted)" }}>
          Will populate as you work.
        </p>
      </div>
    </div>
  );
}
