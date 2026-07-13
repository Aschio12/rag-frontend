"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  FileSearch,
  ListChecks,
  Search,
  ScrollText,
  Sparkles,
  XCircle,
} from "lucide-react";

import type { AgentStepEvent } from "@/lib/api";
import { cn } from "@/lib/utils";
import { AgentStepsAnimation } from "@/components/animations/AgentStepsAnimation";

interface AgentStepsDisplayProps {
  steps: AgentStepEvent[];
  onToggle?: () => void;
}

const stepIcons: Record<string, React.ElementType> = {
  planning: Brain,
  searching: Search,
  retrieving: FileSearch,
  reasoning: Brain,
  critiquing: ListChecks,
  verifying: CheckCircle2,
  memory: Sparkles,
};

const stepColors: Record<string, string> = {
  planning: "text-violet-500 bg-violet-500/10 border-violet-500/20",
  searching: "text-blue-500 bg-blue-500/10 border-blue-500/20",
  retrieving: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20",
  reasoning: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  critiquing: "text-purple-500 bg-purple-500/10 border-purple-500/20",
  verifying: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  memory: "text-rose-500 bg-rose-500/10 border-rose-500/20",
};

export default function AgentStepsDisplay({ steps }: AgentStepsDisplayProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  if (steps.length === 0) return null;

  const lastStep = steps[steps.length - 1];
  const isComplete = lastStep?.event === "complete";
  const hasError = steps.some((s) => s.event === "step_error");
  const plan = isComplete ? lastStep?.plan : undefined;
  const verificationResults = isComplete ? lastStep?.verification : undefined;
  const searchQueries = isComplete ? lastStep?.search_queries : undefined;

  return (
    <div className="mb-3 rounded-xl border bg-muted/20">
      {/* Header */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="h-3.5 w-3.5" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5" />
        )}
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        <span>Agent Execution</span>
        {isComplete && lastStep?.summary && (
          <span className="text-[9px] text-muted-foreground/50">
            {lastStep.summary.searches_performed} searches · {lastStep.summary.sources_found} sources
            {lastStep.summary.claims_verified > 0 ? ` · ${lastStep.summary.claims_verified} verified` : ""}
          </span>
        )}
        {isComplete && (
          <span className="ml-auto flex items-center gap-1 text-[10px] text-emerald-500">
            <CheckCircle2 className="h-3 w-3" />
            Complete
            {lastStep.total_time ? ` (${lastStep.total_time.toFixed(1)}s)` : ""}
          </span>
        )}
        {hasError && !isComplete && (
          <span className="ml-auto flex items-center gap-1 text-[10px] text-red-500">
            <XCircle className="h-3 w-3" />
            Error
          </span>
        )}
        {!isComplete && !hasError && (
          <span className="ml-auto flex items-center gap-1 text-[10px] text-muted-foreground/50">
            <Clock className="h-3 w-3 animate-pulse" />
            Running...
          </span>
        )}
      </button>

      {/* Steps */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3">
              <AgentStepsAnimation
                steps={steps.map((s, i) => ({
                  id: `${s.step || "step"}-${i}`,
                  label: s.label || s.step || "Processing...",
                  status: s.event === "step_error" ? "error" as const
                    : s.event === "step_complete" || s.event === "complete" ? "complete" as const
                    : i === steps.length - 1 && !isComplete && !hasError ? "active" as const
                    : "pending" as const,
                }))}
              />
            </div>

            {/* Search Queries Summary */}
            {isComplete && searchQueries && searchQueries.length > 0 && (
              <div className="border-t border-muted/20 px-3 py-2">
                <div className="flex flex-wrap gap-1">
                  {searchQueries.map((q, i) => (
                    <span
                      key={i}
                      className="rounded-full bg-blue-500/10 text-blue-600 px-2 py-0.5 text-[9px] font-medium"
                    >
                      {q}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Plan & Details */}
            {isComplete && (plan || verificationResults) && (
              <div className="border-t border-muted/20 px-3 py-2">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60 hover:text-foreground transition-colors"
                >
                  <ScrollText className="h-3 w-3" />
                  {showDetails ? "Hide" : "Show"} agent reasoning details
                  {showDetails ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                </button>
                <AnimatePresence>
                  {showDetails && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-2 space-y-2 overflow-hidden"
                    >
                      {plan && (
                        <div>
                          <p className="text-[10px] font-medium text-violet-500 mb-1">Plan</p>
                          <pre className="whitespace-pre-wrap text-[10px] text-muted-foreground/80 bg-muted/30 rounded-lg p-2">
                            {plan}
                          </pre>
                        </div>
                      )}
                      {verificationResults && verificationResults.length > 0 && (
                        <div>
                          <p className="text-[10px] font-medium text-emerald-500 mb-1">Verification</p>
                          <div className="space-y-1">
                            {verificationResults.map((v, i) => (
                              <div
                                key={i}
                                className="rounded-lg bg-muted/30 px-2 py-1.5 text-[10px]"
                              >
                                <p className="text-muted-foreground/80">Claim: {v.claim}</p>
                                <p className={cn(
                                  "mt-0.5",
                                  v.supported ? "text-emerald-500" : "text-amber-500",
                                )}>
                                  {v.verdict}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
