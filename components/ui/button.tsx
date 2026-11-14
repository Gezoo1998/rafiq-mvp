import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-sm font-black transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-r from-indigo-600 via-primary-600 to-teal-600 text-white shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 hover:brightness-105 active:scale-[0.98]",
        secondary:
          "border-2 border-neutral-200/90 bg-white text-neutral-800 hover:bg-neutral-50 hover:border-neutral-300 active:bg-neutral-100 shadow-2xs active:scale-[0.98]",
        ghost:
          "text-neutral-700 hover:bg-neutral-100/80 hover:text-neutral-900 active:scale-[0.98]",
        danger:
          "bg-gradient-to-r from-rose-500 to-red-600 text-white hover:from-rose-600 hover:to-red-700 active:scale-[0.98] shadow-md shadow-rose-500/20",
        accent:
          "bg-gradient-to-r from-amber-400 to-orange-500 text-neutral-950 hover:brightness-105 active:scale-[0.98] shadow-md shadow-amber-500/20",
        outline:
          "border-2 border-indigo-500/30 text-indigo-700 hover:bg-indigo-50/50 hover:border-indigo-500 active:scale-[0.98]",
        // 3D Playful Chunky variants (Duolingo & Khan Kids inspired)
        "fun-yellow":
          "bg-amber-400 text-neutral-950 border-b-4 border-amber-600 hover:bg-amber-300 active:border-b-0 active:translate-y-1 shadow-md hover:shadow-lg font-black",
        "fun-green":
          "bg-emerald-500 text-white border-b-4 border-emerald-700 hover:bg-emerald-400 active:border-b-0 active:translate-y-1 shadow-md hover:shadow-lg font-black",
        "fun-blue":
          "bg-sky-500 text-white border-b-4 border-sky-700 hover:bg-sky-400 active:border-b-0 active:translate-y-1 shadow-md hover:shadow-lg font-black",
        "fun-purple":
          "bg-indigo-600 text-white border-b-4 border-indigo-800 hover:bg-indigo-500 active:border-b-0 active:translate-y-1 shadow-md hover:shadow-lg font-black",
        "fun-white":
          "bg-white text-neutral-900 border-2 border-neutral-200 border-b-4 border-b-neutral-300 hover:bg-neutral-50 active:border-b-2 active:translate-y-0.5 shadow-sm font-black",
      },
      size: {
        sm: "h-9 px-3.5 text-xs rounded-xl gap-1.5",
        md: "h-11 px-5 py-2.5 rounded-2xl gap-2",
        lg: "h-13 px-7 text-base rounded-2xl gap-2.5",
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
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
