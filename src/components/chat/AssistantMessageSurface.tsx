"use client";

/**
 * AssistantMessageSurface — the floating glass assistant answer card.
 *
 * Responsibilities:
 *   - Floating glass panel, 24px radius, layered shadows.
 *   - Breathing ambient glow while not yet settled.
 *   - Hosts Markdown / streaming / thinking / source trace.
 *   - Hosts the hover-reveal MessageToolbar on top.
 *   - Maintains the existing handler signatures (logic untouched).
 */

import * as React from "react";
import { motion } from "framer-motion";
import { ThinkingOrb } from "./ThinkingOrb";
import { ThinkingState } from "./ThinkingState";
import { AetherMarkdown } from "./AetherMarkdown";
import { StreamingText } from "./StreamingText";
import { SourceTrace } from "./SourceTrace";
import { MessageToolbar } from "./MessageToolbar";
import { useAetherMotion } from "@/design-system/motion";

import type { Source } from "@/lib/api";

export interface AssistantMessageSurfaceProps {
  id: string;
  content: string;
  sources?: Source[];
  isStreaming: boolean;
  bookmarked?: boolean;
  copied?: boolean;
  onCopy?: () => void;
  onRegenerate?: () => void;
  onSpeak?: () => void;
  onPin?: () => void;
  onShare?: () => void;
  onExport?: () => void;
  onOpenSource?: (index: number) => void;
}

export const AssistantMessageSurface = React.memo(function AssistantMessageSurface(
  props: AssistantMessageSurfaceProps,
) {
  const {
    content,
    sources,
    isStreaming,
    bookmarked,
    copied,
    onCopy,
    onRegenerate,
    onSpeak,
    onPin,
    onShare,
    onExport,
    onOpenSource,
  } = props;
  const { reduced } = useAetherMotion();
  const [hovered, setHovered] = React.useState(false);
  const showToolbar = hovered && !isStreaming;

  return (
    <motion.div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      initial={
        reduced
          ? false
          : { opacity: 0, y: 14, scale: 0.985, filter: "blur(6px)" }
      }
      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      transition={{ duration: reduced ? 0.2 : 0.42, ease: [0.32, 0.72, 0, 1] }}
      whileHover={reduced ? undefined : { y: -1, scale: 1.004 }}
      style={{
        position: "relative",
        maxWidth: 760,
        width: "fit-content",
        padding: "14px 18px",
        marginTop: 4,
        marginBottom: 4,
        background: "var(--aether-glass-default)",
        border: "1px solid var(--aether-border-default)",
        borderRadius: 24,
        backdropFilter: "blur(20px) saturate(160%)",
        WebkitBackdropFilter: "blur(20px) saturate(160%)",
        boxShadow:
          "0 1px 0 rgba(255,255,255,0.06) inset, 0 28px 64px -28px rgba(0,0,0,0.55), 0 12px 28px -16px rgba(0,0,0,0.45)",
        color: "var(--aether-text-primary)",
      }}
    >
      {/* Ambient edge highlight (top) */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "inherit",
          pointerEvents: "none",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 12%, transparent 90%, rgba(255,255,255,0.02) 100%)",
        }}
      />
      {/* Slow breathing accent while alive */}
      <motion.span
        aria-hidden
        animate={
          isStreaming && !reduced
            ? { opacity: [0.0, 0.16, 0.0] }
            : { opacity: 0.05 }
        }
        transition={
          isStreaming
            ? { duration: 4, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0.4 }
        }
        style={{
          position: "absolute",
          inset: -1,
          borderRadius: "inherit",
          pointerEvents: "none",
          boxShadow:
            "0 0 36px -8px rgba(232,255,107,0.45), 0 0 60px -12px rgba(164,139,255,0.45)",
        }}
      />

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 10,
        }}
      >
        <ThinkingOrb
          size={18}
          intensity={isStreaming ? 2 : 1}
          title={isStreaming ? "Composing" : "Settled"}
        />
        <span
          style={{
            fontSize: 10.5,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--aether-text-tertiary)",
          }}
        >
          Aether · Assistant
        </span>
      </div>

      {/* Body */}
      <div style={{ minHeight: 18 }}>
        {isStreaming && !content ? (
          <ThinkingState label="Composing" />
        ) : isStreaming ? (
          <div
            style={{
              fontSize: 14.5,
              lineHeight: 1.65,
              letterSpacing: "-0.005em",
            }}
          >
            <StreamingText content={content} />
          </div>
        ) : (
          <AetherMarkdown content={content} />
        )}
      </div>

      {/* Sources */}
      <SourceTrace
        sources={sources}
        loading={isStreaming && !content}
        onOpenSource={(i) => {
          if (sources) onOpenSource?.(i);
        }}
      />

      {/* Toolbar */}
      <MessageToolbar
        visible={showToolbar}
        copied={!!copied}
        bookmarked={bookmarked}
        onCopy={() => onCopy?.()}
        onRegenerate={onRegenerate}
        onSpeak={onSpeak}
        onPin={onPin}
        onShare={onShare}
        onExport={onExport}
      />
    </motion.div>
  );
});
