/**
 * AISummary.jsx
 * Dashboard summary card showing key task metrics derived from analyzeTasks().
 * No Gemini calls — pure local analysis via taskAnalyzer.js.
 */

import { useNavigate } from "react-router-dom";
import { ArrowRight, Brain, Clock, AlertTriangle, Flame, TrendingUp } from "lucide-react";
import { useTasks } from "@/hooks/useTasks";
import { analyzeTasks } from "@/utils/taskAnalyzer";
import { ROUTES } from "@/constants/routes";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Generates a short, human-readable recommendation based on the task analysis.
 *
 * @param {Object} analysis - Result of analyzeTasks()
 * @returns {string}
 */
function getRecommendation(analysis) {
  const { overdueTasks, highPriorityTasks, pendingTasks, productivityScore, workloadScore } = analysis;

  if (overdueTasks.length > 0) {
    return overdueTasks.length === 1
      ? "You have 1 overdue task. Tackle it first to get back on track."
      : `You have ${overdueTasks.length} overdue tasks. Consider clearing these before taking on new work.`;
  }

  if (highPriorityTasks.length > 0) {
    return `${highPriorityTasks.length} high priority ${highPriorityTasks.length === 1 ? "task needs" : "tasks need"} your attention today.`;
  }

  if (workloadScore >= 70) {
    return "Your workload is heavy right now. Consider rescheduling lower-priority tasks.";
  }

  if (productivityScore >= 80) {
    return "Great momentum! You're completing tasks faster than they're piling up.";
  }

  if (pendingTasks.length === 0) {
    return "You're all caught up. Nice work staying on top of things.";
  }

  return "Steady progress. Keep chipping away at your pending tasks.";
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/**
 * Single stat tile within the summary grid.
 */
function StatTile({ icon: Icon, label, value, accent }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-muted px-3 py-3 transition-colors duration-150 hover:bg-muted/70">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${accent.iconBg}`}>
        <Icon className={`h-4 w-4 ${accent.iconColor}`} />
      </div>
      <div className="min-w-0">
        <p className="text-lg font-bold leading-none text-foreground">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground truncate">{label}</p>
      </div>
    </div>
  );
}

/**
 * Loading skeleton shown while tasks are being fetched.
 */
function AISummarySkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-5">
        <div className="h-9 w-9 rounded-xl bg-muted animate-pulse" />
        <div className="space-y-2">
          <div className="h-3.5 w-24 rounded bg-muted animate-pulse" />
          <div className="h-3 w-32 rounded bg-muted animate-pulse" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
        ))}
      </div>

      <div className="h-12 rounded-xl bg-muted animate-pulse mb-5" />
      <div className="h-9 w-full rounded-lg bg-muted animate-pulse" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function AISummary() {
  const { tasks, loading } = useTasks();
  const navigate = useNavigate();

  if (loading) {
    return <AISummarySkeleton />;
  }

  const analysis = analyzeTasks(tasks);
  if (tasks.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">AI Summary</h2>
        </div>
  
        <div className="rounded-xl bg-muted p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Create a few tasks and I'll generate productivity insights for you.
          </p>
        </div>
      </div>
    );
  }
  const {
    pendingTasks,
    overdueTasks,
    highPriorityTasks,
    productivityScore,
  } = analysis;

  const recommendation = getRecommendation(analysis);

  return (
    <div className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:shadow-md hover:border-border/80">
      {/* ── Header ── */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 transition-transform duration-200 group-hover:scale-105">
          <Brain className="h-4.5 w-4.5 text-primary" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-foreground leading-tight">
            AI Summary
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Snapshot of your current workload
          </p>
        </div>
      </div>

      {/* ── Stat grid ── */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <StatTile
          icon={Clock}
          label="Pending"
          value={pendingTasks.length}
          accent={{ iconBg: "bg-blue-500/10", iconColor: "text-blue-500" }}
        />
        <StatTile
          icon={AlertTriangle}
          label="Overdue"
          value={overdueTasks.length}
          accent={{ iconBg: "bg-red-500/10", iconColor: "text-red-500" }}
        />
        <StatTile
          icon={Flame}
          label="High Priority"
          value={highPriorityTasks.length}
          accent={{ iconBg: "bg-orange-500/10", iconColor: "text-orange-500" }}
        />
        <StatTile
          icon={TrendingUp}
          label="Productivity"
          value={`${productivityScore}%`}
          accent={{ iconBg: "bg-green-500/10", iconColor: "text-green-500" }}
        />
      </div>

      {/* ── Recommendation ── */}
      <div className="rounded-xl bg-muted px-4 py-3 mb-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
          Recommendation
        </p>
        <p className="text-sm text-foreground leading-relaxed">
          {recommendation}
        </p>
      </div>

      {/* ── CTA ── */}
      <button
        type="button"
        onClick={() => navigate(ROUTES.AI_INSIGHTS)}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-all duration-150 hover:bg-muted active:scale-[0.98]"
      >
        Open AI Productivity Center
        <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" />
      </button>
    </div>
  );
}
