/**
 * taskAnalyzer.js
 * Pure utility functions for analyzing an array of task objects.
 * No React, No Firebase, No Hooks — plain JavaScript only.
 */

/**
 * Safely parses a date value into a Date object.
 * Supports:
 *   - Firestore Timestamp objects (with .toDate())
 *   - JavaScript Date objects
 *   - ISO date strings and other date-parseable strings
 * Returns null if the value is missing or cannot be parsed.
 * @param {*} value
 * @returns {Date|null}
 */
function parseDate(value) {
  if (!value) return null;
  // Firestore Timestamp
  if (typeof value.toDate === "function") {
    const d = value.toDate();
    return d instanceof Date && !isNaN(d.getTime()) ? d : null;
  }
  // Native Date
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }
  // Date string or numeric timestamp
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Returns the start of today (midnight) as a Date.
 * @returns {Date}
 */
function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Returns the end of today (23:59:59.999) as a Date.
 * @returns {Date}
 */
function endOfToday() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * Ensures input is a non-null array; returns [] otherwise.
 * @param {*} tasks
 * @returns {Array}
 */
function safeTasks(tasks) {
  return Array.isArray(tasks) ? tasks : [];
}

// ---------------------------------------------------------------------------
// Exported filter functions
// ---------------------------------------------------------------------------

/**
 * Returns tasks that are marked as completed.
 * Treats task.completed === true or task.status === 'completed' as done.
 * @param {Array} tasks
 * @returns {Array}
 */
export function getCompletedTasks(tasks) {
  return safeTasks(tasks).filter(
    (t) => t && (t.completed === true || t.status === "completed")
  );
}

/**
 * Returns tasks that are NOT completed and NOT overdue.
 * @param {Array} tasks
 * @returns {Array}
 */
export function getPendingTasks(tasks) {
  const now = new Date();
  return safeTasks(tasks).filter((t) => {
    if (!t) return false;
    const isComplete = t.completed === true || t.status === "completed";
    if (isComplete) return false;
    const due = parseDate(t.deadline);
    // pending = no due date yet to expire, or due date still in the future
    return !due || due >= now;
  });
}

/**
 * Returns tasks that are past their due date and not completed.
 * @param {Array} tasks
 * @returns {Array}
 */
export function getOverdueTasks(tasks) {
  const now = new Date();
  return safeTasks(tasks).filter((t) => {
    if (!t) return false;
    const isComplete = t.completed === true || t.status === "completed";
    if (isComplete) return false;
    const due = parseDate(t.deadline);
    return due && due < now;
  });
}

/**
 * Returns tasks with priority === 'high' that are not completed.
 * @param {Array} tasks
 * @returns {Array}
 */
export function getHighPriorityTasks(tasks) {
  return safeTasks(tasks).filter((t) => {
    if (!t) return false;
    const isComplete = t.completed === true || t.status === "completed";
    if (isComplete) return false;
    return (
      typeof t.priority === "string" && t.priority.toLowerCase() === "high"
    );
  });
}

/**
 * Returns tasks due today (any time between 00:00:00 and 23:59:59).
 * Includes both completed and pending tasks due today.
 * @param {Array} tasks
 * @returns {Array}
 */
export function getTasksDueToday(tasks) {
  const start = startOfToday();
  const end = endOfToday();
  return safeTasks(tasks).filter((t) => {
    if (!t) return false;
    const due = parseDate(t.deadline);
    return due && due >= start && due <= end;
  });
}

/**
 * Returns non-completed tasks due within the next `days` days (default 7),
 * excluding tasks that are already overdue.
 * @param {Array} tasks
 * @param {number} days
 * @returns {Array}
 */
export function getUpcomingTasks(tasks, days = 7) {
  const now = new Date();
  const future = new Date(now);
  future.setDate(future.getDate() + Math.max(0, Number(days) || 7));

  return safeTasks(tasks).filter((t) => {
    if (!t) return false;
    const isComplete = t.completed === true || t.status === "completed";
    if (isComplete) return false;
    const due = parseDate(t.deadline);
    return due && due >= now && due <= future;
  });
}

// ---------------------------------------------------------------------------
// Exported aggregate functions
// ---------------------------------------------------------------------------

/**
 * Sums the estimatedDuration field (in minutes) across all tasks and returns total hours.
 * Converts minutes to hours: 60 minutes = 1 hour.
 * Non-numeric or missing values are treated as 0.
 * @param {Array} tasks
 * @returns {number}
 */
export function getTotalEstimatedHours(tasks) {
  return safeTasks(tasks).reduce((sum, t) => {
    if (!t) return sum;
    const minutes = parseFloat(t.estimatedDuration);
    return sum + (isNaN(minutes) ? 0 : minutes / 60);
  }, 0);
}

