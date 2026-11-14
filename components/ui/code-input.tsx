"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface CodeInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
  autoFocus?: boolean;
  onEnter?: () => void;
  className?: string;
}

export function CodeInput({
  value,
  onChange,
  disabled,
  error,
  autoFocus = true,
  onEnter,
  className,
}: CodeInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  /**
   * Formats raw text into R-XXXX-XXXX-XX
   */
  const formatCode = (input: string): string => {
    // Keep only alphanumeric
    const raw = input.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (!raw) return "";

    const parts = [];
    // Role letter (1 char)
    parts.push(raw.slice(0, 1));

    if (raw.length > 1) {
      parts.push(raw.slice(1, 5));
    }
    if (raw.length > 5) {
      parts.push(raw.slice(5, 9));
    }
    if (raw.length > 9) {
      parts.push(raw.slice(9, 11));
    }

    return parts.join("-");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCode(e.target.value);
    onChange(formatted);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && onEnter) {
      e.preventDefault();
      onEnter();
    }
  };

  return (
    <div className="w-full space-y-2">
      <div className="relative group">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          autoFocus={autoFocus}
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          maxLength={14} // R-XXXX-XXXX-XX = 1 + 1 + 4 + 1 + 4 + 1 + 2 = 14 chars
          placeholder="S-7K4P-9XQ2-M8"
          aria-label="Access Code"
          aria-invalid={!!error}
          className={cn(
            "h-14 w-full rounded-2xl border-2 border-neutral-200/90 bg-white dark:bg-neutral-900 px-4 text-center font-mono text-xl sm:text-2xl font-black tracking-widest text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-600 placeholder:font-normal placeholder:tracking-normal shadow-xs transition-all duration-200 focus-visible:outline-none focus-visible:border-indigo-600 focus-visible:ring-4 focus-visible:ring-indigo-500/15 disabled:opacity-50",
            error && "border-rose-500 focus-visible:border-rose-500 focus-visible:ring-rose-500/15 animate-[shake_0.4s_ease-in-out]",
            className
          )}
        />
      </div>
      {error && (
        <p className="text-xs font-bold text-rose-500 text-center flex items-center justify-center gap-1.5" role="alert">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-500 inline-block" />
          {error}
        </p>
      )}
    </div>
  );
}
