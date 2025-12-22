import type { CSSProperties } from "react";

export interface ThemeConfig {
  mode: "light" | "dark";
  accentColor: string;
}

export function createStyles(theme: ThemeConfig): Record<string, CSSProperties> {
  const isDark = theme.mode === "dark";

  const colors = {
    bg: isDark ? "#09090b" : "#ffffff",
    bgSecondary: isDark ? "#18181b" : "#f8fafc",
    bgTertiary: isDark ? "#27272a" : "#f1f5f9",
    text: isDark ? "#fafafa" : "#0f172a",
    textSecondary: isDark ? "#a1a1aa" : "#64748b",
    textMuted: isDark ? "#71717a" : "#94a3b8",
    border: isDark ? "#27272a" : "#e2e8f0",
    borderHover: isDark ? "#3f3f46" : "#cbd5e1",
    accent: theme.accentColor,
    accentHover: theme.accentColor + "e6",
    success: isDark ? "#34d399" : "#059669",
    error: isDark ? "#f87171" : "#dc2626",
    warning: "#f59e0b",
  };

  return {
    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      backdropFilter: "blur(4px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 999999,
      fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    },
    modal: {
      backgroundColor: colors.bg,
      borderRadius: "16px",
      border: `1px solid ${colors.border}`,
      width: "100%",
      maxWidth: "420px",
      maxHeight: "85vh",
      overflow: "hidden",
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
      animation: "untracedModalIn 0.2s ease-out",
    },
    header: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      padding: "24px 24px 20px",
      borderBottom: `1px solid ${colors.border}`,
    },
    headerTitle: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
    },
    logo: {
      width: "28px",
      height: "28px",
      borderRadius: "8px",
      overflow: "hidden",
    },
    logoText: {
      fontSize: "12px",
      fontWeight: 500,
      color: colors.textMuted,
      textTransform: "uppercase" as const,
      letterSpacing: "0.05em",
    },
    title: {
      fontSize: "18px",
      fontWeight: 500,
      color: colors.text,
      margin: "12px 0 0",
      letterSpacing: "-0.01em",
    },
    subtitle: {
      fontSize: "14px",
      fontWeight: 300,
      color: colors.textSecondary,
      margin: "4px 0 0",
    },
    closeButton: {
      width: "32px",
      height: "32px",
      borderRadius: "8px",
      border: "none",
      backgroundColor: "transparent",
      color: colors.textMuted,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "all 0.15s ease",
    },
    content: {
      padding: "24px",
      overflowY: "auto" as const,
      minHeight: "280px",
    },
    moduleGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(1, 1fr)",
      gap: "10px",
    },
    moduleCard: {
      padding: "14px 16px",
      borderRadius: "12px",
      border: `1px solid ${colors.border}`,
      backgroundColor: "transparent",
      cursor: "pointer",
      transition: "all 0.15s ease",
      textAlign: "left" as const,
      display: "flex",
      alignItems: "center",
      gap: "14px",
    },
    moduleCardHover: {
      borderColor: colors.accent,
      backgroundColor: colors.bgSecondary,
    },
    moduleIcon: {
      width: "40px",
      height: "40px",
      borderRadius: "10px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    moduleName: {
      fontSize: "14px",
      fontWeight: 500,
      color: colors.text,
      margin: 0,
    },
    moduleDescription: {
      fontSize: "13px",
      fontWeight: 300,
      color: colors.textMuted,
      margin: "2px 0 0",
    },
    verificationContainer: {
      display: "flex",
      flexDirection: "column" as const,
      alignItems: "center",
      justifyContent: "center",
      gap: "16px",
      minHeight: "220px",
      textAlign: "center" as const,
    },
    statusIcon: {
      width: "64px",
      height: "64px",
      borderRadius: "16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    statusIconVerifying: {
      backgroundColor: colors.accent + "15",
    },
    statusIconSuccess: {
      backgroundColor: colors.success + "15",
      borderRadius: "50%",
    },
    statusIconError: {
      backgroundColor: colors.error + "15",
      borderRadius: "50%",
    },
    statusText: {
      fontSize: "16px",
      fontWeight: 500,
      color: colors.text,
      textAlign: "center" as const,
      margin: 0,
    },
    statusSubtext: {
      fontSize: "14px",
      fontWeight: 300,
      color: colors.textSecondary,
      textAlign: "center" as const,
      margin: 0,
    },
    configSection: {
      marginBottom: "20px",
    },
    configLabel: {
      fontSize: "14px",
      fontWeight: 500,
      color: colors.text,
      marginBottom: "8px",
      display: "block",
    },
    input: {
      width: "100%",
      padding: "12px 16px",
      borderRadius: "12px",
      border: `1px solid ${colors.border}`,
      backgroundColor: colors.bg,
      color: colors.text,
      fontSize: "14px",
      fontWeight: 400,
      outline: "none",
      transition: "border-color 0.15s ease, box-shadow 0.15s ease",
      boxSizing: "border-box" as const,
    },
    select: {
      width: "100%",
      padding: "12px 16px",
      borderRadius: "12px",
      border: `1px solid ${colors.border}`,
      backgroundColor: colors.bg,
      color: colors.text,
      fontSize: "14px",
      fontWeight: 400,
      outline: "none",
      cursor: "pointer",
      appearance: "none" as const,
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='${encodeURIComponent(colors.textSecondary)}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
      backgroundRepeat: "no-repeat",
      backgroundPosition: "right 12px center",
    },
    button: {
      width: "100%",
      padding: "14px 20px",
      borderRadius: "12px",
      border: "none",
      backgroundColor: colors.accent,
      color: "#ffffff",
      fontSize: "14px",
      fontWeight: 500,
      cursor: "pointer",
      transition: "opacity 0.15s ease",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
    },
    buttonSecondary: {
      width: "100%",
      padding: "14px 20px",
      borderRadius: "12px",
      border: `1px solid ${colors.border}`,
      backgroundColor: "transparent",
      color: colors.text,
      fontSize: "14px",
      fontWeight: 500,
      cursor: "pointer",
      transition: "all 0.15s ease",
    },
    buttonDisabled: {
      opacity: 0.5,
      cursor: "not-allowed",
    },
    footer: {
      padding: "16px 24px",
      borderTop: `1px solid ${colors.border}`,
      backgroundColor: colors.bgSecondary + "50",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },
    footerText: {
      fontSize: "12px",
      color: colors.textMuted,
    },
    footerLink: {
      fontSize: "12px",
      color: colors.textMuted,
      textDecoration: "none",
    },
    errorMessage: {
      padding: "12px 16px",
      borderRadius: "12px",
      backgroundColor: colors.error + "10",
      border: `1px solid ${colors.error}20`,
      color: colors.error,
      fontSize: "13px",
      fontWeight: 400,
      marginTop: "12px",
    },
    successBadge: {
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      padding: "10px 16px",
      borderRadius: "12px",
      backgroundColor: colors.success + "10",
      color: colors.success,
      fontSize: "14px",
      fontWeight: 500,
    },
    txLink: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      color: colors.accent,
      fontSize: "14px",
      textDecoration: "none",
      marginTop: "8px",
    },
    spinner: {
      width: "20px",
      height: "20px",
      border: "2px solid transparent",
      borderTopColor: "currentColor",
      borderRadius: "50%",
      animation: "untracedSpin 0.8s linear infinite",
    },
    backButton: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      padding: "8px 12px",
      marginLeft: "-12px",
      borderRadius: "8px",
      border: "none",
      backgroundColor: "transparent",
      color: colors.textSecondary,
      fontSize: "13px",
      fontWeight: 400,
      cursor: "pointer",
      marginBottom: "16px",
      transition: "color 0.15s ease",
    },
    divider: {
      width: "100%",
      height: "1px",
      backgroundColor: colors.border,
      margin: "16px 0",
    },
    walletInfo: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      padding: "10px 16px",
      borderRadius: "12px",
      backgroundColor: colors.bgSecondary,
      marginBottom: "20px",
    },
    walletAddress: {
      fontSize: "14px",
      color: colors.textSecondary,
      fontFamily: "monospace",
    },
    walletDot: {
      width: "8px",
      height: "8px",
      borderRadius: "50%",
      backgroundColor: colors.success,
    },
    privacyNotice: {
      display: "flex",
      alignItems: "flex-start",
      gap: "12px",
      padding: "14px 16px",
      borderRadius: "12px",
      backgroundColor: colors.bgSecondary,
      marginBottom: "20px",
    },
    privacyText: {
      fontSize: "12px",
      fontWeight: 300,
      color: colors.textSecondary,
      lineHeight: 1.5,
      margin: 0,
    },
  };
}

export const globalStyles = `
  @keyframes untracedModalIn {
    from {
      opacity: 0;
      transform: scale(0.95) translateY(10px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  @keyframes untracedSpin {
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes untracedPulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.6;
    }
  }
`;
