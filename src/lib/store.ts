import type { Source } from "./api";

import type { AgentStepEvent } from "@/lib/api";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  timestamp: number;
  bookmarked?: boolean;
  rating?: "up" | "down" | null;
  isAgentic?: boolean;
  agentSteps?: AgentStepEvent[];
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  pinned?: boolean;
  archived?: boolean;
  folderId?: string;
  tags?: string[];
}

export interface Folder {
  id: string;
  name: string;
  conversationIds: string[];
}

let idCounter = 0;

export function generateId(): string {
  idCounter += 1;
  return `${Date.now()}-${idCounter}-${Math.random().toString(36).slice(2, 8)}`;
}

const STORAGE_KEY = "rag-conversations";
const FOLDERS_KEY = "rag-folders";
const ACTIVE_KEY = "rag-active-conversation";

export function loadConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export function saveConversations(conversations: Conversation[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  } catch {}
}

export function loadActiveConversationId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_KEY);
  } catch {
    return null;
  }
}

export function saveActiveConversationId(id: string | null) {
  try {
    if (id) localStorage.setItem(ACTIVE_KEY, id);
    else localStorage.removeItem(ACTIVE_KEY);
  } catch {}
}

export function loadFolders(): Folder[] {
  try {
    const raw = localStorage.getItem(FOLDERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export function saveFolders(folders: Folder[]) {
  try {
    localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
  } catch {}
}

export function addTag(conv: Conversation, tag: string): Conversation {
  const tags = conv.tags || [];
  if (tags.includes(tag)) return conv;
  return { ...conv, tags: [...tags, tag] };
}

export function removeTag(conv: Conversation, tag: string): Conversation {
  return { ...conv, tags: (conv.tags || []).filter((t) => t !== tag) };
}

export function createConversation(title?: string): Conversation {
  const now = Date.now();
  return {
    id: generateId(),
    title: title || "New Chat",
    messages: [],
    createdAt: now,
    updatedAt: now,
    pinned: false,
    archived: false,
    tags: [],
  };
}
