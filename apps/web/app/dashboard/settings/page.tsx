"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { DashboardNavbar } from "@/components/dashboard/dashboard-navbar";
import {
  User,
  Bell,
  Shield,
  Key,
  Globe,
  Trash2,
  AlertTriangle,
  Check,
  Copy,
  Eye,
  EyeOff,
  Plus,
  ExternalLink,
  ChevronRight,
  Mail,
  Smartphone,
  Monitor,
} from "lucide-react";
import { useWallet } from "@/lib/use-wallet";
import { cn } from "@/lib/cn";

type SettingsTab = "general" | "notifications" | "security" | "api";

const tabs: { id: SettingsTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "general", label: "General", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
  { id: "api", label: "API", icon: Key },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const { user, authenticated } = useWallet();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <DashboardNavbar title="Settings" />

      <div className="flex justify-center px-6 py-8">
        <div className="w-full max-w-2xl space-y-8">
          {/* Tab Navigation */}
          <div className="flex justify-center">
            <div className="inline-flex items-center p-1 bg-secondary rounded-xl border border-border">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-light transition-all duration-200",
                      isActive
                        ? "bg-primary/10 text-foreground dark:bg-white/10"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {activeTab === "general" && (
              <GeneralSettings user={user} authenticated={authenticated} />
            )}
            {activeTab === "notifications" && <NotificationSettings />}
            {activeTab === "security" && <SecuritySettings />}
            {activeTab === "api" && <ApiSettings />}
          </div>
        </div>
      </div>
    </div>
  );
}

