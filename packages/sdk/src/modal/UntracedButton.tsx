"use client";

import React, { useMemo, type CSSProperties, type ReactNode } from "react";
import { useUntracedModal } from "./useUntracedModal";
import { useUntracedContext } from "./context";
import type { VerificationModule } from "./types";

// Check icon SVG
function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export interface UntracedButtonProps {
  /** Text to display on the button */
  children?: ReactNode;
  /** Pre-select a specific module when opening */
  module?: VerificationModule;
  /** Custom class name */
  className?: string;
  /** Custom inline styles */
  style?: CSSProperties;
  /** Theme variant */
  variant?: "primary" | "secondary" | "outline" | "ghost";
  /** Button size */
  size?: "sm" | "md" | "lg";
  /** Whether to show the verified status */
  showStatus?: boolean;
  /** Disable the button */
  disabled?: boolean;
}

/**
 * Pre-styled button to open the Untraced verification modal
 *
 * @example
 * ```tsx
 * // Basic usage
 * <UntracedButton />
 *
 * // With specific module
 * <UntracedButton module="zk-github">Verify GitHub</UntracedButton>
 *
 * // Custom styling
 * <UntracedButton variant="outline" size="lg">
 *   Get Verified
 * </UntracedButton>
 * ```
 */
export function UntracedButton({
  children,
  module,
  className,
  style,
  variant = "primary",
  size = "md",
  showStatus = true,
  disabled = false,
}: UntracedButtonProps) {
  const { open, verificationResult, status } = useUntracedModal();
  const { config } = useUntracedContext();

  const isVerified = !!verificationResult;
  const isLoading = status === "verifying" || status === "submitting";

  // Determine theme mode
  const isDark = useMemo(() => {
    if (config?.theme === "auto") {
      return typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    }
    return config?.theme === "dark";
  }, [config?.theme]);

  // Use accent color from config or default to project primary
  const accentColor = config?.accentColor || "#7c3aed";

  // Theme-aware colors
  const colors = useMemo(() => ({
    bg: isDark ? "#09090b" : "#ffffff",
    bgSecondary: isDark ? "#18181b" : "#f8fafc",
    text: isDark ? "#fafafa" : "#0f172a",
    textMuted: isDark ? "#a1a1aa" : "#64748b",
    border: isDark ? "#27272a" : "#e2e8f0",
    success: isDark ? "#34d399" : "#059669",
    accent: accentColor,
  }), [isDark, accentColor]);

  const baseStyles: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontWeight: 500,
    borderRadius: "12px",
    cursor: disabled || isLoading ? "not-allowed" : "pointer",
    transition: "all 0.15s ease",
    border: "none",
    outline: "none",
    opacity: disabled ? 0.5 : 1,
  };

  const sizeStyles: Record<string, CSSProperties> = {
    sm: { padding: "8px 16px", fontSize: "13px" },
    md: { padding: "12px 20px", fontSize: "14px" },
    lg: { padding: "16px 28px", fontSize: "16px" },
  };

  const variantStyles: Record<string, CSSProperties> = {
    primary: {
      backgroundColor: colors.accent,
      color: "#fffefeff",
    },
    secondary: {
      backgroundColor: colors.bgSecondary,
      color: colors.text,
    },
    outline: {
      backgroundColor: "transparent",
      border: `1px solid ${colors.border}`,
      color: colors.text,
    },
    ghost: {
      backgroundColor: "transparent",
      color: colors.accent,
    },
  };

  const computedStyles = useMemo(
    () => ({
      ...baseStyles,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...style,
    }),
    [size, variant, style, disabled, isLoading, colors]
  );

  const handleClick = () => {
    if (!disabled && !isLoading) {
      open(module);
    }
  };

  const buttonContent = () => {
    if (isLoading) {
      return (
        <>
          <span
            style={{
              width: "16px",
              height: "16px",
              border: "2px solid transparent",
              borderTopColor: "currentColor",
              borderRadius: "50%",
              animation: "untracedBtnSpin 0.8s linear infinite",
              display: "inline-block",
            }}
          />
          Verifying...
        </>
      );
    }

    if (showStatus && isVerified) {
      return (
        <>
          <span style={{ color: colors.success, display: "inline-flex" }}>
            <CheckIcon />
          </span>
          Verified
        </>
      );
    }

    return children || "Verify with Untraced";
  };

  return (
    <>
      <style>{`
        @keyframes untracedBtnSpin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      <button
        onClick={handleClick}
        disabled={disabled || isLoading}
        className={className}
        style={computedStyles}
        type="button"
      >
        {buttonContent()}
      </button>
    </>
  );
}
