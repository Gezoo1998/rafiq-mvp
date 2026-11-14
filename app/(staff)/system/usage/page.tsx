"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coins, Zap, AlertTriangle, Layers, Calendar } from "lucide-react";

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">AI Usage & Cost Monitor</h1>
        <p className="text-sm text-neutral-600">
          Track token consumption, call counts, error rates, and estimated cost across all schools
        </p>
      </div>

      {/* Aggregate KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5 text-xs font-semibold text-neutral-600 uppercase tracking-wider">
              <Zap className="h-3.5 w-3.5 text-primary-600" />
              Total Tokens Used
            </CardDescription>
            <CardTitle className="text-2xl font-extrabold text-navy-900">
              {totalTokens.toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5 text-xs font-semibold text-neutral-600 uppercase tracking-wider">
              <Layers className="h-3.5 w-3.5 text-primary-600" />
              AI Calls Made
            </CardDescription>
            <CardTitle className="text-2xl font-extrabold text-navy-900">
              {totalCalls.toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5 text-xs font-semibold text-neutral-600 uppercase tracking-wider">
              <Coins className="h-3.5 w-3.5 text-accent-500" />
              Estimated Cost
            </CardDescription>
            <CardTitle className="text-2xl font-extrabold text-navy-900">
              ${totalCost.toFixed(3)} USD
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Usage Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Usage by School</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-sm text-neutral-600">Loading usage statistics...</div>
          ) : usage.length === 0 ? (
            <div className="p-8 text-center text-sm text-neutral-600">
              No AI sessions recorded yet. Usage data will appear as students interact with Rafiq.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-start">
                <thead className="bg-neutral-50 text-xs font-semibold text-neutral-600 uppercase border-y border-neutral-200">
                  <tr>
                    <th className="px-6 py-3 text-start">School</th>
                    <th className="px-6 py-3 text-end">Input Tokens</th>
                    <th className="px-6 py-3 text-end">Output Tokens</th>
                    <th className="px-6 py-3 text-end">Total Calls</th>
                    <th className="px-6 py-3 text-end">Errors</th>
                    <th className="px-6 py-3 text-end">Est. Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {usage.map((u) => (
                    <tr key={u.schoolId} className="hover:bg-neutral-50/60 transition-colors">
                      <td className="px-6 py-4 font-semibold text-navy-900">
                        {u.schoolName}
                        <span className="block text-xs font-normal text-neutral-600">{u.city}</span>
                      </td>
                      <td className="px-6 py-4 text-end font-mono text-xs">{u.tokensIn.toLocaleString()}</td>
                      <td className="px-6 py-4 text-end font-mono text-xs">{u.tokensOut.toLocaleString()}</td>
                      <td className="px-6 py-4 text-end font-mono text-xs">{u.totalCalls.toLocaleString()}</td>
                      <td className="px-6 py-4 text-end">
                        {u.errorCount > 0 ? (
                          <Badge variant="danger" className="text-xs">
                            {u.errorCount}
                          </Badge>
                        ) : (
                          <span className="text-xs text-neutral-600">0</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-end font-mono text-sm font-bold text-navy-900">
                        ${u.estimatedCostUsd.toFixed(4)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
