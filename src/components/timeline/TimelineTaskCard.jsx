/**
 * TimelineTaskCard.jsx
 * Displays a single task in the timeline view.
 * Pure presentational component — no data fetching, no Firebase, no AI, no Hooks.
 *
 * Props:
 *   task {Object} - Task object with title, deadline, priority,
 *                   estimatedDuration, and completed fields.
 */

import React from "react";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Safely parses a deadline value into a JavaScript Date.
 * Supports Firestore Timestamps, native Date objects, and ISO strings.
 *
 * @param {*} value
 * @returns {Date|null}
 */
function parseDeadline(value) {
  if (!value) return null;
  if (typeof value.toDate === "function") {
    const d = value.toDate();
    return d instanceof Date && !isNaN(d.getTime()) ? d : null;
  }
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Formats a Date into a human-readable deadline string.
 * Examples: "Today, 3:00 PM" / "Tomorrow, 9:30 AM" / "Mon, 14 Jul · 2:00 PM"
 *
 * @param {Date} date
 * @returns {string}
 */
function formatDeadline(date) {
  if (!date) return "No deadline";

  const now       = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(todayStart.getDate() + 1);
  const tomorrowEnd = new Date(tomorrowStart);
  tomorrowEnd.setHours(23, 59, 59, 999);

  const timeStr = date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  if (date >= todayStart && date < tomorrowStart) {
    return `Today, ${timeStr}`;
  }
  if (date >= tomorrowStart && date <= tomorrowEnd) {
    return `Tomorrow, ${timeStr}`;
  }
  const dateStr = date.toLocaleDateString([], {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  return `${dateStr} · ${timeStr}`;
}

/**
 * Returns Tailwind classes for the priority badge.
 *
 * @param {string} priority
 * @returns {{ bg: string, text: string, ring: string, dot: string }}
 */
function getPriorityClasses(priority) {
  switch ((priority ?? "").toLowerCase()) {
    case "high":
      return {
        bg: "bg-red-100",
        text: "text-red-700",
        ring: "ring-red-300",
        dot: "bg-red-500",
      };
    case "medium":
      return {
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        ring: "ring-yellow-300",
        dot: "bg-yellow-500",
      };
    case "low":
      return {
        bg: "bg-green-100",
        text: "text-green-700",
        ring: "ring-green-300",
        dot: "bg-green-500",
      };
    default:
      return {
        bg: "bg-muted",
        text: "text-muted-foreground",
        ring: "ring-gray-200",
        dot: "bg-gray-400",
      };
  }
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/**
 * Small pill badge with a leading colour dot.
 */
function Badge({ label, bg, text, ring, dot }) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5",
        "text-xs font-semibold ring-1 ring-inset",
        bg, text, ring,
      ].join(" ")}
    >
      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${dot}`} />
      {label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function TimelineTaskCard({ task = {} }) {
  const {
    title,
    deadline,
    priority,
    estimatedDuration,
    completed,
  } = task;

  const parsedDeadline  = parseDeadline(deadline);
  const formattedDate   = formatDeadline(parsedDeadline);
  const priorityClasses = getPriorityClasses(priority);
  const isCompleted     = completed === true || task.status === "completed";

  const displayTitle    = title && typeof title === "string" && title.trim()
    ? title.trim()
    : "Untitled Task";

  const durationMinutes = parseFloat(estimatedDuration);
  const hasDuration     = !isNaN(durationMinutes) && durationMinutes > 0;

  return (
    <div
      className={[
        "group flex flex-col gap-3 rounded-2xl border border-border bg-card text-foreground px-5 py-4 shadow-sm",
        "transition-shadow duration-150 hover:shadow-md",
        isCompleted ? "opacity-60" : "",
      ].join(" ")}
    >
      {/* ── Top row: title + completed badge ── */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2 min-w-0">
          {/* Completion indicator dot */}
          <span
            className={[
              "mt-1.5 h-2 w-2 shrink-0 rounded-full",
              isCompleted ? "bg-gray-300" : "bg-indigo-500",
            ].join(" ")}
          />
          <h3
            className={[
              "text-sm font-semibold leading-snug truncate",
              isCompleted
            ? "text-muted-foreground line-through"
            : "text-foreground",
            ].join(" ")}
            title={displayTitle}
          >
            {displayTitle}
          </h3>
        </div>

        {isCompleted && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground ring-1 ring-inset ring-gray-200">
            <svg
              className="h-3 w-3"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Completed
          </span>
        )}
      </div>

      {/* ── Meta row: deadline · duration · priority ── */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Deadline */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <svg
            className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span>{formattedDate}</span>
        </div>

        {/* Estimated duration */}
        {hasDuration && (
          <>
            <span className="text-gray-200">·</span>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <svg
                className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span>{durationMinutes} min</span>
            </div>
          </>
        )}

        {/* Priority badge */}
        {priority && (
          <>
            <span className="text-gray-200">·</span>
            <Badge
              label={priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase()}
              {...priorityClasses}
            />
          </>
        )}
      </div>
    </div>
  );
}