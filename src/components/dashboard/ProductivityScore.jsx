/**
 * ProductivityScore.jsx
 * Dashboard card showing the user's productivity score and task breakdown.
 * Derived entirely from local analysis via taskAnalyzer.js — no Gemini, no Firebase.
 */

import { useEffect, useState } from "react";
import { TrendingUp, CheckCircle2, Clock } from "lucide-react";
import { useTasks } from "@/hooks/useTasks";
import { analyzeTasks } from "@/utils/taskAnalyzer";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Maps a productivity score (0-100) to a status label and color tokens.
 *
 * @param {number} score
 * @returns {{ label: string, ring: string, text: string, chipBg: string }}
 */
function getStatus(score) {
  if (score >= 90) {
    return {
      label: "Excellent",
      ring: "stroke-green-500",
      text: "text-green-500",
      chipBg: "bg-green-500/10",
    };
  }
  if (score >= 70) {
    return {
      label: "Good",
      ring: "stroke-blue-500",
      text: "text-blue-500",
      chipBg: "bg-blue-500/10",
    };
  }
  if (score >= 50) {
    return {
      label: "Average",
      ring: "stroke-yellow-500",
      text: "text-yellow-500",
      chipBg: "bg-yellow-500/10",
    };
  }
  return {
    label: "Needs Attention",
    ring: "stroke-red-500",
    text: "text-red-500",
    chipBg: "bg-red-500/10",
  };
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/**
 * Circular SVG progress ring representing the productivity score.
 */
function ScoreRing({ score, status }) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 100);

    return () => clearTimeout(timer);
  }, [score]);

  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset =
    circumference - (animatedScore / 100) * circumference;

  return (
    <div className="relative flex h-32 w-32 shrink-0 items-center justify-center">
      <svg
        viewBox="0 0 120 120"
        className="h-32 w-32 -rotate-90"
      >
        {/* Track */}
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          strokeWidth="10"
          className="stroke-muted"
        />

        {/* Progress */}
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={`${status.ring} transition-[stroke-dashoffset] duration-700 ease-out`}
        />
      </svg>

      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold tracking-tight text-foreground">
          {animatedScore}
        </span>
        <span className="text-xs text-muted-foreground">/ 100</span>
      </div>
    </div>
  );
}

/**
 * Small statistic chip (e.g. Pending, Completed).
 */
function StatChip({ icon: Icon, label, value, accent }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl bg-muted px-3 py-2.5 transition-colors duration-150 hover:bg-muted/70">
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${accent.iconBg}`}>
        <Icon className={`h-4 w-4 ${accent.iconColor}`} />
      </div>
      <div className="min-w-0">
        <p className="text-base font-bold leading-none text-foreground">{value}</p>
        <p className="mt-0.5 text-xs text-muted-foreground truncate">{label}</p>
      </div>
    </div>
  );
}

/**
 * Loading skeleton shown while tasks are being fetched.
 */
function ProductivityScoreSkeleton() {
  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-5 flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-4 w-36 rounded bg-muted animate-pulse" />
          <div className="h-3 w-28 rounded bg-muted animate-pulse" />
        </div>
        <div className="h-5 w-5 rounded bg-muted animate-pulse" />
      </div>

      <div className="flex items-center justify-center py-2">
        <div className="h-32 w-32 rounded-full bg-muted animate-pulse" />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="h-14 rounded-xl bg-muted animate-pulse" />
        <div className="h-14 rounded-xl bg-muted animate-pulse" />
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function ProductivityScore() {
  const { tasks, loading } = useTasks();

  if (loading) {
    return <ProductivityScoreSkeleton />;
  }

  const analysis = analyzeTasks(tasks);
  const { completedTasks, pendingTasks, productivityScore } = analysis;

  const totalTasks = completedTasks.length + pendingTasks.length;
  const completionPercentage =
    totalTasks === 0 ? 0 : Math.round((completedTasks.length / totalTasks) * 100);

  const status = getStatus(productivityScore);

  return (
    <section className="group rounded-2xl border border-border bg-card p-5 transition-all duration-200 hover:shadow-md hover:border-border/80">
      {/* ── Header ── */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground">Productivity Score</h3>
          <p className="text-sm text-muted-foreground">Based on your activity</p>
        </div>
        <TrendingUp className="size-5 text-primary transition-transform duration-200 group-hover:scale-110" />
      </div>

      {/* ── Score ring + status ── */}
      <div className="flex flex-col items-center gap-2 py-2">
        <ScoreRing score={productivityScore} status={status} />
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.chipBg} ${status.text}`}
        >
          {status.label}
        </span>
        <p className="text-xs text-muted-foreground">
          {completionPercentage}% of tasks completed
        </p>
        <p className="mt-1 text-center text-xs text-muted-foreground">
          {productivityScore >= 90 &&
            "Outstanding consistency. Keep it up!"}

          {productivityScore >= 70 &&
            productivityScore < 90 &&
            "You're doing well. Stay consistent."}

          {productivityScore >= 50 &&
            productivityScore < 70 &&
            "A little more focus will improve your productivity."}

          {productivityScore < 50 &&
            "Complete a few tasks to boost your score."}
        </p>
      </div>

      {/* ── Stat chips ── */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        <StatChip
          icon={Clock}
          label="Pending"
          value={pendingTasks.length}
          accent={{ iconBg: "bg-blue-500/10", iconColor: "text-blue-500" }}
        />
        <StatChip
          icon={CheckCircle2}
          label="Completed"
          value={completedTasks.length}
          accent={{ iconBg: "bg-green-500/10", iconColor: "text-green-500" }}
        />
      </div>
    </section>
  );
}