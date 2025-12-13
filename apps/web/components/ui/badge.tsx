import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-purple-500 text-white",
        secondary: "bg-white/10 text-white",
        outline: "border border-white/20 text-white",
        success: "bg-green-500/20 text-green-400",
        warning: "bg-amber-500/20 text-amber-400",
        destructive: "bg-red-500/20 text-red-400",
        glow: "bg-purple-500 text-white shadow-glow",
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
