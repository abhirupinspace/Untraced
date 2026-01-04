"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { DashboardNavbar } from "@/components/dashboard/dashboard-navbar";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";
import {
  User,
  Bell,
  Shield,
  CreditCard,
  AlertTriangle,
  Check,
  Copy,
  Loader2,
  Zap,
  TrendingUp,
  Crown,
  Building2,
  ChevronRight,
  ExternalLink,
  Camera,
  X,
} from "lucide-react";
import Image from "next/image";
import {
  useSettings,
  PLAN_FEATURES,
  type UserSettings,
  type OrganizationInfo,
  type UsageInfo,
} from "@/lib/hooks";
import { cn } from "@/lib/cn";

type SettingsTab = "general" | "notifications" | "billing" | "security";

const tabs: { id: SettingsTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "general", label: "General", icon: User },
  { id: "billing", label: "Plan & Billing", icon: CreditCard },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const { data, loading, error, updateUser, isSaving, refetch } = useSettings();

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNavbar title="Settings" />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNavbar title="Settings" />
        <div className="flex flex-col items-center justify-center py-20">
          <AlertTriangle className="w-8 h-8 text-destructive mb-3" />
          <p className="text-sm text-muted-foreground mb-4">
            {error || "Failed to load settings"}
          </p>
          <Button onClick={refetch} variant="outline" size="sm">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
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
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {activeTab === "general" && (
              <GeneralSettings
                userData={data.user}
                onUpdate={updateUser}
                isSaving={isSaving}
              />
            )}
            {activeTab === "billing" && (
              <BillingSettings
                userData={data.user}
                organization={data.organization}
                usage={data.usage}
              />
            )}
            {activeTab === "notifications" && (
              <NotificationSettings
                settings={data.user.settings}
                onUpdate={updateUser}
                isSaving={isSaving}
              />
            )}
            {activeTab === "security" && <SecuritySettings />}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function GeneralSettings({
  userData,
  onUpdate,
  isSaving,
}: {
  userData: UserSettings;
  onUpdate: ReturnType<typeof useSettings>["updateUser"];
  isSaving: boolean;
}) {
  const [name, setName] = useState(userData.name || "");
  const [email, setEmail] = useState(userData.email || "");
  const [avatar, setAvatar] = useState(userData.avatar || "");
  const [copied, setCopied] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    setHasChanges(
      name !== (userData.name || "") ||
      email !== (userData.email || "") ||
      avatar !== (userData.avatar || "")
    );
  }, [name, email, avatar, userData]);

  const copyAddress = () => {
    navigator.clipboard.writeText(userData.walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/profile-photo", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Upload failed");
      }

      setAvatar(result.url);
      toast.success("Photo uploaded", {
        description: "Click Save Changes to update your profile.",
      });
    } catch (err) {
      toast.error("Upload failed", {
        description: err instanceof Error ? err.message : "Something went wrong",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = () => {
    setAvatar("");
    toast.info("Photo removed", {
      description: "Click Save Changes to update your profile.",
    });
  };

  const handleSave = async () => {
    const { success, error } = await onUpdate({ name, email, avatar });
    if (success) {
      toast.success("Settings saved", {
        description: "Your profile has been updated.",
      });
      setHasChanges(false);
    } else {
      toast.error("Failed to save", { description: error });
    }
  };

  return (
    <>
      {/* Profile Card */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card">
        <div className="relative p-6">
          <div className="flex flex-col items-center text-center">
            {/* Profile Photo with Upload */}
            <div className="relative group mb-4">
              {avatar ? (
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden">
                  <Image
                    src={avatar}
                    alt="Profile"
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl font-medium text-primary">
                  {userData.walletAddress?.slice(2, 4).toUpperCase() || "U"}
                </div>
              )}

              {/* Upload Overlay */}
              <label
                className={cn(
                  "absolute inset-0 flex items-center justify-center rounded-2xl cursor-pointer transition-all",
                  "bg-black/50 opacity-0 group-hover:opacity-100",
                  isUploading && "opacity-100"
                )}
              >
                {isUploading ? (
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                ) : (
                  <Camera className="w-6 h-6 text-white" />
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>

              {/* Remove Button */}
              {avatar && !isUploading && (
                <button
                  onClick={handleRemovePhoto}
                  className="absolute -top-2 -right-2 p-1 rounded-full bg-destructive text-white hover:bg-destructive/80 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            <h3 className="text-lg font-medium text-foreground mb-1">
              {name || "Unnamed User"}
            </h3>
            <button
              onClick={copyAddress}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-light"
            >
              <code className="font-mono">
                {userData.walletAddress?.slice(0, 6)}...
                {userData.walletAddress?.slice(-4)}
              </code>
              {copied ? (
                <Check className="w-3.5 h-3.5 text-success" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
            <div className="flex items-center gap-2 mt-3">
              <Badge
                variant={userData.plan === "free" ? "secondary" : "default"}
                className="text-xs"
              >
                {userData.plan.charAt(0).toUpperCase() + userData.plan.slice(1)} Plan
              </Badge>
              <span className="text-xs text-muted-foreground">
                Member since {new Date(userData.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Account Details */}
      <SettingsSection
        title="Account Details"
        description="Update your personal information"
      >
        <div className="space-y-4">
          <Input
            label="Display Name"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium h-10 px-6"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </SettingsSection>

      {/* Danger Zone */}
      <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6">
        <div className="flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-destructive/10">
            <AlertTriangle className="w-5 h-5 text-destructive" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-foreground mb-1">
              Delete Account
            </h3>
            <p className="text-xs text-muted-foreground mb-4 font-light">
              Permanently remove your account and all associated data. This
              action cannot be undone.
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

function BillingSettings({
  userData,
  organization,
  usage,
}: {
  userData: UserSettings;
  organization: OrganizationInfo;
  usage: UsageInfo;
}) {
  const currentPlan = PLAN_FEATURES[organization.plan];
  const isUnlimited = (value: number) => value === -1;

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0;
    return Math.min((used / limit) * 100, 100);
  };

  return (
    <>
      {/* Current Plan */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-medium text-foreground">
                  {currentPlan.name} Plan
                </h3>
                {organization.plan !== "free" && (
                  <Badge variant="default" className="text-xs">
                    Active
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground font-light">
                {currentPlan.description}
              </p>
            </div>
            {currentPlan.price > 0 && (
              <div className="text-right">
                <p className="text-2xl font-medium text-foreground">
                  ${currentPlan.price}
                </p>
                <p className="text-xs text-muted-foreground">/month</p>
              </div>
            )}
          </div>

          {/* Usage Stats */}
          <div className="space-y-4">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Current Usage
            </h4>

            <UsageBar
              label="Projects"
              used={usage.projects}
              limit={usage.limits.maxProjects}
              icon={Building2}
            />

            <UsageBar
              label="Verifications this month"
              used={usage.verificationsThisMonth}
              limit={usage.limits.maxVerificationsPerMonth}
              icon={Zap}
            />

            <UsageBar
              label="Flows"
              used={usage.flows}
              limit={usage.limits.maxFlows * usage.projects || usage.limits.maxFlows}
              icon={TrendingUp}
            />
          </div>
        </div>
      </div>

      {/* Upgrade Options */}
      {organization.plan !== "enterprise" && (
        <SettingsSection
          title="Upgrade Your Plan"
          description="Get more out of UNTRACED with a premium plan"
        >
          <div className="grid gap-4">
            {(["pro", "enterprise"] as const)
              .filter((plan) => plan !== organization.plan)
              .map((planKey) => {
                const plan = PLAN_FEATURES[planKey];
                return (
                  <div
                    key={planKey}
                    className={cn(
                      "relative p-5 rounded-xl border transition-all",
                      planKey === "pro"
                        ? "border-primary/30 bg-primary/5"
                        : "border-border bg-secondary/30"
                    )}
                  >
                    {planKey === "pro" && (
                      <div className="absolute -top-2.5 left-4">
                        <Badge className="bg-primary text-primary-foreground text-[10px]">
                          Recommended
                        </Badge>
                      </div>
                    )}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {planKey === "enterprise" ? (
                            <Crown className="w-4 h-4 text-amber-500" />
                          ) : (
                            <Zap className="w-4 h-4 text-primary" />
                          )}
                          <h4 className="text-sm font-medium text-foreground">
                            {plan.name}
                          </h4>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">
                          {plan.description}
                        </p>
                        <ul className="space-y-1.5">
                          {plan.features.slice(0, 4).map((feature, i) => (
                            <li
                              key={i}
                              className="flex items-center gap-2 text-xs text-muted-foreground"
                            >
                              <Check className="w-3 h-3 text-success" />
                              {feature}
                            </li>
                          ))}
                          {plan.features.length > 4 && (
                            <li className="text-xs text-muted-foreground/70">
                              +{plan.features.length - 4} more features
                            </li>
                          )}
                        </ul>
                      </div>
                      <div className="text-right">
                        {plan.price > 0 ? (
                          <>
                            <p className="text-xl font-medium text-foreground">
                              ${plan.price}
                            </p>
                            <p className="text-[10px] text-muted-foreground mb-3">
                              /month
                            </p>
                          </>
                        ) : (
                          <p className="text-sm font-medium text-foreground mb-3">
                            Custom
                          </p>
                        )}
                        <Button
                          size="sm"
                          variant={planKey === "pro" ? "default" : "outline"}
                          className="text-xs h-8"
                        >
                          {planKey === "enterprise" ? "Contact Sales" : "Upgrade"}
                          <ChevronRight className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </SettingsSection>
      )}

      {/* Billing History */}
      <SettingsSection
        title="Billing History"
        description="View your past invoices and payments"
      >
        <div className="text-center py-8">
          <CreditCard className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground font-light">
            No billing history yet
          </p>
          <p className="text-xs text-muted-foreground/70">
            Invoices will appear here after your first payment
          </p>
        </div>
      </SettingsSection>
    </>
  );
}

function UsageBar({
  label,
  used,
  limit,
  icon: Icon,
}: {
  label: string;
  used: number;
  limit: number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  const isUnlimited = limit === -1;
  const percentage = isUnlimited ? 0 : Math.min((used / limit) * 100, 100);
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
        <span className="text-xs font-medium text-foreground">
          {used.toLocaleString()}
          {!isUnlimited && (
            <span className="text-muted-foreground">
              {" "}
              / {limit.toLocaleString()}
            </span>
          )}
          {isUnlimited && (
            <span className="text-muted-foreground"> (Unlimited)</span>
          )}
        </span>
      </div>
      {!isUnlimited && (
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              isAtLimit
                ? "bg-destructive"
                : isNearLimit
                ? "bg-warning"
                : "bg-primary"
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </div>
  );
}

function NotificationSettings({
  settings,
  onUpdate,
  isSaving,
}: {
  settings: { notifications: boolean; timezone: string };
  onUpdate: ReturnType<typeof useSettings>["updateUser"];
  isSaving: boolean;
}) {
  const [notifications, setNotifications] = useState(settings.notifications);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [failedVerifications, setFailedVerifications] = useState(true);
  const [rateLimitWarnings, setRateLimitWarnings] = useState(true);
  const [newFeatures, setNewFeatures] = useState(false);

  const handleNotificationsChange = async (value: boolean) => {
    setNotifications(value);
    const { success, error } = await onUpdate({
      settings: { notifications: value },
    });
    if (success) {
      toast.success("Notifications updated");
    } else {
      toast.error("Failed to update", { description: error });
      setNotifications(!value);
    }
  };

  return (
    <>
      <SettingsSection
        title="Email Notifications"
        description="Manage your email preferences"
      >
        <div className="space-y-1">
          <SettingToggle
            title="All Notifications"
            description="Receive notifications via email"
            checked={notifications}
            onCheckedChange={handleNotificationsChange}
            disabled={isSaving}
          />
          <SettingToggle
            title="Security Alerts"
            description="Important security-related notifications"
            checked={securityAlerts}
            onCheckedChange={setSecurityAlerts}
            disabled={!notifications}
          />
          <SettingToggle
            title="Weekly Digest"
            description="Summary of your weekly activity"
            checked={weeklyDigest}
            onCheckedChange={setWeeklyDigest}
            disabled={!notifications}
          />
        </div>
      </SettingsSection>

      <SettingsSection
        title="Product Alerts"
        description="Stay updated on your projects"
      >
        <div className="space-y-1">
          <SettingToggle
            title="Failed Verifications"
            description="Get notified when verifications fail"
            checked={failedVerifications}
            onCheckedChange={setFailedVerifications}
            disabled={!notifications}
          />
          <SettingToggle
            title="Rate Limit Warnings"
            description="Alert when approaching API limits"
            checked={rateLimitWarnings}
            onCheckedChange={setRateLimitWarnings}
            disabled={!notifications}
          />
          <SettingToggle
            title="New Features"
            description="Updates about new features and improvements"
            checked={newFeatures}
            onCheckedChange={setNewFeatures}
            disabled={!notifications}
          />
        </div>
      </SettingsSection>
    </>
  );
}

function SecuritySettings() {
  return (
    <>
      <SettingsSection
        title="Two-Factor Authentication"
        description="Add an extra layer of security"
      >
        <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border border-border">
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-foreground font-light">Enable 2FA</p>
              <p className="text-xs text-muted-foreground font-light">
                Secure your account with TOTP
              </p>
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
        title="Connected Wallet"
        description="Your primary authentication method"
      >
        <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border border-border">
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-secondary">
              <Shield className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-foreground font-light">
                Ethereum Wallet
              </p>
              <p className="text-xs text-muted-foreground font-light">
                Primary authentication via Privy
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs">
            Connected
          </Badge>
        </div>
      </SettingsSection>

      <div className="flex items-center justify-between p-5 rounded-2xl bg-card border border-border">
        <div className="flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-secondary">
            <ExternalLink className="w-4 h-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm text-foreground font-medium">
              Security Best Practices
            </p>
            <p className="text-xs text-muted-foreground font-light">
              Learn how to keep your account secure
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="text-muted-foreground hover:text-foreground text-sm font-medium gap-2"
          asChild
        >
          <a
            href="https://docs.untraced.io/security"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn More
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
          <p className="text-xs text-muted-foreground mt-0.5 font-light">
            {description}
          </p>
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
  checked,
  onCheckedChange,
  disabled,
}: {
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between py-3",
        disabled && "opacity-50"
      )}
    >
      <div>
        <p className="text-sm text-foreground font-light">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5 font-light">
          {description}
        </p>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange ?? (() => {})}
        disabled={disabled}
      />
    </div>
  );
}
