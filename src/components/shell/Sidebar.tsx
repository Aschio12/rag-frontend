"use client";

/**
 * Sidebar — floating glass rail.
 *
 * Width animates between 72 (collapsed) and 270 (expanded).
 * Active item carries an animated lime arc on its left edge.
 */

import * as React from "react";
import { motion, AnimatePresence, type LayoutGroup } from "framer-motion";
import { useAetherSpring, useAetherMotion } from "@/design-system/motion";
import { Panel } from "./Panel";
import { AetherGlyph } from "./AetherGlyph";
import {
  Home,
  MessagesSquare,
  FolderKanban,
  FileText,
  Library,
  Bot,
  Search,
  Settings,
  User,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Conversation, Folder } from "@/lib/store";

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  group: "Workspace" | "Knowledge" | "Account";
}

const items: NavItem[] = [
  { id: "home",      label: "Home",        icon: Home,           group: "Workspace" },
  { id: "chats",     label: "Chat",        icon: MessagesSquare, group: "Workspace" },
  { id: "projects",  label: "Projects",    icon: FolderKanban,   group: "Workspace" },
  { id: "documents", label: "Documents",   icon: FileText,       group: "Knowledge" },
  { id: "knowledge", label: "Knowledge",   icon: Library,        group: "Knowledge" },
  { id: "mind-map",  label: "Mind Map",    icon: Bot,            group: "Knowledge" },
  { id: "agents",    label: "Agents",      icon: Bot,            group: "Workspace" },
  { id: "settings",  label: "Settings",    icon: Settings,       group: "Account" },
  { id: "profile",   label: "Profile",     icon: User,           group: "Account" },
];

// de-dup "Agents"/"Mind Map" both Bot — keep visually distinct by id order
items.splice(items.findIndex((i) => i.id === "mind-map") + 1, 0, {
  id: "search", label: "Search", icon: Search, group: "Workspace",
});

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  activeView: string;
  setActiveView: (v: string) => void;
  conversations?: Conversation[];
  activeId?: string | null;
  onSelectConversation?: (id: string) => void;
  onNewChat?: () => void;
  onDeleteConversation?: (id: string) => void;
  onPinConversation?: (id: string) => void;
  onArchiveConversation?: (id: string) => void;
  onAutoRename?: (id: string) => void;
  folders?: Folder[];
  onCreateFolder?: (name: string) => void;
  onDeleteFolder?: (folderId: string) => void;
  onMoveToFolder?: (convId: string, folderId: string | undefined) => void;
  onAddTag?: (convId: string, tag: string) => void;
  onRemoveTag?: (convId: string, tag: string) => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

const groupOrder: NavItem["group"][] = ["Workspace", "Knowledge", "Account"];

