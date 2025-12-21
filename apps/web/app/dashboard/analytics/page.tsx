"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { SimpleTooltip } from "@/components/ui/tooltip";
import { DashboardNavbar } from "@/components/dashboard/dashboard-navbar";
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
  Zap,
  Globe,
  Calendar,
  Mail,
  Github,
  Wallet,
} from "lucide-react";

// Mock data
const stats = {
  totalVerifications: 12847,
  successRate: 94.2,
  activeUsers: 1243,
  avgResponseTime: 1.2,
};

const sparklineData = [65, 78, 52, 85, 92, 73, 88, 95, 68, 82, 91, 76];
const successSparkline = [88, 91, 89, 94, 92, 95, 93, 96, 94, 95, 94, 94];

const weeklyData = [
  { day: "M", verifications: 1820, success: 1712 },
  { day: "T", verifications: 2140, success: 2018 },
  { day: "W", verifications: 1960, success: 1842 },
  { day: "T", verifications: 2380, success: 2244 },
  { day: "F", verifications: 2560, success: 2410 },
  { day: "S", verifications: 1240, success: 1168 },
  { day: "S", verifications: 747, success: 703 },
];

const moduleStats = [
  { name: "Age", icon: Calendar, verifications: 4521, success: 98.2, color: "text-purple-500", bg: "bg-purple-500" },
  { name: "Email", icon: Mail, verifications: 3842, success: 96.8, color: "text-blue-500", bg: "bg-blue-500" },
  { name: "GitHub", icon: Github, verifications: 2156, success: 99.1, color: "text-emerald-500", bg: "bg-emerald-500" },
  { name: "Balance", icon: Wallet, verifications: 1000, success: 87.3, color: "text-orange-500", bg: "bg-orange-500" },
];

const recentActivity = [
  { id: 1, type: "success", module: "Age", time: "2m", region: "US" },
  { id: 2, type: "success", module: "Email", time: "5m", region: "EU" },
  { id: 3, type: "failed", module: "Balance", time: "8m", region: "APAC" },
  { id: 4, type: "success", module: "GitHub", time: "12m", region: "US" },
  { id: 5, type: "success", module: "Email", time: "15m", region: "EU" },
];

const regions = [
  { name: "US", value: 42, flag: "🇺🇸" },
  { name: "EU", value: 31, flag: "🇪🇺" },
  { name: "APAC", value: 27, flag: "🌏" },
];

