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
import { Skeleton } from "@/components/ui/skeleton";
import type { Source } from "@/lib/api";
import { sendMessage } from "@/lib/api";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
}

const STORAGE_KEY = "rag-chat-messages";

function saveMessages(msgs: Message[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs));
  } catch {}
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeView, setActiveView] = useState("chats");
  const [docRefreshKey, setDocRefreshKey] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Message[];
        queueMicrotask(() => setMessages(parsed));
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (messages.length > 0) saveMessages(messages);
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = useCallback(async (text: string) => {
    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await sendMessage({ message: text });
      const assistantMsg: Message = {
        role: "assistant",
        content: res.answer,
        sources: res.sources,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const errMsg: Message = {
        role: "assistant",
        content: "Sorry, something went wrong. Please try again.",
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleClear = useCallback(() => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const handleUploaded = useCallback(() => {
    setDocRefreshKey((k) => k + 1);
  }, []);

  return (
    <div className="flex h-dvh">
      <Sidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          activeView={activeView}
          messagesCount={messages.length}
          onClear={handleClear}
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
                  {messages.length === 0 ? (
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
                      {messages.map((m, i) => (
                        <ChatMessage
                          key={i}
                          role={m.role}
                          content={m.content}
                          sources={m.sources}
                          isStreaming={loading && i === messages.length - 1 && m.role === "assistant"}
                        />
                      ))}
                      {loading && (
                        <div className="flex gap-3">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
                            <Sparkles className="h-3.5 w-3.5 text-white" />
                          </div>
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
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

const suggestions = [
  "What documents do I have?",
  "Summarize the refund policy",
  "How do I upload a file?",
];
