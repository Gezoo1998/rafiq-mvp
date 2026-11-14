"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, CheckCircle, AlertCircle, Clock, Cpu } from "lucide-react";

export default function AiTestPage() {
  const [testing, setTesting] = React.useState(false);
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

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">AI Provider Diagnostics</h1>
        <p className="text-sm text-neutral-600">
          Verify real-time connectivity, latency, and streaming response with your configured AI provider
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Live Connection Test</CardTitle>
          <CardDescription>
            Sends a minimal probe request to check round-trip latency and model responsiveness.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button
            variant="primary"
            onClick={runTest}
            isLoading={testing}
            className="gap-2"
          >
            <Activity className="h-4 w-4" />
            <span>Test AI Connection</span>
          </Button>

          {testResult && (
            <div className="space-y-4 pt-4 border-t border-neutral-100">
              <div className="flex items-center gap-3">
                {testResult.success ? (
                  <div className="flex items-center gap-2 text-semantic-success font-semibold">
                    <CheckCircle className="h-5 w-5" />
                    <span>Connection Successful</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-semantic-danger font-semibold">
                    <AlertCircle className="h-5 w-5" />
                    <span>Connection Failed</span>
                  </div>
                )}
              </div>

              {testResult.success ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-neutral-50 rounded-md border border-neutral-200">
                    <span className="text-xs text-neutral-600 uppercase font-semibold">Provider</span>
                    <p className="text-sm font-bold text-navy-900 capitalize mt-0.5">
                      {testResult.provider}
                    </p>
                  </div>
                  <div className="p-3 bg-neutral-50 rounded-md border border-neutral-200">
                    <span className="text-xs text-neutral-600 uppercase font-semibold">Model</span>
                    <p className="text-sm font-mono font-bold text-navy-900 mt-0.5 truncate">
                      {testResult.model}
                    </p>
                  </div>
                  <div className="p-3 bg-neutral-50 rounded-md border border-neutral-200">
                    <span className="text-xs text-neutral-600 uppercase font-semibold">Latency</span>
                    <p className="text-sm font-mono font-bold text-primary-600 mt-0.5">
                      {testResult.latencyMs} ms
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-red-50 text-red-800 rounded-md border border-red-200 text-xs">
                  {testResult.error}
                </div>
              )}

              {testResult.response && (
                <div className="p-3 bg-neutral-50 rounded-md border border-neutral-200">
                  <span className="text-xs text-neutral-600 uppercase font-semibold">Model Response</span>
                  <pre className="text-xs font-mono bg-surface p-2 rounded border border-neutral-200 mt-1 text-neutral-900">
                    {testResult.response}
                  </pre>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
