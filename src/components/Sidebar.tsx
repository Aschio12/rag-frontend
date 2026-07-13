"use client";

import { type Dispatch, type SetStateAction, useState } from "react";
import { motion } from "framer-motion";
import {
  Archive,
  Bot,
  ChevronLeft,
  ChevronRight,
  FileText,
  Folder,
  FolderKanban,
  Home,
  Library,
  MessagesSquare,
  Pencil,
  Pin,
  Plus,
  Search,
  Settings,
  Tags,
  Trash2,
  User,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { Conversation, Folder } from "@/lib/store";
import { StaggerContainer } from "@/components/animations/StaggerContainer";

interface NavItem {
  icon: typeof Home;
  label: string;
  id: string;
}

const navItems: NavItem[] = [
  { icon: Home, label: "Home", id: "home" },
  { icon: MessagesSquare, label: "Chats", id: "chats" },
  { icon: FolderKanban, label: "Projects", id: "projects" },
  { icon: FileText, label: "Documents", id: "documents" },
  { icon: Library, label: "Knowledge Bases", id: "knowledge" },
  { icon: Bot, label: "Agents", id: "agents" },
  { icon: Search, label: "Search", id: "search" },
];

const bottomItems: NavItem[] = [
  { icon: Settings, label: "Settings", id: "settings" },
  { icon: User, label: "Profile", id: "profile" },
];

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: Dispatch<SetStateAction<boolean>>;
  activeView: string;
  setActiveView: Dispatch<SetStateAction<string>>;
  conversations?: Conversation[];
  activeId?: string | null;
  onSelectConversation?: (id: string) => void;
  onNewChat?: () => void;
  onPinConversation?: (id: string) => void;
  onArchiveConversation?: (id: string) => void;
  onDeleteConversation?: (id: string) => void;
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

function NavItemButton({
  item,
  isActive,
  isHovered,
  collapsed,
  onSelect,
  onHoverStart,
  onHoverEnd,
  layoutId = "activeNavGlow",
}: {
  item: NavItem;
  isActive: boolean;
  isHovered: boolean;
  collapsed: boolean;
  onSelect: () => void;
  onHoverStart: () => void;
  onHoverEnd: () => void;
  layoutId?: string;
}) {
  const Icon = item.icon;
  return (
    <motion.div
      whileHover={{ scale: 1.02, x: collapsed ? 0 : 4 }}
      whileTap={{ scale: 0.98 }}
      className="group"
    >
      <Tooltip open={collapsed ? isHovered : undefined}>
        <TooltipTrigger asChild>
          <button
            onClick={onSelect}
            onMouseEnter={onHoverStart}
            onMouseLeave={onHoverEnd}
            className={cn(
              "relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-300",
              isActive
                ? "text-white"
                : "text-gray-400 hover:text-white",
              collapsed && "justify-center px-2",
            )}
          >
            {isActive && (
              <motion.div
                layoutId={layoutId}
                className="absolute left-0 w-[3px] h-3/5 bg-gradient-to-b from-[#00f2fe] to-[#7000ff] glow-cyan rounded-full"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <Icon className={cn("w-5 h-5 shrink-0", isActive ? "text-[#00f2fe]" : "text-gray-400 group-hover:text-[#00f2fe]")} />
            {!collapsed && (
              <span className="z-10 text-xs font-medium tracking-widest uppercase">{item.label}</span>
            )}
          </button>
        </TooltipTrigger>
        {collapsed && (
          <TooltipContent side="right" className="text-xs">
            {item.label}
          </TooltipContent>
        )}
      </Tooltip>
    </motion.div>
  );
}

export default function Sidebar({ collapsed, setCollapsed, activeView, setActiveView, conversations, activeId, onSelectConversation, onNewChat, onPinConversation, onArchiveConversation, onDeleteConversation, onAutoRename, folders, onCreateFolder, onDeleteFolder, onMoveToFolder, onAddTag, onRemoveTag, mobileOpen, onCloseMobile }: SidebarProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Close mobile sidebar when selecting a conversation
  const handleSelect = (id: string) => {
    onSelectConversation?.(id);
    setActiveView("chats");
    onCloseMobile?.();
  };

  return (
    <TooltipProvider delayDuration={300}>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden" onClick={onCloseMobile} />
      )}
      <motion.aside
        animate={{ width: collapsed && !mobileOpen ? 60 : 240 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={cn(
          "flex h-dvh flex-col overflow-hidden shrink-0",
          "py-4 my-2 ml-2 max-md:my-0 max-md:ml-0 rounded-2xl max-md:rounded-none",
          "cyber-glass border-r border-white/5",
          mobileOpen && "fixed left-0 top-0 z-50 shadow-xl max-md:my-0 max-md:ml-0",
          "max-md:absolute max-md:z-50",
          collapsed && !mobileOpen && "max-md:hidden",
        )}
      >
        <div className={cn("flex items-center px-3 mb-2", collapsed ? "justify-center" : "justify-between")}>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
                <Bot className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-sm font-semibold">RAG Workspace</span>
            </motion.div>
          )}
          {collapsed && (
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <Bot className="h-4 w-4 text-primary-foreground" />
            </div>
          )}
        </div>

        <Separator className="mb-2 bg-white/5" />

        <nav className="space-y-0.5 px-2">
          <StaggerContainer staggerDelay={0.04} delayChildren={0.05} direction="none">
            {navItems.map((item) => (
              <NavItemButton
                key={item.id}
                item={item}
                isActive={activeView === item.id}
                isHovered={hoveredItem === item.id}
                collapsed={collapsed}
                onSelect={() => setActiveView(item.id)}
                onHoverStart={() => setHoveredItem(item.id)}
                onHoverEnd={() => setHoveredItem(null)}
              />
            ))}
          </StaggerContainer>
        </nav>

        {!collapsed && conversations && (
          <div className="mt-2 flex-1 overflow-y-auto px-2 scrollbar-thin">
            <div className="flex items-center justify-between mb-1 px-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">Chats</span>
              {onNewChat && (
                <button
                  onClick={onNewChat}
                  className="rounded p-0.5 text-muted-foreground/50 hover:text-foreground transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <div className="relative mb-1">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground/40" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chats..."
                className="w-full rounded-md border border-transparent bg-muted/30 py-1.5 pl-6 pr-2 text-[11px] outline-none placeholder:text-muted-foreground/30 focus:border-primary/30 focus:bg-background transition-colors"
              />
            </div>

            {folders && folders.length > 0 && (
              <div className="mb-1 space-y-0.5">
                {folders.map((folder) => (
                  <div key={folder.id} className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] text-muted-foreground/60">
                    <Folder className="h-3 w-3 shrink-0 text-muted-foreground/60" />
                    <span className="truncate">{folder.name}</span>
                    <span className="ml-auto text-[9px]">{folder.conversationIds.length}</span>
                    {onDeleteFolder && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onDeleteFolder(folder.id); }}
                        className="ml-0.5 rounded p-0.5 text-muted-foreground/30 hover:text-destructive transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
            {onCreateFolder && (
              <button
                onClick={() => {
                  const name = prompt("Folder name:");
                  if (name?.trim()) onCreateFolder(name.trim());
                }}
                className="mb-1 flex w-full items-center gap-1 rounded-md px-2 py-1 text-[10px] text-muted-foreground/50 hover:text-foreground hover:bg-accent transition-colors"
              >
                <Folder className="h-3 w-3" />
                <span>New Folder</span>
              </button>
            )}

            <div className="space-y-0.5">
              {conversations
                .filter((c) => !c.archived && c.title.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((conv) => (
                  <div key={conv.id} className="group relative">
                    <button
                      onClick={() => handleSelect(conv.id)}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs transition-colors",
                        conv.id === activeId
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                      )}
                    >
                      {conv.pinned && <Pin className="h-3 w-3 text-amber-500 shrink-0" />}
                      <span className="truncate">{conv.title}</span>
                      {conv.tags && conv.tags.length > 0 && (
                        <span className="ml-auto flex gap-0.5">
                          {conv.tags.slice(0, 2).map((t) => (
                            <span
                              key={t}
                              onClick={(e) => { e.stopPropagation(); onRemoveTag?.(conv.id, t); }}
                              className="rounded bg-muted px-1 text-[8px] text-muted-foreground/60 cursor-pointer hover:line-through"
                              title="Remove tag"
                            >
                              {t}
                            </span>
                          ))}
                          {conv.tags.length > 2 && (
                            <span className="text-[8px] text-muted-foreground/40">+{conv.tags.length - 2}</span>
                          )}
                        </span>
                      )}
                    </button>
                    <div className="absolute right-1 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-0.5">
                      {onAutoRename && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onAutoRename(conv.id); }}
                          className="rounded p-0.5 text-muted-foreground/40 hover:text-foreground transition-colors"
                          title="Auto-rename"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                      )}
                      {onAddTag && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const tag = prompt("Add tag:");
                            if (tag?.trim()) onAddTag(conv.id, tag.trim());
                          }}
                          className="rounded p-0.5 text-muted-foreground/40 hover:text-foreground transition-colors"
                          title="Add tag"
                        >
                          <Tags className="h-3 w-3" />
                        </button>
                      )}
                      {onPinConversation && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onPinConversation(conv.id); }}
                          className={cn("rounded p-0.5 transition-colors", conv.pinned ? "text-amber-500" : "text-muted-foreground/40 hover:text-muted-foreground")}
                        >
                          <Pin className="h-3 w-3" />
                        </button>
                      )}
                      {onArchiveConversation && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onArchiveConversation(conv.id); }}
                          className="rounded p-0.5 text-muted-foreground/40 hover:text-muted-foreground transition-colors"
                        >
                          <Archive className="h-3 w-3" />
                        </button>
                      )}
                      {onMoveToFolder && folders && folders.length > 0 && (
                        <select
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => onMoveToFolder(conv.id, e.target.value || undefined)}
                          value={conv.folderId || ""}
                          className="rounded border-none bg-transparent text-[9px] text-muted-foreground/40 outline-none cursor-pointer"
                        >
                          <option value="">Folder</option>
                          {folders.map((f) => (
                            <option key={f.id} value={f.id}>{f.name}</option>
                          ))}
                          <option value="">None</option>
                        </select>
                      )}
                      {onDeleteConversation && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onDeleteConversation(conv.id); }}
                          className="rounded p-0.5 text-muted-foreground/40 hover:text-destructive transition-colors"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              {conversations.filter((c) => !c.archived && c.title.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                <p className="px-2.5 py-1.5 text-[10px] text-muted-foreground/40">
                  {searchQuery ? "No matching chats" : "No conversations yet"}
                </p>
              )}

              {/* Archived conversations */}
              {conversations.some((c) => c.archived && c.title.toLowerCase().includes(searchQuery.toLowerCase())) && (
                <>
                  <div className="mt-3 mb-1 flex items-center gap-1 px-1">
                    <span className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground/40">Archived</span>
                  </div>
                  {conversations
                    .filter((c) => c.archived && c.title.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((conv) => (
                      <div key={conv.id} className="group relative opacity-60 hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleSelect(conv.id)}
                          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-accent transition-colors"
                        >
                          <span className="truncate">{conv.title}</span>
                        </button>
                        <div className="absolute right-1 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-0.5">
                          {onArchiveConversation && (
                            <button
                              onClick={(e) => { e.stopPropagation(); onArchiveConversation(conv.id); }}
                              className="rounded p-0.5 text-[10px] text-muted-foreground/40 hover:text-foreground transition-colors"
                              title="Unarchive"
                            >
                              <Archive className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                </>
              )}
            </div>
          </div>
        )}

        <Separator className="my-2 bg-white/5" />

        <div className="space-y-0.5 px-2">
          <StaggerContainer staggerDelay={0.04} delayChildren={0.05} direction="none">
            {bottomItems.map((item) => (
              <NavItemButton
                key={item.id}
                item={item}
                isActive={activeView === item.id}
                isHovered={hoveredItem === item.id}
                collapsed={collapsed}
                onSelect={() => setActiveView(item.id)}
                onHoverStart={() => setHoveredItem(item.id)}
                onHoverEnd={() => setHoveredItem(null)}
                layoutId="activeNavGlowBottom"
              />
            ))}
          </StaggerContainer>
        </div>

        <Separator className="my-2 bg-white/5" />

        <div className={cn("px-2", collapsed && "flex justify-center")}>
          <Button
            variant="ghost"
            size={collapsed ? "icon" : "default"}
            onClick={() => setCollapsed(!collapsed)}
            className="w-full text-gray-400 hover:text-white hover:bg-white/5"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            {!collapsed && <span className="text-xs tracking-wider uppercase">Collapse</span>}
          </Button>
        </div>

        <div className={cn("mt-2 flex items-center gap-2 px-3", collapsed && "justify-center")}>
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#00f2fe] to-[#7000ff] text-[10px] font-bold text-white">
            A
          </div>
          {!collapsed && (
            <div className="flex-1 truncate text-xs text-muted-foreground">
              <p className="truncate font-medium text-foreground">Aschalew</p>
            </div>
          )}
        </div>
      </motion.aside>
    </TooltipProvider>
  );
}
