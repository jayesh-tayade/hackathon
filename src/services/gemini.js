/**
 * gemini.js
 * Reusable service for sending prompts to the Google Gemini API.
 * No React. No Firebase. No UI.
 */

const GEMINI_MODEL =
  import.meta.env.VITE_GEMINI_MODEL || "gemini-2.5-flash";

const GEMINI_API_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

/**
 * Sends a prompt to the Gemini API and returns the plain-text response.
 *
 * @param {string} prompt - The prompt to send to Gemini.
 * @returns {Promise<string>} The plain-text content of Gemini's first response candidate.
 * @throws {Error} If the API key is missing, the request fails, or the response is malformed.
 */
export async function generateGeminiResponse(prompt) {
  // --- Validate API key ---
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey || typeof apiKey !== "string" || apiKey.trim() === "") {
    throw new Error(
      "Gemini API key is missing. Set VITE_GEMINI_API_KEY in your .env file."
    );
  }

  // --- Validate prompt ---
  if (!prompt || typeof prompt !== "string" || prompt.trim() === "") {
    throw new Error("A non-empty string prompt is required.");
  }

  const url = `${GEMINI_API_URL}?key=${apiKey.trim()}`;

  const body = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
  };

  // --- Network request ---
  let response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (networkError) {
    throw new Error(
      `Network error while contacting Gemini API: ${networkError.message}`
    );
  }

  // --- HTTP-level errors ---
  if (!response.ok) {
    let detail = `HTTP ${response.status} ${response.statusText}`;
    try {
      const errBody = await response.json();
      if (errBody?.error?.message) {
        detail = `HTTP ${response.status} — ${errBody.error.message}`;
      }
    } catch {
      // Could not parse error body; keep the status-line detail.
    }
    throw new Error(`Gemini API request failed: ${detail}`);
  }

  // --- Parse response ---
  let data;
  try {
    data = await response.json();
  } catch (parseError) {
    throw new Error(
      `Failed to parse Gemini API response as JSON: ${parseError.message}`
    );
  }

  // --- Extract plain text ---
  const text =
    data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (typeof text !== "string") {
    // Surface a useful snapshot of what was actually returned.
    const snapshot = JSON.stringify(data).slice(0, 300);
    throw new Error(
      `Unexpected Gemini API response structure. No text found. Response snapshot: ${snapshot}`
    );
  }

  return text;
}
