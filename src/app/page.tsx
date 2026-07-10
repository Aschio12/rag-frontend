"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FileText, MessageSquareOff, Sparkles } from "lucide-react";

import ChatInput from "@/components/ChatInput";
import ChatMessage from "@/components/ChatMessage";
import DocumentList from "@/components/DocumentList";
import DocumentUpload from "@/components/DocumentUpload";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { sendMessage, sendMessageStream } from "@/lib/api";
import {
  type Conversation,
  type Message,
  createConversation,
  generateId,
  loadActiveConversationId,
  loadConversations,
  saveActiveConversationId,
  saveConversations,
} from "@/lib/store";

const suggestions = [
  "What documents do I have?",
  "Summarize the refund policy",
  "How do I upload a file?",
];

export default function Home() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeView, setActiveView] = useState("chats");
  const [docRefreshKey, setDocRefreshKey] = useState(0);
  const [streamingContent, setStreamingContent] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<AbortController | null>(null);

  const activeConversation = conversations.find((c) => c.id === activeId) || null;
  const messages = activeConversation?.messages || [];
  const loading = streamRef.current !== null;

  useEffect(() => {
    const stored = loadConversations();
    if (stored.length > 0) {
      setConversations(stored);
      const active = loadActiveConversationId();
      if (active && stored.some((c) => c.id === active)) {
        setActiveId(active);
      } else {
        setActiveId(stored[0].id);
      }
    }
  }, []);

  useEffect(() => {
    if (conversations.length > 0) saveConversations(conversations);
  }, [conversations]);

  useEffect(() => {
    saveActiveConversationId(activeId);
  }, [activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

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

  return (
    <div className="flex h-dvh">
      <Sidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        activeView={activeView}
        setActiveView={setActiveView}
        conversations={conversations}
        activeId={activeId}
        onSelectConversation={setActiveId}
        onNewChat={handleNewChat}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          activeView={activeView}
          messagesCount={messages.length}
          onClear={handleClear}
          onNewChat={handleNewChat}
          conversation={activeConversation}
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
              <div className="flex-1 overflow-y-auto scrollbar-thin">
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
                          content={m.content}
                          sources={m.sources}
                          isStreaming={m.content === "" && loading}
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
                      <div ref={bottomRef} />
                    </div>
                  )}
                </div>
              </div>

              <ChatInput onSend={handleSend} disabled={loading} />
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