function GeneralSettings({ user, authenticated }: { user: any; authenticated: boolean }) {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    if (user?.wallet?.address) {
      navigator.clipboard.writeText(user.wallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      {/* Profile Card */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
        <div className="relative p-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center text-2xl font-medium text-primary-foreground mb-4">
              {authenticated ? user?.wallet?.address?.slice(2, 4).toUpperCase() || "U" : "?"}
            </div>
            <h3 className="text-lg font-medium text-foreground mb-1">
              {displayName || "Unnamed User"}
            </h3>
            {authenticated && (
              <button
                onClick={copyAddress}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-light"
              >
                <code className="font-mono">
                  {user?.wallet?.address?.slice(0, 6)}...{user?.wallet?.address?.slice(-4)}
                </code>
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-success" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Account Details */}
      <SettingsSection title="Account Details" description="Update your personal information">
        <div className="space-y-4">
          <Input
            label="Display Name"
            placeholder="Enter your name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="flex justify-end mt-6">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium h-10 px-6">
            Save Changes
          </Button>
        </div>
      </SettingsSection>

      {/* Preferences */}
      <SettingsSection title="Preferences" description="Customize your experience">
        <div className="space-y-1">
          <SettingToggle
            title="Theme"
            description="Toggle between light and dark mode"
            checked={true}
            disabled
          />
          <SettingToggle
            title="Compact View"
            description="Display more content with reduced spacing"
            checked={false}
          />
        </div>
      </SettingsSection>

      {/* Danger Zone */}
      <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6">
        <div className="flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-destructive/10">
            <AlertTriangle className="w-5 h-5 text-destructive" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-foreground mb-1">Delete Account</h3>
            <p className="text-xs text-muted-foreground mb-4 font-light">
              Permanently remove your account and all associated data. This action cannot be undone.
            </p>
            <Button
              variant="outline"
              className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive/50 text-sm font-medium h-9"
            >
              Delete Account
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

function NotificationSettings() {
  return (
    <>
      <SettingsSection title="Email Notifications" description="Manage your email preferences">
        <div className="space-y-1">
          <SettingToggle
            title="All Notifications"
            description="Receive notifications via email"
            checked={true}
          />
          <SettingToggle
            title="Security Alerts"
            description="Important security-related notifications"
            checked={true}
          />
          <SettingToggle
            title="Weekly Digest"
            description="Summary of your weekly activity"
            checked={false}
          />
        </div>
      </SettingsSection>

      <SettingsSection title="Product Alerts" description="Stay updated on your projects">
        <div className="space-y-1">
          <SettingToggle
            title="Failed Verifications"
            description="Get notified when verifications fail"
            checked={true}
          />
          <SettingToggle
            title="Rate Limit Warnings"
            description="Alert when approaching API limits"
            checked={true}
          />
          <SettingToggle
            title="New Features"
            description="Updates about new features and improvements"
            checked={false}
          />
        </div>
      </SettingsSection>
    </>
  );
}

function SecuritySettings() {
  const sessions = [
    { device: "MacBook Pro", type: "desktop", location: "San Francisco, US", current: true, lastActive: "Now" },
    { device: "iPhone 15", type: "mobile", location: "San Francisco, US", current: false, lastActive: "2h ago" },
  ];

  return (
    <>
      <SettingsSection title="Two-Factor Authentication" description="Add an extra layer of security">
        <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border border-border">
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-foreground font-light">Enable 2FA</p>
              <p className="text-xs text-muted-foreground font-light">Secure your account with TOTP</p>
            </div>
          </div>
          <Button
            variant="outline"
            className="border-border text-foreground hover:bg-secondary text-sm font-medium h-9"
          >
            Setup
          </Button>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Active Sessions"
        description="Devices currently logged into your account"
        action={
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive hover:bg-destructive/10 text-xs h-8 font-medium"
          >
            Revoke All
          </Button>
        }
      >
        <div className="space-y-2">
          {sessions.map((session, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border border-border"
            >
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-secondary">
                  {session.type === "desktop" ? (
                    <Monitor className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Smartphone className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-foreground font-light">{session.device}</p>
                    {session.current && (
                      <span className="px-2 py-0.5 text-[10px] rounded-full bg-success/10 text-success font-medium">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground font-light">
                    {session.location} · {session.lastActive}
                  </p>
                </div>
              </div>
              {!session.current && (
                <button className="text-xs text-muted-foreground hover:text-destructive transition-colors font-medium">
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      </SettingsSection>
    </>
  );
}

function ApiSettings() {
  const [showSecret, setShowSecret] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const apiKeys = [
    { id: "pk_live_xxx", name: "Publishable Key", type: "public", lastUsed: "2h ago" },
    { id: "sk_live_xxx", name: "Secret Key", type: "secret", lastUsed: "1h ago" },
  ];

  return (
    <>
      <SettingsSection
        title="API Keys"
        description="Manage your API credentials"
        action={
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium h-9 gap-2">
            <Plus className="w-4 h-4" />
            New Key
          </Button>
        }
      >
        <div className="space-y-2">
          {apiKeys.map((key) => (
            <div
              key={key.id}
              className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border border-border"
            >
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-secondary">
                  <Key className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-foreground font-light">{key.name}</p>
                    <span
                      className={cn(
                        "px-2 py-0.5 text-[10px] rounded-full font-medium",
                        key.type === "public"
                          ? "bg-secondary text-muted-foreground"
                          : "bg-destructive/10 text-destructive"
                      )}
                    >
                      {key.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="text-xs text-muted-foreground font-mono">
                      {key.type === "secret" && !showSecret ? "••••••••••••" : key.id}
                    </code>
                    {key.type === "secret" && (
                      <button
                        onClick={() => setShowSecret(!showSecret)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showSecret ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground/70 mr-2 font-light">{key.lastUsed}</span>
                <button
                  onClick={() => copyToClipboard(key.id, key.id)}
                  className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
                >
                  {copiedId === key.id ? (
                    <Check className="w-4 h-4 text-success" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                <button className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </SettingsSection>

      <SettingsSection title="Webhooks" description="Receive real-time event notifications">
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="p-3 rounded-xl bg-secondary mb-4">
            <Globe className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground mb-1 font-light">No webhooks configured</p>
          <p className="text-xs text-muted-foreground/70 mb-4 font-light">Add an endpoint to receive events</p>
          <Button
            variant="outline"
            className="border-border text-foreground hover:bg-secondary text-sm font-medium h-9 gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Webhook
          </Button>
        </div>
      </SettingsSection>

      <div className="flex items-center justify-between p-5 rounded-2xl bg-card border border-border">
        <div className="flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-secondary">
            <ExternalLink className="w-4 h-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm text-foreground font-medium">API Documentation</p>
            <p className="text-xs text-muted-foreground font-light">Learn how to integrate UNTRACED</p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="text-muted-foreground hover:text-foreground text-sm font-medium gap-2"
          asChild
        >
          <a href="https://docs.untraced.io" target="_blank" rel="noopener noreferrer">
            View Docs
            <ChevronRight className="w-4 h-4" />
          </a>
        </Button>
      </div>
    </>
  );
}

function SettingsSection({
  title,
  description,
  children,
  action,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between p-5 border-b border-border">
        <div>
          <h3 className="text-sm font-medium text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5 font-light">{description}</p>
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function SettingToggle({
  title,
  description,
  checked: initialChecked,
  disabled,
}: {
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
}) {
  const [checked, setChecked] = useState(initialChecked);

  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm text-foreground font-light">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5 font-light">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={setChecked} disabled={disabled} />
    </div>
  );
}
