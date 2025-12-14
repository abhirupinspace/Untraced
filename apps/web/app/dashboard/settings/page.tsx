"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
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
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="h-14 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="h-full px-6 flex items-center justify-center">
          <h1 className="text-lg font-normal text-white">Settings</h1>
        </div>
      </header>

      <div className="flex justify-center px-6 py-8">
        <div className="w-full max-w-2xl space-y-8">
          {/* Tab Navigation */}
          <div className="flex justify-center">
            <div className="inline-flex items-center p-1 bg-white/[0.03] rounded-xl border border-white/5">
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
                        ? "bg-white/10 text-white"
                        : "text-gray-500 hover:text-gray-300"
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
      <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-500/5 via-transparent to-transparent" />
        <div className="relative p-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-2xl bg-purple-500 flex items-center justify-center text-2xl font-medium text-white mb-4">
              {authenticated ? user?.wallet?.address?.slice(2, 4).toUpperCase() || "U" : "?"}
            </div>
            <h3 className="text-lg font-normal text-white mb-1">
              {displayName || "Unnamed User"}
            </h3>
            {authenticated && (
              <button
                onClick={copyAddress}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors"
              >
                <code className="font-mono">
                  {user?.wallet?.address?.slice(0, 6)}...{user?.wallet?.address?.slice(-4)}
                </code>
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-green-400" />
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
          <Button className="bg-white text-black hover:bg-gray-100 text-sm font-normal h-10 px-6">
            Save Changes
          </Button>
        </div>
      </SettingsSection>

      {/* Preferences */}
      <SettingsSection title="Preferences" description="Customize your experience">
        <div className="space-y-1">
          <SettingToggle
            title="Dark Mode"
            description="Always enabled for optimal viewing"
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
      <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.02] p-6">
        <div className="flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-red-500/10">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-normal text-white mb-1">Delete Account</h3>
            <p className="text-xs text-gray-500 mb-4">
              Permanently remove your account and all associated data. This action cannot be undone.
            </p>
            <Button
              variant="outline"
              className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 text-sm font-normal h-9"
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
        <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5">
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-purple-500/10">
              <Shield className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-white font-light">Enable 2FA</p>
              <p className="text-xs text-gray-500">Secure your account with TOTP</p>
            </div>
          </div>
          <Button
            variant="outline"
            className="border-white/10 text-gray-300 hover:text-white hover:bg-white/5 text-sm font-normal h-9"
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
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs h-8"
          >
            Revoke All
          </Button>
        }
      >
        <div className="space-y-2">
          {sessions.map((session, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5"
            >
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-white/5">
                  {session.type === "desktop" ? (
                    <Monitor className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Smartphone className="w-4 h-4 text-gray-400" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-white font-light">{session.device}</p>
                    {session.current && (
                      <span className="px-2 py-0.5 text-[10px] rounded-full bg-green-500/10 text-green-400">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {session.location} · {session.lastActive}
                  </p>
                </div>
              </div>
              {!session.current && (
                <button className="text-xs text-gray-500 hover:text-red-400 transition-colors">
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
          <Button className="bg-white text-black hover:bg-gray-100 text-sm font-normal h-9 gap-2">
            <Plus className="w-4 h-4" />
            New Key
          </Button>
        }
      >
        <div className="space-y-2">
          {apiKeys.map((key) => (
            <div
              key={key.id}
              className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5"
            >
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-white/5">
                  <Key className="w-4 h-4 text-gray-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-white font-light">{key.name}</p>
                    <span
                      className={cn(
                        "px-2 py-0.5 text-[10px] rounded-full",
                        key.type === "public"
                          ? "bg-white/10 text-gray-300"
                          : "bg-red-500/10 text-red-400"
                      )}
                    >
                      {key.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="text-xs text-gray-500 font-mono">
                      {key.type === "secret" && !showSecret ? "••••••••••••" : key.id}
                    </code>
                    {key.type === "secret" && (
                      <button
                        onClick={() => setShowSecret(!showSecret)}
                        className="text-gray-500 hover:text-white transition-colors"
                      >
                        {showSecret ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600 mr-2">{key.lastUsed}</span>
                <button
                  onClick={() => copyToClipboard(key.id, key.id)}
                  className="p-2 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-all"
                >
                  {copiedId === key.id ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                <button className="p-2 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </SettingsSection>

      <SettingsSection title="Webhooks" description="Receive real-time event notifications">
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="p-3 rounded-xl bg-white/5 mb-4">
            <Globe className="w-6 h-6 text-gray-500" />
          </div>
          <p className="text-sm text-gray-400 mb-1">No webhooks configured</p>
          <p className="text-xs text-gray-600 mb-4">Add an endpoint to receive events</p>
          <Button
            variant="outline"
            className="border-white/10 text-gray-300 hover:text-white hover:bg-white/5 text-sm font-normal h-9 gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Webhook
          </Button>
        </div>
      </SettingsSection>

      <div className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.02] border border-white/5">
        <div className="flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-white/5">
            <ExternalLink className="w-4 h-4 text-gray-400" />
          </div>
          <div>
            <p className="text-sm text-white font-light">API Documentation</p>
            <p className="text-xs text-gray-500">Learn how to integrate UNTRACED</p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="text-gray-400 hover:text-white text-sm font-normal gap-2"
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
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
      <div className="flex items-center justify-between p-5 border-b border-white/5">
        <div>
          <h3 className="text-sm font-normal text-white">{title}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
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
        <p className="text-sm text-white font-light">{title}</p>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={setChecked} disabled={disabled} />
    </div>
  );
}
