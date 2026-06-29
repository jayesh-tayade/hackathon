/**
 * timelineAnalyzer.js
 * Pure utility functions for grouping tasks by their deadline timeline.
 * No React. No Firebase. No Hooks.
 *
 * Follows the same coding style as taskAnalyzer.js.
 */

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Safely parses a deadline value into a JavaScript Date object.
 * Supports:
 *   - Firestore Timestamp objects (with .toDate())
 *   - JavaScript Date objects
 *   - ISO date strings and other date-parseable strings/numbers
 * Returns null if the value is missing or cannot be parsed.
 *
 * @param {*} value
 * @returns {Date|null}
 */
function parseDeadline(value) {
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
    // ISO string or numeric timestamp
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }
  
  /**
   * Returns a Date set to midnight (00:00:00.000) of the given date.
   *
   * @param {Date} date
   * @returns {Date}
   */
  function startOfDay(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  
  /**
   * Returns a Date set to the last millisecond (23:59:59.999) of the given date.
   *
   * @param {Date} date
   * @returns {Date}
   */
  function endOfDay(date) {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
  }
  
  /**
   * Returns true if the task is considered complete.
   * Treats task.completed === true or task.status === "completed" as done.
   *
   * @param {Object} task
   * @returns {boolean}
   */
  function isCompleted(task) {
    return task.completed === true || task.status === "completed";
  }
  
  /**
   * Comparator for sorting tasks by their parsed deadline ascending.
   * Tasks without a valid deadline are sorted to the end.
   *
   * @param {Object} a
   * @param {Object} b
   * @returns {number}
   */
  function byDeadlineAscending(a, b) {
    const da = parseDeadline(a.deadline);
    const db = parseDeadline(b.deadline);
    if (!da && !db) return 0;
    if (!da) return 1;
    if (!db) return -1;
    return da.getTime() - db.getTime();
  }
  
  /**
   * Ensures input is a non-null array; returns [] otherwise.
   *
   * @param {*} tasks
   * @returns {Array}
   */
  function safeTasks(tasks) {
    return Array.isArray(tasks) ? tasks : [];
  }
  
  // ---------------------------------------------------------------------------
  // Exported functions
  // ---------------------------------------------------------------------------
  
  /**
   * Groups an array of task objects into timeline buckets based on their deadline.
   *
   * Completed tasks (task.completed === true or task.status === "completed") are
   * always placed in the `completed` bucket regardless of their deadline.
   *
   * Pending tasks are distributed into the following buckets:
   *   - overdue   : deadline is before the start of today
   *   - today     : deadline falls within today
   *   - tomorrow  : deadline falls within tomorrow
   *   - thisWeek  : deadline falls within the next 2–6 days (after tomorrow,
   *                 through the end of 6 days from today)
   *   - later     : deadline is more than 6 days away, or has no valid deadline
   *
   * Every bucket is sorted by deadline ascending (nulls last).
   *
   * @param {Array} tasks - Array of task objects to group.
   * @returns {{
   *   overdue:   Array,
   *   today:     Array,
   *   tomorrow:  Array,
   *   thisWeek:  Array,
   *   later:     Array,
   *   completed: Array
   * }}
   */
  export function groupTasksByTimeline(tasks) {
    const all = safeTasks(tasks).filter((t) => t && typeof t === "object");
  
    // Build boundary dates relative to now
    const now           = new Date();
    const todayStart    = startOfDay(now);
    const todayEnd      = endOfDay(now);
  
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);
    const tomorrowEnd   = endOfDay(tomorrowStart);
  
    const thisWeekEnd   = new Date(todayStart);
    thisWeekEnd.setDate(thisWeekEnd.getDate() + 6);
    thisWeekEnd.setHours(23, 59, 59, 999);
  
    // Initialise buckets
    const buckets = {
      overdue:   [],
      today:     [],
      tomorrow:  [],
      thisWeek:  [],
      later:     [],
      completed: [],
    };
  
    for (const task of all) {
      // Completed tasks always go into their own bucket
      if (isCompleted(task)) {
        buckets.completed.push(task);
        continue;
      }
  
      const due = parseDeadline(task.deadline);
  
      if (!due) {
        // No valid deadline → later
        buckets.later.push(task);
        continue;
      }
  
      if (due < todayStart) {
        buckets.overdue.push(task);
      } else if (due <= todayEnd) {
        buckets.today.push(task);
      } else if (due <= tomorrowEnd) {
        buckets.tomorrow.push(task);
      } else if (due <= thisWeekEnd) {
        buckets.thisWeek.push(task);
      } else {
        buckets.later.push(task);
      }
    }
  
    // Sort every bucket by deadline ascending
    for (const key of Object.keys(buckets)) {
      buckets[key].sort(byDeadlineAscending);
    }
  
    return buckets;
  }