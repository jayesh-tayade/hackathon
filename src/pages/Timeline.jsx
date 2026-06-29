/**
 * Timeline.jsx
 * Displays all tasks grouped into deadline timeline buckets.
 * No editing. No deleting. No Firebase. No AI.
 */

import { useTasks } from "@/hooks/useTasks";
import { groupTasksByTimeline } from "@/utils/timelineAnalyzer";
import TimelineTaskCard from "@/components/timeline/TimelineTaskCard";

// ---------------------------------------------------------------------------
// Section metadata
// ---------------------------------------------------------------------------

const SECTIONS = [
  {
    key: "overdue",
    label: "Overdue",
    accent: "text-red-600",
    countBg: "bg-red-100 text-red-600",
    borderColor: "border-red-200",
    dotColor: "bg-red-500",
  },
  {
    key: "today",
    label: "Today",
    accent: "text-indigo-600",
    countBg: "bg-indigo-100 text-indigo-600",
    borderColor: "border-indigo-200",
    dotColor: "bg-indigo-500",
  },
  {
    key: "tomorrow",
    label: "Tomorrow",
    accent: "text-blue-600",
    countBg: "bg-blue-100 text-blue-600",
    borderColor: "border-blue-200",
    dotColor: "bg-blue-500",
  },
  {
    key: "thisWeek",
    label: "This Week",
    accent: "text-violet-600",
    countBg: "bg-violet-100 text-violet-600",
    borderColor: "border-violet-200",
    dotColor: "bg-violet-500",
  },
  {
    key: "later",
    label: "Later",
    accent: "text-gray-600",
    countBg: "bg-gray-100 text-muted-foreground",
    borderColor: "border-border",
    dotColor: "bg-gray-400",
  },
  {
    key: "completed",
    label: "Completed",
    accent: "text-green-600",
    countBg: "bg-green-100 text-green-600",
    borderColor: "border-green-200",
    dotColor: "bg-green-500",
  },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/**
 * Skeleton card shown while tasks are loading.
 */
function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-border bg-card px-5 py-4 shadow-sm animate-pulse">
      <div className="flex items-start gap-2 mb-3">
        <div className="mt-1.5 h-2 w-2 rounded-full bg-muted shrink-0" />
        <div className="h-4 w-2/3 rounded bg-muted" />
      </div>
      <div className="flex gap-3">
        <div className="h-3 w-24 rounded bg-gray-100" />
        <div className="h-3 w-16 rounded bg-gray-100" />
        <div className="h-3 w-14 rounded bg-gray-100" />
      </div>
    </div>
  );
}

/**
 * A single timeline section (e.g. "Overdue", "Today").
 */
function TimelineSection({ section, tasks }) {
  return (
    <section>
      {/* Section header */}
      <div className="flex items-center gap-3 mb-3">
        <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${section.dotColor}`} />
        <h2 className={`text-sm font-bold uppercase tracking-widest ${section.accent}`}>
          {section.label}
        </h2>
        <span
          className={[
            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold",
            section.countBg,
          ].join(" ")}
        >
          {tasks.length}
        </span>
        <div className={`flex-1 border-t ${section.borderColor}`} />
      </div>

      {/* Task cards */}
      <div className="space-y-3 pl-5">
        {tasks.map((task, i) => (
          <TimelineTaskCard key={task.id ?? i} task={task} />
        ))}
      </div>
    </section>
  );
}

/**
 * Empty state shown when there are no tasks at all.
 */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
        <svg
          className="h-8 w-8 text-gray-300"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">No tasks yet</p>
        <p className="text-xs text-muted-foreground">
          Tasks you create will appear here, grouped by their deadline.
        </p>
      </div>
    </div>
  );
}

/**
 * Loading state — shows skeleton cards under placeholder section headers.
 */
function LoadingState() {
  return (
    <div className="space-y-8">
      {["Overdue", "Today", "This Week"].map((label) => (
        <section key={label}>
          <div className="flex items-center gap-3 mb-3">
            <div className="h-2.5 w-2.5 rounded-full bg-muted shrink-0 animate-pulse" />
            <div className="h-3.5 w-20 rounded bg-muted animate-pulse" />
            <div className="flex-1 border-t border-border" />
          </div>
          <div className="space-y-3 pl-5">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </section>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function Timeline() {
  const { tasks, loading } = useTasks();

  const grouped = loading ? null : groupTasksByTimeline(tasks);

  const totalTasks = grouped
    ? Object.values(grouped).reduce((sum, arr) => sum + arr.length, 0)
    : 0;

  const visibleSections = grouped
    ? SECTIONS.filter((s) => grouped[s.key]?.length > 0)
    : [];

  return (
    <div className="mx-auto max-w-3xl space-y-2 pb-16">
      {/* ── Page header ── */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Timeline</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your tasks organised by deadline
        </p>
      </div>

      {/* ── Loading ── */}
      {loading && <LoadingState />}

      {/* ── Empty ── */}
      {!loading && totalTasks === 0 && <EmptyState />}

      {/* ── Grouped sections ── */}
      {!loading && totalTasks > 0 && (
        <div className="space-y-10">
          {visibleSections.map((section) => (
            <TimelineSection
              key={section.key}
              section={section}
              tasks={grouped[section.key]}
            />
          ))}
        </div>
      )}
    </div>
  );
}