/**
 * Calculates a workload score (0–100) based on:
 * - Number of pending tasks (weighted)
 * - Number of overdue tasks (heavily weighted)
 * - Total estimated hours (capped contribution)
 *
 * Score of 0 means no workload; 100 means extremely high workload.
 * @param {Array} tasks
 * @returns {number} Rounded integer 0–100
 */
export function calculateWorkloadScore(tasks) {
  const all = safeTasks(tasks);
  if (all.length === 0) return 0;

  const pending = getPendingTasks(all).length;
  const overdue = getOverdueTasks(all).length;
  const hours = getTotalEstimatedHours(all);

  // Weights chosen empirically; tune as needed
  const pendingScore = Math.min(pending * 4, 40);   // up to 40 pts
  const overdueScore = Math.min(overdue * 8, 40);   // up to 40 pts
  const hoursScore   = Math.min(hours * 0.5, 20);   // up to 20 pts

  return Math.min(Math.round(pendingScore + overdueScore + hoursScore), 100);
}

/**
 * Calculates a productivity score (0–100) based on:
 * - Ratio of completed tasks to total tasks
 * - Penalty for overdue tasks
 *
 * Score of 100 means all tasks completed on time; 0 means none completed / all overdue.
 * @param {Array} tasks
 * @returns {number} Rounded integer 0–100
 */
export function calculateProductivityScore(tasks) {
  const all = safeTasks(tasks);
  if (all.length === 0) return 0;

  const completed = getCompletedTasks(all).length;
  const overdue   = getOverdueTasks(all).length;

  const completionRatio = completed / all.length;          // 0–1
  const overdueRatio    = overdue   / all.length;          // 0–1

  const raw = completionRatio * 100 - overdueRatio * 30;
  return Math.min(Math.max(Math.round(raw), 0), 100);
}

// ---------------------------------------------------------------------------
// Exported summary helper
// ---------------------------------------------------------------------------

/**
 * Returns a simplified array of task objects containing only the fields
 * relevant for AI prompts and human-readable summaries.
 *
 * Each returned object contains:
 *   - title             {string}       task title, or "Untitled" if missing
 *   - priority          {string}       "low" | "medium" | "high" | "none"
 *   - deadline          {string|null}  ISO date string of task.deadline, or null
 *   - estimatedDuration {number}       estimatedDuration (minutes) as-is, or 0
 *   - completed         {boolean}      true if the task is complete
 *
 * @param {Array} tasks
 * @returns {Array<{title: string, priority: string, deadline: string|null, estimatedDuration: number, completed: boolean}>}
 */
export function getTaskSummary(tasks) {
  return safeTasks(tasks)
    .filter((t) => t && typeof t === "object")
    .map((t) => {
      const title =
        t.title && typeof t.title === "string" && t.title.trim()
          ? t.title.trim()
          : "Untitled";

      const priority =
        t.priority && typeof t.priority === "string" && t.priority.trim()
          ? t.priority.trim().toLowerCase()
          : "none";

      const parsedDue = parseDate(t.deadline);
      const deadline = parsedDue ? parsedDue.toISOString() : null;

      const minutes = parseFloat(t.estimatedDuration);
      const estimatedDuration = isNaN(minutes) ? 0 : minutes;

      const completed =
        t.completed === true || t.status === "completed";

      return { title, priority, deadline, estimatedDuration, completed };
    });
}

// ---------------------------------------------------------------------------
// Master analyzer
// ---------------------------------------------------------------------------

/**
 * Runs all analyses on the provided tasks array and returns a summary object.
 * @param {Array} tasks
 * @returns {{
 *   totalTasks: number,
 *   completedTasks: Array,
 *   pendingTasks: Array,
 *   overdueTasks: Array,
 *   highPriorityTasks: Array,
 *   dueToday: Array,
 *   upcomingTasks: Array,
 *   totalEstimatedHours: number,
 *   workloadScore: number,
 *   productivityScore: number,
 *   taskSummary: Array
 * }}
 */
export function analyzeTasks(tasks) {
  const all = safeTasks(tasks);

  const completedTasks    = getCompletedTasks(all);
  const pendingTasks      = getPendingTasks(all);
  const overdueTasks      = getOverdueTasks(all);
  const highPriorityTasks = getHighPriorityTasks(all);
  const dueToday          = getTasksDueToday(all);
  const upcomingTasks     = getUpcomingTasks(all);
  const totalEstimatedHours = getTotalEstimatedHours(all);
  const workloadScore     = calculateWorkloadScore(all);
  const productivityScore = calculateProductivityScore(all);
  const taskSummary       = getTaskSummary(all);

  return {
    totalTasks: all.length,
    completedTasks,
    pendingTasks,
    overdueTasks,
    highPriorityTasks,
    dueToday,
    upcomingTasks,
    totalEstimatedHours,
    workloadScore,
    productivityScore,
    taskSummary,
  };
}