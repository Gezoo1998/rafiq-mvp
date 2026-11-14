import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-300",
  {
    variants: {
      variant: {
        default:
          "bg-neutral-100 text-neutral-800 border border-neutral-200",
        primary:
          "bg-primary-50 text-primary-700 border border-primary-100",
        success:
          "bg-semantic-success-bg text-semantic-success",
        warning:
          "bg-semantic-warning-bg text-semantic-warning",
        danger:
          "bg-semantic-danger-bg text-semantic-danger font-semibold",
        info:
          "bg-semantic-info-bg text-semantic-info",
        outline:
          "border border-neutral-300 text-neutral-700",
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
