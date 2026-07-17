"use client";

/**
 * TopBar — 60px transparent hairline chrome.
 *
 * Contains: workspace breadcrumb · search trigger · connection · theme · avatar.
 */

import * as React from "react";
import { motion } from "framer-motion";
import {
  Search,
  Sun,
  Moon,
  Bell,
  PanelLeft,
  Command as CommandIcon,
} from "lucide-react";
import { useAetherTheme } from "@/design-system/themes";
import { useAetherMotion } from "@/design-system/motion";

interface TopBarProps {
  onToggleSidebar: () => void;
  workspaceName: string;
  onCommandOpen?: () => void;
}

export default function TopBar({
  onToggleSidebar,
  workspaceName,
  onCommandOpen,
}: TopBarProps) {
  const { theme, toggle } = useAetherTheme();
  const { reduced } = useAetherMotion();

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: reduced ? 0.2 : 0.4, ease: [0.32, 0.72, 0, 1] }}
      style={{
        position: "sticky",
        top: 12,
        zIndex: 40,
        margin: "0 12px",
      }}
    >
      <div
        style={{
          height: 60,
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "0 14px 0 12px",
          background: "var(--aether-glass-default)",
          backdropFilter: "blur(20px) saturate(160%)",
          WebkitBackdropFilter: "blur(20px) saturate(160%)",
          border: "1px solid var(--aether-border-subtle)",
          borderRadius: 22,
          boxShadow:
            "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 18px 40px -20px rgba(0,0,0,0.55)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <span
          aria-hidden
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 1,
            background:
              "linear-gradient(90deg, transparent, var(--aether-border-accent), transparent)",
            opacity: 0.4,
            pointerEvents: "none",
          }}
        />

        <IconButton onClick={onToggleSidebar} label="Toggle sidebar">
          <PanelLeft size={15} strokeWidth={1.6} />
        </IconButton>

        <div
          className="aether-workspace-name"
          style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}
        >
          <BreadcrumbDot />
          <span
            style={{
              fontSize: 13.5,
              fontWeight: 500,
              color: "var(--aether-text-primary)",
              letterSpacing: "-0.01em",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {workspaceName}
          </span>
        </div>

        <ConnectionChip />

        <div style={{ flex: 1 }} />

        <SearchTrigger onClick={onCommandOpen} />

        <IconButton onClick={toggle} label={`Theme: ${theme}`}>
          <motion.span
            key={theme}
            initial={{ rotate: theme === "dark" ? -30 : 30, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
            style={{ display: "inline-flex" }}
          >
            {theme === "dark" ? (
              <Sun size={15} strokeWidth={1.6} />
            ) : (
              <Moon size={15} strokeWidth={1.6} />
            )}
          </motion.span>
        </IconButton>

        <IconButton label="Notifications">
          <Bell size={15} strokeWidth={1.6} />
        </IconButton>

        <Avatar />
      </div>
    </motion.header>
  );
}

function BreadcrumbDot() {
  return (
    <span
      aria-hidden
      style={{
        display: "inline-block",
        width: 6,
        height: 6,
        borderRadius: 999,
        background: "var(--aether-text-accent)",
        boxShadow: "0 0 8px rgba(232,255,107,0.65)",
      }}
    />
  );
}

function ConnectionChip() {
  return (
    <span
      title="Connected"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 10px",
        background: "var(--aether-hover-tint)",
        border: "1px solid var(--aether-border-subtle)",
        borderRadius: 999,
        fontSize: 10.5,
        letterSpacing: "0.06em",
        color: "var(--aether-text-secondary)",
        textTransform: "uppercase",
      }}
    >
      <motion.span
        animate={{ opacity: [1, 0.35, 1] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        style={{
          width: 6,
          height: 6,
          borderRadius: 999,
          background: "var(--aether-glow-signal-ok, rgba(122,224,162,1))",
          backgroundColor: "#7AE0A2",
          boxShadow: "0 0 8px rgba(122,224,162,0.6)",
        }}
      />
      <span>Live</span>
    </span>
  );
}

function SearchTrigger({ onClick }: { onClick?: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="aether-search-trigger"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: "var(--aether-surface-recessed)",
        border: "1px solid var(--aether-border-subtle)",
        color: "var(--aether-text-tertiary)",
        padding: "7px 10px",
        borderRadius: 999,
        fontSize: 12.5,
        width: 220,
        maxWidth: "40vw",
        cursor: "pointer",
        transition: "all 160ms ease",
      }}
    >
      <Search size={13} strokeWidth={1.6} />
      <span style={{ flex: 1, textAlign: "left" }}>Search anything</span>
      <kbd
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 2,
          padding: "2px 6px",
          fontSize: 10,
          background: "var(--aether-surface-panel)",
          color: "var(--aether-text-tertiary)",
          border: "1px solid var(--aether-border-subtle)",
          borderRadius: 6,
        }}
      >
        <CommandIcon size={9} strokeWidth={1.7} />
        <span>K</span>
      </kbd>
    </motion.button>
  );
}

interface IconButtonProps
  extends Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    "onAnimationStart" | "onAnimationEnd" | "onDragStart" | "onDragEnd" | "onDrag"
  > {
  label: string;
  children: React.ReactNode;
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, children, style, ...rest },
  ref,
) {
  return (
    <motion.button
      ref={ref}
      whileHover={{ y: -1, scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
      aria-label={label}
      style={{
        display: "grid",
        placeItems: "center",
        width: 32,
        height: 32,
        borderRadius: 999,
        background: "transparent",
        color: "var(--aether-text-secondary)",
        border: "1px solid transparent",
        cursor: "pointer",
        transition: "all 160ms ease",
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--aether-hover-tint)";
        e.currentTarget.style.borderColor = "var(--aether-border-subtle)";
        e.currentTarget.style.color = "var(--aether-text-primary)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.borderColor = "transparent";
        e.currentTarget.style.color = "var(--aether-text-secondary)";
      }}
      {...rest}
    >
      {children}
    </motion.button>
  );
});

function Avatar() {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
      aria-label="Open profile"
      style={{
        position: "relative",
        width: 32,
        height: 32,
        borderRadius: 999,
        background:
          "linear-gradient(135deg, var(--aether-text-accent) 0%, var(--aether-text-iris) 100%)",
        color: "var(--aether-text-on-accent)",
        display: "grid",
        placeItems: "center",
        fontSize: 11.5,
        fontWeight: 600,
        border: "1px solid var(--aether-border-default)",
        cursor: "pointer",
        boxShadow: "0 6px 16px -6px rgba(0,0,0,0.45)",
      }}
    >
      <span>A</span>
      <span
        aria-hidden
        style={{
          position: "absolute",
          right: -2,
          top: -2,
          width: 8,
          height: 8,
          borderRadius: 999,
          background: "#7AE0A2",
          border: "2px solid var(--aether-surface-canvas)",
        }}
      />
    </motion.button>
  );
}
