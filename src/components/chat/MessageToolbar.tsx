"use client";

/**
 * MessageToolbar — floating hover toolbar for an assistant message.
 *
 * Buttons:
 *   - Copy
 *   - Regenerate
 *   - Speak
 *   - Pin (bookmark)
 *   - Share
 *   - Export
 *
 * Each icon animates on hover (lift + color shift). The toolbar slides out
 * of the message top and softly fades in.
 */

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bookmark,
  Copy,
  Check,
  Pin,
  RefreshCw,
  Share2,
  Volume2,
  Download,
} from "lucide-react";
import { useAetherMotion } from "@/design-system/motion";

interface MessageToolbarProps {
  visible: boolean;
  copied: boolean;
  bookmarked?: boolean;
  onCopy: () => void;
  onRegenerate?: () => void;
  onSpeak?: () => void;
  onPin?: () => void;
  onShare?: () => void;
  onExport?: () => void;
}

export const MessageToolbar = React.memo(function MessageToolbar({
  visible,
  copied,
  bookmarked,
  onCopy,
  onRegenerate,
  onSpeak,
  onPin,
  onShare,
  onExport,
}: MessageToolbarProps) {
  const { reduced } = useAetherMotion();

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="toolbar"
          initial={{ opacity: 0, y: 6, scale: 0.97, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: 4, scale: 0.97, filter: "blur(2px)" }}
          transition={{ duration: reduced ? 0.16 : 0.28, ease: [0.32, 0.72, 0, 1] }}
          style={{
            position: "absolute",
            top: -38,
            right: 0,
            display: "inline-flex",
            alignItems: "center",
            gap: 2,
            padding: 4,
            background: "var(--aether-glass-strong)",
            border: "1px solid var(--aether-border-default)",
            borderRadius: 999,
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
            boxShadow:
              "0 1px 0 rgba(255,255,255,0.06) inset, 0 18px 36px -16px rgba(0,0,0,0.55)",
            zIndex: 4,
          }}
        >
          <ToolButton label="Copy" onClick={onCopy} active={copied}>
            {copied ? <Check size={13} /> : <Copy size={13} />}
          </ToolButton>
          {onRegenerate && (
            <ToolButton label="Regenerate" onClick={onRegenerate}>
              <RefreshCw size={13} />
            </ToolButton>
          )}
          {onSpeak && (
            <ToolButton label="Speak" onClick={onSpeak}>
              <Volume2 size={13} />
            </ToolButton>
          )}
          {onPin && (
            <ToolButton label="Pin" onClick={onPin} active={bookmarked}>
              {bookmarked ? <Pin size={13} /> : <Bookmark size={13} />}
            </ToolButton>
          )}
          {onShare && (
            <ToolButton label="Share" onClick={onShare}>
              <Share2 size={13} />
            </ToolButton>
          )}
          {onExport && (
            <ToolButton label="Export" onClick={onExport}>
              <Download size={13} />
            </ToolButton>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
});

interface ToolButtonProps {
  label: string;
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
}

const ToolButton = React.memo(function ToolButton({
  label,
  onClick,
  active,
  children,
}: ToolButtonProps) {
  const [hovered, setHovered] = React.useState(false);
  const color = active
    ? "var(--aether-text-accent)"
    : hovered
    ? "var(--aether-text-primary)"
    : "var(--aether-text-tertiary)";

  return (
    <motion.button
      aria-label={label}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileTap={{ scale: 0.92 }}
      animate={{ y: hovered ? -1 : 0, scale: hovered ? 1.06 : 1 }}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
      style={{
        display: "grid",
        placeItems: "center",
        width: 28,
        height: 28,
        borderRadius: 999,
        border: "none",
        cursor: "pointer",
        background: active
          ? "var(--aether-hover-tint)"
          : hovered
          ? "var(--aether-surface-recessed)"
          : "transparent",
        color,
        transition: "background 160ms ease, color 160ms ease",
      }}
    >
      {children}
    </motion.button>
  );
});
