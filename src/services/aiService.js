/**
 * aiService.js
 * Orchestrates task analysis and Gemini prompt generation.
 * No React. No Firebase. No UI.
 */

import { analyzeTasks } from "../utils/taskAnalyzer.js";
import { generateGeminiResponse } from "./gemini.js";
import { buildFutureConsequencePrompt } from "../prompts/futureConsequencePrompt.js";

/**
 * Returns the appropriate prompt string for the given feature.
 *
 * @param {string} featureName
 * @param {Object} analysis - Result of analyzeTasks()
 * @returns {string}
 * @throws {Error} If the feature has no prompt implementation.
 */
function getPrompt(featureName, analysis) {
  if (featureName === "future-consequence") {
    return buildFutureConsequencePrompt(analysis);
  }
  throw new Error("Feature prompt not implemented.");
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
    };
  }

  // --- Step 2: Build prompt ---
  let prompt;
  try {
    prompt = getPrompt(feature, analysis);
  } catch (promptError) {
    return {
      success: false,
      feature,
      analysis,
      response: null,
      error: `Prompt construction failed: ${promptError.message}`,
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
    };
  }

  // --- Step 4: Return structured result ---
  return {
    success: true,
    feature,
    analysis,
    response,
  };
}