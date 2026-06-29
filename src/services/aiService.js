/**
 * aiService.js
 * Orchestrates task analysis and Gemini prompt generation.
 * No React. No Firebase. No UI.
 */

import { analyzeTasks } from "../utils/taskAnalyzer.js";
import { generateGeminiResponse } from "./gemini.js";

/**
 * Builds a plain-text prompt from a feature name and a task analysis summary.
 *
 * @param {string} featureName
 * @param {Object} analysis - Result of analyzeTasks()
 * @returns {string}
 */
function buildPrompt(featureName, analysis) {
  const {
    totalTasks,
    completedTasks,
    pendingTasks,
    overdueTasks,
    highPriorityTasks,
    dueToday,
    upcomingTasks,
    totalEstimatedHours,
    workloadScore,
    productivityScore,
  } = analysis;

  return `
You are a productivity assistant helping a user manage their tasks.

Feature requested: ${featureName}

Current task summary:
- Total tasks: ${totalTasks}
- Completed: ${completedTasks.length}
- Pending: ${pendingTasks.length}
- Overdue: ${overdueTasks.length}
- High priority: ${highPriorityTasks.length}
- Due today: ${dueToday.length}
- Upcoming (next 7 days): ${upcomingTasks.length}
- Total estimated hours: ${totalEstimatedHours}
- Workload score (0–100): ${workloadScore}
- Productivity score (0–100): ${productivityScore}

Based on this data, provide a helpful, concise response for the requested feature.
`.trim();
}

/**
 * Analyzes the given tasks, builds a feature prompt, calls Gemini,
 * and returns a structured result object.
 *
 * @param {string} featureName - The name of the AI feature being invoked.
 * @param {Array}  tasks       - Array of task objects to analyze.
 * @returns {Promise<{
 *   success: boolean,
 *   feature: string,
 *   analysis: Object,
 *   response: string|null,
 *   error: string|undefined
 * }>}
 */
export async function generateAIResponse(featureName, tasks) {
  // --- Validate featureName ---
  const feature =
    featureName && typeof featureName === "string" && featureName.trim()
      ? featureName.trim()
      : "General";

  // --- Step 1: Analyze tasks ---
  let analysis;
  try {
    analysis = analyzeTasks(tasks);
  } catch (analyzerError) {
    return {
      success: false,
      feature,
      analysis: null,
      response: null,
      error: `Task analysis failed: ${analyzerError.message}`,
      generatedAt: new Date().toISOString(),
    };
  }

  // --- Step 2: Build prompt ---
  let prompt;
  try {
    prompt = buildPrompt(feature, analysis);
  } catch (promptError) {
    return {
      success: false,
      feature,
      analysis,
      response: null,
      error: `Prompt construction failed: ${promptError.message}`,
      generatedAt: new Date().toISOString(),
    };
  }

  // --- Step 3: Call Gemini ---
  let response;
  try {
    response = await generateGeminiResponse(prompt);
  } catch (geminiError) {
    return {
      success: false,
      feature,
      analysis,
      response: null,
      error: `Gemini request failed: ${geminiError.message}`,
      generatedAt: new Date().toISOString(),
    };
  }

  // --- Step 4: Return structured result ---
  return {
    success: true,
    feature,
    analysis,
    response,
    generatedAt: new Date().toISOString(),
  };
}
