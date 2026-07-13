"use client";

import { type Dispatch, type SetStateAction } from "react";
import { motion } from "framer-motion";
import { Download, PanelLeft, Plus, Share2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { Conversation } from "@/lib/store";
import { HeaderAnimation } from "@/components/animations/HeaderAnimation";

interface HeaderProps {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: Dispatch<SetStateAction<boolean>>;
  activeView: string;
  messagesCount: number;
  onClear: () => void;
  onNewChat?: () => void;
  onExport?: (format: "json" | "markdown" | "txt") => void;
  onShare?: () => void;
  onToggleMobileSidebar?: () => void;
  conversation?: Conversation | null;
}

const viewTitles: Record<string, string> = {
  home: "Home",
  chats: "Chats",
  projects: "Projects",
  documents: "Documents",
  knowledge: "Knowledge Bases",
  agents: "Agents",
  search: "Search",
  settings: "Settings",
  profile: "Profile",
};

export default function Header({
  sidebarCollapsed,
  setSidebarCollapsed,
  activeView,
  messagesCount,
  onClear,
  onNewChat,
  onExport,
  onShare,
  onToggleMobileSidebar,
  conversation,
}: HeaderProps) {
  return (
    <HeaderAnimation className="sticky top-0 z-40 flex h-14 items-center justify-between px-6 py-4 cyber-glass border-0 border-b border-white/5">
      <div className="flex items-center gap-3">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                  onClick={() => {
                  if (window.innerWidth < 768) {
                    onToggleMobileSidebar?.();
                  } else {
                    setSidebarCollapsed(!sidebarCollapsed);
                  }
                }}
                className="text-gray-400 hover:text-white hover:bg-white/5"
              >
                <PanelLeft className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              {sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00ff87] animate-pulse shadow-[0_0_6px_rgba(0,255,135,0.5)]" />
            <span className="text-xs font-mono text-gray-500 tracking-wider">AETHER_OS_v2.9.9</span>
          </div>
          <div className="w-px h-4 bg-white/10" />
          <h2 className="text-sm font-light font-mono tracking-widest uppercase truncate max-w-48">
            {activeView === "chats" && conversation ? conversation.title : (viewTitles[activeView] || "Chats")}
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {onShare && messagesCount > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onShare}
                  className="text-gray-400 hover:text-white hover:bg-white/5"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Share chat</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {onExport && messagesCount > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onExport("markdown")}
                  className="text-gray-400 hover:text-white hover:bg-white/5"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Export chat</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {onNewChat && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onNewChat}
                  className="text-gray-400 hover:text-white hover:bg-white/5"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>New chat</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {messagesCount > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClear}
                  className="text-gray-400 hover:text-red-400 hover:bg-white/5"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Clear conversation</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </HeaderAnimation>
  );
}
