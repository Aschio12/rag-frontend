"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
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
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-3 rounded-xl border border-white/5 bg-white/[0.01] overflow-hidden"
    >
      <motion.button
        onClick={() => setCollapsed(!collapsed)}
        whileHover={{ backgroundColor: "rgba(255,255,255,0.02)" }}
        className="flex w-full items-center gap-2 px-3 py-2.5 text-xs font-medium text-muted-foreground/70 hover:text-foreground transition-colors"
      >
        <motion.div
          animate={{ rotate: collapsed ? 0 : 90 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </motion.div>
        <Sparkles className="h-3.5 w-3.5 text-purple-400" />
        <span>Agent Execution</span>
        {isComplete && lastStep?.summary && (
          <span className="text-[9px] text-muted-foreground/40 hidden sm:inline">
            {lastStep.summary.searches_performed} searches &middot; {lastStep.summary.sources_found} sources
            {lastStep.summary.claims_verified > 0 ? ` &middot; ${lastStep.summary.claims_verified} verified` : ""}
          </span>
        )}
        <span className="ml-auto flex items-center gap-1">
          {isComplete && (
            <span className="flex items-center gap-1 text-[10px] text-emerald-400">
              <CheckCircle2 className="h-3 w-3" />
              <span className="hidden sm:inline">Complete</span>
              {lastStep.total_time ? ` (${lastStep.total_time.toFixed(1)}s)` : ""}
            </span>
          )}
          {hasError && !isComplete && (
            <span className="flex items-center gap-1 text-[10px] text-red-400">
              <XCircle className="h-3 w-3" />
              Error
            </span>
          )}
          {!isComplete && !hasError && (
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground/40">
              <Clock className="h-3 w-3 animate-pulse" />
              Running...
            </span>
          )}
        </span>
      </motion.button>

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: "auto",
              opacity: 1,
              transition: {
                height: { type: "spring", stiffness: 200, damping: 25 },
                opacity: { duration: 0.2 },
              },
            }}
            exit={{
              height: 0,
              opacity: 0,
              transition: {
                height: { duration: 0.2 },
                opacity: { duration: 0.1 },
              },
            }}
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

            {isComplete && searchQueries && searchQueries.length > 0 && (
              <div className="border-t border-white/5 px-3 py-2">
                <div className="flex flex-wrap gap-1">
                  {searchQueries.map((q, i) => (
                    <span
                      key={i}
                      className="rounded-full bg-blue-500/10 text-blue-400 px-2 py-0.5 text-[9px] font-medium"
                    >
                      {q}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {isComplete && (plan || verificationResults) && (
              <div className="border-t border-white/5 px-3 py-2">
                <motion.button
                  onClick={() => setShowDetails(!showDetails)}
                  whileHover={{ backgroundColor: "rgba(255,255,255,0.02)" }}
                  className="flex w-full items-center gap-1.5 rounded-lg px-2 py-1 text-[10px] text-muted-foreground/50 hover:text-foreground transition-colors"
                >
                  <ScrollText className="h-3 w-3" />
                  {showDetails ? "Hide" : "Show"} agent reasoning details
                  <motion.div
                    animate={{ rotate: showDetails ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="ml-auto"
                  >
                    <ChevronDown className="h-3 w-3" />
                  </motion.div>
                </motion.button>
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
                          <p className="text-[10px] font-medium text-violet-400 mb-1">Plan</p>
                          <pre className="whitespace-pre-wrap text-[10px] text-muted-foreground/60 bg-white/[0.02] rounded-lg p-2.5 border border-white/5">
                            {plan}
                          </pre>
                        </div>
                      )}
                      {verificationResults && verificationResults.length > 0 && (
                        <div>
                          <p className="text-[10px] font-medium text-emerald-400 mb-1">Verification</p>
                          <div className="space-y-1">
                            {verificationResults.map((v, i) => (
                              <div
                                key={i}
                                className="rounded-lg bg-white/[0.02] border border-white/5 px-2.5 py-1.5 text-[10px]"
                              >
                                <p className="text-muted-foreground/70">Claim: {v.claim}</p>
                                <p className={cn(
                                  "mt-0.5 font-medium",
                                  v.supported ? "text-emerald-400" : "text-amber-400",
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
    </motion.div>
  );
}
