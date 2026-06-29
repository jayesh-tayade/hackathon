/**
 * futureConsequencePrompt.js
 * Builds a Gemini prompt for future consequence analysis based on task data.
 * Pure JavaScript. No React. No Firebase.
 */

/**
 * Builds a prompt string that instructs Gemini to return a structured JSON
 * consequence analysis based on the provided task analysis summary.
 *
 * @param {Object} analysis - The object returned by analyzeTasks().
 * @returns {string} A prompt string ready to pass to generateGeminiResponse().
 */
export function buildFutureConsequencePrompt(analysis) {
    const {
      totalTasks         = 0,
      completedTasks     = [],
      pendingTasks       = [],
      overdueTasks       = [],
      highPriorityTasks  = [],
      dueToday           = [],
      upcomingTasks      = [],
      totalEstimatedHours = 0,
      workloadScore      = 0,
      productivityScore  = 0,
      taskSummary        = [],
    } = analysis || {};
  
    const completed  = Array.isArray(completedTasks)    ? completedTasks.length    : 0;
    const pending    = Array.isArray(pendingTasks)       ? pendingTasks.length      : 0;
    const overdue    = Array.isArray(overdueTasks)       ? overdueTasks.length      : 0;
    const highPrio   = Array.isArray(highPriorityTasks)  ? highPriorityTasks.length : 0;
    const today      = Array.isArray(dueToday)           ? dueToday.length          : 0;
    const upcoming   = Array.isArray(upcomingTasks)      ? upcomingTasks.length     : 0;
  
    const safeSummary = Array.isArray(taskSummary) ? taskSummary : [];
    const taskSummaryText = safeSummary.length === 0
      ? "No tasks available."
      : safeSummary
          .map((t) => {
            const title     = t.title             ?? "Untitled";
            const priority  = t.priority          ?? "none";
            const deadline  = t.deadline          ?? "No deadline";
            const duration  = t.estimatedDuration ?? 0;
            const completed = t.completed ? "Yes" : "No";
            return `Title: ${title}\nPriority: ${priority}\nDeadline: ${deadline}\nEstimated Duration: ${duration} minutes\nCompleted: ${completed}`;
          })
          .join("\n\n");
  
    return `You are an expert productivity and planning AI.
  
  Analyze the following task data and predict the future consequences if the user continues at their current pace.
  
  Task data:
  - Total tasks: ${totalTasks}
  - Completed tasks: ${completed}
  - Pending tasks: ${pending}
  - Overdue tasks: ${overdue}
  - High priority tasks: ${highPrio}
  - Due today: ${today}
  - Upcoming in next 7 days: ${upcoming}
  - Total estimated hours remaining: ${totalEstimatedHours}
  - Workload score (0–100, higher = more overloaded): ${workloadScore}
  - Productivity score (0–100, higher = more productive): ${productivityScore}
  
  Task Summary:
  ${taskSummaryText}
  
  Based on this data, return a consequence analysis as a single JSON object using exactly this structure:
  
  {
    "riskLevel": "Low | Medium | High",
    "summary": "A short one-sentence summary of the user's current situation and trajectory.",
    "consequences": [
      "First predicted consequence if current pace continues.",
      "Second predicted consequence.",
      "Third predicted consequence."
    ],
    "recommendations": [
      "First actionable recommendation to improve outcomes.",
      "Second actionable recommendation.",
      "Third actionable recommendation."
    ],
    "confidence": 0
  }
  
  Rules you must follow:
  - riskLevel must be exactly one of: Low, Medium, or High.
  - consequences must contain at least 3 items.
  - recommendations must contain at least 3 items.
  - confidence must be an integer between 0 and 100 reflecting how confident you are in the analysis given the available data.
  - Return only the JSON object.
  - Do not include markdown.
  - Do not include code fences.
  - Do not include any explanation, preamble, or trailing text.
  - The response must be valid JSON that can be parsed with JSON.parse().`;
  }