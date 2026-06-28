import { Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function WelcomeCard() {
  const { user } = useAuth();
  const firstName = user?.displayName?.split(" ")[0] || "there";

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-card to-card p-6">
      <div className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-primary/10 blur-2xl" />
      <div className="relative">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <Sparkles className="size-3.5" />
          Good to see you
        </div>
        <h2 className="text-2xl font-bold tracking-tight">
          Welcome back, {firstName}
        </h2>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Here&apos;s your productivity overview for today. Stay focused and
          make every minute count.
        </p>
      </div>
    </section>
  );
}
