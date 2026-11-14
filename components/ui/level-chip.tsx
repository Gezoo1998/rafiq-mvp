import * as React from "react";
import { Sparkles, TrendingUp, Sprout, LifeBuoy, ShieldAlert, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";

export type MasteryLevel = "mastered" | "proficient" | "developing" | "needs_support";

interface LevelChipProps {
  level: MasteryLevel | null | undefined;
  className?: string;
  size?: "sm" | "md";
}

export function LevelChip({ level, className, size = "md" }: LevelChipProps) {
  if (!level) {
    return (
      <span className="inline-flex items-center text-xs text-neutral-400 font-medium">
        —
      </span>
    );
  }

  const config = {
    mastered: {
      label: "Mastered it!",
      arabic: "متقن بامتياز",
      icon: Sparkles,
      className: "bg-gradient-to-r from-emerald-500/15 to-teal-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-300/60 dark:border-emerald-700/60",
      dotClass: "bg-emerald-500 shadow-sm shadow-emerald-500/50",
    },
    proficient: {
      label: "Getting Strong",
      arabic: "متمكن",
      icon: TrendingUp,
      className: "bg-gradient-to-r from-sky-500/15 to-blue-500/15 text-sky-700 dark:text-sky-300 border-sky-300/60 dark:border-sky-700/60",
      dotClass: "bg-sky-500 shadow-sm shadow-sky-500/50",
    },
    developing: {
      label: "Making Progress",
      arabic: "في تقدم",
      icon: Sprout,
      className: "bg-gradient-to-r from-amber-500/15 to-orange-500/15 text-amber-700 dark:text-amber-300 border-amber-300/60 dark:border-amber-700/60",
      dotClass: "bg-amber-500 shadow-sm shadow-amber-500/50",
    },
    needs_support: {
      label: "Needs Practice",
      arabic: "بحاجة لتدريب",
      icon: LifeBuoy,
      className: "bg-gradient-to-r from-rose-500/15 to-pink-500/15 text-rose-700 dark:text-rose-300 border-rose-300/60 dark:border-rose-700/60",
      dotClass: "bg-rose-500 shadow-sm shadow-rose-500/50",
    },
  }[level];

  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center font-bold rounded-full border shadow-xs transition-all",
        size === "sm" ? "px-2.5 py-0.5 text-2xs gap-1.5" : "px-3.5 py-1 text-xs gap-2",
        config.className,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", config.dotClass)} />
      <Icon className={cn(size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5")} />
      <span>{config.label}</span>
    </span>
  );
}

export function SafetyBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-red-500/15 to-rose-500/15 text-red-700 dark:text-red-300 border border-red-300/60 shadow-xs",
        className
      )}
    >
      <ShieldAlert className="h-3.5 w-3.5 text-red-600 animate-pulse" />
      <span>Safety Flag Detected</span>
    </span>
  );
}

export function DemoBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-2xs font-mono font-bold bg-gradient-to-r from-indigo-500/15 to-purple-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800 shadow-2xs",
        className
      )}
    >
      <Cpu className="h-3 w-3 text-indigo-500" />
      <span>Demo AI Engine</span>
    </span>
  );
}
