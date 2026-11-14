"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coins, Zap, AlertTriangle, Layers, Calendar, BarChart3, TrendingUp, Building2, CheckCircle2 } from "lucide-react";

interface UsageItem {
  schoolId: string;
  schoolName: string;
  city: string;
  tokensIn: number;
  tokensOut: number;
  totalCalls: number;
  errorCount: number;
  estimatedCostUsd: number;
}

export default function SystemUsagePage() {
  const [usage, setUsage] = React.useState<UsageItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadUsage() {
      try {
        const res = await fetch("/api/system/usage");
        const data = await res.json();
        if (res.ok) {
          setUsage(data.usage || []);
        }
      } finally {
        setLoading(false);
      }
    }
    loadUsage();
  }, []);

  const totalTokens = usage.reduce((acc, u) => acc + u.tokensIn + u.tokensOut, 0);
  const totalCalls = usage.reduce((acc, u) => acc + u.totalCalls, 0);
  const totalCost = usage.reduce((acc, u) => acc + u.estimatedCostUsd, 0);
  const maxTokens = Math.max(1, ...usage.map((u) => u.tokensIn + u.tokensOut));

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-8 w-1 rounded-full bg-gradient-to-b from-primary-500 to-indigo-700" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
              AI Usage & Infrastructure Cost
            </h1>
          </div>
          <p className="text-sm text-neutral-500 ml-3">
            Real-time LLM token consumption, inference call metrics, error diagnostics, and billing tracking
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="primary" className="text-xs px-3 py-1 font-semibold flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Live Telemetry
          </Badge>
        </div>
      </div>

      {/* Aggregate KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="rounded-3xl border border-neutral-200/80 shadow-sm relative overflow-hidden bg-white hover:shadow-md transition-shadow">
          <div className="h-2 w-full bg-gradient-to-r from-indigo-500 to-primary-600" />
          <CardHeader className="pb-2 pt-5">
            <div className="flex items-center justify-between">
              <CardDescription className="text-2xs font-bold uppercase tracking-wider text-neutral-500">
                Total Tokens Consumed
              </CardDescription>
              <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Zap className="h-4.5 w-4.5" />
              </div>
            </div>
            <CardTitle className="text-3xl font-black text-navy-900 mt-1">
              {totalTokens.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 pb-4 text-xs text-neutral-500">
            Prompt context + Socratic AI completions
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-neutral-200/80 shadow-sm relative overflow-hidden bg-white hover:shadow-md transition-shadow">
          <div className="h-2 w-full bg-gradient-to-r from-sky-500 to-blue-600" />
          <CardHeader className="pb-2 pt-5">
            <div className="flex items-center justify-between">
              <CardDescription className="text-2xs font-bold uppercase tracking-wider text-neutral-500">
                Total Inference Calls
              </CardDescription>
              <div className="h-9 w-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <Layers className="h-4.5 w-4.5" />
              </div>
            </div>
            <CardTitle className="text-3xl font-black text-navy-900 mt-1">
              {totalCalls.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 pb-4 text-xs text-neutral-500">
            SSE message turns & evaluation runs
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-neutral-200/80 shadow-sm relative overflow-hidden bg-white hover:shadow-md transition-shadow">
          <div className="h-2 w-full bg-gradient-to-r from-amber-400 to-orange-500" />
          <CardHeader className="pb-2 pt-5">
            <div className="flex items-center justify-between">
              <CardDescription className="text-2xs font-bold uppercase tracking-wider text-neutral-500">
                Estimated Model Cost
              </CardDescription>
              <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Coins className="h-4.5 w-4.5" />
              </div>
            </div>
            <CardTitle className="text-3xl font-black text-navy-900 mt-1">
              ${totalCost.toFixed(4)} <span className="text-xs font-normal text-neutral-500">USD</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 pb-4 text-xs text-neutral-500">
            Groq Llama-3.3-70b billing estimate
          </CardContent>
        </Card>
      </div>

      {/* Usage Table */}
      <Card className="rounded-3xl border border-neutral-200/80 shadow-sm overflow-hidden bg-white">
        <CardHeader className="border-b border-neutral-200/80 bg-neutral-50/60 py-5 px-6 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-lg font-bold text-navy-900 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary-600" />
                <span>Usage Distribution by School</span>
              </CardTitle>
              <CardDescription className="text-xs text-neutral-500">
                Token consumption volume and cost per educational tenant
              </CardDescription>
            </div>
            <span className="text-xs font-mono font-bold text-neutral-500">
              {usage.length} Active School{usage.length === 1 ? "" : "s"}
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-sm text-neutral-500 space-y-2">
              <div className="h-6 w-36 bg-neutral-200 animate-pulse rounded mx-auto" />
              <p>Aggregating AI usage telemetries...</p>
            </div>
          ) : usage.length === 0 ? (
            <div className="p-16 text-center text-sm text-neutral-500 space-y-2">
              <Zap className="h-10 w-10 text-neutral-300 mx-auto" />
              <p className="font-bold text-navy-900">No AI usage recorded yet</p>
              <p className="text-xs text-neutral-400">
                Usage charts and billing records populate automatically when students interact with Rafiq tutors.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-start">
                <thead className="bg-neutral-100/60 text-2xs font-bold text-neutral-600 uppercase tracking-wider border-b border-neutral-200">
                  <tr>
                    <th className="px-6 sm:px-8 py-3.5 text-start">School Entity</th>
                    <th className="px-6 py-3.5 text-start">Token Consumption Share</th>
                    <th className="px-6 py-3.5 text-end">Input Tokens</th>
                    <th className="px-6 py-3.5 text-end">Output Tokens</th>
                    <th className="px-6 py-3.5 text-end">Inferences</th>
                    <th className="px-6 py-3.5 text-center">Errors</th>
                    <th className="px-6 sm:px-8 py-3.5 text-end">Estimated Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200/70">
                  {usage.map((u) => {
                    const schoolTokens = u.tokensIn + u.tokensOut;
                    const pctOfMax = Math.round((schoolTokens / maxTokens) * 100);

                    return (
                      <tr key={u.schoolId} className="hover:bg-primary-50/20 transition-colors">
                        <td className="px-6 sm:px-8 py-4">
                          <div className="font-bold text-navy-900 text-sm">{u.schoolName}</div>
                          <span className="text-2xs text-neutral-400">{u.city}, Saudi Arabia</span>
                        </td>
                        <td className="px-6 py-4 w-48">
                          <div className="space-y-1">
                            <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-primary-500 to-indigo-600 h-full rounded-full transition-all"
                                style={{ width: `${pctOfMax}%` }}
                              />
                            </div>
                            <span className="text-2xs font-mono text-neutral-500 block">
                              {schoolTokens.toLocaleString()} tokens
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-end font-mono text-xs text-neutral-600">
                          {u.tokensIn.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-end font-mono text-xs text-neutral-600">
                          {u.tokensOut.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-end font-mono text-xs font-semibold text-navy-900">
                          {u.totalCalls.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {u.errorCount > 0 ? (
                            <Badge variant="danger" className="text-2xs font-bold px-2 py-0.5">
                              {u.errorCount}
                            </Badge>
                          ) : (
                            <span className="text-neutral-400 font-mono text-xs">0</span>
                          )}
                        </td>
                        <td className="px-6 sm:px-8 py-4 text-end font-mono text-sm font-extrabold text-navy-900">
                          ${u.estimatedCostUsd.toFixed(4)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
