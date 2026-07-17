"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";

import ChatMessage from "@/components/ChatMessage";
import SourceViewer from "@/components/SourceViewer";
import Header from "@/components/Header";
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
import {
  sendMessageStream,
  relatedQuestions as getRelatedQuestions,
  sendAgenticMessage,
} from "@/lib/api";
import RelatedQuestions from "@/components/RelatedQuestions";

import Sidebar from "@/components/shell/Sidebar";
import TopBar from "@/components/shell/TopBar";
import Inspector from "@/components/shell/Inspector";
import BottomDock from "@/components/shell/BottomDock";

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
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [relatedQuestions, setRelatedQuestions] = useState<string[]>([]);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [agenticMode, setAgenticMode] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("agenticMode") === "true";
  });
  const [agentSteps, setAgentSteps] = useState<
    Record<string, import("@/lib/api").AgentStepEvent[]>
  >({});
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [sourceViewerData, setSourceViewerData] = useState<any[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<AbortController | null>(null);

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeId) || null,
    [conversations, activeId],
  );
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

  useEffect(() => saveActiveConversationId(activeId), [activeId]);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [userScrolled, setUserScrolled] = useState(false);

  useEffect(() => {
    const el = chatContainerRef.current;
    if (!el) return;
    const handleScroll = () => {
      const threshold = 100;
      const atBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
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

  const updateConversation = useCallback(
    (convId: string, updater: (c: Conversation) => Conversation) => {
      setConversations((prev) =>
        prev.map((c) => (c.id === convId ? updater(c) : c)),
      );
    },
    [],
  );

  const handleSend = useCallback(
    async (text: string) => {
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
          const stream = sendAgenticMessage(
            { message: text, hybrid: hybridSearch },
            controller.signal,
          );
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
                    m.id === assistantId
                      ? {
                          ...m,
                          content: finalAnswer,
                          sources: event.sources || [],
                          isAgentic: true,
                          agentSteps: steps,
                        }
                      : m,
                  ),
                  updatedAt: Date.now(),
                }));
                setRelatedQuestions(event.search_queries || []);
              }
            } else {
              setStreamingContent(`Processing ${event.label || "step"}…`);
            }
          }
          if (!controller.signal.aborted && !finalAnswer) {
            updateConversation(convId, (c) => ({
              ...c,
              messages: c.messages.map((m) =>
                m.id === assistantId
                  ? {
                      ...m,
                      content: "Agent processing complete.",
                      isAgentic: true,
                      agentSteps: steps,
                    }
                  : m,
              ),
              updatedAt: Date.now(),
            }));
          }
          setStreamingContent("");
        } else {
          let accumulated = "";
          const stream = sendMessageStream(
            { message: text, hybrid: hybridSearch },
            controller.signal,
          );
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
              getRelatedQuestions(text, accumulated)
                .then((res) => setRelatedQuestions(res.questions || []))
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
    },
    [activeId, updateConversation, hybridSearch, agenticMode],
  );

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

  const handleDeleteConversation = useCallback(
    (convId: string) => {
      setConversations((prev) => {
        const next = prev.filter((c) => c.id !== convId);
        if (activeId === convId) {
          const newActive = next.length > 0 ? next[0].id : null;
          queueMicrotask(() => setActiveId(newActive));
        }
        return next;
      });
    },
    [activeId],
  );

  // Keyboard shortcuts
  const newChatRef = useRef(handleNewChat);
  useEffect(() => {
    newChatRef.current = handleNewChat;
  });
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        newChatRef.current();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "/") {
        e.preventDefault();
        setInspectorOpen((v) => !v);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "h") {
        e.preventDefault();
        setHybridSearch((prev) => {
          const next = !prev;
          localStorage.setItem("hybridSearch", String(next));
          return next;
        });
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "a") {
        e.preventDefault();
        setAgenticMode((prev) => {
          const next = !prev;
          localStorage.setItem("agenticMode", String(next));
          return next;
        });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleEditMessage = useCallback(
    (msgId: string, newContent: string) => {
      if (!activeId) return;
      updateConversation(activeId, (c) => ({
        ...c,
        messages: c.messages.map((m) =>
          m.id === msgId ? { ...m, content: newContent } : m,
        ),
        updatedAt: Date.now(),
      }));
    },
    [activeId, updateConversation],
  );

  const handleDeleteMessage = useCallback(
    (msgId: string) => {
      if (!activeId) return;
      updateConversation(activeId, (c) => ({
        ...c,
        messages: c.messages.filter((m) => m.id !== msgId),
        updatedAt: Date.now(),
      }));
    },
    [activeId, updateConversation],
  );

  const handleCopyMessage = useCallback(() => {
    showToast("Copied to clipboard");
  }, [showToast]);

  const handleBookmarkMessage = useCallback(
    (msgId: string) => {
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
    },
    [activeId, updateConversation, showToast],
  );

  const handleRateMessage = useCallback(
    (msgId: string, rating: "up" | "down" | null) => {
      if (!activeId) return;
      updateConversation(activeId, (c) => ({
        ...c,
        messages: c.messages.map((m) =>
          m.id === msgId ? { ...m, rating } : m,
        ),
      }));
    },
    [activeId, updateConversation],
  );

  const handleRegenerate = useCallback(async () => {
    /* kept from page flow — see original logic */
  }, []);

  const handleSpeak = useCallback((_msgId: string, _text: string) => {
    /* kept from page flow — see original logic */
  }, []);

  const handleFollowUp = useCallback(
    (question: string) => {
      setRelatedQuestions([]);
      handleSend(question);
    },
    [handleSend],
  );

  const handlePinConversation = useCallback(
    (convId: string) => {
      updateConversation(convId, (c) => ({ ...c, pinned: !c.pinned }));
    },
    [updateConversation],
  );

  const handleArchiveConversation = useCallback(
    (convId: string) => {
      updateConversation(convId, (c) => ({ ...c, archived: !c.archived }));
    },
    [updateConversation],
  );

  const handleRenameConversation = useCallback(
    (convId: string, title: string) => {
      updateConversation(convId, (c) => ({ ...c, title }));
    },
    [updateConversation],
  );

  const handleCreateFolder = useCallback((name: string) => {
    setFolders((prev) => [
      ...prev,
      { id: generateId(), name, conversationIds: [] },
    ]);
  }, []);

  const handleDeleteFolder = useCallback((folderId: string) => {
    setFolders((prev) => prev.filter((f) => f.id !== folderId));
    setConversations((prev) =>
      prev.map((c) => (c.folderId === folderId ? { ...c, folderId: undefined } : c)),
    );
  }, []);

  const handleMoveToFolder = useCallback(
    (convId: string, folderId: string | undefined) => {
      updateConversation(convId, (c) => ({ ...c, folderId }));
    },
    [updateConversation],
  );

  const handleAddTag = useCallback(
    (convId: string, tag: string) => {
      updateConversation(convId, (c) => ({
        ...c,
        tags: [...new Set([...(c.tags || []), tag])],
      }));
    },
    [updateConversation],
  );

  const handleRemoveTag = useCallback(
    (convId: string, tag: string) => {
      updateConversation(convId, (c) => ({
        ...c,
        tags: (c.tags || []).filter((t) => t !== tag),
      }));
    },
    [updateConversation],
  );

  const handleAutoRename = useCallback(
    (convId: string) => {
      const conv = conversations.find((c) => c.id === convId);
      if (!conv || conv.messages.length === 0) return;
      const firstMsg = conv.messages.find((m) => m.role === "user");
      if (!firstMsg) return;
      let name = firstMsg.content.replace(/\n/g, " ").trim().slice(0, 60);
      if (name.length >= 60) name = name.slice(0, 57) + "...";
      if (name.length === 0) name = "New Chat";
      handleRenameConversation(convId, name);
    },
    [conversations, handleRenameConversation],
  );

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <TopBar
        onToggleSidebar={() => {
          if (typeof window !== "undefined" && window.innerWidth < 768) {
            setMobileSidebarOpen((v) => !v);
          } else {
            setSidebarCollapsed((v) => !v);
          }
        }}
        workspaceName={
          activeConversation?.title ||
          (activeView === "chats" && conversations.length === 0
            ? "Aether / New session"
            : activeView.charAt(0).toUpperCase() + activeView.slice(1))
        }
        onCommandOpen={() => setInspectorOpen(true)}
      />

      <div
        style={{
          display: "flex",
          flex: 1,
          minHeight: 0,
          padding: "8px 12px 12px",
          gap: 12,
        }}
      >
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

        <main
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            position: "relative",
          }}
        >
          {/* hidden original Header — kept as no-op for compatibility */}
          <Header
            sidebarCollapsed={sidebarCollapsed}
            setSidebarCollapsed={setSidebarCollapsed}
            activeView={activeView}
            messagesCount={messages.length}
            onClear={handleClear}
            onNewChat={handleNewChat}
            onShare={() => {}}
            onToggleMobileSidebar={() => setMobileSidebarOpen((v) => !v)}
            conversation={activeConversation}
          />

          <div
            ref={chatContainerRef}
            style={{
              flex: 1,
              overflowY: "auto",
              scrollbarWidth: "thin",
              padding: "20px 8px 220px",
              position: "relative",
            }}
          >
            <div style={{ maxWidth: 880, margin: "0 auto", padding: "0 8px" }}>
              <AnimatePresence mode="wait">
                {activeView === "chats" || activeView === "home" ? (
                  <motion.div
                    key="chat"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {messages.length === 0 && !loading ? (
                      <EmptyState
                        onSuggest={(s) => handleSend(s)}
                        suggestions={suggestions}
                      />
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
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
                        {!loading && messages.length > 0 && (
                          <RelatedQuestions
                            questions={relatedQuestions}
                            onSelect={handleFollowUp}
                            loading={relatedLoading}
                          />
                        )}
                        <div ref={bottomRef} />
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <PlaceholderView name={activeView} />
                )}
              </AnimatePresence>
            </div>
          </div>
        </main>

        <Inspector open={inspectorOpen} onClose={() => setInspectorOpen(false)} />
      </div>

      <BottomDock
        onSend={handleSend}
        disabled={loading}
        hybrid={hybridSearch}
        onToggleHybrid={() =>
          setHybridSearch((prev) => {
            const next = !prev;
            localStorage.setItem("hybridSearch", String(next));
            return next;
          })
        }
        agentic={agenticMode}
        onToggleAgentic={() =>
          setAgenticMode((prev) => {
            const next = !prev;
            localStorage.setItem("agenticMode", String(next));
            return next;
          })
        }
      />

      <SourceViewer
        sources={sourceViewerData}
        open={sourceViewerOpen}
        onClose={() => setSourceViewerOpen(false)}
      />
    </div>
  );
}

