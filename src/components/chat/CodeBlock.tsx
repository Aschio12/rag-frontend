"use client";

/**
 * CodeBlock — premium code surface.
 *
 * - Glass container with traffic-light language header.
 * - Animated line numbers (fade in as content streams).
 * - Token-revealed lines during streaming.
 * - Copy on demand, with running-environment placeholder badge.
 */

import * as React from "react";
import { motion } from "framer-motion";
import { Check, Copy, Play } from "lucide-react";
import { useAetherMotion } from "@/design-system/motion";

interface CodeBlockProps {
  className?: string;
  children?: React.ReactNode;
  streaming?: boolean;
}

export const CodeBlock = React.memo(function CodeBlock({
  className,
  children,
  streaming,
}: CodeBlockProps) {
  const [copied, setCopied] = React.useState(false);
  const { reduced } = useAetherMotion();
  const code = React.useMemo(() => String(children ?? ""), [children]);
  const lang = (className ?? "").replace("language-", "");
  const validLang = lang || "code";
  const lines = code.split("\n");
  const hasNewlines = lines.length > 1;

  const handleCopy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // noop
    }
  }, [code]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: reduced ? 0.2 : 0.36, ease: [0.32, 0.72, 0, 1] }}
      style={{
        position: "relative",
        margin: "16px 0",
        borderRadius: 18,
        border: "1px solid var(--aether-border-default)",
        background: "rgba(8,8,12,0.78)",
        boxShadow:
          "0 1px 0 rgba(255,255,255,0.04) inset, 0 18px 40px -22px rgba(0,0,0,0.65), 0 0 0 1px rgba(232,255,107,0.04)",
        overflow: "hidden",
        backdropFilter: "blur(20px) saturate(160%)",
        WebkitBackdropFilter: "blur(20px) saturate(160%)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 14px",
          borderBottom: "1px solid var(--aether-border-subtle)",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.04), transparent)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: 999, background: "#ff5f56" }} />
          <span style={{ width: 8, height: 8, borderRadius: 999, background: "#febc2e" }} />
          <span style={{ width: 8, height: 8, borderRadius: 999, background: "#28c840" }} />
          <span
            style={{
              marginLeft: 10,
              fontSize: 10.5,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--aether-text-tertiary)",
              fontFamily:
                "var(--font-geist-mono, 'JetBrains Mono', monospace)",
            }}
          >
            {validLang}
          </span>
        </div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "3px 8px",
              fontSize: 10,
              letterSpacing: "0.04em",
              color: "var(--aether-text-muted)",
              background: "var(--aether-surface-recessed)",
              border: "1px solid var(--aether-border-subtle)",
              borderRadius: 999,
            }}
          >
            <Play size={10} /> Run
          </span>
          <button
            onClick={handleCopy}
            aria-label={copied ? "Copied" : "Copy code"}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 10px",
              fontSize: 11,
              letterSpacing: "0.04em",
              color: copied ? "var(--aether-text-accent)" : "var(--aether-text-tertiary)",
              background: copied
                ? "var(--aether-hover-tint)"
                : "transparent",
              border:
                "1px solid " +
                (copied
                  ? "var(--aether-border-accent)"
                  : "var(--aether-border-subtle)"),
              borderRadius: 999,
              cursor: "pointer",
              transition: "all 160ms ease",
            }}
          >
            {copied ? <Check size={11} /> : <Copy size={11} />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>

      {/* Body */}
      <pre
        className={className}
        style={{
          margin: 0,
          padding: "14px 16px",
          fontSize: 13,
          lineHeight: 1.6,
          fontFamily:
            "var(--font-geist-mono, 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace)",
          color: "var(--aether-text-primary)",
          overflowX: "auto",
          whiteSpace: hasNewlines ? "pre" : "pre-wrap",
        }}
      >
        {hasNewlines ? (
          <code className={className} style={{ display: "block", minWidth: "fit-content" }}>
            {lines.map((line, i) => (
              <span
                key={i}
                style={{
                  display: "flex",
                  gap: 16,
                  opacity: streaming ? Math.min(1, 0.4 + i * 0.06) : 1,
                  transition: "opacity 200ms ease",
                }}
              >
                <span
                  aria-hidden
                  style={{
                    width: 24,
                    textAlign: "right",
                    color: "var(--aether-text-muted)",
                    fontSize: 11,
                    userSelect: "none",
                    opacity: 0.6,
                  }}
                >
                  {i + 1}
                </span>
                <span style={{ flex: 1 }}>{line || "\u00A0"}</span>
              </span>
            ))}
          </code>
        ) : (
          <code className={className}>{code}</code>
        )}
      </pre>
    </motion.div>
  );
});
