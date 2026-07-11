"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Bookmark,
  Check,
  Copy,
  Edit2,
  RefreshCw,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  User,
  Volume2,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { Source } from "@/lib/api";
import { cn } from "@/lib/utils";

interface Props {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  isStreaming?: boolean;
  bookmarked?: boolean;
  rating?: "up" | "down" | null;
  onEdit?: (id: string, newContent: string) => void;
  onDelete?: (id: string) => void;
  onRegenerate?: (id: string) => void;
  onCopy?: (id: string) => void;
  onBookmark?: (id: string) => void;
  onRate?: (id: string, rating: "up" | "down" | null) => void;
  onSpeak?: (id: string, content: string) => void;
}

function CodeBlock({ className, children, ...props }: React.HTMLAttributes<HTMLElement>) {
  const [copied, setCopied] = useState(false);
  const code = String(children ?? "");
  const match = /language-(\w+)/.exec(className ?? "");
  const lang = match?.[1] ?? "";
  const lines = code.split("\n");
  const showLineNumbers = lines.length > 1;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative my-3 overflow-hidden rounded-lg border bg-[#0a0a0b]">
      {lang && (
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-1.5">
          <span className="text-[11px] font-medium text-white/40">{lang}</span>
          <span className="text-[9px] text-white/20">{lines.length} lines</span>
        </div>
      )}
      <div className="relative">
        <pre className={cn("overflow-x-auto p-4 text-sm leading-relaxed", !lang && "p-0")}>
          {showLineNumbers && (
            <span className="float-left mr-4 select-none text-right text-white/15" aria-hidden>
              {lines.map((_, i) => (
                <span key={i} className="block leading-relaxed">{i + 1}</span>
              ))}
            </span>
          )}
          <code className={className} {...props}>
            {children}
          </code>
        </pre>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCopy}
          className="absolute right-2 top-2 h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100 text-white/40 hover:text-white hover:bg-white/10"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
        </Button>
      </div>
    </div>
  );
}

function MermaidDiagram({ code }: { code: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function render() {
      if (!ref.current || !code) return;
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({ startOnLoad: false, theme: "dark" });
        const { svg } = await mermaid.render("mermaid-" + Math.random().toString(36).slice(2), code);
        if (mounted && ref.current) {
          ref.current.innerHTML = svg;
        }
      } catch {
        if (mounted) setError(true);
      }
    }
    render();
    return () => { mounted = false; };
  }, [code]);

  if (error) {
    return <pre className="rounded bg-red-950/30 p-3 text-xs text-red-400 overflow-x-auto">{code}</pre>;
  }

  return <div ref={ref} className="my-3 flex justify-center overflow-x-auto" />;
}

function TypingContent({ content }: { content: string }) {
  const [displayed, setDisplayed] = useState(0);
  useEffect(() => {
    if (displayed >= content.length) return;
    const timer = setTimeout(() => {
      setDisplayed((prev) => Math.min(prev + 3, content.length));
    }, 15);
    return () => clearTimeout(timer);
  }, [content, displayed]);
  useEffect(() => { queueMicrotask(() => setDisplayed(0)); }, [content]);
  return <span>{content.slice(0, displayed)}<span className="animate-pulse">▊</span></span>;
}

