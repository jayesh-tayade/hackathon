import { TrendingUp } from "lucide-react";

export default function ProductivityScore() {
  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Productivity Score</h3>
          <p className="text-sm text-muted-foreground">Based on your activity</p>
        </div>
        <TrendingUp className="size-5 text-primary" />
      </div>

      <div className="flex items-end gap-2">
        <span className="text-4xl font-bold tracking-tight">—</span>
        <span className="mb-1 text-sm text-muted-foreground">/ 100</span>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full w-0 rounded-full bg-primary transition-all" />
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Placeholder — AI-powered scoring coming soon.
      </p>
    </section>
  );
}
