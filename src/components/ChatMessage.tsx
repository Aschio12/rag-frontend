"use client";

import { memo, useId, useState } from "react";
import { motion } from "framer-motion";
import { Check, Copy, Sparkles, ThumbsDown, ThumbsUp, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { Source } from "@/lib/api";
import { cn } from "@/lib/utils";

interface Props {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  isStreaming?: boolean;
}

function CodeBlock({ className, children, ...props }: React.HTMLAttributes<HTMLElement>) {
  const [copied, setCopied] = useState(false);
  const code = String(children ?? "");
  const match = /language-(\w+)/.exec(className ?? "");
  const lang = match?.[1] ?? "";

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
        </div>
      )}
      <div className="relative">
        <pre className={cn("overflow-x-auto p-4 text-sm leading-relaxed", !lang && "p-0")}>
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

function SourceBadge({ source, index }: { source: Source; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg border bg-muted/30 p-2.5 text-xs">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-2"
      >
        <span className="font-medium text-muted-foreground">Source #{index + 1}</span>
        <span className="shrink-0 text-muted-foreground/60">
          {open ? "▲" : "▼"} {(source.score * 100).toFixed(0)}% match
        </span>
      </button>
      {open && (
        <p className="mt-1.5 leading-relaxed text-muted-foreground/80 line-clamp-3">{source.text}</p>
      )}
    </div>
  );
}

function FeedbackButtons({ messageId }: { messageId: string }) {
  const stored = typeof window !== "undefined" ? localStorage.getItem(`feedback-${messageId}`) : null;
  const [rating, setRating] = useState<"up" | "down" | null>(stored as "up" | "down" | null);

  const handleRate = (value: "up" | "down") => {
    const next = rating === value ? null : value;
    setRating(next);
    if (typeof window !== "undefined") {
      localStorage.setItem(`feedback-${messageId}`, next ?? "");
    }
  };

  return (
    <div className="mt-3 flex items-center gap-1.5">
      <span className="mr-1 text-[11px] text-muted-foreground/50">Was this helpful?</span>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => handleRate("up")}
              className={cn(
                "rounded-md p-1 transition-colors",
                rating === "up" ? "text-emerald-500" : "text-muted-foreground/40 hover:text-muted-foreground",
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
                rating === "down" ? "text-red-500" : "text-muted-foreground/40 hover:text-muted-foreground",
              )}
            >
              <ThumbsDown className="h-3.5 w-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Not helpful</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

const ChatMessage = memo(function ChatMessage({ role, content, sources, isStreaming }: Props) {
  const isUser = role === "user";
  const messageId = useId();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}
    >
      <Avatar className={cn("mt-0.5 h-7 w-7 shrink-0", isUser ? "bg-primary" : "bg-gradient-to-br from-blue-500 to-purple-600")}>
        <AvatarFallback className="text-[10px] text-white">
          {isUser ? <User className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
        </AvatarFallback>
      </Avatar>

      <div className={cn("flex max-w-[75%] flex-col", isUser ? "items-end" : "items-start")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
            isUser
              ? "bg-chat-user text-chat-user-foreground rounded-br-md"
              : "bg-chat-assistant text-chat-assistant-foreground rounded-bl-md border shadow-xs",
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{content}</p>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none prose-pre:p-0 prose-code:before:content-none prose-code:after:content-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
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
            </div>
            {sources.map((s, i) => (
              <SourceBadge key={i} source={s} index={i} />
            ))}
          </motion.div>
        )}

        {!isUser && !isStreaming && <FeedbackButtons messageId={messageId} />}
      </div>
    </motion.div>
  );
});

export default ChatMessage;
