"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MasteryMeter } from "@/components/ui/mastery-meter";
import { LevelChip, MasteryLevel } from "@/components/ui/level-chip";
import { MarkdownView } from "@/components/domain/MarkdownView";
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
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isStreaming || !session?.id) return;

    setInputText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    setErrorBanner(null);

    // Optimistically add user message
    const tempUserMsg: MessageItem = {
      id: Date.now(),
      role: "user",
      content: text,
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setIsStreaming(true);
    setStreamBuffer("");

    try {
      const response = await fetch(`/api/sessions/${session.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });

      if (!response.ok) {
        const errorJson = await response.json();
        setErrorBanner(errorJson.error?.message || "Failed to get a response from Rafiq.");
        setIsStreaming(false);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");

      const decoder = new TextDecoder();
      let accumulated = "";
      let sessionFinished = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("event: delta")) {
            // Next line will be data
          } else if (line.startsWith("event: done")) {
            // Done event
          } else if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.text) {
                accumulated += data.text;
                setStreamBuffer(accumulated);
              }
              if (data.sessionComplete) {
                sessionFinished = true;
              }
            } catch {
              // ignore parse errors on partial chunks
            }
          }
        }
      }

      // Append assistant message once streaming completes
      const cleaned = accumulated
        .replace(/\[\[SESSION_COMPLETE\]\]/g, "")
        .replace(/\[\[SAFETY_FLAG\]\]/g, "")
        .trim();

      const assistantMsg: MessageItem = {
        id: Date.now() + 1,
        role: "assistant",
        content: cleaned,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setStreamBuffer("");
      setIsStreaming(false);

      if (sessionFinished) {
        // Automatically trigger evaluation if AI signalled session completion
        handleFinishSession();
      }
    } catch (err: any) {
      console.error(err);
      setErrorBanner("Network interrupted. Your message was saved; try sending again.");
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // "I'm stuck" quick hint action
  const handleStuck = () => {
    handleSendMessage("I'm stuck, can you give me a hint?");
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
    } catch {
      setErrorBanner("Failed to connect for evaluation. Please tap Retry.");
    } finally {
      setEvaluating(false);
    }
  };

  const hasStudentSentMessage = messages.some((m) => m.role === "user");

  if (loading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        <p className="text-sm text-neutral-600 font-medium">Connecting to Rafiq...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] max-w-[720px] mx-auto">
      {/* Top Session Navigation */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-200 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Button asChild variant="ghost" size="sm" className="p-1 h-8 w-8">
            <Link href="/missions" aria-label="Back to missions">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="min-w-0">
            <h2 className="text-base font-bold text-navy-900 truncate">
              {mission?.title || "Tutoring Session"}
            </h2>
            <p className="text-2xs text-neutral-500 capitalize">
              {mission?.subject} • Grade {mission?.grade}
            </p>
          </div>
        </div>

        {!isCompleted && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleFinishSession}
            isLoading={evaluating}
            className="text-xs font-semibold"
          >
            Finish & Review
          </Button>
        )}
      </div>

      {/* Evaluating overlay state */}
      {evaluating && (
        <div className="my-auto py-12 text-center space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-primary-100 text-primary-700 flex items-center justify-center mx-auto animate-pulse">
            <Sparkles className="h-7 w-7 animate-spin" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-navy-900">Rafiq is reviewing your session...</h3>
            <p className="text-xs text-neutral-600 mt-1">
              Analyzing your understanding and preparing your progress summary!
            </p>
          </div>
        </div>
      )}

      {/* Evaluation Summary Card (when completed) */}
      {!evaluating && isCompleted && evaluation && (
        <div className="py-4 space-y-4">
          <Card className="border-primary-200 bg-gradient-to-b from-surface to-primary-50/20 shadow-sm">
            <CardHeader className="text-center pb-2">
              <div className="h-10 w-10 rounded-full bg-semantic-success-bg text-semantic-success flex items-center justify-center mx-auto mb-1">
                <CheckCircle className="h-5 w-5" />
              </div>
              <CardTitle className="text-xl font-extrabold text-navy-900">
                Mission Complete!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <MasteryMeter level={evaluation.level as MasteryLevel} />

              <div className="p-3.5 bg-surface rounded-lg border border-neutral-200 space-y-2 text-xs leading-relaxed text-neutral-800">
                <p className="font-medium">{evaluation.studentSummary}</p>
              </div>

              {evaluation.strengths?.length > 0 && (
                <div className="space-y-1.5 text-xs">
                  <span className="font-bold text-navy-900 uppercase tracking-wider text-2xs">
                    What You Did Great:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {evaluation.strengths.map((str: string, i: number) => (
                      <span
                        key={i}
                        className="bg-semantic-success-bg text-semantic-success px-2.5 py-1 rounded-md font-medium text-xs border border-green-200"
                      >
                        ✓ {str}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {evaluation.nextStep && (
                <div className="p-3 bg-accent-100/60 rounded-lg border border-amber-200 text-xs text-amber-950 flex items-start gap-2">
                  <Lightbulb className="h-4 w-4 text-accent-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Next Step: </span>
                    <span>{evaluation.nextStep}</span>
                  </div>
                </div>
              )}

              <div className="pt-2 text-center">
                <Button asChild variant="primary" size="md">
                  <Link href="/missions">Back to My Missions</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <span className="text-xs text-neutral-500 uppercase font-semibold">Transcript History Below</span>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {errorBanner && (
        <div className="my-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2 shrink-0">
          <AlertCircle className="h-4 w-4 shrink-0 text-semantic-danger" />
          <span>{errorBanner}</span>
        </div>
      )}

      {/* Messages Scroll Area */}
      {!evaluating && (
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {messages.map((m) => {
            const isUser = m.role === "user";
            return (
              <div
                key={m.id}
                className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}
              >
                {!isUser && (
                  <div className="h-8 w-8 rounded-full bg-primary-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm md:text-base ${
                    isUser
                      ? "bg-primary-600 text-white rounded-tr-xs"
                      : "bg-surface border border-neutral-200 text-neutral-900 rounded-tl-xs shadow-2xs"
                  }`}
                >
                  <MarkdownView content={m.content} />
                </div>
              </div>
            );
          })}

          {/* Active Streaming Chunk Bubble */}
          {isStreaming && streamBuffer && (
            <div className="flex gap-2.5 justify-start">
              <div className="h-8 w-8 rounded-full bg-primary-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs animate-pulse">
                <MessageSquare className="h-4 w-4" />
              </div>
              <div className="max-w-[85%] rounded-2xl px-4 py-3 text-sm md:text-base bg-surface border border-neutral-200 text-neutral-900 rounded-tl-xs shadow-2xs">
                <MarkdownView content={streamBuffer} />
              </div>
            </div>
          )}

          {/* Typing Indicator while waiting for initial tokens */}
          {isStreaming && !streamBuffer && (
            <div className="flex gap-2.5 justify-start">
              <div className="h-8 w-8 rounded-full bg-primary-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <MessageSquare className="h-4 w-4" />
              </div>
              <div className="bg-surface border border-neutral-200 rounded-2xl px-4 py-3 flex items-center gap-1.5 shadow-2xs">
                <span className="h-2 w-2 rounded-full bg-primary-500 animate-bounce" />
                <span className="h-2 w-2 rounded-full bg-primary-500 animate-bounce [animation-delay:0.2s]" />
                <span className="h-2 w-2 rounded-full bg-primary-500 animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Composer Section (pinned bottom) */}
      {!isCompleted && !evaluating && (
        <div className="pt-2 border-t border-neutral-200 space-y-2 shrink-0 bg-neutral-50">
          <div className="flex items-center justify-between">
            {hasStudentSentMessage ? (
              <button
                type="button"
                onClick={handleStuck}
                disabled={isStreaming}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary-100 text-primary-800 hover:bg-primary-200/80 transition-colors disabled:opacity-50"
              >
                <HelpCircle className="h-3.5 w-3.5" />
                <span>I'm stuck</span>
              </button>
            ) : <div />}

            {inputText.length >= 800 && (
              <span className={`text-2xs font-mono ${inputText.length > 950 ? "text-semantic-danger font-bold" : "text-neutral-500"}`}>
                {inputText.length} / 1000
              </span>
            )}
          </div>

          <div className="relative flex items-end gap-2 bg-surface rounded-xl border border-neutral-300 p-2 shadow-2xs focus-within:ring-2 focus-within:ring-primary-300 focus-within:border-primary-600">
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputText}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={isStreaming}
              placeholder="Type your answer or question here..."
              dir="auto"
              className="flex-1 max-h-32 resize-none bg-transparent px-2 py-1.5 text-sm md:text-base text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
            />
            <Button
              type="button"
              variant="primary"
              size="icon"
              disabled={!inputText.trim() || isStreaming}
              onClick={() => handleSendMessage()}
              className="h-9 w-9 shrink-0 rounded-lg"
              aria-label="Send answer"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-center text-3xs sm:text-2xs text-neutral-600">
            AI can make mistakes. Check important facts and tell your teacher if unsure.
          </p>
        </div>
      )}
    </div>
  );
}
