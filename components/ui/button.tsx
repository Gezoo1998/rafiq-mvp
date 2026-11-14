import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-bold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-r from-primary-600 via-indigo-600 to-indigo-700 text-white shadow-md shadow-primary-500/20 hover:shadow-lg hover:shadow-primary-500/30 hover:brightness-105 active:scale-[0.98]",
        secondary:
          "border border-neutral-200/90 bg-white text-navy-900 hover:bg-neutral-50 hover:border-neutral-300 active:bg-neutral-100 shadow-xs active:scale-[0.98]",
        ghost:
          "text-neutral-700 hover:bg-neutral-100/80 hover:text-navy-900 active:scale-[0.98]",
        danger:
          "bg-gradient-to-r from-rose-600 to-red-600 text-white hover:from-rose-700 hover:to-red-700 active:scale-[0.98] shadow-md shadow-rose-500/20",
        accent:
          "bg-gradient-to-r from-amber-400 to-orange-500 text-navy-950 hover:brightness-105 active:scale-[0.98] shadow-md shadow-amber-500/20",
        outline:
          "border-2 border-primary-500/30 text-primary-700 hover:bg-primary-50/50 hover:border-primary-500 active:scale-[0.98]",
      },
      size: {
        sm: "h-8 px-3 text-xs rounded-lg gap-1.5",
        md: "h-10 px-4 py-2 rounded-xl gap-2",
        lg: "h-12 px-6 text-base rounded-2xl gap-2.5",
        icon: "h-10 w-10 p-0 rounded-xl",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, asChild = false, isLoading, children, disabled, ...props }, ref) => {
    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, fullWidth, className }))}
          ref={ref}
          {...props}
        >
          {children}
        </Slot>
      );
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin text-current" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
