"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { useUntracedContext } from "./context";
import { createStyles, globalStyles } from "./styles";
import { AVAILABLE_MODULES, type VerificationModule, type ModuleConfig } from "./types";

// SVG Icons
function EmailIcon({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function UserIcon({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="5" />
      <path d="M20 21a8 8 0 1 0-16 0" />
    </svg>
  );
}

function GithubIcon({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
  );
}

function TwitterIcon({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

function WalletIcon({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
    </svg>
  );
}

function LockIcon({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function getModuleIcon(iconType: string, size = 20, color = "white") {
  switch (iconType) {
    case "email":
      return <EmailIcon size={size} color={color} />;
    case "user":
      return <UserIcon size={size} color={color} />;
    case "github":
      return <GithubIcon size={size} color={color} />;
    case "twitter":
      return <TwitterIcon size={size} color={color} />;
    case "wallet":
      return <WalletIcon size={size} color={color} />;
    default:
      return <UserIcon size={size} color={color} />;
  }
}

interface ModuleCardProps {
  module: ModuleConfig;
  styles: ReturnType<typeof createStyles>;
  onClick: () => void;
}

function ModuleCard({ module, styles, onClick }: ModuleCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      style={{
        ...styles.moduleCard,
        ...(isHovered ? styles.moduleCardHover : {}),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
    >
      <div style={{ ...styles.moduleIcon, backgroundColor: module.color }}>
        {getModuleIcon(module.icon, 20, "white")}
      </div>
      <div>
        <p style={styles.moduleName}>{module.name}</p>
        <p style={styles.moduleDescription}>{module.description}</p>
      </div>
    </div>
  );
}

function Spinner({ style }: { style?: React.CSSProperties }) {
  return <div style={{ ...style }} className="untraced-spinner" />;
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}

export function UntracedModal() {
  const {
    config,
    isOpen,
    isConnected,
    userAddress,
    status,
    currentModule,
    verificationResult,
    error,
    close,
    verify,
    reset,
  } = useUntracedContext();

  const [mounted, setMounted] = useState(false);
  const [selectedModule, setSelectedModule] = useState<ModuleConfig | null>(null);
  const [moduleConfig, setModuleConfig] = useState<Record<string, unknown>>({});

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (currentModule) {
      const module = AVAILABLE_MODULES.find((m) => m.id === currentModule);
      if (module) {
        setSelectedModule(module);
        // Set default config values
        const defaults: Record<string, unknown> = {};
        module.configOptions?.forEach((opt) => {
          defaults[opt.id] = opt.default;
        });
        setModuleConfig(defaults);
      }
    }
  }, [currentModule]);

  const styles = useMemo(() => {
    const mode = config?.theme === "auto"
      ? (typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : (config?.theme || "dark");
    return createStyles({ mode, accentColor: config?.accentColor || "#a855f7" });
  }, [config?.theme, config?.accentColor]);

  const availableModules = useMemo(() => {
    const allowedModules = config?.modules || AVAILABLE_MODULES.map((m) => m.id);
    return AVAILABLE_MODULES.filter((m) => allowedModules.includes(m.id));
  }, [config?.modules]);

  const handleModuleSelect = useCallback((module: ModuleConfig) => {
    setSelectedModule(module);
    // Set default config values
    const defaults: Record<string, unknown> = {};
    module.configOptions?.forEach((opt) => {
      defaults[opt.id] = opt.default;
    });
    setModuleConfig(defaults);
  }, []);

  const handleBack = useCallback(() => {
    setSelectedModule(null);
    setModuleConfig({});
    reset();
  }, [reset]);

  const handleVerify = useCallback(async () => {
    if (!selectedModule) return;
    try {
      await verify(selectedModule.id, moduleConfig);
    } catch {
      // Error is handled in context
    }
  }, [selectedModule, moduleConfig, verify]);

  const handleClose = useCallback(() => {
    setSelectedModule(null);
    setModuleConfig({});
    close();
  }, [close]);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!mounted || !isOpen) return null;

  const modalContent = (
    <>
      <style>{globalStyles}</style>
      <style>{`
        .untraced-spinner {
          width: 24px;
          height: 24px;
          border: 2px solid transparent;
          border-top-color: currentColor;
          border-radius: 50%;
          animation: untracedSpin 0.8s linear infinite;
        }
      `}</style>
      <div style={styles.overlay} onClick={handleClose}>
        <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div style={styles.header}>
            <div>
              <div style={styles.headerTitle}>
                <img
                  src="/icon.png"
                  alt="Untraced"
                  style={styles.logo}
                  onError={(e) => {
                    // Fallback if image doesn't load
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <span style={styles.logoText as React.CSSProperties}>Untraced</span>
              </div>
              <h2 style={styles.title}>Identity Verification</h2>
              <p style={styles.subtitle}>
                {selectedModule ? selectedModule.description : "Select a verification method"}
              </p>
            </div>
            <button
              style={styles.closeButton}
              onClick={handleClose}
              aria-label="Close"
            >
              <CloseIcon />
            </button>
          </div>

          {/* Content */}
          <div style={styles.content}>
            {/* Module Selection */}
            {!selectedModule && (
              <div style={styles.moduleGrid}>
                {availableModules.map((module) => (
                  <ModuleCard
                    key={module.id}
                    module={module}
                    styles={styles}
                    onClick={() => handleModuleSelect(module)}
                  />
                ))}
              </div>
            )}

            {/* Module Verification Flow */}
            {selectedModule && (
              <>
                <button style={styles.backButton} onClick={handleBack}>
                  <BackIcon />
                  Back to modules
                </button>

                {/* Idle / Config State */}
                {status === "idle" && (
                  <>
                    <div style={{ textAlign: "center", marginBottom: "20px" }}>
                      <div
                        style={{
                          ...styles.statusIcon,
                          backgroundColor: selectedModule.color,
                          margin: "0 auto 16px",
                        }}
                      >
                        {getModuleIcon(selectedModule.icon, 28, "white")}
                      </div>
                      <p style={styles.statusText}>{selectedModule.name}</p>
                      <p style={styles.statusSubtext}>{selectedModule.description}</p>
                    </div>

                    {/* Wallet Connection Status */}
                    {isConnected && userAddress && (
                      <div style={styles.walletInfo}>
                        <div style={styles.walletDot} />
                        <span style={styles.walletAddress}>
                          {formatAddress(userAddress)}
                        </span>
                      </div>
                    )}

                    {/* Config Options */}
                    {selectedModule.configOptions?.map((option) => (
                      <div key={option.id} style={styles.configSection}>
                        <label style={styles.configLabel}>{option.label}</label>
                        {option.type === "select" ? (
                          <select
                            style={styles.select}
                            value={String(moduleConfig[option.id] ?? option.default)}
                            onChange={(e) =>
                              setModuleConfig((prev) => ({
                                ...prev,
                                [option.id]: e.target.value,
                              }))
                            }
                          >
                            {option.options?.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="number"
                            style={styles.input}
                            min={option.min}
                            max={option.max}
                            value={Number(moduleConfig[option.id] ?? option.default)}
                            onChange={(e) =>
                              setModuleConfig((prev) => ({
                                ...prev,
                                [option.id]: Number(e.target.value),
                              }))
                            }
                          />
                        )}
                      </div>
                    ))}

                    {/* Privacy Notice */}
                    <div style={styles.privacyNotice as React.CSSProperties}>
                      <LockIcon size={16} />
                      <p style={styles.privacyText as React.CSSProperties}>
                        Your data is verified locally using zero-knowledge proofs. Only the verification result is shared.
                      </p>
                    </div>

                    <button style={styles.button} onClick={handleVerify}>
                      {isConnected ? "Verify" : "Connect & Verify"}
                    </button>
                  </>
                )}

                {/* Connecting State */}
                {status === "connecting" && (
                  <div style={styles.verificationContainer}>
                    <div style={{ ...styles.statusIcon, ...styles.statusIconVerifying }}>
                      <Spinner />
                    </div>
                    <p style={styles.statusText}>Connecting Wallet...</p>
                    <p style={styles.statusSubtext}>
                      Please approve the connection in your wallet
                    </p>
                  </div>
                )}

                {/* Verifying State */}
                {status === "verifying" && (
                  <div style={styles.verificationContainer}>
                    <div style={{ ...styles.statusIcon, ...styles.statusIconVerifying }}>
                      <Spinner />
                    </div>
                    <p style={styles.statusText}>Verifying...</p>
                    <p style={styles.statusSubtext}>
                      {selectedModule.requiresOAuth
                        ? "Complete authentication in the popup window"
                        : "Running zero-knowledge proof locally"}
                    </p>
                  </div>
                )}

                {/* Submitting State */}
                {status === "submitting" && (
                  <div style={styles.verificationContainer}>
                    <div style={{ ...styles.statusIcon, ...styles.statusIconVerifying }}>
                      <Spinner />
                    </div>
                    <p style={styles.statusText}>Submitting to Blockchain...</p>
                    <p style={styles.statusSubtext}>
                      Please confirm the transaction in your wallet
                    </p>
                  </div>
                )}

                {/* Success State */}
                {status === "success" && verificationResult && (
                  <div style={styles.verificationContainer}>
                    <div style={{ ...styles.statusIcon, ...styles.statusIconSuccess }}>
                      <CheckIcon />
                    </div>
                    <p style={styles.statusText}>Verification Complete</p>
                    <div style={styles.successBadge}>
                      {selectedModule.name} Verified
                    </div>
                    {verificationResult.transactionHash && (
                      <a
                        href={`https://sepolia.mantlescan.xyz/tx/${verificationResult.transactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.txLink}
                      >
                        View on Explorer <ExternalLinkIcon />
                      </a>
                    )}
                    <div style={{ ...styles.divider, margin: "20px 0" }} />
                    <button style={styles.button} onClick={handleClose}>
                      Done
                    </button>
                  </div>
                )}

                {/* Error State */}
                {status === "error" && error && (
                  <div style={styles.verificationContainer}>
                    <div style={{ ...styles.statusIcon, ...styles.statusIconError }}>
                      <ErrorIcon />
                    </div>
                    <p style={styles.statusText}>Verification Failed</p>
                    <div style={styles.errorMessage}>{error.message}</div>
                    <div style={{ ...styles.divider, margin: "20px 0" }} />
                    <button style={styles.button} onClick={handleVerify}>
                      Try Again
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div style={styles.footer}>
            <span style={styles.footerText}>Powered by Untraced</span>
            <span style={styles.footerText}>Zero-Knowledge Verification</span>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}
