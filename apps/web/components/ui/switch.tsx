"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "default" | "lg";
}

function Switch({
  checked,
  onCheckedChange,
  disabled,
  className,
  size = "default",
}: SwitchProps) {
  const sizes = {
    sm: { track: "h-5 w-9", thumb: "h-4 w-4", translate: "translate-x-4" },
    default: { track: "h-6 w-11", thumb: "h-5 w-5", translate: "translate-x-5" },
    lg: { track: "h-7 w-14", thumb: "h-6 w-6", translate: "translate-x-7" },
  };

  const currentSize = sizes[size];

  return (
    <button
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex shrink-0 cursor-pointer rounded-full border-2 border-transparent",
        "transition-all duration-300 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-50",
        currentSize.track,
        checked ? "bg-primary" : "bg-secondary",
        className
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block rounded-full bg-white shadow-sm",
          "transform transition-transform duration-300 ease-out",
          currentSize.thumb,
          checked ? currentSize.translate : "translate-x-0"
        )}
      />
    </button>
  );
}

export { Switch };
