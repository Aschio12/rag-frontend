"use client";

/**
 * MermaidFrame — uniform container for mermaid diagrams.
 *
 * Mirrors the CodeBlock chrome so diagrams feel like another first-class surface.
 */

import * as React from "react";
import { motion } from "framer-motion";
import { useAetherMotion } from "@/design-system/motion";
import {
  Bold,
  Boxes,
  ChevronDown,
  ChevronRight,
  Component,
  Maximize2,
  Repeat,
} from "lucide-react";

interface MermaidFrameProps {
  code: string;
}

const nodeKindFor = (raw: string): "flow" | "sequence" | "class" | "state" | "graph" | "er" => {
  const t = raw.trim().toLowerCase();
  if (t.startsWith("sequencediagram")) return "sequence";
  if (t.startsWith("classdiagram")) return "class";
  if (t.startsWith("statediagram")) return "state";
  if (t.startsWith("erdiagram")) return "er";
  if (t.startsWith("flowchart") || t.startsWith("flow")) return "flow";
  return "graph";
};

export const MermaidFrame = React.memo(function MermaidFrame({ code }: MermaidFrameProps) {
  const { reduced } = useAetherMotion();
  const ref = React.useRef<HTMLDivElement>(null);
  const [error, setError] = React.useState(false);
  const [expanded, setExpanded] = React.useState(false);
  const kind = React.useMemo(() => nodeKindFor(code), [code]);
  const icon = {
    flow: Component,
    sequence: Repeat,
    class: Boxes,
    state: ChevronRight,
    graph: Boxes,
    er: Bold,
  }[kind];

  React.useEffect(() => {
    let mounted = true;
    async function render() {
      if (!ref.current || !code) return;
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          themeVariables: {
            background: "transparent",
            primaryColor: "transparent",
            primaryTextColor: "#E8FF6B",
            primaryBorderColor: "#A48BFF",
            lineColor: "#A48BFF",
            fontFamily:
              "var(--font-geist-sans, system-ui, sans-serif)",
          },
        });
        const { svg } = await mermaid.render(
          "mermaid-" + Math.random().toString(36).slice(2),
          code,
        );
        if (mounted && ref.current) {
          ref.current.innerHTML = svg;
        }
      } catch {
        if (mounted) setError(true);
      }
    }
    render();
    return () => {
      mounted = false;
    };
  }, [code]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={reduced ? { duration: 0.2 } : { duration: 0.36, ease: [0.32, 0.72, 0, 1] }}
      style={{
        position: "relative",
        margin: "16px 0",
        borderRadius: 18,
        border: "1px solid var(--aether-border-default)",
        background: "rgba(8,8,12,0.78)",
        boxShadow:
          "0 1px 0 rgba(255,255,255,0.04) inset, 0 18px 40px -22px rgba(0,0,0,0.65)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 14px",
          borderBottom: "1px solid var(--aether-border-subtle)",
          background: "linear-gradient(180deg, rgba(255,255,255,0.04), transparent)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {React.createElement(icon, { size: 12, style: { color: "var(--aether-text-iris)" } })}
          <span
            style={{
              fontSize: 10.5,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--aether-text-tertiary)",
              fontFamily:
                "var(--font-geist-mono, 'JetBrains Mono', monospace)",
            }}
          >
            Diagram · {kind}
          </span>
        </div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <button
            aria-label="Toggle source"
            onClick={() => setExpanded((v) => !v)}
            style={{
              padding: "4px 10px",
              fontSize: 11,
              letterSpacing: "0.04em",
              color: "var(--aether-text-tertiary)",
              background: "transparent",
              border: "1px solid var(--aether-border-subtle)",
              borderRadius: 999,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            {expanded ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
            Source
          </button>
          <span
            title="Fullscreen"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              padding: "4px 8px",
              fontSize: 11,
              color: "var(--aether-text-tertiary)",
              border: "1px solid var(--aether-border-subtle)",
              borderRadius: 999,
              background: "var(--aether-surface-recessed)",
              cursor: "default",
            }}
          >
            <Maximize2 size={11} />
          </span>
        </div>
      </div>
      <div
        ref={ref}
        style={{
          padding: "12px",
          display: "grid",
          placeItems: "center",
          maxHeight: expanded ? "none" : 360,
          overflow: "hidden",
        }}
      />
      {error && (
        <pre
          style={{
            background: "rgba(120, 30, 30, 0.25)",
            color: "#FFB3B3",
            padding: 14,
            fontSize: 12,
            overflow: "auto",
            margin: 0,
          }}
        >
          {code}
        </pre>
      )}
      {expanded && (
        <pre
          style={{
            borderTop: "1px solid var(--aether-border-subtle)",
            padding: 14,
            fontSize: 12,
            color: "var(--aether-text-secondary)",
            background: "rgba(8,8,12,0.6)",
            margin: 0,
            whiteSpace: "pre-wrap",
          }}
        >
          {code}
        </pre>
      )}
    </motion.div>
  );
});
