"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  Brain,
  Clock,
  FileText,
  Lightbulb,
  Sparkles,
  Table2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  extractTables,
  extractTimeline,
  generateFlashcards,
  generateQuiz,
  summarizeDocument,
} from "@/lib/api";
import { cn } from "@/lib/utils";

interface Props {
  docId: string;
}

type ToolTab = "summary" | "flashcards" | "quiz" | "timeline" | "tables";

export default function StudyToolsPanel({ docId }: Props) {
  const [activeTab, setActiveTab] = useState<ToolTab>("summary");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [flashcards, setFlashcards] = useState<{ front: string; back: string }[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<{ question: string; options: string[]; answer: number }[]>([]);
  const [timeline, setTimeline] = useState<{ date: string; event: string; description?: string }[]>([]);
  const [tables, setTables] = useState<{ caption?: string; headers?: string[]; rows: string[][] }[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [showFlashcardAnswer, setShowFlashcardAnswer] = useState(false);

  const tabs: { id: ToolTab; label: string; icon: LucideIcon; color: string }[] = [
    { id: "summary", label: "Summary", icon: FileText, color: "text-purple-400" },
    { id: "flashcards", label: "Flashcards", icon: Brain, color: "text-emerald-400" },
    { id: "quiz", label: "Quiz", icon: Lightbulb, color: "text-amber-400" },
    { id: "timeline", label: "Timeline", icon: Clock, color: "text-blue-400" },
    { id: "tables", label: "Tables", icon: Table2, color: "text-rose-400" },
  ];

  const loadData = async (tab: ToolTab) => {
    setActiveTab(tab);
    setLoading(true);
    try {
      switch (tab) {
        case "summary": {
          const res = await summarizeDocument(docId);
          setSummary(res.summary);
          break;
        }
        case "flashcards": {
          const res = await generateFlashcards(docId);
          setFlashcards(res.flashcards || []);
          setFlashcardIndex(0);
          setShowFlashcardAnswer(false);
          break;
        }
        case "quiz": {
          const res = await generateQuiz(docId);
          setQuizQuestions(res.questions || []);
          setQuizAnswers({});
          break;
        }
        case "timeline": {
          const res = await extractTimeline(docId);
          setTimeline(res.events || []);
          break;
        }
        case "tables": {
          const res = await extractTables(docId);
          setTables(res.tables || []);
          break;
        }
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cyber-glass bg-[#030307]/50 rounded-xl border border-white/5 overflow-hidden">
      <div className="flex items-center gap-3 border-b border-white/5 px-3 py-2.5 overflow-x-auto scrollbar-thin">
        <Sparkles className="h-3.5 w-3.5 text-purple-400 shrink-0" />
        <span className="text-[11px] font-medium text-muted-foreground/60 shrink-0">Study Tools</span>
        <div className="h-3 w-px bg-white/5" />
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => loadData(tab.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] transition-all duration-200 whitespace-nowrap",
                isActive
                  ? "bg-[#7000ff]/10 text-[#00f2fe] font-medium border border-[#7000ff]/20"
                  : "text-muted-foreground/40 hover:text-muted-foreground/70 hover:bg-white/[0.03] border border-transparent",
              )}
            >
              <Icon className={cn("h-3 w-3", isActive ? tab.color : "")} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="p-4 min-h-[160px]">
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-10"
          >
            <div className="flex flex-col items-center gap-2">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              >
                <Sparkles className="h-5 w-5 text-[#00f2fe]/60" />
              </motion.div>
              <span className="text-xs text-muted-foreground/40">Generating...</span>
            </div>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              {activeTab === "summary" && (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {summary ? (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm leading-relaxed text-muted-foreground/80"
                    >
                      {summary}
                    </motion.p>
                  ) : (
                    <p className="text-xs text-muted-foreground/30 text-center py-6">
                      Click <span className="text-[#00f2fe]/60 font-medium">Summary</span> to begin
                    </p>
                  )}
                </div>
              )}

              {activeTab === "flashcards" && (
                <div>
                  {flashcards.length > 0 ? (
                    <div>
                      <motion.div
                        key={flashcardIndex}
                        initial={{ opacity: 0, rotateY: -10 }}
                        animate={{ opacity: 1, rotateY: 0 }}
                        className="cursor-pointer rounded-xl border border-white/10 p-6 min-h-[140px] flex items-center justify-center bg-gradient-to-b from-[#00f2fe]/[0.02] to-transparent hover:border-[#7000ff]/30 transition-all duration-300"
                        onClick={() => setShowFlashcardAnswer(!showFlashcardAnswer)}
                      >
                        <p className="text-sm text-center leading-relaxed">
                          {showFlashcardAnswer
                            ? flashcards[flashcardIndex]?.back
                            : flashcards[flashcardIndex]?.front}
                        </p>
                      </motion.div>
                      <p className="mt-2 text-center text-[10px] text-muted-foreground/30">
                        {showFlashcardAnswer ? "Answer" : "Question"} — Click to flip
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={flashcardIndex === 0}
                          onClick={() => { setFlashcardIndex((i) => i - 1); setShowFlashcardAnswer(false); }}
                          className="text-xs h-7 text-muted-foreground/50"
                        >
                          <ChevronLeft className="h-3 w-3 mr-1" />
                          Prev
                        </Button>
                        <span className="text-[10px] font-mono text-muted-foreground/40">
                          {flashcardIndex + 1} / {flashcards.length}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={flashcardIndex === flashcards.length - 1}
                          onClick={() => { setFlashcardIndex((i) => i + 1); setShowFlashcardAnswer(false); }}
                          className="text-xs h-7 text-muted-foreground/50"
                        >
                          Next
                          <ChevronRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground/30 text-center py-6">
                      Generate flashcards to test your knowledge
                    </p>
                  )}
                </div>
              )}

              {activeTab === "quiz" && (
                <div className="space-y-3">
                  {quizQuestions.length > 0 ? (
                    quizQuestions.map((q, qi) => (
                      <motion.div
                        key={qi}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: qi * 0.05 }}
                        className="rounded-xl border border-white/5 bg-white/[0.01] p-3.5"
                      >
                        <p className="mb-2.5 text-xs font-medium text-foreground/80">
                          {qi + 1}. {q.question}
                        </p>
                        <div className="space-y-1">
                          {(q.options || []).map((opt: string, oi: number) => {
                            const isAnswered = quizAnswers[qi] !== undefined;
                            const isCorrect = q.answer === oi;
                            const isSelected = quizAnswers[qi] === oi;
                            return (
                              <button
                                key={oi}
                                onClick={() => !isAnswered && setQuizAnswers((prev) => ({ ...prev, [qi]: oi }))}
                                className={cn(
                                  "w-full rounded-lg px-3 py-1.5 text-left text-[11px] transition-all duration-200",
                                  isSelected && isCorrect
                                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                                    : isSelected && !isCorrect
                                      ? "bg-red-500/15 text-red-400 border border-red-500/20"
                                      : isAnswered && isCorrect
                                        ? "bg-emerald-500/10 text-emerald-400/60 border border-emerald-500/10"
                                        : "bg-white/[0.02] text-muted-foreground/60 hover:bg-white/[0.04] hover:border-[#7000ff]/20 border border-transparent",
                                )}
                                disabled={isAnswered}
                              >
                                {String.fromCharCode(65 + oi)}. {opt}
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground/30 text-center py-6">
                      Generate a quiz to check understanding
                    </p>
                  )}
                </div>
              )}

              {activeTab === "timeline" && (
                <div className="space-y-3">
                  {timeline.length > 0 ? (
                    <div className="relative pl-5 border-l border-[#00f2fe]/20">
                      {timeline.map((event, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="relative pb-5 last:pb-0"
                        >
                          <div className="absolute -left-[11.5px] top-1 h-3 w-3 rounded-full border-2 border-background bg-[#00f2fe] shadow-[0_0_10px_rgba(0,242,254,0.5)]" />
                          <p className="text-[10px] font-semibold text-[#00f2fe]/80">{event.date}</p>
                          <p className="mt-0.5 text-xs font-medium text-foreground/70">{event.event}</p>
                          {event.description && (
                            <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground/50">{event.description}</p>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground/30 text-center py-6">No timeline data yet</p>
                  )}
                </div>
              )}

              {activeTab === "tables" && (
                <div className="space-y-3">
                  {tables.length > 0 ? (
                    tables.map((table, ti) => (
                      <motion.div
                        key={ti}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="overflow-x-auto rounded-xl border border-white/5 bg-white/[0.01]"
                      >
                        {table.caption && (
                          <p className="border-b border-white/5 px-3 py-1.5 text-[11px] font-medium text-muted-foreground/60">
                            {table.caption}
                          </p>
                        )}
                        <table className="min-w-full text-xs">
                          {table.headers && (
                            <thead>
                              <tr className="bg-white/[0.02]">
                                {table.headers.map((h: string, hi: number) => (
                                  <th key={hi} className="px-3 py-2 text-left font-medium text-muted-foreground/60">{h}</th>
                                ))}
                              </tr>
                            </thead>
                          )}
                          <tbody>
                            {(table.rows || []).map((row: string[], ri: number) => (
                              <tr key={ri} className="border-t border-white/5">
                                {row.map((cell: string, ci: number) => (
                                  <td key={ci} className="px-3 py-2 text-muted-foreground/50">{cell}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </motion.div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground/30 text-center py-6">No tables extracted yet</p>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
