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

  const tabs: { id: ToolTab; label: string; icon: LucideIcon }[] = [
    { id: "summary", label: "Summary", icon: FileText },
    { id: "flashcards", label: "Flashcards", icon: Brain },
    { id: "quiz", label: "Quiz", icon: Lightbulb },
    { id: "timeline", label: "Timeline", icon: Clock },
    { id: "tables", label: "Tables", icon: Table2 },
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
    <div className="rounded-xl border bg-card">
      <div className="flex items-center gap-1 border-b px-3 py-2 overflow-x-auto scrollbar-thin">
        <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="mr-2 text-[11px] font-medium text-muted-foreground">Study Tools</span>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => loadData(tab.id)}
              className={cn(
                "flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] transition-colors whitespace-nowrap",
                activeTab === tab.id
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground/60 hover:text-foreground hover:bg-accent/50",
              )}
            >
              <Icon className="h-3 w-3" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="p-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 animate-pulse text-primary" />
              <span className="text-xs text-muted-foreground">Generating...</span>
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              {activeTab === "summary" && (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {summary ? (
                    <p className="text-sm leading-relaxed text-muted-foreground">{summary}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground/40 text-center py-4">
                      Click &quot;Summary&quot; to generate
                    </p>
                  )}
                </div>
              )}

              {activeTab === "flashcards" && (
                <div>
                  {flashcards.length > 0 ? (
                    <div>
                      <div
                        className="cursor-pointer rounded-xl border p-4 min-h-[120px] flex items-center justify-center"
                        onClick={() => setShowFlashcardAnswer(!showFlashcardAnswer)}
                      >
                        <p className="text-sm text-center">
                          {showFlashcardAnswer
                            ? flashcards[flashcardIndex]?.back
                            : flashcards[flashcardIndex]?.front}
                        </p>
                      </div>
                      <p className="mt-2 text-center text-[10px] text-muted-foreground/40">
                        {showFlashcardAnswer ? "Answer" : "Question"} — Click to flip
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={flashcardIndex === 0}
                          onClick={() => { setFlashcardIndex((i) => i - 1); setShowFlashcardAnswer(false); }}
                          className="text-xs h-7"
                        >
                          ← Prev
                        </Button>
                        <span className="text-[10px] text-muted-foreground/60">
                          {flashcardIndex + 1} / {flashcards.length}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={flashcardIndex === flashcards.length - 1}
                          onClick={() => { setFlashcardIndex((i) => i + 1); setShowFlashcardAnswer(false); }}
                          className="text-xs h-7"
                        >
                          Next →
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground/40 text-center py-4">Click &quot;Flashcards&quot; to generate</p>
                  )}
                </div>
              )}

              {activeTab === "quiz" && (
                <div className="space-y-4">
                  {quizQuestions.length > 0 ? (
                    quizQuestions.map((q, qi) => (
                      <div key={qi} className="rounded-lg border p-3">
                        <p className="mb-2 text-xs font-medium">{qi + 1}. {q.question}</p>
                        <div className="space-y-1">
                          {(q.options || []).map((opt: string, oi: number) => (
                            <button
                              key={oi}
                              onClick={() => setQuizAnswers((prev) => ({ ...prev, [qi]: oi }))}
                              className={cn(
                                "w-full rounded-md px-3 py-1.5 text-left text-[11px] transition-colors",
                                quizAnswers[qi] === oi && q.answer === oi
                                  ? "bg-emerald-500/20 text-emerald-600"
                                  : quizAnswers[qi] === oi && q.answer !== oi
                                    ? "bg-red-500/20 text-red-600"
                                    : "bg-muted/30 hover:bg-accent/50 text-muted-foreground",
                              )}
                            >
                              {String.fromCharCode(65 + oi)}. {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground/40 text-center py-4">Click &quot;Quiz&quot; to generate</p>
                  )}
                </div>
              )}

              {activeTab === "timeline" && (
                <div className="space-y-3">
                  {timeline.length > 0 ? (
                    <div className="relative pl-4 border-l-2 border-muted/30">
                      {timeline.map((event, i) => (
                        <div key={i} className="relative pb-4 last:pb-0">
                          <div className="absolute -left-[9.5px] top-1 h-3.5 w-3.5 rounded-full border-2 border-background bg-primary" />
                          <p className="text-[10px] font-medium text-primary">{event.date}</p>
                          <p className="mt-0.5 text-xs font-medium">{event.event}</p>
                          {event.description && (
                            <p className="mt-0.5 text-[11px] text-muted-foreground">{event.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground/40 text-center py-4">Click &quot;Timeline&quot; to extract</p>
                  )}
                </div>
              )}

              {activeTab === "tables" && (
                <div className="space-y-4">
                  {tables.length > 0 ? (
                    tables.map((table, ti) => (
                      <div key={ti} className="overflow-x-auto rounded-lg border">
                        {table.caption && (
                          <p className="border-b px-3 py-1.5 text-[11px] font-medium text-muted-foreground">
                            {table.caption}
                          </p>
                        )}
                        <table className="min-w-full text-xs">
                          {table.headers && (
                            <thead>
                              <tr className="bg-muted/30">
                                {table.headers.map((h: string, hi: number) => (
                                  <th key={hi} className="px-3 py-2 text-left font-medium text-muted-foreground">{h}</th>
                                ))}
                              </tr>
                            </thead>
                          )}
                          <tbody>
                            {(table.rows || []).map((row: string[], ri: number) => (
                              <tr key={ri} className="border-t border-muted/20">
                                {row.map((cell: string, ci: number) => (
                                  <td key={ci} className="px-3 py-2 text-muted-foreground">{cell}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground/40 text-center py-4">Click &quot;Tables&quot; to extract</p>
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
