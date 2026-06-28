import { Brain } from "lucide-react";

export default function AIInsights() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border px-6 py-20 text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10">
          <Brain className="size-7 text-primary" />
        </div>
        <h2 className="text-xl font-semibold">AI Insights</h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Personalized productivity recommendations and pattern analysis will
          appear here soon.
        </p>
      </div>
    </div>
  );
}
