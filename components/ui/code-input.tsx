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
      <div className="relative">
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
            "h-14 w-full rounded-lg border-2 border-neutral-200 bg-surface px-4 text-center font-mono text-xl md:text-2xl font-bold tracking-widest text-navy-900 placeholder:text-neutral-400 placeholder:font-normal placeholder:tracking-normal focus-visible:outline-none focus-visible:border-primary-600 focus-visible:ring-4 focus-visible:ring-primary-100 disabled:opacity-50 transition-all",
            error && "border-semantic-danger focus-visible:border-semantic-danger focus-visible:ring-red-100 animate-[shake_0.4s_ease-in-out]",
            className
          )}
        />
      </div>
      {error && (
        <p className="text-sm font-medium text-semantic-danger text-center" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

