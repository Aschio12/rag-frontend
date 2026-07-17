"use client";

/**
 * AetherMarkdown — opinionated markdown render surface.
 *
 * - Tokenized typography (display for h1, etc.)
 * - Soft drop-in for paragraphs and lists (staggered).
 * - Tables styled as glass rows; blockquotes get a thin lime rule.
 * - Math, diagrams, and code all route into chat sub-surfaces.
 */

import * as React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import { motion } from "framer-motion";
import { useAetherMotion } from "@/design-system/motion";

import { CodeBlock } from "./CodeBlock";
import { InlineCode } from "./InlineCode";
import { MermaidFrame } from "./MermaidFrame";
import {
  CheckSquare,
  Square,
} from "lucide-react";

interface AetherMarkdownProps {
  content: string;
  streaming?: boolean;
}

export const AetherMarkdown = React.memo(function AetherMarkdown({
  content,
  streaming,
}: AetherMarkdownProps) {
  const { reduced } = useAetherMotion();

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduced ? 0.0 : 0.36, ease: [0.32, 0.72, 0, 1] }}
      style={{
        fontSize: 14.5,
        lineHeight: 1.65,
        color: "var(--aether-text-primary)",
        letterSpacing: "-0.005em",
        "--aether-md-color": "var(--aether-text-primary)",
      } as React.CSSProperties}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeHighlight, rehypeKatex]}
        components={{
          code({ className, children, ...props }) {
            const isMermaid =
              /language-mermaid/.test(className ?? "") ||
              String(children ?? "").trim().startsWith(/(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram)/i);
            if (isMermaid) {
              return <MermaidFrame code={String(children ?? "")} />;
            }
            const isInline = !className || /language-/.test(className ?? "") === false;
            if (isInline && !/language-/.test(className ?? "")) {
              return <InlineCode {...props}>{children}</InlineCode>;
            }
            return (
              <CodeBlock className={className} streaming={streaming}>
                {children}
              </CodeBlock>
            );
          },
          pre({ children }) {
            return <>{children}</>;
          },
          h1({ children }) {
            return (
              <Heading level={1} reduced={reduced}>
                {children}
              </Heading>
            );
          },
          h2({ children }) {
            return (
              <Heading level={2} reduced={reduced}>
                {children}
              </Heading>
            );
          },
          h3({ children }) {
            return (
              <Heading level={3} reduced={reduced}>
                {children}
              </Heading>
            );
          },
          p({ children }) {
            return <p style={{ margin: "10px 0 12px", color: "var(--aether-text-primary)" }}>{children}</p>;
          },
          ul({ children }) {
            return (
              <ul
                style={{
                  margin: "10px 0 12px",
                  padding: 0,
                  listStyle: "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                {children}
              </ul>
            );
          },
          ol({ children }) {
            return (
              <ol
                style={{
                  margin: "10px 0 12px",
                  padding: 0,
                  counterReset: "md-counter",
                  listStyle: "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                {children}
              </ol>
            );
          },
          li({ children, checked, ...rest }) {
            const isTask = rest.node && (rest as { node?: { tagName?: string } }).node?.tagName === "li" && (rest as { node?: { properties?: { className?: string[] } } }).node?.properties?.className?.includes("task-list-item");
            if (isTask) {
              return (
                <li
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 8,
                    color: "var(--aether-text-primary)",
                    fontSize: 14,
                  }}
                >
                  {checked ? (
                    <CheckSquare size={14} style={{ color: "var(--aether-text-accent)", marginTop: 4 }} />
                  ) : (
                    <Square size={14} style={{ color: "var(--aether-text-tertiary)", marginTop: 4 }} />
                  )}
                  <span>{children}</span>
                </li>
              );
            }
            const isOrderedItem = typeof children === "object" && children;
            return (
              <li
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  color: "var(--aether-text-primary)",
                  fontSize: 14,
                }}
              >
                <BulletDot />
                <span>{children}</span>
              </li>
            );
          },
          table({ children }) {
            return (
              <div
                style={{
                  margin: "16px 0",
                  borderRadius: 14,
                  border: "1px solid var(--aether-border-subtle)",
                  overflowX: "auto",
                  background: "var(--aether-surface-recessed)",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                }}
              >
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: 13,
                  }}
                >
                  {children}
                </table>
              </div>
            );
          },
          thead({ children }) {
            return (
              <thead
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.04), transparent)",
                }}
              >
                {children}
              </thead>
            );
          },
          th({ children }) {
            return (
              <th
                style={{
                  textAlign: "left",
                  padding: "10px 14px",
                  fontWeight: 500,
                  fontSize: 11,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "var(--aether-text-tertiary)",
                  borderBottom: "1px solid var(--aether-border-default)",
                }}
              >
                {children}
              </th>
            );
          },
          td({ children }) {
            return (
              <td
                style={{
                  padding: "10px 14px",
                  borderTop: "1px solid var(--aether-border-subtle)",
                  color: "var(--aether-text-secondary)",
                }}
              >
                {children}
              </td>
            );
          },
          a({ href, children }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "var(--aether-text-accent)",
                  borderBottom: "1px solid transparent",
                  textDecoration: "none",
                  transition: "border-color 160ms ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderBottomColor = "var(--aether-text-accent)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderBottomColor = "transparent";
                }}
              >
                {children}
              </a>
            );
          },
          blockquote({ children }) {
            return (
              <blockquote
                style={{
                  position: "relative",
                  margin: "14px 0",
                  padding: "10px 16px",
                  background: "var(--aether-surface-recessed)",
                  border: "1px solid var(--aether-border-subtle)",
                  borderLeft: "2px solid var(--aether-text-accent)",
                  borderRadius: 12,
                  color: "var(--aether-text-secondary)",
                  fontStyle: "italic",
                }}
              >
                {children}
              </blockquote>
            );
          },
          hr() {
            return (
              <hr
                style={{
                  margin: "20px 0",
                  border: 0,
                  height: 1,
                  background:
                    "linear-gradient(90deg, transparent, var(--aether-border-default), transparent)",
                }}
              />
            );
          },
          img({ src, alt }) {
            return (
              <img
                src={src}
                alt={alt ?? ""}
                style={{
                  display: "block",
                  maxWidth: "100%",
                  margin: "12px 0",
                  borderRadius: 12,
                  border: "1px solid var(--aether-border-subtle)",
                  boxShadow: "0 12px 32px -16px rgba(0,0,0,0.5)",
                }}
              />
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </motion.div>
  );
});

function Heading({
  level,
  children,
  reduced,
}: {
  level: 1 | 2 | 3;
  children: React.ReactNode;
  reduced: boolean;
}) {
  const config = {
    1: { size: 22, weight: 500, tracking: "-0.03em", margin: "20px 0 12px" },
    2: { size: 18, weight: 500, tracking: "-0.02em", margin: "18px 0 10px" },
    3: { size: 15, weight: 500, tracking: "-0.01em", margin: "14px 0 8px" },
  }[level];
  return (
    <motion.h1
      initial={reduced ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.26 }}
      style={{
        margin: config.margin,
        fontSize: config.size,
        fontWeight: config.weight,
        letterSpacing: config.tracking,
        color: "var(--aether-text-primary)",
      }}
    >
      {children}
    </motion.h1>
    // h1 default tag ok — node expects h1 specifically
  ) as unknown as React.ReactElement;
}

function BulletDot() {
  return (
    <span
      aria-hidden
      style={{
        marginTop: 8,
        display: "inline-block",
        width: 6,
        height: 6,
        borderRadius: 999,
        background: "var(--aether-text-accent)",
        boxShadow: "0 0 8px rgba(232,255,107,0.55)",
        flexShrink: 0,
      }}
    />
  );
}
