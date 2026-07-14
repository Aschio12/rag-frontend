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
import type { AgentStepEvent, Source } from "@/lib/api";
import AgentStepsDisplay from "@/components/AgentStepsDisplay";
import { cn } from "@/lib/utils";
import { ChatMessageAnimation } from "@/components/animations/ChatMessageAnimation";

interface Props {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  agentSteps?: AgentStepEvent[];
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
    <div className="group relative my-3 overflow-hidden rounded-xl border border-white/5 bg-[#0a0a0b]">
      {lang && (
        <div className="flex items-center justify-between border-b border-white/[0.03] px-4 py-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-red-500/60" />
            <span className="flex h-2 w-2 rounded-full bg-amber-500/60" />
            <span className="flex h-2 w-2 rounded-full bg-emerald-500/60" />
            <span className="ml-2 text-[11px] font-medium text-white/30">{lang}</span>
          </div>
          <span className="text-[9px] text-white/15">{lines.length} lines</span>
        </div>
      )}
      <div className="relative">
        <pre className={cn("overflow-x-auto p-4 text-sm leading-relaxed", !lang && "p-0")}>
          {showLineNumbers && (
            <span className="float-left mr-4 select-none text-right text-white/10" aria-hidden>
              {lines.map((_, i) => (
                <span key={i} className="block leading-relaxed">{i + 1}</span>
              ))}
            </span>
          )}
          <code className={className} {...props}>
            {children}
          </code>
        </pre>
        <motion.button
          onClick={handleCopy}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="absolute right-2 top-2 h-7 w-7 opacity-0 group-hover:opacity-100 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/5 transition-all"
        >
          {copied ? (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-emerald-400"
            >
              <Check className="h-3.5 w-3.5" />
            </motion.span>
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </motion.button>
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
      const charsPerTick = content.length > 200 ? 5 : 3;
      setDisplayed((prev) => Math.min(prev + charsPerTick, content.length));
    }, 12);
    return () => clearTimeout(timer);
  }, [content, displayed]);
  useEffect(() => { queueMicrotask(() => setDisplayed(0)); }, [content]);
  return (
    <span className="text-sm leading-relaxed whitespace-pre-wrap text-gray-200 font-mono tracking-wide">
      {content.slice(0, displayed)}
      {displayed < content.length && (
        <motion.span
          className="inline-block w-[2px] h-[1em] bg-purple-400 ml-0.5 align-middle"
          animate={{ opacity: [1, 0.2] }}
          transition={{ duration: 0.6, repeat: Infinity }}
        />
      )}
    </span>
  );
}

