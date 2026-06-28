import { ListTodo } from "lucide-react";
import TaskCard from "@/components/tasks/TaskCard";

export default function TaskList({
  tasks,
  loading,
  emptyTitle = "No tasks yet",
  emptyDescription = "Create your first task to get started.",
  compact = false,
  onToggleComplete,
  onEdit,
  onDelete,
}) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: compact ? 2 : 3 }).map((_, index) => (
          <div
            key={index}
            className="h-24 animate-pulse rounded-xl border border-border bg-muted/40"
          />
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-10 text-center">
        <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-muted">
          <ListTodo className="size-6 text-muted-foreground" />
        </div>
        <h3 className="font-medium">{emptyTitle}</h3>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          {emptyDescription}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          compact={compact}
          onToggleComplete={onToggleComplete}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
