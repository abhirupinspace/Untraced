"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { NumberTicker } from "@/components/ui/number-ticker";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/cn";
import {
  Activity,
  Users,
  Shield,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  Globe,
  Zap,
  BarChart3,
} from "lucide-react";

// Mock data
const stats = {
  totalVerifications: 12847,
  successRate: 94.2,
  activeUsers: 1243,
  avgResponseTime: 1.2,
};

const weeklyData = [
  { day: "Mon", verifications: 1820, success: 1712 },
  { day: "Tue", verifications: 2140, success: 2018 },
  { day: "Wed", verifications: 1960, success: 1842 },
  { day: "Thu", verifications: 2380, success: 2244 },
  { day: "Fri", verifications: 2560, success: 2410 },
  { day: "Sat", verifications: 1240, success: 1168 },
  { day: "Sun", verifications: 747, success: 703 },
];

const moduleStats = [
  { name: "Age Verification", verifications: 4521, success: 98.2, color: "bg-purple-500" },
  { name: "Email Verification", verifications: 3842, success: 96.8, color: "bg-blue-500" },
  { name: "GitHub OAuth", verifications: 2156, success: 99.1, color: "bg-green-500" },
  { name: "Twitter OAuth", verifications: 1328, success: 91.4, color: "bg-cyan-500" },
  { name: "Balance Check", verifications: 1000, success: 87.3, color: "bg-orange-500" },
];

const recentActivity = [
  { id: 1, type: "success", module: "Age Verification", time: "2m", region: "US" },
  { id: 2, type: "success", module: "Email Verification", time: "5m", region: "EU" },
  { id: 3, type: "failed", module: "Balance Check", time: "8m", region: "APAC" },
  { id: 4, type: "success", module: "GitHub OAuth", time: "12m", region: "US" },
  { id: 5, type: "success", module: "Twitter OAuth", time: "15m", region: "EU" },
];