export default function Sidebar({
  collapsed,
  setCollapsed,
  activeView,
  setActiveView,
  conversations,
  activeId,
  onSelectConversation,
  onNewChat,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const { reduced } = useAetherMotion();
  const spring = useAetherSpring("panel");

  const grouped = React.useMemo(() => {
    const map: Record<string, NavItem[]> = { Workspace: [], Knowledge: [], Account: [] };
    for (const i of items) map[i.group].push(i);
    return map;
  }, []);

  const stateWidth = collapsed && !mobileOpen ? 72 : 270;

  return (
    <>
      {mobileOpen && (
        <div
          aria-hidden
          className="fixed inset-0 z-40"
          style={{
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
          onClick={onCloseMobile}
        />
      )}
      <motion.aside
        animate={{ width: stateWidth }}
        transition={reduced ? { duration: 0.2 } : spring}
        className={[
          "fixed md:relative left-3 top-3 bottom-3 z-[var(--aether-z-rail)] md:left-3",
          mobileOpen ? "translate-x-0" : "md:translate-x-0",
        ].join(" ")}
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Panel
          variant="glass"
          level="rest"
          style={{
            width: "100%",
            height: "100%",
            padding: 14,
            borderRadius: 24,
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          {/* Brand glyph */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              paddingLeft: collapsed ? 0 : 6,
              justifyContent: collapsed ? "center" : "flex-start",
              position: "relative",
              minHeight: 36,
            }}
          >
            <AetherGlyph size={26} arc={0.65} title="Aether" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -4 }}
                  transition={{ duration: 0.16 }}
                  style={{
                    fontFamily: "var(--font-geist-sans, system-ui, sans-serif)",
                    fontWeight: 500,
                    letterSpacing: "-0.02em",
                    fontSize: 15,
                    color: "var(--aether-text-primary)",
                  }}
                >
                  Aether
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* Nav */}
          <motion.nav
            layout
            style={{ display: "flex", flexDirection: "column", gap: 14, flex: 1, overflowY: "auto", overflowX: "hidden", paddingRight: 2 }}
          >
            {groupOrder.map((g) => (
              <NavGroup
                key={g}
                label={g}
                items={grouped[g]}
                collapsed={collapsed}
                activeView={activeView}
                setActiveView={(id) => {
                  setActiveView(id);
                  onCloseMobile?.();
                }}
              />
            ))}

            {!collapsed && conversations && conversations.length > 0 && (
              <div style={{ marginTop: 4 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0 6px 6px",
                  }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: "var(--aether-text-tertiary)",
                    }}
                  >
                    Recent
                  </span>
                  {onNewChat && (
                    <button
                      onClick={onNewChat}
                      aria-label="New chat"
                      style={{
                        background: "transparent",
                        border: "1px solid var(--aether-border-subtle)",
                        width: 22,
                        height: 22,
                        borderRadius: 999,
                        color: "var(--aether-text-tertiary)",
                        display: "grid",
                        placeItems: "center",
                        cursor: "pointer",
                        transition: "all 160ms ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = "var(--aether-text-accent)";
                        e.currentTarget.style.borderColor = "var(--aether-border-accent)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = "var(--aether-text-tertiary)";
                        e.currentTarget.style.borderColor = "var(--aether-border-subtle)";
                      }}
                    >
                      <Plus size={11} />
                    </button>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {conversations.slice(0, 8).map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        onSelectConversation?.(c.id);
                        setActiveView("chats");
                        onCloseMobile?.();
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "7px 10px",
                        borderRadius: 10,
                        background:
                          c.id === activeId
                            ? "var(--aether-hover-tint)"
                            : "transparent",
                        color:
                          c.id === activeId
                            ? "var(--aether-text-primary)"
                            : "var(--aether-text-tertiary)",
                        border: "none",
                        cursor: "pointer",
                        textAlign: "left",
                        fontSize: 12.5,
                        fontWeight: 400,
                        transition: "all 160ms ease",
                      }}
                    >
                      <span
                        style={{
                          width: 4,
                          height: 4,
                          borderRadius: 999,
                          background:
                            c.id === activeId
                              ? "var(--aether-text-accent)"
                              : "var(--aether-text-muted)",
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          flex: 1,
                        }}
                      >
                        {c.title || "New chat"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.nav>

          {/* Footer */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: collapsed ? "center" : "space-between",
              padding: 6,
              borderTop: "1px solid var(--aether-border-subtle)",
            }}
          >
            {!collapsed && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 11,
                  color: "var(--aether-text-tertiary)",
                }}
              >
                <span
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 999,
                    background:
                      "linear-gradient(135deg, var(--aether-text-accent) 0%, var(--aether-text-iris) 100%)",
                    color: "var(--aether-text-on-accent)",
                    display: "grid",
                    placeItems: "center",
                    fontSize: 10,
                    fontWeight: 600,
                  }}
                >
                  A
                </span>
                <span>Aschalew</span>
              </div>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
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
              {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
            </button>
          </div>
        </Panel>
      </motion.aside>
    </>
  );
}

interface NavGroupProps {
  label: string;
  items: NavItem[];
  collapsed: boolean;
  activeView: string;
  setActiveView: (id: string) => void;
}

function NavGroup({ label, items, collapsed, activeView, setActiveView }: NavGroupProps) {
  return (
    <div>
      {!collapsed && (
        <div
          style={{
            padding: "4px 8px 6px",
            fontSize: 10,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--aether-text-muted)",
          }}
        >
          {label}
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {items.map((item) => (
          <NavButton
            key={item.id}
            item={item}
            active={activeView === item.id}
            collapsed={collapsed}
            onClick={() => setActiveView(item.id)}
          />
        ))}
      </div>
    </div>
  );
}

interface NavButtonProps {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  onClick: () => void;
}

const NavButton = React.memo(function NavButton({ item, active, collapsed, onClick }: NavButtonProps) {
  const Icon = item.icon;
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -1, scale: 1.02 }}
      whileTap={{ scale: 0.985 }}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
      aria-current={active ? "page" : undefined}
      title={collapsed ? item.label : undefined}
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: 10,
        width: "100%",
        padding: collapsed ? "10px 0" : "9px 10px",
        justifyContent: collapsed ? "center" : "flex-start",
        background: active ? "var(--aether-hover-tint)" : "transparent",
        border: "none",
        borderRadius: 12,
        color: active ? "var(--aether-text-primary)" : "var(--aether-text-tertiary)",
        cursor: "pointer",
        fontSize: 13,
        fontWeight: active ? 500 : 400,
        letterSpacing: "-0.005em",
        transition: "color 160ms ease, background 160ms ease",
        outline: "none",
      }}
    >
      {active && (
        <motion.span
          layoutId="sidebar-arc"
          initial={{ scaleY: 0, opacity: 0 }}
          animate={{ scaleY: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 320, damping: 26 }}
          aria-hidden
          style={{
            position: "absolute",
            left: -10,
            top: 8,
            bottom: 8,
            width: 2,
            borderRadius: 999,
            background:
              "linear-gradient(180deg, var(--aether-text-accent) 0%, var(--aether-text-iris) 100%)",
            boxShadow: "0 0 12px rgba(232,255,107,0.55)",
            transformOrigin: "center",
          }}
        />
      )}
      <motion.span
        animate={
          active
            ? { color: "var(--aether-text-accent)", filter: "drop-shadow(0 0 6px rgba(232,255,107,0.45))" }
            : { color: "var(--aether-text-tertiary)", filter: "none" }
        }
        transition={{ duration: 0.2 }}
        style={{ display: "inline-flex" }}
      >
        <Icon size={16} strokeWidth={1.6} />
      </motion.span>
      {!collapsed && (
        <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {item.label}
        </span>
      )}
      {!collapsed && item.group === "Workspace" && active && (
        <motion.span
          initial={{ opacity: 0, x: 4 }}
          animate={{ opacity: 0.6, x: 0 }}
          style={{
            marginLeft: "auto",
            width: 4,
            height: 4,
            borderRadius: 999,
            background: "var(--aether-text-accent)",
          }}
        />
      )}
    </motion.button>
  );
});
