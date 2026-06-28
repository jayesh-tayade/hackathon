import { Calendar, Clock, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PRIORITY_STYLES } from "@/constants/tasks";
import { getTaskDeadlineDate } from "@/services/taskService";
import { cn } from "@/lib/utils";

const formatDeadline = (task) => {
  const deadline = getTaskDeadlineDate(task);

  if (!deadline) {
    return "No deadline";
  }

  return deadline.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

export default function TaskCard({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
  compact = false,
}) {
  const priorityStyle = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.medium;

  return (
    <article
      className={cn(
        "group rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-md",
        task.completed && "opacity-60",
        compact && "p-3",
      )}
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={Boolean(task.completed)}
          onChange={(event) => onToggleComplete(task.id, event.target.checked)}
          className="mt-1 size-4 shrink-0 rounded border-input accent-primary"
          aria-label={`Mark ${task.title} as ${task.completed ? "incomplete" : "complete"}`}
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3
              className={cn(
                "font-medium text-foreground",
                task.completed && "line-through",
              )}
            >
              {task.title}
            </h3>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-medium capitalize",
                priorityStyle,
              )}
            >
              {task.priority}
            </span>
            {task.category && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {task.category}
              </span>
            )}
          </div>

          {!compact && task.description && (
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
              {task.description}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Calendar className="size-3.5" />
              {formatDeadline(task)}
            </span>
            {task.estimatedDuration > 0 && (
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3.5" />
                {task.estimatedDuration} min
              </span>
            )}
          </div>
        </div>

        {!compact && (
          <div className="flex shrink-0 gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => onEdit(task)}
              aria-label={`Edit ${task.title}`}
            >
              <Pencil />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="text-destructive hover:text-destructive"
              onClick={() => onDelete(task.id)}
              aria-label={`Delete ${task.title}`}
            >
              <Trash2 />
            </Button>
          </div>
        )}
      </div>
    </article>
  );
}
