import * as React from "react";
import { cn } from "@/lib/utils";
import { MasteryLevel, LevelChip } from "./level-chip";

interface MasteryMeterProps {
  level: MasteryLevel;
  showChip?: boolean;
  className?: string;
}

export function MasteryMeter({ level, showChip = true, className }: MasteryMeterProps) {
  const levels: MasteryLevel[] = [
    "needs_support",
    "developing",
    "proficient",
    "mastered",
  ];

  const levelIndex = levels.indexOf(level);

  const segmentColors = [
    { active: "bg-gradient-to-r from-rose-500 to-pink-500", inactive: "bg-neutral-200/60 dark:bg-neutral-800", label: "Needs Practice" },
    { active: "bg-gradient-to-r from-amber-500 to-orange-500", inactive: "bg-neutral-200/60 dark:bg-neutral-800", label: "Making Progress" },
    { active: "bg-gradient-to-r from-sky-500 to-blue-500", inactive: "bg-neutral-200/60 dark:bg-neutral-800", label: "Getting Strong" },
    { active: "bg-gradient-to-r from-emerald-500 to-teal-500", inactive: "bg-neutral-200/60 dark:bg-neutral-800", label: "Mastered" },
  ];

  return (
    <div className={cn("w-full space-y-2.5", className)}>
      {showChip && (
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
            Mastery Meter
          </span>
          <LevelChip level={level} size="sm" />
        </div>
      )}
      <div className="grid grid-cols-4 gap-2 h-3.5 w-full">
        {levels.map((lvl, index) => {
          const isFilled = index <= levelIndex;
          const isCurrent = index === levelIndex;
          const config = segmentColors[index];

          return (
            <div
              key={lvl}
              className={cn(
                "h-full rounded-full transition-all duration-500 relative group overflow-hidden",
                isFilled ? config.active : config.inactive,
                isCurrent && "ring-2 ring-offset-2 ring-primary-500/80 shadow-md shadow-primary-500/20"
              )}
              title={`${config.label} tier`}
            >
              {isFilled && (
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
