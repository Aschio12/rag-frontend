"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FileText, Library, MessageSquareOff, Sparkles } from "lucide-react";

import ChatInput from "@/components/ChatInput";
import ChatMessage from "@/components/ChatMessage";
import DocumentList from "@/components/DocumentList";
import DocumentUpload from "@/components/DocumentUpload";
import SourceViewer from "@/components/SourceViewer";
import KnowledgeBaseManager from "@/components/KnowledgeBaseManager";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { sendMessageStream, getRelatedQuestions, sendAgenticMessage } from "@/lib/api";
import RelatedQuestions from "@/components/RelatedQuestions";
import { useToast } from "@/components/Toast";
import {
  type Conversation,
  type Folder,
  type Message,
  createConversation,
  generateId,
  loadActiveConversationId,
  loadConversations,
  loadFolders,
  saveActiveConversationId,
  saveConversations,
  saveFolders,
} from "@/lib/store";

const suggestions = [
  "What documents do I have?",
  "Summarize the refund policy",
  "How do I upload a file?",
];

const followUpSuggestions = [
  "Tell me more",
  "Give me an example",
  "Summarize this",
  "Explain in simpler terms",
];

export default function Home() {
  const { showToast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState("chats");
  const [docRefreshKey, setDocRefreshKey] = useState(0);
  const [streamingContent, setStreamingContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [hybridSearch, setHybridSearch] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("hybridSearch") === "true";
  });
  const [sourceViewerOpen, setSourceViewerOpen] = useState(false);
  const [relatedQuestions, setRelatedQuestions] = useState<string[]>([]);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [agenticMode, setAgenticMode] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("agenticMode") === "true";
  });
  const [agentSteps, setAgentSteps] = useState<Record<string, import("@/lib/api").AgentStepEvent[]>>({});
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [sourceViewerData, setSourceViewerData] = useState<any[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<AbortController | null>(null);

  const activeConversation = useMemo(() => conversations.find((c) => c.id === activeId) || null, [conversations, activeId]);
  const messages = activeConversation?.messages || [];

  useEffect(() => {
    const storedFolders = loadFolders();
    if (storedFolders.length > 0) {
      queueMicrotask(() => setFolders(storedFolders));
    }
  }, []);

  useEffect(() => {
    if (folders.length > 0) saveFolders(folders);
  }, [folders]);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.sources) {
        setSourceViewerData(detail.sources);
        setSourceViewerOpen(true);
      }
    };
    window.addEventListener("open-source", handler);
    return () => window.removeEventListener("open-source", handler);
  }, []);

  useEffect(() => {
    const stored = loadConversations();
    if (stored.length > 0) {
      queueMicrotask(() => setConversations(stored));
      const active = loadActiveConversationId();
      queueMicrotask(() => {
        if (active && stored.some((c) => c.id === active)) {
          setActiveId(active);
        } else {
          setActiveId(stored[0].id);
        }
      });
    }
  }, []);

  useEffect(() => {
    if (conversations.length > 0) saveConversations(conversations);
  }, [conversations]);

  useEffect(() => {
    saveActiveConversationId(activeId);
  }, [activeId]);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [userScrolled, setUserScrolled] = useState(false);

  useEffect(() => {
    const el = chatContainerRef.current;
    if (!el) return;
    const handleScroll = () => {
      const threshold = 100;
      const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
      if (!atBottom && !loading) setUserScrolled(true);
      else setUserScrolled(false);
    };
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, [loading]);

  useEffect(() => {
    if (!userScrolled) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeConversation?.messages, streamingContent, userScrolled]);

  const updateConversation = useCallback((convId: string, updater: (c: Conversation) => Conversation) => {
    setConversations((prev) => prev.map((c) => (c.id === convId ? updater(c) : c)));
  }, []);

  const handleSend = useCallback(async (text: string) => {
    const userMsg: Message = {
      id: generateId(),
      role: "user",
      content: text,
      timestamp: Date.now(),
    };

    let convId = activeId;

    if (!convId) {
      const conv = createConversation(text.slice(0, 60));
      conv.messages.push(userMsg);
      setConversations((prev) => [conv, ...prev]);
      setActiveId(conv.id);
      convId = conv.id;
    } else {
      updateConversation(convId, (c) => ({
        ...c,
        messages: [...c.messages, userMsg],
        updatedAt: Date.now(),
      }));
    }

    const assistantId = generateId();
    const assistantMsgPlaceholder: Message = {
      id: assistantId,
      role: "assistant",
      content: "",
      timestamp: Date.now(),
      isAgentic: agenticMode,
    };

    updateConversation(convId, (c) => ({
      ...c,
      messages: [...c.messages, assistantMsgPlaceholder],
      updatedAt: Date.now(),
    }));

    const controller = new AbortController();
    setLoading(true);
    streamRef.current = controller;
    setStreamingContent("");

    try {
        if (agenticMode) {
        const steps: import("@/lib/api").AgentStepEvent[] = [];
        let finalAnswer = "";
        const stream = sendAgenticMessage({ message: text, hybrid: hybridSearch });
        for await (const event of stream) {
          if (controller.signal.aborted) break;
          steps.push(event);
          setAgentSteps((prev) => ({ ...prev, [assistantId]: [...steps] }));
          if (event.event === "complete") {
            finalAnswer = event.answer || "";
            if (finalAnswer) {
              updateConversation(convId, (c) => ({
                ...c,
                messages: c.messages.map((m) =>
                  m.id === assistantId ? {
                    ...m,
                    content: finalAnswer,
                    sources: event.sources || [],
                    isAgentic: true,
                    agentSteps: steps,
                  } : m,
                ),
                updatedAt: Date.now(),
              }));
              setRelatedQuestions(event.search_queries || []);
            }
          } else {
            setStreamingContent(`🤖 ${event.label || "Processing"}...`);
          }
        }
        if (!controller.signal.aborted && !finalAnswer) {
          updateConversation(convId, (c) => ({
            ...c,
            messages: c.messages.map((m) =>
              m.id === assistantId ? {
                ...m,
                content: "Agent processing complete.",
                isAgentic: true,
                agentSteps: steps,
              } : m,
            ),
            updatedAt: Date.now(),
          }));
        }
        setStreamingContent("");
      } else {
        let accumulated = "";
        const stream = sendMessageStream({ message: text, hybrid: hybridSearch });
        for await (const chunk of stream) {
          if (controller.signal.aborted) break;
          accumulated += chunk;
          setStreamingContent(accumulated);
        }

        if (!controller.signal.aborted) {
          updateConversation(convId, (c) => ({
            ...c,
            messages: c.messages.map((m) =>
              m.id === assistantId ? { ...m, content: accumulated } : m,
            ),
            updatedAt: Date.now(),
          }));
          setStreamingContent("");
          if (accumulated) {
            setRelatedLoading(true);
            getRelatedQuestions({ query: text, context: accumulated })
              .then(res => setRelatedQuestions(res.questions || []))
              .catch(() => {})
              .finally(() => setRelatedLoading(false));
          }
        }
      }
    } catch {
      if (!controller.signal.aborted) {
        updateConversation(convId, (c) => ({
          ...c,
          messages: c.messages.map((m) =>
            m.id === assistantId
              ? { ...m, content: "Sorry, something went wrong. Please try again." }
              : m,
          ),
          updatedAt: Date.now(),
        }));
        setStreamingContent("");
      }
    } finally {
      setLoading(false);
      streamRef.current = null;
    }
  }, [activeId, updateConversation, hybridSearch, agenticMode]);

  const handleClear = useCallback(() => {
    setConversations([]);
    setActiveId(null);
  }, []);

  const handleUploaded = useCallback(() => {
    setDocRefreshKey((k) => k + 1);
  }, []);

  const handleNewChat = useCallback(() => {
    const conv = createConversation();
    setConversations((prev) => [conv, ...prev]);
    setActiveId(conv.id);
    setActiveView("chats");
  }, []);

  // Keyboard shortcuts
  const newChatRef = useRef(handleNewChat);
  useEffect(() => { newChatRef.current = handleNewChat; });
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        newChatRef.current();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
  useEffect(() => {
    const handleHybridKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "h") {
        e.preventDefault();
        setHybridSearch((prev) => { const next = !prev; localStorage.setItem("hybridSearch", String(next)); return next; });
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "a") {
        e.preventDefault();
        setAgenticMode((prev) => { const next = !prev; localStorage.setItem("agenticMode", String(next)); return next; });
      }
    };
    window.addEventListener("keydown", handleHybridKey);
    return () => window.removeEventListener("keydown", handleHybridKey);
  }, []);

  const handleEditMessage = useCallback((msgId: string, newContent: string) => {
    if (!activeId) return;
    updateConversation(activeId, (c) => ({
      ...c,
      messages: c.messages.map((m) =>
        m.id === msgId ? { ...m, content: newContent } : m,
      ),
      updatedAt: Date.now(),
    }));
  }, [activeId, updateConversation]);

  const handleDeleteMessage = useCallback((msgId: string) => {
    if (!activeId) return;
    updateConversation(activeId, (c) => ({
      ...c,
      messages: c.messages.filter((m) => m.id !== msgId),
      updatedAt: Date.now(),
    }));
  }, [activeId, updateConversation]);

  const handleRegenerate = useCallback(async (msgId: string) => {
    if (!activeId) return;
    const conv = conversations.find((c) => c.id === activeId);
    if (!conv) return;
    const msgIndex = conv.messages.findIndex((m) => m.id === msgId);
    if (msgIndex < 0 || msgIndex === 0) return;
    const userMsg = conv.messages[msgIndex - 1];
    if (userMsg.role !== "user") return;

    updateConversation(activeId, (c) => ({
      ...c,
      messages: c.messages.map((m) =>
        m.id === msgId ? { ...m, content: "" } : m,
      ),
      updatedAt: Date.now(),
    }));

    const controller = new AbortController();
    setLoading(true);
    streamRef.current = controller;
    setStreamingContent("");

    try {
      if (agenticMode) {
        const steps: import("@/lib/api").AgentStepEvent[] = [];
        let finalAnswer = "";
        const stream = sendAgenticMessage({ message: userMsg.content, hybrid: hybridSearch });
        for await (const event of stream) {
          if (controller.signal.aborted) break;
          steps.push(event);
          setAgentSteps((prev) => ({ ...prev, [msgId]: [...steps] }));
          if (event.event === "complete") {
            finalAnswer = event.answer || "";
            if (finalAnswer) {
              updateConversation(activeId, (c) => ({
                ...c,
                messages: c.messages.map((m) =>
                  m.id === msgId ? {
                    ...m,
                    content: finalAnswer,
                    sources: event.sources || [],
                    isAgentic: true,
                    agentSteps: steps,
                  } : m,
                ),
                updatedAt: Date.now(),
              }));
              setRelatedQuestions(event.search_queries || []);
            }
          } else {
            setStreamingContent(`🤖 ${event.label || "Processing"}...`);
          }
        }
        if (!controller.signal.aborted && !finalAnswer) {
          updateConversation(activeId, (c) => ({
            ...c,
            messages: c.messages.map((m) =>
              m.id === msgId ? {
                ...m,
                content: "Agent processing complete.",
                isAgentic: true,
                agentSteps: steps,
              } : m,
            ),
            updatedAt: Date.now(),
          }));
        }
        setStreamingContent("");
      } else {
        let accumulated = "";
        const stream = sendMessageStream({ message: userMsg.content, hybrid: hybridSearch });
        for await (const chunk of stream) {
          if (controller.signal.aborted) break;
          accumulated += chunk;
          setStreamingContent(accumulated);
        }
        if (!controller.signal.aborted) {
          updateConversation(activeId, (c) => ({
            ...c,
            messages: c.messages.map((m) =>
              m.id === msgId ? { ...m, content: accumulated } : m,
            ),
            updatedAt: Date.now(),
          }));
          setStreamingContent("");
          if (accumulated) {
            setRelatedLoading(true);
            getRelatedQuestions({ query: userMsg.content, context: accumulated })
              .then(res => setRelatedQuestions(res.questions || []))
              .catch(() => {})
              .finally(() => setRelatedLoading(false));
          }
        }
      }
    } catch {
      if (!controller.signal.aborted) {
        updateConversation(activeId, (c) => ({
          ...c,
          messages: c.messages.map((m) =>
            m.id === msgId
              ? { ...m, content: "Sorry, something went wrong. Please try again." }
              : m,
          ),
          updatedAt: Date.now(),
        }));
        setStreamingContent("");
      }
    } finally {
      setLoading(false);
      streamRef.current = null;
    }
  }, [activeId, conversations, updateConversation, hybridSearch, agenticMode]);

  const handleFollowUp = useCallback((question: string) => {
    setRelatedQuestions([]);
    handleSend(question);
  }, [handleSend]);

  const handleCopyMessage = useCallback(() => {
    showToast("Copied to clipboard");
  }, [showToast]);

  const handlePinConversation = useCallback((convId: string) => {
    updateConversation(convId, (c) => ({ ...c, pinned: !c.pinned }));
  }, [updateConversation]);

  const handleArchiveConversation = useCallback((convId: string) => {
    updateConversation(convId, (c) => ({ ...c, archived: !c.archived }));
  }, [updateConversation]);

  const handleRenameConversation = useCallback((convId: string, title: string) => {
    updateConversation(convId, (c) => ({ ...c, title }));
  }, [updateConversation]);

  const handleCreateFolder = useCallback((name: string) => {
    setFolders((prev) => [...prev, { id: generateId(), name, conversationIds: [] }]);
  }, []);

  const handleDeleteFolder = useCallback((folderId: string) => {
    setFolders((prev) => prev.filter((f) => f.id !== folderId));
    setConversations((prev) => prev.map((c) => c.folderId === folderId ? { ...c, folderId: undefined } : c));
  }, []);

  const handleAddTag = useCallback((convId: string, tag: string) => {
    updateConversation(convId, (c) => ({
      ...c,
      tags: [...new Set([...(c.tags || []), tag])],
    }));
  }, [updateConversation]);

  const handleRemoveTag = useCallback((convId: string, tag: string) => {
    updateConversation(convId, (c) => ({
      ...c,
      tags: (c.tags || []).filter((t) => t !== tag),
    }));
  }, [updateConversation]);

  const handleMoveToFolder = useCallback((convId: string, folderId: string | undefined) => {
    updateConversation(convId, (c) => ({ ...c, folderId }));
  }, [updateConversation]);

  const handleAutoRename = useCallback((convId: string) => {
    const conv = conversations.find((c) => c.id === convId);
    if (!conv || conv.messages.length === 0) return;
    const firstMsg = conv.messages.find((m) => m.role === "user");
    if (!firstMsg) return;
    let name = firstMsg.content.replace(/\n/g, " ").trim().slice(0, 60);
    if (name.length >= 60) name = name.slice(0, 57) + "...";
    if (name.length === 0) name = "New Chat";
    handleRenameConversation(convId, name);
  }, [conversations, handleRenameConversation]);

  const handleDeleteConversation = useCallback((convId: string) => {
    setConversations((prev) => {
      const next = prev.filter((c) => c.id !== convId);
      if (activeId === convId) {
        const newActive = next.length > 0 ? next[0].id : null;
        queueMicrotask(() => setActiveId(newActive));
      }
      return next;
    });
  }, [activeId]);

  const handleBookmarkMessage = useCallback((msgId: string) => {
    if (!activeId) return;
    let wasBookmarked = false;
    updateConversation(activeId, (c) => {
      const msg = c.messages.find((m) => m.id === msgId);
      wasBookmarked = !!msg?.bookmarked;
      return {
        ...c,
        messages: c.messages.map((m) =>
          m.id === msgId ? { ...m, bookmarked: !m.bookmarked } : m,
        ),
      };
    });
    showToast(wasBookmarked ? "Bookmark removed" : "Message bookmarked");
  }, [activeId, updateConversation, showToast]);

  const handleRateMessage = useCallback((msgId: string, rating: "up" | "down" | null) => {
    if (!activeId) return;
    updateConversation(activeId, (c) => ({
      ...c,
      messages: c.messages.map((m) =>
        m.id === msgId ? { ...m, rating } : m,
      ),
    }));
  }, [activeId, updateConversation]);

  const [showShareDialog, setShowShareDialog] = useState(false);

  const handleShareChat = useCallback(() => {
    setShowShareDialog(true);
  }, []);

  const handleShareCopy = useCallback(() => {
    if (!activeConversation) return;
    const text = activeConversation.messages.map((m) => {
      return `[${m.role.toUpperCase()}]\n${m.content}`;
    }).join("\n\n---\n\n");
    navigator.clipboard.writeText(text);
    setShowShareDialog(false);
    showToast("Shared to clipboard");
  }, [activeConversation, showToast]);

  const handleExportChat = useCallback((format: "json" | "markdown" | "txt") => {
    if (!activeConversation) return;
    const conv = activeConversation;
    let content = "";
    const filename = conv.title.replace(/[^a-z0-9]/gi, "_").toLowerCase();

    if (format === "json") {
      content = JSON.stringify(conv.messages, null, 2);
    } else if (format === "markdown") {
      content = conv.messages.map((m) => {
        const role = m.role === "user" ? "**You**" : "**Assistant**";
        return `${role}:\n\n${m.content}\n\n---\n`;
      }).join("\n");
    } else {
      content = conv.messages.map((m) => {
        return `[${m.role.toUpperCase()}]\n${m.content}\n`;
      }).join("\n");
    }

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.${format === "json" ? "json" : format === "markdown" ? "md" : "txt"}`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Chat exported");
  }, [activeConversation, showToast]);

  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);

  const handleSpeak = useCallback((msgId: string, text: string) => {
    if (!("speechSynthesis" in window)) return;
    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);
    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utterance);
  }, [speakingMsgId]);

  return (
    <div className="flex h-dvh">
      <Sidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        activeView={activeView}
        setActiveView={setActiveView}
        conversations={conversations}
        activeId={activeId}
        onSelectConversation={setActiveId}
        onNewChat={handleNewChat}
        onPinConversation={handlePinConversation}
        onArchiveConversation={handleArchiveConversation}
        onDeleteConversation={handleDeleteConversation}
        onAutoRename={handleAutoRename}
        folders={folders}
        onCreateFolder={handleCreateFolder}
        onDeleteFolder={handleDeleteFolder}
        onMoveToFolder={handleMoveToFolder}
        onAddTag={handleAddTag}
        onRemoveTag={handleRemoveTag}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          activeView={activeView}
          messagesCount={messages.length}
          onClear={handleClear}
          onNewChat={handleNewChat}
          conversation={activeConversation}
          onExport={handleExportChat}
          onShare={handleShareChat}
        />

        <AnimatePresence mode="wait">
          {activeView === "chats" || activeView === "home" ? (
            <motion.div
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-1 flex-col overflow-hidden"
            >
              <div ref={chatContainerRef} className="flex-1 overflow-y-auto scrollbar-thin">
                <div className="mx-auto max-w-3xl px-4 py-6">
                  {messages.length === 0 && !loading ? (
                    <div className="flex h-full min-h-[calc(100dvh-12rem)] flex-col items-center justify-center">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-lg shadow-purple-500/20"
                      >
                        <Sparkles className="h-6 w-6 text-white" />
                      </motion.div>
                      <motion.h1
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="mb-2 text-xl font-semibold gradient-text"
                      >
                        What would you like to know?
                      </motion.h1>
                      <motion.p
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="mb-8 text-sm text-muted-foreground"
                      >
                        Upload documents and ask questions to get started.
                      </motion.p>
                      <motion.div
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="flex flex-wrap justify-center gap-2"
                      >
                        {suggestions.map((s) => (
                          <Button
                            key={s}
                            variant="outline"
                            size="sm"
                            onClick={() => handleSend(s)}
                            className="rounded-full text-xs"
                          >
                            {s}
                          </Button>
                        ))}
                      </motion.div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((m) => (
                        <ChatMessage
                          key={m.id}
                          id={m.id}
                          role={m.role}
                          content={m.content || streamingContent}
                          sources={m.sources}
                          agentSteps={agentSteps[m.id]}
                          isStreaming={m.content === "" && loading}
                          bookmarked={m.bookmarked}
                          rating={m.rating}
                          onEdit={handleEditMessage}
                          onDelete={handleDeleteMessage}
                          onRegenerate={handleRegenerate}
                          onCopy={handleCopyMessage}
                          onBookmark={handleBookmarkMessage}
                          onRate={handleRateMessage}
                          onSpeak={handleSpeak}
                        />
                      ))}
                      {loading && messages[messages.length - 1]?.content !== "" && (
                        <div className="flex gap-3">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
                            <Sparkles className="h-3.5 w-3.5 text-white" />
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="thinking-dot" />
                            <span className="thinking-dot" />
                            <span className="thinking-dot" />
                          </div>
                        </div>
                      )}
                      {userScrolled && messages.length > 0 && (
                        <motion.button
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          onClick={() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); setUserScrolled(false); }}
                          className="sticky bottom-2 left-1/2 z-10 mx-auto -translate-x-1/2 rounded-full border bg-background px-3 py-1.5 text-[11px] text-muted-foreground shadow-md hover:bg-accent transition-colors"
                        >
                          ↓ Scroll to bottom
                        </motion.button>
                      )}
                      {!loading && messages.length > 0 && messages[messages.length - 1]?.role === "assistant" && messages[messages.length - 1]?.content && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex flex-wrap gap-1.5 pl-10"
                        >
                          <span className="w-full text-[10px] text-muted-foreground/40 mb-0.5">Suggested follow-ups</span>
                          {followUpSuggestions.map((q) => (
                            <button
                              key={q}
                              onClick={() => handleFollowUp(q)}
                              className="rounded-full border border-muted/50 bg-muted/20 px-2.5 py-1 text-[11px] text-muted-foreground/70 hover:bg-muted/40 hover:text-foreground transition-colors"
                            >
                              {q}
                            </button>
                          ))}
                        </motion.div>
                      )}
                      {!loading && (
                        <div className="pl-10">
                          <RelatedQuestions
                            questions={relatedQuestions}
                            onSelect={handleFollowUp}
                            loading={relatedLoading}
                          />
                        </div>
                      )}
                      <div ref={bottomRef} />
                    </div>
                  )}
                </div>
              </div>

              <ChatInput
                onSend={handleSend}
                disabled={loading}
                hybrid={hybridSearch}
                onToggleHybrid={() => setHybridSearch((prev) => { const next = !prev; localStorage.setItem("hybridSearch", String(next)); return next; })}
                agentic={agenticMode}
                onToggleAgentic={() => setAgenticMode((prev) => { const next = !prev; localStorage.setItem("agenticMode", String(next)); return next; })}
              />
            </motion.div>
          ) : activeView === "knowledge" ? (
            <motion.div
              key="knowledge"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 overflow-y-auto scrollbar-thin"
            >
              <div className="mx-auto max-w-2xl space-y-6 px-4 py-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-sm">
                    <Library className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold">Knowledge Bases</h2>
                    <p className="text-xs text-muted-foreground">Manage collections and explore knowledge graphs</p>
                  </div>
                </div>
                <KnowledgeBaseManager />
              </div>
            </motion.div>
          ) : activeView === "documents" ? (
            <motion.div
              key="documents"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 overflow-y-auto scrollbar-thin"
            >
              <div className="mx-auto max-w-2xl space-y-6 px-4 py-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-sm">
                    <FileText className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold">Documents</h2>
                    <p className="text-xs text-muted-foreground">Manage your knowledge base</p>
                  </div>
                </div>
                <DocumentUpload onUploaded={handleUploaded} />
                <div>
                  <h3 className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Indexed Documents
                  </h3>
                  <DocumentList refreshKey={docRefreshKey} />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-1 items-center justify-center"
            >
              <div className="text-center">
                <MessageSquareOff className="mx-auto mb-3 h-8 w-8 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground/60">
                  {activeView === "settings"
                    ? "Settings panel coming soon."
                    : activeView === "profile"
                      ? "Profile panel coming soon."
                      : `${activeView.charAt(0).toUpperCase() + activeView.slice(1)} view coming soon.`}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <SourceViewer
          sources={sourceViewerData}
          open={sourceViewerOpen}
          onClose={() => setSourceViewerOpen(false)}
        />

        {showShareDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mx-4 w-full max-w-sm rounded-xl border bg-background p-6 shadow-xl"
            >
              <h3 className="mb-2 text-sm font-semibold">Share Chat</h3>
              <p className="mb-4 text-xs text-muted-foreground">
                Copy this conversation as formatted text to share.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowShareDialog(false)}
                  className="rounded-lg px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleShareCopy}
                  className="rounded-lg bg-primary px-3 py-1.5 text-xs text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  Copy to Clipboard
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
