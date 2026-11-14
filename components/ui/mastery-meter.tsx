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
    { active: "bg-[#B5532A]", inactive: "bg-[#FBEBE2]" },
    { active: "bg-[#A86412]", inactive: "bg-[#FDF1DC]" },
    { active: "bg-[#1F63B5]", inactive: "bg-[#E6F0FB]" },
    { active: "bg-[#1E7B4B]", inactive: "bg-[#E6F4EC]" },
  ];

  return (
    <div className={cn("w-full space-y-2", className)}>
      {showChip && (
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
            Your Progress
          </span>
          <LevelChip level={level} size="sm" />
        </div>
      )}
      <div className="grid grid-cols-4 gap-1.5 h-3 w-full">
        {levels.map((lvl, index) => {
          const isFilled = index <= levelIndex;
          const isCurrent = index === levelIndex;
          const colors = segmentColors[index];

          return (
            <div
              key={lvl}
              className={cn(
                "h-full rounded-sm transition-all duration-300",
                isFilled ? colors.active : colors.inactive,
                isCurrent && "ring-2 ring-offset-1 ring-primary-300 shadow-xs"
              )}
              title={lvl}
            />
          );
        })}
      </div>
    </div>
  );
}

