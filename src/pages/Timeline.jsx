import { CalendarDays } from "lucide-react";

export default function Timeline() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border px-6 py-20 text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10">
          <CalendarDays className="size-7 text-primary" />
        </div>
        <h2 className="text-xl font-semibold">Timeline</h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          A visual timeline of your tasks and deadlines is coming in a future
          update.
        </p>
      </div>
    </div>
  );
}
