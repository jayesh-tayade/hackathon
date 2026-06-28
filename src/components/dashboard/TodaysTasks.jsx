import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import TaskList from "@/components/tasks/TaskList";
import { ROUTES } from "@/constants/routes";
import { isToday } from "@/services/taskService";

export default function TodaysTasks({
  tasks,
  loading,
  onToggleComplete,
  onEdit,
  onDelete,
}) {
  const todaysTasks = tasks
    .filter((task) => isToday(task) && !task.completed)
    .slice(0, 4);

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Today&apos;s Tasks</h3>
          <p className="text-sm text-muted-foreground">
            {todaysTasks.length} due today
          </p>
        </div>
        <Link
          to={ROUTES.TASKS}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          View all
          <ArrowRight className="size-4" />
        </Link>
      </div>

      <TaskList
        tasks={todaysTasks}
        loading={loading}
        compact
        emptyTitle="Nothing due today"
        emptyDescription="You're all caught up for today."
        onToggleComplete={onToggleComplete}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </section>
  );
}