const timeRanges = ["24h", "7d", "30d"];

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("7d");

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar title="Analytics">
        <Badge variant="secondary" className="text-[9px] px-1.5 py-0">Beta</Badge>
        <div className="ml-auto mr-4">
          <div className="inline-flex items-center p-0.5 bg-secondary rounded-md border border-border">
            {timeRanges.map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={cn(
                  "px-2.5 py-1 text-[11px] font-light rounded transition-all",
                  timeRange === range
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </DashboardNavbar>

      <div className="p-6 flex justify-center">
        <div className="w-full max-w-4xl space-y-4">
          {/* Top Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <MetricCard
              label="Verifications"
              value={stats.totalVerifications.toLocaleString()}
              trend="+12.5%"
              trendUp
              sparkline={sparklineData}
              color="primary"
            />
            <MetricCard
              label="Success Rate"
              value={`${stats.successRate}%`}
              trend="+2.1%"
              trendUp
              ring={stats.successRate}
              color="success"
            />
            <MetricCard
              label="Active Users"
              value={stats.activeUsers.toLocaleString()}
              trend="+8.3%"
              trendUp
              icon={Users}
              color="primary"
            />
            <MetricCard
              label="Avg Response"
              value={`${stats.avgResponseTime}s`}
              trend="-15%"
              trendUp
              icon={Zap}
              color="warning"
            />
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
            {/* Chart */}
            <Card variant="bordered" padding="none" className="lg:col-span-3 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <span className="text-xs font-medium text-foreground">Weekly Activity</span>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
                    <span className="text-[10px] text-muted-foreground">Total</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span className="text-[10px] text-muted-foreground">Success</span>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <MiniBarChart data={weeklyData} />
              </div>
            </Card>

            {/* Live Activity */}
            <Card variant="bordered" padding="none" className="lg:col-span-2 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <span className="text-xs font-medium text-foreground">Live</span>
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-success" />
                </span>
              </div>
              <div className="divide-y divide-border">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-2.5 px-4 py-2.5">
                    {activity.type === "success" ? (
                      <CheckCircle2 className="w-3 h-3 text-success" />
                    ) : (
                      <XCircle className="w-3 h-3 text-destructive" />
                    )}
                    <span className="text-xs text-foreground font-light flex-1">{activity.module}</span>
                    <span className="text-[10px] text-muted-foreground">{activity.region}</span>
                    <span className="text-[10px] text-muted-foreground/60">{activity.time}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {/* Module Performance */}
            <Card variant="bordered" padding="none" className="lg:col-span-2 overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <span className="text-xs font-medium text-foreground">Module Performance</span>
              </div>
              <div className="p-3">
                <div className="grid grid-cols-2 gap-2">
                  {moduleStats.map((module) => {
                    const Icon = module.icon;
                    return (
                      <div
                        key={module.name}
                        className="flex items-center gap-2.5 p-2.5 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                      >
                        <div className={cn("p-1.5 rounded-md bg-background", module.color)}>
                          <Icon className="w-3 h-3" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-foreground font-light">{module.name}</span>
                            <span className={cn(
                              "text-[10px] font-medium tabular-nums",
                              module.success >= 95 ? "text-success" : module.success >= 90 ? "text-warning" : "text-destructive"
                            )}>
                              {module.success}%
                            </span>
                          </div>
                          <div className="h-1 bg-background rounded-full overflow-hidden">
                            <div
                              className={cn("h-full rounded-full transition-all", module.bg)}
                              style={{ width: `${module.success}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>

            {/* Regions */}
            <Card variant="bordered" padding="none" className="overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <span className="text-xs font-medium text-foreground">Top Regions</span>
              </div>
              <div className="p-3 space-y-2">
                {regions.map((region) => (
                  <div key={region.name} className="flex items-center gap-2.5">
                    <span className="text-sm">{region.flag}</span>
                    <span className="text-xs text-foreground font-light flex-1">{region.name}</span>
                    <div className="w-16 h-1 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${region.value}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground tabular-nums w-8 text-right">
                      {region.value}%
                    </span>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2.5 border-t border-border bg-secondary/30">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">Peak: 2-4 PM UTC</span>
                  <span className="text-[10px] text-muted-foreground">2.4k/hr</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// Compact Metric Card
function MetricCard({
  label,
  value,
  trend,
  trendUp,
  sparkline,
  ring,
  icon: Icon,
  color = "primary",
}: {
  label: string;
  value: string;
  trend: string;
  trendUp?: boolean;
  sparkline?: number[];
  ring?: number;
  icon?: React.ComponentType<{ className?: string }>;
  color?: "primary" | "success" | "warning";
}) {
  return (
    <Card variant="bordered" padding="none" className="p-3">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-[10px] text-muted-foreground mb-0.5">{label}</p>
          <p className="text-lg font-medium text-foreground tabular-nums">{value}</p>
        </div>
        {sparkline && <Sparkline data={sparkline} color={color} />}
        {ring && <RingProgress value={ring} size={36} />}
        {Icon && (
          <div className={cn(
            "p-1.5 rounded-md",
            color === "success" ? "bg-success/10 text-success" :
            color === "warning" ? "bg-warning/10 text-warning" :
            "bg-primary/10 text-primary"
          )}>
            <Icon className="w-3.5 h-3.5" />
          </div>
        )}
      </div>
      <div className={cn(
        "flex items-center gap-1 text-[10px] font-medium",
        trendUp ? "text-success" : "text-destructive"
      )}>
        {trendUp ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
        {trend}
        <span className="text-muted-foreground font-light ml-0.5">vs last period</span>
      </div>
    </Card>
  );
}

// Mini Sparkline
function Sparkline({ data, color = "primary" }: { data: number[]; color?: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 48;
  const height = 24;
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width={width} height={height} className="opacity-60">
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
        className={cn(
          color === "success" ? "text-success" :
          color === "warning" ? "text-warning" :
          "text-primary"
        )}
      />
    </svg>
  );
}

// Ring Progress
function RingProgress({ value, size = 40 }: { value: number; size?: number }) {
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-secondary"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-success transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[8px] font-medium text-foreground tabular-nums">{Math.round(value)}</span>
      </div>
    </div>
  );
}

// Mini Bar Chart
function MiniBarChart({ data }: { data: typeof weeklyData }) {
  const maxValue = Math.max(...data.map((d) => d.verifications));

  return (
    <div className="flex items-end justify-between gap-2 h-28">
      {data.map((item, index) => {
        const totalHeight = (item.verifications / maxValue) * 100;
        const successHeight = (item.success / maxValue) * 100;
        const successRate = Math.round((item.success / item.verifications) * 100);

        return (
          <SimpleTooltip
            key={index}
            content={`${item.success.toLocaleString()} / ${item.verifications.toLocaleString()} (${successRate}%)`}
          >
            <div className="flex-1 flex flex-col items-center gap-2 group cursor-default">
              <div className="relative w-full h-20 flex items-end">
                <div
                  className="absolute bottom-0 w-full bg-secondary rounded transition-all"
                  style={{ height: `${totalHeight}%` }}
                />
                <div
                  className="absolute bottom-0 w-full bg-primary/60 group-hover:bg-primary rounded transition-all"
                  style={{ height: `${successHeight}%` }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground group-hover:text-foreground transition-colors">
                {item.day}
              </span>
            </div>
          </SimpleTooltip>
        );
      })}
    </div>
  );
}
