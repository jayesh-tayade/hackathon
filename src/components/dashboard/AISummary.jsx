import { Brain } from "lucide-react";

export default function AISummary() {
  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
          <Brain className="size-4 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">AI Summary</h3>
          <p className="text-sm text-muted-foreground">Your daily briefing</p>
        </div>
      </div>

      <div className="rounded-xl bg-muted/50 p-4">
        <p className="text-sm leading-relaxed text-muted-foreground">
          Your AI assistant will analyze your tasks, deadlines, and productivity
          patterns to deliver personalized insights here.
        </p>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Placeholder — connect AI insights in a future update.
      </p>
    </section>
  );
}