const ChatMessage = memo(function ChatMessage({
  id,
  role,
  content,
  sources,
  isStreaming,
  bookmarked,
  rating: propRating,
  onEdit,
  onDelete,
  onRegenerate,
  onCopy,
  onBookmark,
  onRate,
  onSpeak,
}: Props) {
  const isUser = role === "user";
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(content);
  const [showActions, setShowActions] = useState(false);

  const handleSaveEdit = useCallback(() => {
    if (editText.trim() && editText !== content) {
      onEdit?.(id, editText.trim());
    }
    setEditing(false);
  }, [editText, content, id, onEdit]);

  const handleCopyMessage = useCallback(() => {
    navigator.clipboard.writeText(content);
    onCopy?.(id);
  }, [content, id, onCopy]);

  const handleRate = useCallback((value: "up" | "down") => {
    const next = propRating === value ? null : value;
    onRate?.(id, next);
  }, [propRating, id, onRate]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn("flex gap-3 group", isUser ? "flex-row-reverse" : "flex-row")}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <Avatar className={cn("mt-0.5 h-7 w-7 shrink-0", isUser ? "bg-primary" : "bg-gradient-to-br from-blue-500 to-purple-600")}>
        <AvatarFallback className="text-[10px] text-white">
          {isUser ? <User className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
        </AvatarFallback>
      </Avatar>

      <div className={cn("flex max-w-[90%] md:max-w-[80%] flex-col", isUser ? "items-end" : "items-start")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm leading-relaxed relative",
            isUser
              ? "bg-chat-user text-chat-user-foreground rounded-br-md"
              : "bg-chat-assistant text-chat-assistant-foreground rounded-bl-md border shadow-xs",
          )}
        >
          {/* Message actions bar */}
          <div
            className={cn(
              "absolute -top-8 flex items-center gap-0.5 rounded-lg border bg-background px-1 py-0.5 shadow-sm transition-opacity duration-200",
              isUser ? "right-0" : "left-0",
              showActions && !editing ? "opacity-100" : "opacity-0 pointer-events-none",
            )}
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button onClick={handleCopyMessage} className="rounded p-1 text-muted-foreground/60 hover:text-foreground transition-colors">
                    <Copy className="h-3 w-3" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-[10px]">Copy</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {isUser && onEdit && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button onClick={() => { setEditText(content); setEditing(true); }} className="rounded p-1 text-muted-foreground/60 hover:text-foreground transition-colors">
                      <Edit2 className="h-3 w-3" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-[10px]">Edit</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {onDelete && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button onClick={() => onDelete(id)} className="rounded p-1 text-muted-foreground/60 hover:text-destructive transition-colors">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-[10px]">Delete</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {!isUser && onRegenerate && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button onClick={() => onRegenerate(id)} className="rounded p-1 text-muted-foreground/60 hover:text-foreground transition-colors">
                      <RefreshCw className="h-3 w-3" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-[10px]">Regenerate</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {onBookmark && !isUser && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button onClick={() => onBookmark(id)} className={cn("rounded p-1 transition-colors", bookmarked ? "text-amber-500" : "text-muted-foreground/60 hover:text-foreground")}>
                      <Bookmark className="h-3 w-3" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-[10px]">{bookmarked ? "Unbookmark" : "Bookmark"}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {onSpeak && !isUser && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button onClick={() => onSpeak(id, content)} className="rounded p-1 text-muted-foreground/60 hover:text-foreground transition-colors">
                      <Volume2 className="h-3 w-3" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-[10px]">Speak</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          {editing ? (
            <div className="space-y-2">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full resize-none rounded-lg border bg-background p-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                rows={3}
                autoFocus
              />
              <div className="flex gap-1.5 justify-end">
                <button
                  onClick={() => setEditing(false)}
                  className="rounded-md px-2 py-1 text-[11px] text-muted-foreground hover:bg-accent transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="rounded-md px-2 py-1 text-[11px] bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  Save
                </button>
              </div>
            </div>
          ) : isUser ? (
            <p className="whitespace-pre-wrap">{content}</p>
          ) : isStreaming ? (
            <div className="text-sm leading-relaxed whitespace-pre-wrap">
              <TypingContent content={content} />
            </div>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none prose-pre:p-0 prose-code:before:content-none prose-code:after:content-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeHighlight, rehypeKatex]}
                components={{
                  code({ className, children, ...props }) {
                    const isInline = !className;
                    if (isInline) {
                      return (
                        <code
                          className="rounded bg-muted px-1.5 py-0.5 text-[13px] font-mono text-foreground"
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    }
                    const lang = (className ?? "").replace("language-", "");
                    if (lang === "mermaid") {
                      return <MermaidDiagram code={String(children ?? "")} />;
                    }
                    return <CodeBlock className={className} {...props}>{children}</CodeBlock>;
                  },
                  pre({ children }) {
                    return <>{children}</>;
                  },
                  p({ children }) {
                    return <p className="mb-2 last:mb-0 leading-7">{children}</p>;
                  },
                  ul({ children }) {
                    return <ul className="mb-2 list-disc pl-5 space-y-1">{children}</ul>;
                  },
                  ol({ children }) {
                    return <ol className="mb-2 list-decimal pl-5 space-y-1">{children}</ol>;
                  },
                  table({ children }) {
                    return (
                      <div className="my-3 overflow-x-auto rounded-lg border">
                        <table className="min-w-full divide-y text-sm">{children}</table>
                      </div>
                    );
                  },
                  thead({ children }) {
                    return <thead className="bg-muted/50">{children}</thead>;
                  },
                  th({ children }) {
                    return <th className="px-3 py-2 text-left font-medium text-muted-foreground">{children}</th>;
                  },
                  td({ children }) {
                    return <td className="px-3 py-2">{children}</td>;
                  },
                  a({ href, children }) {
                    return (
                      <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {children}
                      </a>
                    );
                  },
                  blockquote({ children }) {
                    return (
                      <blockquote className="border-l-2 border-muted-foreground/20 pl-4 italic text-muted-foreground">
                        {children}
                      </blockquote>
                    );
                  },
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {sources && sources.length > 0 && !isUser && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-2 w-full space-y-1.5"
          >
            <div className="flex items-center gap-1.5">
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                {sources.length} source{sources.length > 1 ? "s" : ""}
              </Badge>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-muted-foreground/60">
                Click to view details
              </Badge>
            </div>
            {sources.slice(0, 3).map((s, i) => (
              <button
                key={i}
                onClick={() => window.dispatchEvent(new CustomEvent("open-source", { detail: { sources, index: i } }))}
                className="w-full text-left rounded-lg border bg-muted/30 p-2.5 text-xs hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-muted-foreground flex items-center gap-1">
                    {s.filename || `Source #${i + 1}`}
                    {s.page_number ? <span className="text-[9px] text-muted-foreground/50">p.{s.page_number}</span> : null}
                  </span>
                  <span className="shrink-0 rounded bg-muted px-1 py-0.5 text-[9px] font-medium" style={{
                    color: s.score > 0.8 ? '#10b981' : s.score > 0.5 ? '#f59e0b' : '#ef4444'
                  }}>
                    {(s.score * 100).toFixed(0)}%
                  </span>
                </div>
                <p className="mt-1 leading-relaxed text-muted-foreground/80 line-clamp-2">{s.text}</p>
              </button>
            ))}
            {sources.length > 3 && (
              <button
                onClick={() => window.dispatchEvent(new CustomEvent("open-source", { detail: { sources, index: 0 } }))}
                className="w-full rounded-lg border border-dashed border-muted-foreground/20 p-2 text-[10px] text-muted-foreground/50 hover:text-foreground hover:bg-accent/30 transition-colors"
              >
                + {sources.length - 3} more sources
              </button>
            )}
          </motion.div>
        )}

        {!isUser && !isStreaming && (
          <div className="mt-3 flex items-center gap-1.5">
            <span className="mr-1 text-[11px] text-muted-foreground/50">Was this helpful?</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => handleRate("up")}
                    className={cn(
                      "rounded-md p-1 transition-colors",
                      propRating === "up" ? "text-emerald-500" : "text-muted-foreground/40 hover:text-muted-foreground",
                    )}
                  >
                    <ThumbsUp className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Helpful</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => handleRate("down")}
                    className={cn(
                      "rounded-md p-1 transition-colors",
                      propRating === "down" ? "text-red-500" : "text-muted-foreground/40 hover:text-muted-foreground",
                    )}
                  >
                    <ThumbsDown className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Not helpful</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>
    </motion.div>
  );
});

export default ChatMessage;
