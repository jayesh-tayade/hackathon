/**
 * taskAnalyzer.js
 * Pure utility functions for analyzing an array of task objects.
 * No React, No Firebase, No Hooks — plain JavaScript only.
 */

/**
 * Safely parses a date value into a Date object.
 * Returns null if the value is invalid or missing.
 * @param {*} value
 * @returns {Date|null}
 */
function parseDate(value) {
    if (!value) return null;
  
    // Firestore Timestamp
    if (value?.toDate) {
      return value.toDate();
    }
  
    // JavaScript Date or date string
    const d = value instanceof Date ? value : new Date(value);
  
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
      const due = parseDate(t.dueDate);
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
      const due = parseDate(t.dueDate);
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
      const due = parseDate(t.dueDate);
      return due && due >= now && due <= future;
    });
  }
  
  // ---------------------------------------------------------------------------
  // Exported aggregate functions
  // ---------------------------------------------------------------------------
  
  /**
   * Sums the estimatedDuration field across all tasks.
   * Non-numeric or missing values are treated as 0.
   * @param {Array} tasks
   * @returns {number}
   */
  export function getTotalestimatedDuration(tasks) {
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
    const hours = getTotalestimatedDuration(all);
  
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
   *   totalestimatedDuration: number,
   *   workloadScore: number,
   *   productivityScore: number
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
    const totalestimatedDuration = getTotalestimatedDuration(all);
    const workloadScore     = calculateWorkloadScore(all);
    const productivityScore = calculateProductivityScore(all);
  
    return {
      totalTasks: all.length,
      completedTasks,
      pendingTasks,
      overdueTasks,
      highPriorityTasks,
      dueToday,
      upcomingTasks,
      totalestimatedDuration,
      workloadScore,
      productivityScore,
    };
  }
  