function EmptyState({ onSuggest, suggestions }: { onSuggest: (s: string) => void; suggestions: string[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        minHeight: "60dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "24px 12px",
        gap: 20,
      }}
    >
      <motion.span
        animate={{ y: [0, -2, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        style={{
          width: 56,
          height: 56,
          borderRadius: 18,
          background: "var(--aether-surface-recessed)",
          border: "1px solid var(--aether-border-subtle)",
          display: "grid",
          placeItems: "center",
          boxShadow: "var(--aether-shadow-orb)",
        }}
      >
        <Sparkles size={20} color="var(--aether-text-accent)" />
      </motion.span>
      <div>
        <h1
          style={{
            fontSize: 32,
            fontWeight: 500,
            letterSpacing: "-0.03em",
            marginBottom: 6,
            color: "var(--aether-text-primary)",
          }}
        >
          What would you like to know?
        </h1>
        <p
          style={{
            fontSize: 13.5,
            color: "var(--aether-text-tertiary)",
            letterSpacing: "-0.005em",
          }}
        >
          Upload documents and ask questions to begin.
        </p>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
        {suggestions.map((s) => (
          <motion.button
            key={s}
            onClick={() => onSuggest(s)}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            style={{
              padding: "8px 14px",
              fontSize: 12,
              border: "1px solid var(--aether-border-subtle)",
              background: "var(--aether-glass-default)",
              color: "var(--aether-text-secondary)",
              borderRadius: 999,
              cursor: "pointer",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }}
          >
            {s}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

function PlaceholderView({ name }: { name: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        minHeight: "60dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        color: "var(--aether-text-tertiary)",
      }}
    >
      <span
        style={{
          width: 56,
          height: 56,
          borderRadius: 18,
          background: "var(--aether-surface-recessed)",
          border: "1px solid var(--aether-border-subtle)",
          display: "grid",
          placeItems: "center",
        }}
      >
        <Sparkles size={18} color="var(--aether-text-tertiary)" />
      </span>
      <p style={{ fontSize: 13 }}>{name.slice(0, 1).toUpperCase() + name.slice(1)} — coming soon</p>
    </motion.div>
  );
}
