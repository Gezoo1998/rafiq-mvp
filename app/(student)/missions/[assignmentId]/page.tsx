"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MasteryMeter } from "@/components/ui/mastery-meter";
import { LevelChip, MasteryLevel } from "@/components/ui/level-chip";
import { MarkdownView } from "@/components/domain/MarkdownView";
import { triggerCelebrationConfetti } from "@/components/ui/motion";
import {
  ArrowLeft,
  Send,
  HelpCircle,
  Sparkles,
  MessageSquare,
  CheckCircle,
  Loader2,
  AlertCircle,
  Lightbulb,
  CheckCircle2,
  Award,
  Zap,
  RotateCcw,
} from "lucide-react";

interface MessageItem {
  id: number;
  role: "user" | "assistant" | "system";
  content: string;
}

export default function StudentSessionPage() {
  const params = useParams();
  const router = useRouter();
  const assignmentId = params.assignmentId as string;

  const [loading, setLoading] = React.useState(true);
  const [mission, setMission] = React.useState<any>(null);
  const [session, setSession] = React.useState<any>(null);
  const [messages, setMessages] = React.useState<MessageItem[]>([]);
  const [inputText, setInputText] = React.useState("");
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [streamBuffer, setStreamBuffer] = React.useState("");
  const [evaluating, setEvaluating] = React.useState(false);
  const [evaluation, setEvaluation] = React.useState<any>(null);
  const [isCompleted, setIsCompleted] = React.useState(false);
  const [errorBanner, setErrorBanner] = React.useState<string | null>(null);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, streamBuffer]);

  // Initial load: start or resume session
  React.useEffect(() => {
    async function initSession() {
      try {
        setLoading(true);
        const res = await fetch(`/api/student/missions/${assignmentId}/start`, {
          method: "POST",
        });

        const data = await res.json();
        if (!res.ok) {
          setErrorBanner(data.error?.message || "Failed to load mission");
          return;
        }

        setMission(data.mission);
        setSession(data.session);
        setMessages(data.messages || []);

        // Check if already completed
        if (data.session.status === "finished") {
          setIsCompleted(true);
          // fetch evaluation
          const evalRes = await fetch(`/api/student/missions/${assignmentId}`);
          const evalData = await evalRes.json();
          if (evalData.evaluation) {
            setEvaluation(evalData.evaluation);
          }
        }
      } catch {
        setErrorBanner("Failed to connect to the tutoring service.");
      } finally {
        setLoading(false);
      }
    }

    if (assignmentId) initSession();
  }, [assignmentId]);

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 128)}px`;
    }
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputText.trim();
    if (!textToSend || isStreaming || !session?.id) return;

    if (!customText) {
      setInputText("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";
    }

    setErrorBanner(null);

    // Optimistically add student message
    const tempStudentMsg: MessageItem = {
      id: Date.now(),
      role: "user",
      content: textToSend,
    };
    setMessages((prev) => [...prev, tempStudentMsg]);
    setIsStreaming(true);
    setStreamBuffer("");

    try {
      const response = await fetch(`/api/sessions/${session.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: textToSend }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        setErrorBanner(errData.error?.message || "Failed to send message");
        setIsStreaming(false);
        return;
      }

      // Read SSE stream
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No readable stream received");
      }

      const decoder = new TextDecoder("utf-8");
      let fullAssistantReply = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith("data: ")) {
            const jsonStr = trimmed.slice(6);
            if (jsonStr === "[DONE]") continue;

            try {
              const parsed = JSON.parse(jsonStr);
              if (parsed.content) {
                fullAssistantReply += parsed.content;
                setStreamBuffer(fullAssistantReply);
              }
            } catch {
              // Ignore non-json lines
            }
          }
        }
      }

      // Append assistant message to list and clear buffer
      if (fullAssistantReply) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            role: "assistant",
            content: fullAssistantReply,
          },
        ]);
      }
    } catch {
      setErrorBanner("Lost connection while streaming reply. Please try again.");
    } finally {
      setIsStreaming(false);
      setStreamBuffer("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFinishSession = async () => {
    if (!session?.id || evaluating) return;

    setEvaluating(true);
    setErrorBanner(null);

    try {
      const res = await fetch(`/api/sessions/${session.id}/finish`, {
        method: "POST",
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorBanner(data.error?.message || "Failed to finalize evaluation");
        setEvaluating(false);
        return;
      }

      setEvaluation(data.evaluation);
      setIsCompleted(true);
      // Trigger festive celebration confetti
      triggerCelebrationConfetti();
    } catch {
      setErrorBanner("Failed to connect for evaluation. Please tap Retry.");
    } finally {
      setEvaluating(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center space-y-4">
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="h-16 w-16 rounded-3xl bg-gradient-to-br from-indigo-600 via-primary-600 to-purple-600 text-white flex items-center justify-center shadow-xl shadow-indigo-500/30"
        >
          <Sparkles className="h-8 w-8 animate-spin" />
        </motion.div>
        <p className="text-sm font-bold text-navy-900">Connecting to Rafiq Socratic Tutor...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] max-w-[760px] mx-auto">
      {/* Top Session Navigation */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between pb-3.5 border-b border-neutral-200/80 shrink-0"
      >
        <div className="flex items-center gap-3 min-w-0">
          <Button asChild variant="ghost" size="sm" className="p-2 h-9 w-9 rounded-xl hover:bg-neutral-100">
            <Link href="/missions" aria-label="Back to missions">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="min-w-0">
            <h2 className="text-base font-black text-navy-900 truncate">
              {mission?.title || "Tutoring Session"}
            </h2>
            <div className="flex items-center gap-2 text-2xs font-bold text-neutral-500">
              <span className="uppercase text-primary-600">{mission?.subject}</span>
              <span>•</span>
              <span>Grade {mission?.grade}</span>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse ml-1" />
              <span className="text-emerald-600 font-semibold">Live Socratic Session</span>
            </div>
          </div>
        </div>

        {!isCompleted && (
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
            <Button
              variant="primary"
              size="sm"
              onClick={handleFinishSession}
              isLoading={evaluating}
              className="text-xs font-bold shadow-md shadow-emerald-500/20 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl"
            >
              <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
              <span>Finish & Grade</span>
            </Button>
          </motion.div>
        )}
      </motion.div>

      {/* Evaluating overlay state */}
      <AnimatePresence>
        {evaluating && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="my-auto py-12 text-center space-y-4"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="h-20 w-20 rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center mx-auto shadow-2xl shadow-indigo-500/35"
            >
              <Award className="h-10 w-10" />
            </motion.div>
            <div>
              <h3 className="text-xl font-black text-navy-900">Rafiq is evaluating your session...</h3>
              <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                Analyzing your Socratic reasoning steps, misconceptions resolved, and calculating your mastery tier!
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Evaluation Results Card (If session completed) */}
      <AnimatePresence>
        {isCompleted && evaluation && !evaluating && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", damping: 20, stiffness: 260 }}
            className="my-4 space-y-4"
          >
            <div className="rounded-3xl bg-gradient-to-br from-navy-950 via-indigo-950 to-neutral-900 text-white p-6 sm:p-7 shadow-2xl border border-indigo-900/60 space-y-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative">
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30">
                    <Award className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">Mission Evaluation Complete!</h3>
                    <p className="text-xs text-indigo-200">
                      Pedagogical Mastery Assessment for {mission?.title}
                    </p>
                  </div>
                </div>

                <LevelChip level={evaluation.level} size="md" />
              </div>

              <div className="p-4 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-md">
                <MasteryMeter level={evaluation.level} showChip={false} />
              </div>

              {evaluation.studentSummary && (
                <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/5">
                  {evaluation.studentSummary}
                </p>
              )}

              {evaluation.strengths?.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Key Strengths Observed:</span>
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {evaluation.strengths.map((str: string, i: number) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-xs"
                      >
                        ✓ {str}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {evaluation.nextStep && (
                <div className="p-3.5 bg-amber-500/15 rounded-2xl border border-amber-500/30 text-xs text-amber-200 flex items-start gap-2.5">
                  <Lightbulb className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-amber-300">Next Step: </strong>
                    <span>{evaluation.nextStep}</span>
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center justify-center gap-3">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => triggerCelebrationConfetti()}
                  className="font-bold bg-gradient-to-r from-amber-400 to-orange-500 text-navy-950 hover:brightness-110 rounded-xl gap-2 shadow-lg"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Celebrate 🎉</span>
                </Button>
                <Button asChild variant="secondary" size="md" className="font-bold bg-white text-navy-950 hover:bg-neutral-100 rounded-xl">
                  <Link href="/missions">Back to My Missions</Link>
                </Button>
              </div>
            </div>

            <div className="text-center">
              <span className="text-xs text-neutral-400 uppercase font-black tracking-wider">
                Session Transcript Below
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Banner */}
      {errorBanner && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="my-2 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2 shrink-0"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{errorBanner}</span>
        </motion.div>
      )}

      {/* Messages Scroll Area */}
      {!evaluating && (
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          <AnimatePresence initial={false}>
            {messages.map((m) => {
              const isUser = m.role === "user";
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", damping: 24, stiffness: 300 }}
                  className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
                >
                  {!isUser && (
                    <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-indigo-600 via-primary-600 to-purple-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-md shadow-indigo-500/20">
                      <Sparkles className="h-4 w-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-3xl px-5 py-3.5 text-sm md:text-base leading-relaxed ${
                      isUser
                        ? "bg-gradient-to-r from-indigo-600 to-primary-600 text-white rounded-tr-xs shadow-md shadow-indigo-500/15 font-medium"
                        : "bg-white border border-neutral-200/90 text-navy-900 rounded-tl-xs shadow-sm"
                    }`}
                  >
                    <MarkdownView content={m.content} />
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Active Streaming Chunk Bubble */}
          {isStreaming && streamBuffer && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 justify-start"
            >
              <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-indigo-600 via-primary-600 to-purple-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-md shadow-indigo-500/20 animate-pulse">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="max-w-[85%] rounded-3xl px-5 py-3.5 text-sm md:text-base bg-white border border-neutral-200/90 text-navy-900 rounded-tl-xs shadow-sm">
                <MarkdownView content={streamBuffer} />
              </div>
            </motion.div>
          )}

          {/* Typing Indicator */}
          {isStreaming && !streamBuffer && (
            <div className="flex gap-3 justify-start">
              <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-indigo-600 via-primary-600 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/20">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="bg-white border border-neutral-200 rounded-3xl px-5 py-3.5 flex items-center gap-2 shadow-xs">
                <span className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce" />
                <span className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]" />
                <span className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Composer Section (pinned bottom) */}
      {!isCompleted && !evaluating && (
        <div className="pt-3 border-t border-neutral-200/80 space-y-2.5 shrink-0 bg-neutral-50/80 backdrop-blur-md">
          {/* Quick Action Suggestion Chips */}
          <div className="flex flex-wrap items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={() => handleSendMessage("I'm stuck, can you give me a hint?")}
              disabled={isStreaming}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 border border-amber-300/60 transition-all disabled:opacity-50 shadow-2xs"
            >
              <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
              <span>I&apos;m stuck (Hint)</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={() => handleSendMessage("Can you give me a simpler example?")}
              disabled={isStreaming}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-800 border border-indigo-200 transition-all disabled:opacity-50 shadow-2xs"
            >
              <Zap className="h-3.5 w-3.5 text-indigo-500" />
              <span>Simpler example</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={() => handleSendMessage("Did I solve this correctly?")}
              disabled={isStreaming}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-800 border border-emerald-200 transition-all disabled:opacity-50 shadow-2xs"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span>Check my answer</span>
            </motion.button>
          </div>

          <div className="relative flex items-end gap-2 bg-white rounded-2xl border border-neutral-300 p-2.5 shadow-sm focus-within:ring-2 focus-within:ring-primary-500/40 focus-within:border-primary-500 transition-all">
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputText}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={isStreaming}
              placeholder="Type your answer, ask a question, or explain your thinking..."
              dir="auto"
              className="flex-1 max-h-32 resize-none bg-transparent px-2 py-1.5 text-sm md:text-base text-navy-900 placeholder:text-neutral-400 focus:outline-none"
            />
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                type="button"
                variant="primary"
                size="icon"
                disabled={!inputText.trim() || isStreaming}
                onClick={() => handleSendMessage()}
                className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-indigo-600 to-primary-600 shadow-md shadow-primary-500/25 transition-all"
                aria-label="Send answer"
              >
                <Send className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>

          <p className="text-center text-[11px] text-neutral-400">
            Rafiq Socratic Tutor guides step-by-step without giving answers away.
          </p>
        </div>
      )}
    </div>
  );
}
