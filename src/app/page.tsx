"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FileText, MessageSquareOff, Sparkles } from "lucide-react";

import ChatInput from "@/components/ChatInput";
import ChatMessage from "@/components/ChatMessage";
import DocumentList from "@/components/DocumentList";
import DocumentUpload from "@/components/DocumentUpload";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { sendMessageStream } from "@/lib/api";
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
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState("chats");
  const [docRefreshKey, setDocRefreshKey] = useState(0);
  const [streamingContent, setStreamingContent] = useState("");
  const [loading, setLoading] = useState(false);
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
      let accumulated = "";
      const stream = sendMessageStream({ message: text });
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
  }, [activeId, updateConversation]);

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
      let accumulated = "";
      const stream = sendMessageStream({ message: userMsg.content });
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
  }, [activeId, conversations, updateConversation]);

  const handleFollowUp = useCallback((question: string) => {
    handleSend(question);
  }, [handleSend]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleCopyMessage = useCallback((msgId: string) => {
  }, []);

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
    const name = firstMsg.content.slice(0, 60);
    const suffix = name.length >= 60 ? "..." : "";
    handleRenameConversation(convId, name + suffix);
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
    updateConversation(activeId, (c) => ({
      ...c,
      messages: c.messages.map((m) =>
        m.id === msgId ? { ...m, bookmarked: !m.bookmarked } : m,
      ),
    }));
  }, [activeId, updateConversation]);

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
  }, [activeConversation]);

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
  }, [activeConversation]);

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
                      <div ref={bottomRef} />
                    </div>
                  )}
                </div>
              </div>

              <ChatInput onSend={handleSend} disabled={loading} />

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
      </div>
    </div>
  );
}
