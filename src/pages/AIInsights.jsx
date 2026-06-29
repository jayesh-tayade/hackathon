/**
 * AIInsights.jsx
 * AI Productivity Center page.
 * Composes FutureConsequenceCard and DeadlineCrashCard with independent
 * loading and result state. No Firebase. No direct Gemini calls.
 */

import { useState } from "react";
import { Brain, Calendar, BarChart2, Activity } from "lucide-react";
import { useTasks } from "@/hooks/useTasks";
import { generateAIResponse } from "@/services/aiService";
import FutureConsequenceCard from "@/components/ai/FutureConsequenceCard";
import DeadlineCrashCard from "@/components/ai/DeadlineCrashCard";

// ---------------------------------------------------------------------------
// Coming-soon features config
// ---------------------------------------------------------------------------

const COMING_SOON = [
  {
    icon: Calendar,
    label: "Smart Day Planner",
    description: "Auto-schedule your day based on priority and energy levels.",
  },
  {
    icon: BarChart2,
    label: "Weekly Productivity Report",
    description: "Visualise completion trends and peak performance windows.",
  },
  {
    icon: Activity,
    label: "Burnout Risk Detector",
    description: "Spot early warning signs before your workload becomes harmful.",
  },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function HeroCard() {
  return (
    <div className="rounded-2xl border border-border bg-card px-8 py-8 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 shadow-md">
          <Brain className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">
            AI Productivity Center
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground max-w-lg">
            Analyze your workload using Gemini AI to predict future outcomes
            and identify deadline risks.
          </p>
        </div>
      </div>
    </div>
  );
}

function ComingSoonCard() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-6 shadow-sm">
      <h2 className="mb-1 text-sm font-bold uppercase tracking-widest text-muted-foreground">
        Coming Soon
      </h2>
      <p className="mb-5 text-xs text-gray-400">
        More AI-powered features are on the way.
      </p>
      <ul className="space-y-4">
        {COMING_SOON.map(({ icon: Icon, label, description }) => (
          <li key={label} className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-muted">
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AIInsights() {
  const { tasks, loading } = useTasks();

  // Future Consequence state
  const [futureLoading, setFutureLoading] = useState(false);
  const [futureResult,  setFutureResult]  = useState(null);

  // Deadline Crash state
  const [crashLoading, setCrashLoading] = useState(false);
  const [crashResult,  setCrashResult]  = useState(null);

  const handleFutureAnalysis = async () => {
    if (loading) return;
    setFutureLoading(true);
    try {
      const result = await generateAIResponse("future-consequence", tasks);
      setFutureResult(result);
    } finally {
      setFutureLoading(false);
    }
  };

  const handleCrashAnalysis = async () => {
    if (loading) return;
    setCrashLoading(true);
    try {
      const result = await generateAIResponse("deadline-crash", tasks);
      setCrashResult(result);
    } finally {
      setCrashLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-16">
      {/* Hero */}
      <HeroCard />

      {/* Future Consequence */}
      <FutureConsequenceCard
        loading={futureLoading}
        result={futureResult}
        onAnalyze={handleFutureAnalysis}
      />

      {/* Deadline Crash */}
      <DeadlineCrashCard
        loading={crashLoading}
        result={crashResult}
        onAnalyze={handleCrashAnalysis}
      />

      {/* Coming Soon */}
      <ComingSoonCard />
    </div>
  );
}