const timeRanges = ["24h", "7d", "30d", "90d"];

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("7d");

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="h-14 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="h-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-normal text-white">Analytics</h1>
            <Badge variant="secondary" className="text-[10px]">Beta</Badge>
          </div>
          <div className="inline-flex items-center p-1 bg-white/[0.03] rounded-lg border border-white/5">
            {timeRanges.map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={cn(
                  "px-3 py-1.5 text-xs font-light rounded-md transition-all duration-200",
                  timeRange === range
                    ? "bg-white/10 text-white"
                    : "text-gray-500 hover:text-gray-300"
                )}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Verifications"
            value={stats.totalVerifications}
            icon={Activity}
            trend={{ direction: "up", value: "+12.5%" }}
          />
          <StatCard
            title="Success Rate"
            value={stats.successRate}
            suffix="%"
            icon={Shield}
            trend={{ direction: "up", value: "+2.1%" }}
          />
          <StatCard
            title="Active Users"
            value={stats.activeUsers}
            icon={Users}
            trend={{ direction: "up", value: "+8.3%" }}
          />
          <StatCard
            title="Avg Response"
            value={stats.avgResponseTime}
            suffix="s"
            icon={Clock}
            trend={{ direction: "down", value: "-15%" }}
            trendPositive
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart Section */}
          <div className="lg:col-span-2 rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <div>
                <h3 className="text-sm font-normal text-white">Weekly Overview</h3>
                <p className="text-xs text-gray-500 mt-0.5">Verification activity</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-white/20" />
                  <span className="text-xs text-gray-500">Total</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500" />
                  <span className="text-xs text-gray-500">Success</span>
                </div>
              </div>
            </div>
            <div className="p-5">
              <BarChart data={weeklyData} />
            </div>
          </div>

          {/* Activity Feed */}
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <h3 className="text-sm font-normal text-white">Live Activity</h3>
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
                <span className="text-xs text-gray-500">Live</span>
              </div>
            </div>
            <div className="divide-y divide-white/5">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-4">
                  <div
                    className={cn(
                      "p-1.5 rounded-lg",
                      activity.type === "success" ? "bg-green-500/10" : "bg-red-500/10"
                    )}
                  >
                    {activity.type === "success" ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-red-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white truncate">{activity.module}</p>
                    <p className="text-[10px] text-gray-600">{activity.region}</p>
                  </div>
                  <span className="text-[10px] text-gray-500">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Module Performance */}
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-white/5">
            <div>
              <h3 className="text-sm font-normal text-white">Module Performance</h3>
              <p className="text-xs text-gray-500 mt-0.5">Success rates by module</p>
            </div>
            <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-white transition-colors">
              View all
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          <div className="p-5">
            <div className="grid gap-4">
              {moduleStats.map((module, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className={cn("w-1 h-8 rounded-full", module.color)} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-white font-light">{module.name}</span>
                        <span className="text-xs text-gray-600">
                          {module.verifications.toLocaleString()}
                        </span>
                      </div>
                      <span
                        className={cn(
                          "text-sm font-light tabular-nums",
                          module.success >= 95
                            ? "text-green-400"
                            : module.success >= 90
                            ? "text-yellow-400"
                            : "text-red-400"
                        )}
                      >
                        {module.success}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all duration-500", module.color)}
                        style={{ width: `${module.success}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MiniStatCard
            icon={Globe}
            title="Top Regions"
            items={[
              { label: "United States", value: "42%" },
              { label: "Europe", value: "31%" },
              { label: "Asia Pacific", value: "27%" },
            ]}
          />
          <MiniStatCard
            icon={Clock}
            title="Peak Hours"
            items={[
              { label: "2:00 PM - 4:00 PM", value: "2.4k" },
              { label: "10:00 AM - 12:00 PM", value: "2.1k" },
              { label: "6:00 PM - 8:00 PM", value: "1.8k" },
            ]}
          />
          <MiniStatCard
            icon={TrendingUp}
            title="Growth"
            items={[
              { label: "New Users", value: "+156", positive: true },
              { label: "Verifications", value: "+2.4k", positive: true },
              { label: "API Calls", value: "+12.8k", positive: true },
            ]}
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  suffix,
  icon: Icon,
  trend,
  trendPositive,
}: {
  title: string;
  value: number;
  suffix?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: { direction: "up" | "down"; value: string };
  trendPositive?: boolean;
}) {
  const isPositive = trendPositive ?? trend?.direction === "up";

  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="p-2.5 rounded-xl bg-white/5">
          <Icon className="w-4 h-4 text-gray-400" />
        </div>
        {trend && (
          <div
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-full text-[10px]",
              isPositive ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
            )}
          >
            {trend.direction === "up" ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {trend.value}
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-1">
        <NumberTicker
          value={value}
          className="text-2xl font-normal text-white tabular-nums"
          decimalPlaces={suffix === "%" || suffix === "s" ? 1 : 0}
        />
        {suffix && <span className="text-sm text-gray-500">{suffix}</span>}
      </div>
      <p className="text-xs text-gray-500 mt-1">{title}</p>
    </div>
  );
}

function BarChart({ data }: { data: typeof weeklyData }) {
  const maxValue = Math.max(...data.map((d) => d.verifications));

  return (
    <div className="flex items-end justify-between gap-3 h-44">
      {data.map((item, index) => {
        const totalHeight = (item.verifications / maxValue) * 100;
        const successHeight = (item.success / maxValue) * 100;

        return (
          <div key={index} className="flex-1 flex flex-col items-center gap-3 group">
            <div className="relative w-full h-36 flex items-end">
              {/* Background bar */}
              <div
                className="absolute bottom-0 w-full bg-white/[0.03] rounded-lg transition-all duration-300"
                style={{ height: `${totalHeight}%` }}
              />
              {/* Success bar */}
              <div
                className="absolute bottom-0 w-full bg-purple-500/60 group-hover:bg-purple-500/80 rounded-lg transition-all duration-300"
                style={{ height: `${successHeight}%` }}
              />
              {/* Hover tooltip */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-white/10 backdrop-blur-sm px-2 py-1 rounded text-[10px] text-white whitespace-nowrap">
                  {item.success.toLocaleString()}
                </div>
              </div>
            </div>
            <span className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">
              {item.day}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function MiniStatCard({
  icon: Icon,
  title,
  items,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  items: { label: string; value: string; positive?: boolean }[];
}) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-white/5">
          <Icon className="w-4 h-4 text-gray-400" />
        </div>
        <span className="text-sm text-white font-light">{title}</span>
      </div>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-xs text-gray-500">{item.label}</span>
            <span
              className={cn(
                "text-xs tabular-nums",
                item.positive ? "text-green-400" : "text-white"
              )}
            >
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
