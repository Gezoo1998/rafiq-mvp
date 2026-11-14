import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-bold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary-300",
  {
    variants: {
      variant: {
        default:
          "bg-neutral-100 text-neutral-800 border border-neutral-200/80 shadow-2xs",
        secondary:
          "bg-neutral-100/90 text-neutral-700 border border-neutral-200/90 shadow-2xs",
        primary:
          "bg-primary-50 text-primary-700 border border-primary-200/70 shadow-2xs",
        success:
          "bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs",
        warning:
          "bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs",
        danger:
          "bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs",
        info:
          "bg-sky-50 text-sky-700 border border-sky-200 shadow-2xs",
        outline:
          "border border-neutral-300/80 text-neutral-700 bg-white shadow-2xs",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
