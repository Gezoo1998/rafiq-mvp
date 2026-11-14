"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, CheckCircle, AlertCircle, Clock, Cpu, Sparkles, Terminal, Copy, Check } from "lucide-react";

export default function AiTestPage() {
  const [testing, setTesting] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [testResult, setTestResult] = React.useState<{
    success: boolean;
    provider?: string;
    model?: string;
    latencyMs?: number;
    response?: string;
    error?: string;
  } | null>(null);

  const runTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/system/ai/test", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setTestResult(data);
      } else {
        setTestResult({
          success: false,
          error: data.error?.message || "AI test request failed",
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        error: err.message || "Failed to reach server",
      });
    } finally {
      setTesting(false);
    }
  };

  const handleCopy = () => {
    if (testResult?.response) {
      navigator.clipboard.writeText(testResult.response);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="h-8 w-1 rounded-full bg-gradient-to-b from-primary-500 to-indigo-700" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
            AI Provider Diagnostics & Health
          </h1>
        </div>
        <p className="text-sm text-neutral-500 ml-3">
          Perform live probe pings, measure round-trip inference latency, and verify streaming model responsiveness
        </p>
      </div>

      <Card className="rounded-3xl border border-neutral-200/80 shadow-sm bg-white overflow-hidden">
        <div className="h-2 w-full bg-gradient-to-r from-indigo-500 via-primary-600 to-emerald-500" />
        <CardHeader className="p-6 sm:p-8 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
                <Cpu className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-navy-900">
                  Live Socratic Inference Probe
                </CardTitle>
                <CardDescription className="text-xs text-neutral-500 mt-0.5">
                  Sends an end-to-end ping to Groq / LLM backend to verify credentials and response formatting
                </CardDescription>
              </div>
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={runTest}
              isLoading={testing}
              className="gap-2 rounded-xl text-xs font-bold shadow-md shadow-primary-500/20 h-11 px-6 shrink-0"
            >
              <Activity className="h-4 w-4" />
              <span>{testing ? "Testing..." : "Execute Test Ping"}</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 sm:p-8 pt-2 space-y-6">
          {!testResult && !testing && (
            <div className="p-8 rounded-2xl border border-dashed border-neutral-300 text-center bg-neutral-50/50 space-y-2">
              <Sparkles className="h-8 w-8 text-neutral-300 mx-auto" />
              <p className="text-sm font-bold text-navy-900">Ready to test AI connectivity</p>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Click &quot;Execute Test Ping&quot; to measure token throughput and provider response latency.
              </p>
            </div>
          )}

          {testing && (
            <div className="p-10 rounded-2xl bg-neutral-50 border border-neutral-200 text-center space-y-3">
              <Clock className="h-8 w-8 text-primary-600 animate-spin mx-auto" />
              <p className="text-sm font-bold text-navy-900">Pinging AI Inference Provider...</p>
              <p className="text-xs text-neutral-400">Waiting for model first-token streaming acknowledgement</p>
            </div>
          )}

          {testResult && (
            <div className="space-y-5 pt-2">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-neutral-50 border border-neutral-200">
                <div className="flex items-center gap-3">
                  {testResult.success ? (
                    <div className="h-9 w-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                  ) : (
                    <div className="h-9 w-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                      <AlertCircle className="h-5 w-5" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-bold text-navy-900">
                      {testResult.success ? "AI Engine Online & Ready" : "Diagnostic Check Failed"}
                    </h3>
                    <p className="text-2xs text-neutral-500">
                      {testResult.success
                        ? "Model streamed response within normal latency thresholds"
                        : "Encountered an error communicating with the configured LLM API"}
                    </p>
                  </div>
                </div>

                <Badge
                  variant={testResult.success ? "success" : "danger"}
                  className="text-xs font-bold px-3 py-1"
                >
                  {testResult.success ? "Healthy 200 OK" : "Error"}
                </Badge>
              </div>

              {testResult.success ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200">
                      <span className="text-2xs text-neutral-500 uppercase font-bold">Active Provider</span>
                      <p className="text-sm font-bold text-navy-900 capitalize mt-1">
                        {testResult.provider}
                      </p>
                    </div>
                    <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200">
                      <span className="text-2xs text-neutral-500 uppercase font-bold">Model Engine</span>
                      <p className="text-sm font-mono font-bold text-primary-700 mt-1 truncate">
                        {testResult.model}
                      </p>
                    </div>
                    <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200">
                      <span className="text-2xs text-neutral-500 uppercase font-bold">Inference Latency</span>
                      <p className="text-sm font-mono font-bold text-emerald-600 mt-1">
                        {testResult.latencyMs} ms
                      </p>
                    </div>
                  </div>

                  {testResult.response && (
                    <div className="rounded-2xl border border-neutral-800 bg-navy-900 overflow-hidden shadow-lg">
                      <div className="px-4 py-2.5 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
                        <div className="flex items-center gap-2">
                          <Terminal className="h-3.5 w-3.5 text-emerald-400" />
                          <span className="font-mono text-2xs">Model Response Stream Output</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleCopy}
                          className="flex items-center gap-1 text-2xs hover:text-white transition-colors"
                        >
                          {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                          <span>{copied ? "Copied" : "Copy Output"}</span>
                        </button>
                      </div>
                      <div className="p-4 text-xs font-mono text-emerald-300 leading-relaxed overflow-x-auto whitespace-pre-wrap">
                        {testResult.response}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-4 bg-rose-50 text-rose-800 rounded-2xl border border-rose-200 text-xs font-mono">
                  {testResult.error}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