const ChatMessage = memo(function ChatMessage(props: Props) {
  const {
    id,
    role,
    content,
    sources,
    agentSteps,
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
  } = props;
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
    <ChatMessageAnimation
      role={role}
      className={cn("flex gap-3 group", isUser ? "flex-row-reverse" : "flex-row")}
    >
      <div
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
        className="contents"
      >
      <Avatar className={cn("mt-0.5 h-7 w-7 shrink-0", isUser ? "bg-[#0a0a14] border border-[#7000ff]/50 text-[#7000ff]" : "bg-[#0a0a14] border border-[#00f2fe]/50 glow-cyan text-[#00f2fe]")}>
        <AvatarFallback className="text-[10px] text-current">
          {isUser ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>

      <div className={cn("flex max-w-[90%] md:max-w-[80%] flex-col", isUser ? "items-end" : "items-start")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm leading-relaxed relative overflow-hidden",
            isUser
              ? "bg-white/[0.02] border border-white/10 text-foreground/90"
              : "cyber-glass bg-[#0a0a14]/40 text-foreground/90 rounded-bl-sm",
          )}
        >
          {!isUser && (
            <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-[#7000ff] to-[#00f2fe] opacity-60" />
          )}
          {/* Message actions bar */}
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={showActions && !editing ? { opacity: 1, y: 0 } : { opacity: 0, y: 4 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={cn(
              "absolute -top-9 flex items-center gap-0.5 rounded-xl border border-white/5 bg-white/[0.03] backdrop-blur-xl px-1 py-0.5 shadow-lg",
              isUser ? "right-0" : "left-0",
            )}
          >
            <TooltipProvider delayDuration={400}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button onClick={handleCopyMessage} className="rounded-lg p-1.5 text-muted-foreground/50 hover:text-foreground hover:bg-white/5 transition-all">
                    <Copy className="h-3 w-3" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-[10px]">Copy</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {isUser && onEdit && (
              <TooltipProvider delayDuration={400}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button onClick={() => { setEditText(content); setEditing(true); }} className="rounded-lg p-1.5 text-muted-foreground/50 hover:text-foreground hover:bg-white/5 transition-all">
                      <Edit2 className="h-3 w-3" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-[10px]">Edit</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {onDelete && (
              <TooltipProvider delayDuration={400}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button onClick={() => onDelete(id)} className="rounded-lg p-1.5 text-muted-foreground/50 hover:text-red-400 hover:bg-red-500/10 transition-all">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-[10px]">Delete</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {!isUser && onRegenerate && (
              <TooltipProvider delayDuration={400}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button onClick={() => onRegenerate(id)} className="rounded-lg p-1.5 text-muted-foreground/50 hover:text-purple-400 hover:bg-purple-500/10 transition-all">
                      <RefreshCw className="h-3 w-3" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-[10px]">Regenerate</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {onBookmark && !isUser && (
              <TooltipProvider delayDuration={400}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button onClick={() => onBookmark(id)} className={cn("rounded-lg p-1.5 transition-all", bookmarked ? "text-amber-400 bg-amber-500/10" : "text-muted-foreground/50 hover:text-amber-400 hover:bg-amber-500/10")}>
                      <Bookmark className="h-3 w-3" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-[10px]">{bookmarked ? "Unbookmark" : "Bookmark"}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {onSpeak && !isUser && (
              <TooltipProvider delayDuration={400}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button onClick={() => onSpeak(id, content)} className="rounded-lg p-1.5 text-muted-foreground/50 hover:text-foreground hover:bg-white/5 transition-all">
                      <Volume2 className="h-3 w-3" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-[10px]">Speak</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </motion.div>

          {editing ? (
            <div className="space-y-2">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full resize-none rounded-lg border border-white/10 bg-white/[0.02] p-2 text-sm outline-none focus:ring-1 focus:ring-[#00f2fe]/50"
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
              <p className="whitespace-pre-wrap text-gray-200 font-mono text-sm tracking-wide leading-relaxed">{content}</p>
          ) : isStreaming ? (
            <>
              {agentSteps && agentSteps.length > 0 && (
                <AgentStepsDisplay steps={agentSteps} />
              )}
              <div className="text-sm leading-relaxed whitespace-pre-wrap text-gray-200 font-mono tracking-wide">
                <TypingContent content={content} />
              </div>
            </>
          ) : (
            <>
              {agentSteps && agentSteps.length > 0 && (
                <AgentStepsDisplay steps={agentSteps} />
              )}
              <div className="prose prose-sm dark:prose-invert max-w-none prose-pre:p-0 prose-code:before:content-none prose-code:after:content-none text-gray-200 font-mono tracking-wide">
                <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeHighlight, rehypeKatex]}
                components={{
                  code({ className, children, ...props }) {
                    const isInline = !className;
                    if (isInline) {
                      return (
                          <code
                            className="rounded bg-[#1a1a2e] px-1.5 py-0.5 text-[13px] font-mono text-gray-200"
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
            </>
          )}
        </div>

        {sources && sources.length > 0 && !isUser && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-2 w-full space-y-1.5"
          >
            <div className="flex items-center gap-1.5">
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-mono tracking-wider text-gray-400 bg-white/5">
                {sources.length} SOURCE{sources.length > 1 ? "S" : ""}
              </Badge>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-gray-500/60 border-white/10">
                Click to view details
              </Badge>
            </div>
            {sources.slice(0, 3).map((s, i) => (
              <button
                key={i}
                onClick={() => window.dispatchEvent(new CustomEvent("open-source", { detail: { sources, index: i } }))}
                className="w-full text-left rounded-lg border border-white/5 bg-white/[0.02] p-2.5 text-xs hover:bg-white/[0.05] transition-colors"
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
                className="w-full rounded-lg border border-dashed border-white/10 p-2 text-[10px] text-gray-500/50 hover:text-gray-300 hover:bg-white/[0.03] transition-colors"
              >
                + {sources.length - 3} more sources
              </button>
            )}
          </motion.div>
        )}

        {!isUser && !isStreaming && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-3 flex items-center gap-2"
          >
            <span className="text-[10px] text-gray-500/40 font-mono tracking-wider">SYS: FEEDBACK</span>
            <button
              onClick={() => handleRate("up")}
              className={cn(
                "rounded-lg p-1 transition-all duration-200",
                propRating === "up"
                  ? "text-emerald-400 glow-emerald bg-emerald-500/10"
                  : "text-gray-500/30 hover:text-emerald-400 hover:bg-emerald-500/5",
              )}
            >
              <ThumbsUp className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => handleRate("down")}
              className={cn(
                "rounded-lg p-1 transition-all duration-200",
                propRating === "down"
                  ? "text-red-400 bg-red-500/10"
                  : "text-gray-500/30 hover:text-red-400 hover:bg-red-500/5",
              )}
            >
              <ThumbsDown className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        )}
      </div>
      </div>
    </ChatMessageAnimation>
  );
});

export default ChatMessage;
