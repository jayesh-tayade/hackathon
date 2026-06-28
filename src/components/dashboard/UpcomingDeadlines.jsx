import { AlertCircle } from "lucide-react";
import { getTaskDeadlineDate, isUpcoming } from "@/services/taskService";

const formatDeadline = (task) => {
  const deadline = getTaskDeadlineDate(task);

  if (!deadline) {
    return "";
  }

  return deadline.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

export default function UpcomingDeadlines({ tasks, loading }) {
  const upcomingTasks = tasks
    .filter(isUpcoming)
    .sort(
      (a, b) =>
        getTaskDeadlineDate(a).getTime() - getTaskDeadlineDate(b).getTime(),
    )
    .slice(0, 5);

  if (loading) {
    return (
      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-4 h-6 w-40 animate-pulse rounded bg-muted" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-14 animate-pulse rounded-lg bg-muted/40"
            />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-4">
        <h3 className="font-semibold">Upcoming Deadlines</h3>
        <p className="text-sm text-muted-foreground">Next 5 on your calendar</p>
      </div>

      {upcomingTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-4 py-8 text-center">
          <AlertCircle className="mb-2 size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No upcoming deadlines. Plan ahead by adding tasks.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {upcomingTasks.map((task) => (
            <li
              key={task.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{task.title}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDeadline(task)}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs capitalize text-muted-foreground">
                {task.priority}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
