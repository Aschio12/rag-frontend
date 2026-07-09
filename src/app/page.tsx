"use client";

import { useEffect, useRef, useState } from "react";

import ChatInput from "@/components/ChatInput";
import ChatMessage from "@/components/ChatMessage";
import DocumentList from "@/components/DocumentList";
import DocumentUpload from "@/components/DocumentUpload";
import type { Source } from "@/lib/api";
import { sendMessage } from "@/lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
}

const STORAGE_KEY = "rag-chat-messages";

function loadMessages(): Message[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveMessages(msgs: Message[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs));
  } catch {
  }
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>(loadMessages);
  const [loading, setLoading] = useState(false);
  const [showDocs, setShowDocs] = useState(false);
  const [docRefreshKey, setDocRefreshKey] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    saveMessages(messages);
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text: string) => {
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
  };

  const handleClear = () => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleUploaded = () => {
    setDocRefreshKey((k) => k + 1);
  };

  return (
    <div className="mx-auto flex h-dvh max-w-3xl flex-col bg-neutral-50">
      <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-3">
        <div>
          <h1 className="text-sm font-semibold text-neutral-800">RAG Knowledge Chatbot</h1>
          <p className="text-xs text-neutral-400">Ask questions about your documents</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDocs(!showDocs)}
            className="rounded-lg px-3 py-1.5 text-xs text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors"
          >
            {showDocs ? "Chat" : "Documents"}
          </button>
          {messages.length > 0 && (
            <button
              onClick={handleClear}
              className="rounded-lg px-3 py-1.5 text-xs text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </header>

      {showDocs ? (
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          <DocumentUpload onUploaded={handleUploaded} />
          <div>
            <h2 className="mb-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Indexed Documents</h2>
            <DocumentList refreshKey={docRefreshKey} />
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-neutral-400">Upload a document and ask a question to get started.</p>
            </div>
          )}
          {messages.map((m, i) => (
            <ChatMessage key={i} role={m.role} content={m.content} sources={m.sources} />
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-md border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-400">
                <span className="animate-pulse">Thinking</span>
                <span className="animate-pulse" style={{ animationDelay: "0.2s" }}>.</span>
                <span className="animate-pulse" style={{ animationDelay: "0.4s" }}>.</span>
                <span className="animate-pulse" style={{ animationDelay: "0.6s" }}>.</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      )}

      <ChatInput onSend={handleSend} disabled={loading} />
    </div>
  );
}
