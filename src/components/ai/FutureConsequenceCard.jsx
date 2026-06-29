/**
 * FutureConsequenceCard.jsx
 * Displays a Future Consequence analysis result.
 * Pure presentational component — no data fetching, no Gemini calls.
 *
 * Props:
 *   loading   {boolean}         - Whether analysis is in progress.
 *   result    {Object|null}     - Parsed result object from generateAIResponse().
 *   onAnalyze {Function}        - Callback fired when the user clicks "Analyze My Future".
 */

import React from "react";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Maps riskLevel string to Tailwind badge classes.
 * @param {string} level
 * @returns {{ bg: string, text: string, ring: string }}
 */
function getRiskBadgeClasses(level) {
  switch ((level ?? "").toLowerCase()) {
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
        bg: "bg-gray-100",
        text: "text-gray-600",
        ring: "ring-gray-300",
        dot: "bg-gray-400",
      };
  }
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SectionLabel({ children }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
      {children}
    </h3>
  );
}

function BulletList({ items }) {
  if (!Array.isArray(items) || items.length === 0) return null;
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-400" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function Divider() {
  return <hr className="border-gray-100" />;
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function FutureConsequenceCard({ loading = false, result = null, onAnalyze }) {
  const hasResult = result?.success && result?.response;

  // Parse the JSON response if it's a string (Gemini returns plain text)
  let parsed = null;
  if (hasResult) {
    if (typeof result.response === "string") {
      try {
        parsed = JSON.parse(result.response);
      } catch {
        parsed = null;
      }
    } else if (typeof result.response === "object") {
      parsed = result.response;
    }
  }

  const badge = parsed ? getRiskBadgeClasses(parsed.riskLevel) : null;

  // Confidence bar width clamped 0–100
  const confidence = parsed?.confidence != null
    ? Math.min(Math.max(Number(parsed.confidence), 0), 100)
    : null;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50">
            <svg
              className="h-5 w-5 text-indigo-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2a10 10 0 1 1 0 20A10 10 0 0 1 12 2z" />
              <path d="M12 6v6l4 2" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900 leading-tight">
              Future Consequence Simulator
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              AI-powered trajectory analysis
            </p>
          </div>
        </div>

        {/* Analyze button */}
        <button
          onClick={onAnalyze}
          disabled={loading}
          className={[
            "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-150",
            loading
              ? "cursor-not-allowed bg-indigo-50 text-indigo-300"
              : "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 shadow-sm",
          ].join(" ")}
        >
          {loading ? (
            <>
              {/* Spinner */}
              <svg
                className="h-4 w-4 animate-spin text-indigo-400"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4l3-3-3-3V0a12 12 0 00-12 12h4z"
                />
              </svg>
              Analyzing...
            </>
          ) : (
            <>
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
              Analyze My Future
            </>
          )}
        </button>
      </div>

      {/* ── Loading state ── */}
      {loading && (
        <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
          <div className="h-8 w-8 rounded-full border-2 border-indigo-200 border-t-indigo-500 animate-spin" />
          <p className="text-sm text-gray-400">Running consequence analysis…</p>
        </div>
      )}

      {/* ── Error state ── */}
      {!loading && result && !result.success && (
        <div className="mx-6 my-5 rounded-xl bg-red-50 border border-red-100 px-4 py-3">
          <p className="text-sm font-medium text-red-700">Analysis failed</p>
          {result.error && (
            <p className="mt-1 text-xs text-red-500">{result.error}</p>
          )}
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && !result && (
        <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-50">
            <svg
              className="h-6 w-6 text-gray-300"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
          </div>
          <p className="text-sm text-gray-400">
            Click <span className="font-medium text-gray-600">Analyze My Future</span> to see your task trajectory.
          </p>
        </div>
      )}

      {/* ── Result ── */}
      {!loading && parsed && (
        <div className="divide-y divide-gray-100">
          {/* Risk Level */}
          <div className="flex items-center justify-between px-6 py-4">
            <SectionLabel>Risk Level</SectionLabel>
            <span
              className={[
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset",
                badge.bg,
                badge.text,
                badge.ring,
              ].join(" ")}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
              {parsed.riskLevel ?? "Unknown"}
            </span>
          </div>

          <Divider />

          {/* Summary */}
          {parsed.summary && (
            <div className="px-6 py-4">
              <SectionLabel>Summary</SectionLabel>
              <p className="text-sm text-gray-700 leading-relaxed">{parsed.summary}</p>
            </div>
          )}

          <Divider />

          {/* Predicted Consequences */}
          {Array.isArray(parsed.consequences) && parsed.consequences.length > 0 && (
            <div className="px-6 py-4">
              <SectionLabel>Predicted Consequences</SectionLabel>
              <BulletList items={parsed.consequences} />
            </div>
          )}

          <Divider />

          {/* Recommendations */}
          {Array.isArray(parsed.recommendations) && parsed.recommendations.length > 0 && (
            <div className="px-6 py-4">
              <SectionLabel>Recommendations</SectionLabel>
              <BulletList items={parsed.recommendations} />
            </div>
          )}

          <Divider />

          {/* Confidence */}
          {confidence !== null && (
            <div className="px-6 py-4">
              <div className="flex items-center justify-between mb-2">
                <SectionLabel>Confidence</SectionLabel>
                <span className="text-xs font-semibold text-gray-500">{confidence}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                  style={{ width: `${confidence}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}