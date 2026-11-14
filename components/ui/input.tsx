import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, helperText, error, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5 text-start">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300"
          >
            {label}
            {props.required && <span className="text-rose-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <input
            type={type}
            id={inputId}
            className={cn(
              "flex h-11 w-full rounded-xl border border-neutral-200/90 bg-white px-3.5 py-2.5 text-sm font-medium text-neutral-900 placeholder:text-neutral-400 shadow-2xs transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-600 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-900 dark:border-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus-visible:ring-indigo-400/20 dark:focus-visible:border-indigo-500",
              error && "border-rose-500 focus-visible:ring-rose-500/20 focus-visible:border-rose-500 dark:border-rose-500",
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs font-semibold text-rose-500 flex items-center gap-1" role="alert">
            <span>•</span> {error}
          </p>
        )}
        {!error && helperText && (
          <p className="text-xs text-neutral-500 dark:text-neutral-400">{helperText}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
