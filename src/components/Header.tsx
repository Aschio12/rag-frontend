"use client";

import { type Dispatch, type SetStateAction } from "react";
import { motion } from "framer-motion";
import { PanelLeft, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { Conversation } from "@/lib/store";

interface HeaderProps {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: Dispatch<SetStateAction<boolean>>;
  activeView: string;
  messagesCount: number;
  onClear: () => void;
  onNewChat?: () => void;
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
  conversation,
}: HeaderProps) {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-lg"
    >
      <div className="flex items-center gap-3">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="text-muted-foreground"
              >
                <PanelLeft className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              {sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <h2 className="text-sm font-medium truncate max-w-48">
            {activeView === "chats" && conversation ? conversation.title : (viewTitles[activeView] || "Chats")}
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {onNewChat && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onNewChat}
                  className="text-muted-foreground"
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
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Clear conversation</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </motion.header>
  );
}
