import { Brain, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";

export default function AISummary() {
  const navigate = useNavigate();

  return (
    <section
      onClick={() => navigate(ROUTES.AI_INSIGHTS)}
      className="cursor-pointer rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary hover:shadow-md"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
            <Brain className="size-4 text-primary" />
          </div>

          <div>
            <h3 className="font-semibold">AI Summary</h3>
            <p className="text-sm text-muted-foreground">
              Your daily briefing
            </p>
          </div>
        </div>

        <ArrowRight className="size-4 text-muted-foreground" />
      </div>

      <div className="rounded-xl bg-muted/50 p-4">
        <p className="text-sm leading-relaxed text-muted-foreground">
          Explore AI-powered insights including future consequence prediction
          and deadline crash analysis based on your tasks.
        </p>
      </div>

      <p className="mt-3 text-xs font-medium text-primary">
        Click to open AI Productivity Center →
      </p>
    </section>
  );
}