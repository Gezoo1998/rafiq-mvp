"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MasteryMeter } from "@/components/ui/mastery-meter";
import { LevelChip } from "@/components/ui/level-chip";
import { MarkdownView } from "@/components/domain/MarkdownView";
import { triggerCelebrationConfetti } from "@/components/ui/motion";
import { RafiqMascot } from "@/components/ui/mascot";
import {
  ArrowLeft,
  Send,
  HelpCircle,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  CheckCircle2,
  Award,
  Zap,
  Star,
  Trophy,
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
              // Ignore non-json
            }
          }
        }
      }

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
        <RafiqMascot size="lg" expression="waving" />
        <p className="text-base font-black text-neutral-900">Rafiq is getting your quest ready! 🚀</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] max-w-[780px] mx-auto">
      {/* Top Session Navigation */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between pb-3 border-b-2 border-amber-200 shrink-0"
      >
        <div className="flex items-center gap-3 min-w-0">
          <Button asChild variant="ghost" size="sm" className="p-2 h-10 w-10 rounded-2xl bg-amber-100 hover:bg-amber-200 border border-amber-300">
            <Link href="/missions" aria-label="Back to missions">
              <ArrowLeft className="h-4 w-4 text-neutral-900" />
            </Link>
          </Button>
          <div className="min-w-0">
            <h2 className="text-base font-black text-neutral-900 truncate">
              {mission?.title || "Tutoring Session"}
            </h2>
            <div className="flex items-center gap-2 text-xs font-black text-amber-700">
              <span className="uppercase">{mission?.subject}</span>
              <span>•</span>
              <span>Grade {mission?.grade}</span>
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse ml-1" />
              <span className="text-emerald-700">Live Socratic Quest</span>
            </div>
          </div>
        </div>

        {!isCompleted && (
          <button
            onClick={handleFinishSession}
            disabled={evaluating}
            className="text-xs font-black px-4 py-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 border-b-4 border-emerald-700 text-white active:border-b-0 active:translate-y-1 shadow-md flex items-center gap-1.5 transition-all"
          >
            <CheckCircle className="h-4 w-4" />
            <span>Finish & Grade 🏆</span>
          </button>
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
            <RafiqMascot size="xl" expression="celebrating" className="mx-auto" />
            <div>
              <h3 className="text-2xl font-black text-neutral-900">Rafiq is checking your breakthrough! ⭐</h3>
              <p className="text-sm font-bold text-neutral-600 mt-1 max-w-sm mx-auto">
                Analyzing your steps, clues used, and awarding your Star Mastery badge!
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
            <div className="rounded-3xl bg-amber-400 text-neutral-950 p-6 sm:p-7 shadow-2xl border-4 border-amber-500 space-y-5 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative">
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 rounded-2xl bg-white border-2 border-neutral-900 text-neutral-950 flex items-center justify-center shadow-md">
                    <Trophy className="h-7 w-7 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black">Quest Completed! 🎉</h3>
                    <p className="text-xs font-bold text-neutral-800">
                      Mastery Assessment for {mission?.title}
                    </p>
                  </div>
                </div>

                <LevelChip level={evaluation.level} size="md" />
              </div>

              <div className="p-4 bg-white/90 rounded-2xl border-2 border-amber-300">
                <MasteryMeter level={evaluation.level} showChip={false} />
              </div>

              {evaluation.studentSummary && (
                <p className="text-xs sm:text-sm text-neutral-900 font-bold leading-relaxed bg-white/80 p-4 rounded-2xl border border-amber-300">
                  {evaluation.studentSummary}
                </p>
              )}

              {evaluation.strengths?.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-black uppercase tracking-wider text-neutral-900 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                    <span>Your Superpowers Observed:</span>
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {evaluation.strengths.map((str: string, i: number) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 rounded-full text-xs font-black bg-white text-emerald-800 border-2 border-emerald-300 shadow-2xs"
                      >
                        ✓ {str}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {evaluation.nextStep && (
                <div className="p-3.5 bg-white/90 rounded-2xl border-2 border-amber-300 text-xs text-neutral-900 flex items-start gap-2.5 font-bold">
                  <Lightbulb className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-amber-800">Next Clue to Practice: </strong>
                    <span>{evaluation.nextStep}</span>
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  onClick={() => triggerCelebrationConfetti()}
                  className="px-5 py-2.5 rounded-2xl font-black bg-white text-neutral-950 border-b-4 border-neutral-300 hover:bg-neutral-50 active:border-b-0 active:translate-y-1 shadow-md flex items-center gap-2"
                >
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <span>Confetti Blast! 🎉</span>
                </button>
                <Button asChild variant="fun-blue" size="md">
                  <Link href="/missions">Back to My Missions 🚀</Link>
                </Button>
              </div>
            </div>

            <div className="text-center">
              <span className="text-xs text-neutral-500 uppercase font-black tracking-wider">
                Full Quest Transcript Below 👇
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
          className="my-2 p-3.5 rounded-2xl bg-rose-50 border-2 border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2 shrink-0"
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
                    <RafiqMascot size="sm" expression="waving" className="shrink-0 mt-0.5" />
                  )}

                  <div
                    className={`max-w-[85%] rounded-3xl px-5 py-3.5 text-sm md:text-base leading-relaxed ${
                      isUser
                        ? "bg-sky-500 text-white rounded-tr-xs shadow-md border-b-4 border-sky-700 font-bold"
                        : "bg-white border-2 border-amber-200 text-neutral-900 rounded-tl-xs shadow-sm font-medium"
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
              <RafiqMascot size="sm" expression="thinking" className="shrink-0 mt-0.5" />
              <div className="max-w-[85%] rounded-3xl px-5 py-3.5 text-sm md:text-base bg-white border-2 border-amber-200 text-neutral-900 rounded-tl-xs shadow-sm font-medium">
                <MarkdownView content={streamBuffer} />
              </div>
            </motion.div>
          )}

          {/* Typing Indicator */}
          {isStreaming && !streamBuffer && (
            <div className="flex gap-3 justify-start">
              <RafiqMascot size="sm" expression="thinking" className="shrink-0" />
              <div className="bg-white border-2 border-amber-200 rounded-3xl px-5 py-3.5 flex items-center gap-2 shadow-xs">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-bounce" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-bounce [animation-delay:0.2s]" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Composer Section (pinned bottom) */}
      {!isCompleted && !evaluating && (
        <div className="pt-3 border-t-2 border-amber-200 space-y-2.5 shrink-0 bg-[#FFFDF7]/90 backdrop-blur-md">
          {/* Quick Action Suggestion Chips (Chunky Buttons) */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleSendMessage("I'm stuck, can you give me a hint?")}
              disabled={isStreaming}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-black bg-amber-300 hover:bg-amber-200 text-amber-950 border-b-2 border-amber-500 active:border-b-0 active:translate-y-0.5 transition-all disabled:opacity-50 shadow-2xs"
            >
              <Lightbulb className="h-3.5 w-3.5 text-amber-800" />
              <span>💡 I&apos;m stuck (Give clue)</span>
            </button>

            <button
              type="button"
              onClick={() => handleSendMessage("Can you give me a simpler example?")}
              disabled={isStreaming}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-black bg-sky-200 hover:bg-sky-100 text-sky-950 border-b-2 border-sky-400 active:border-b-0 active:translate-y-0.5 transition-all disabled:opacity-50 shadow-2xs"
            >
              <Zap className="h-3.5 w-3.5 text-sky-700" />
              <span>✨ Simpler example</span>
            </button>

            <button
              type="button"
              onClick={() => handleSendMessage("Did I solve this correctly?")}
              disabled={isStreaming}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-black bg-emerald-200 hover:bg-emerald-100 text-emerald-950 border-b-2 border-emerald-400 active:border-b-0 active:translate-y-0.5 transition-all disabled:opacity-50 shadow-2xs"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
              <span>🏆 Check my answer</span>
            </button>
          </div>

          <div className="relative flex items-end gap-2 bg-white rounded-3xl border-2 border-amber-300 p-3 shadow-md focus-within:ring-4 focus-within:ring-amber-400/25 transition-all">
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputText}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={isStreaming}
              placeholder="Type your answer, or explain your thinking to Rafiq..."
              dir="auto"
              className="flex-1 max-h-32 resize-none bg-transparent px-2 py-1.5 text-sm md:text-base text-neutral-900 font-bold placeholder:text-neutral-400 focus:outline-none"
            />
            <button
              type="button"
              disabled={!inputText.trim() || isStreaming}
              onClick={() => handleSendMessage()}
              className="h-11 w-11 shrink-0 rounded-2xl bg-amber-400 hover:bg-amber-300 border-b-4 border-amber-600 active:border-b-0 active:translate-y-1 text-neutral-900 flex items-center justify-center transition-all disabled:opacity-50"
              aria-label="Send answer"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>

          <p className="text-center text-xs font-bold text-amber-700/80">
            Rafiq guides you step-by-step with clues • You discover the answers! ⭐
          </p>
        </div>
      )}
    </div>
  );
}
