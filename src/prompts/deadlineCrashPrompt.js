/**
 * deadlineCrashPrompt.js
 * Builds a Gemini prompt for deadline crash risk analysis based on task data.
 * Pure JavaScript. No React. No Firebase.
 */

/**
 * Builds a prompt string that instructs Gemini to return a structured JSON
 * deadline crash risk analysis based on the provided task analysis summary.
 *
 * @param {Object} analysis - The object returned by analyzeTasks().
 * @returns {string} A prompt string ready to pass to generateGeminiResponse().
 */
export function buildDeadlineCrashPrompt(analysis) {
    const {
      totalTasks          = 0,
      pendingTasks        = [],
      overdueTasks        = [],
      highPriorityTasks   = [],
      totalEstimatedHours = 0,
      workloadScore       = 0,
      productivityScore   = 0,
      taskSummary         = [],
    } = analysis || {};
  
    const pending  = Array.isArray(pendingTasks)      ? pendingTasks.length      : 0;
    const overdue  = Array.isArray(overdueTasks)      ? overdueTasks.length      : 0;
    const highPrio = Array.isArray(highPriorityTasks) ? highPriorityTasks.length : 0;
  
    const safeSummary = Array.isArray(taskSummary) ? taskSummary : [];
    const taskSummaryText = safeSummary.length === 0
      ? "No tasks available."
      : safeSummary
          .map((t) => {
            const title     = t?.title             ?? "Untitled";
            const priority  = t?.priority          ?? "none";
            const deadline  = t?.deadline          ?? "No deadline";
            const duration  = t?.estimatedDuration ?? 0;
            const completed = t?.completed ? "Yes" : "No";
            return `Title: ${title}\nPriority: ${priority}\nDeadline: ${deadline}\nEstimated Duration: ${duration} minutes (${(duration / 60).toFixed(1)} hours)\nCompleted: ${completed}`;
          })
          .join("\n\n");
  
    return `You are an expert project risk and deadline management AI.
  
  Analyze the following task data and assess the risk of a deadline crash — a situation where one or more critical tasks will not be completed by their deadlines given the user's current pace and workload.
  
  Task data:
  - Total tasks: ${totalTasks}
  - Pending tasks: ${pending}
  - Overdue tasks: ${overdue}
  - High priority tasks: ${highPrio}
  - Total estimated hours remaining: ${totalEstimatedHours}
  - Workload score (0–100, higher = more overloaded): ${workloadScore}
  - Productivity score (0–100, higher = more productive): ${productivityScore}
  
  Task Summary:
  ${taskSummaryText}
  
  Important reasoning instructions:
  
  - Consider the deadlines in chronological order.
  - Pay special attention to tasks due within the next 7 days.
  - Consider high-priority tasks before low-priority tasks.
  - Assume the user can realistically complete only a limited number of hours of work per day.
  - Identify any deadline collisions where multiple important tasks compete for the same time period.
  - Prefer concrete task names instead of generic statements.
  
  Based on this data, return a deadline crash risk assessment as a single JSON object using exactly this structure:
  
  {
    "crashRisk": "Low | Medium | High",
    "summary": "A short one-sentence summary of the user's deadline crash risk and its primary cause.",
    "criticalTasks": [
      "First task or area most at risk of missing its deadline.",
      "Second task or area at risk."
    ],
    "recommendations": [
      "First actionable recommendation to prevent a deadline crash.",
      "Second actionable recommendation.",
      "Third actionable recommendation."
    ],
    "confidence": 0
  }
  
  Rules you must follow:
  - crashRisk must be exactly one of: Low, Medium, or High.
  - criticalTasks must list the specific tasks or areas most likely to miss their deadlines; include at least 1 item.
  - recommendations must contain at least 3 actionable items.
  - confidence must be an integer between 0 and 100 reflecting how confident you are in this assessment given the available data.
  - Return only the JSON object.
  - Do not include markdown.
  - Do not include code fences.
  - Do not include any explanation, preamble, or trailing text.
  - The response must be valid JSON that can be parsed with JSON.parse().`;
  }
  