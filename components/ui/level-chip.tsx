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
      icon: Sparkles,
      className: "bg-[#E6F4EC] text-[#1E7B4B] border-[#C2E8D2]",
    },
    proficient: {
      label: "Getting strong",
      icon: TrendingUp,
      className: "bg-[#E6F0FB] text-[#1F63B5] border-[#BDDCF8]",
    },
    developing: {
      label: "Making progress",
      icon: Sprout,
      className: "bg-[#FDF1DC] text-[#A86412] border-[#FCE1B6]",
    },
    needs_support: {
      label: "Needs more practice",
      icon: LifeBuoy,
      className: "bg-[#FBEBE2] text-[#B5532A] border-[#F6D0BC]",
    },
  }[level];

  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full border shadow-2xs",
        size === "sm" ? "px-2 py-0.5 text-xs gap-1" : "px-3 py-1 text-xs md:text-sm gap-1.5",
        config.className,
        className
      )}
    >
      <Icon className={cn(size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5")} />
      <span>{config.label}</span>
    </span>
  );
}

export function SafetyBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200",
        className
      )}
    >
      <ShieldAlert className="h-3.5 w-3.5" />
      <span>Safety Alert</span>
    </span>
  );
}

export function DemoBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-2xs font-mono font-medium bg-amber-100 text-amber-800 border border-amber-300",
        className
      )}
    >
      <Cpu className="h-3 w-3" />
      <span>Demo AI</span>
    </span>
  );
}
