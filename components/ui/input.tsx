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
            className="block text-sm font-medium text-neutral-900"
          >
            {label}
            {props.required && <span className="text-semantic-danger ml-1">*</span>}
          </label>
        )}
        <input
          type={type}
          id={inputId}
          className={cn(
            "flex h-10 w-full rounded-md border border-neutral-200 bg-surface px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:border-primary-500 disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
            error && "border-semantic-danger focus-visible:ring-red-200",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-xs text-semantic-danger" role="alert">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p className="text-xs text-neutral-600">{helperText}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };

