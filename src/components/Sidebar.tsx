"use client";

import { type Dispatch, type SetStateAction, useState } from "react";
import { motion } from "framer-motion";
import {
  Bot,
  ChevronLeft,
  ChevronRight,
  FileText,
  FolderKanban,
  Home,
  Library,
  MessagesSquare,
  Search,
  Settings,
  User,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
}

export default function Sidebar({ collapsed, setCollapsed, activeView, setActiveView }: SidebarProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <TooltipProvider delayDuration={300}>
      <motion.aside
        animate={{ width: collapsed ? 60 : 240 }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        className={cn(
          "flex h-dvh flex-col border-r bg-sidebar py-2 overflow-hidden shrink-0",
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

        <Separator className="mb-2" />

        <nav className="flex-1 space-y-0.5 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            const isHovered = hoveredItem === item.id;
            return (
              <Tooltip key={item.id} open={collapsed ? isHovered : undefined}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setActiveView(item.id)}
                    onMouseEnter={() => setHoveredItem(item.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className={cn(
                      "relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                      collapsed && "justify-center px-2",
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active"
                        className="absolute inset-0 rounded-lg bg-primary/10"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <Icon className={cn("h-4 w-4 shrink-0", isActive && "text-primary")} />
                    {!collapsed && (
                      <span className="z-10 truncate">{item.label}</span>
                    )}
                  </button>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right" className="text-xs">
                    {item.label}
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </nav>

        <Separator className="my-2" />

        <div className="space-y-0.5 px-2">
          {bottomItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            const isHovered = hoveredItem === item.id;
            return (
              <Tooltip key={item.id} open={collapsed ? isHovered : undefined}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setActiveView(item.id)}
                    onMouseEnter={() => setHoveredItem(item.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className={cn(
                      "relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                      collapsed && "justify-center px-2",
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active-bottom"
                        className="absolute inset-0 rounded-lg bg-primary/10"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <Icon className={cn("h-4 w-4 shrink-0", isActive && "text-primary")} />
                    {!collapsed && (
                      <span className="z-10 truncate">{item.label}</span>
                    )}
                  </button>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right" className="text-xs">
                    {item.label}
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </div>

        <Separator className="my-2" />

        <div className={cn("px-2", collapsed && "flex justify-center")}>
          <Button
            variant="ghost"
            size={collapsed ? "icon" : "default"}
            onClick={() => setCollapsed(!collapsed)}
            className="w-full text-muted-foreground"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            {!collapsed && <span className="text-xs">Collapse</span>}
          </Button>
        </div>

        <div className={cn("mt-2 flex items-center gap-2 px-3", collapsed && "justify-center")}>
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-[10px] font-bold text-white">
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
