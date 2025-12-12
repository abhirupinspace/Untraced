import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-untraced-dark text-untraced-light",
        secondary: "bg-untraced-dark/10 text-untraced-dark",
        outline: "border border-untraced-dark/20 text-untraced-dark",
        success: "bg-green-100 text-green-700",
        warning: "bg-amber-100 text-amber-700",
        destructive: "bg-red-100 text-red-700",
        glow: "bg-untraced-dark text-untraced-light shadow-glow",
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
