import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import TaskList from "@/components/tasks/TaskList";
import TaskModal from "@/components/tasks/TaskModal";
import { Button } from "@/components/ui/button";
import { useTasks } from "@/hooks/useTasks";

export default function Tasks() {
  const { tasks, loading, error, addTask, editTask, removeTask, completeTask } =
    useTasks();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState("all");

  const filteredTasks = useMemo(() => {
    if (filter === "completed") {
      return tasks.filter((task) => task.completed);
    }

    if (filter === "active") {
      return tasks.filter((task) => !task.completed);
    }

    return tasks;
  }, [tasks, filter]);

  const openCreateModal = () => {
    setEditingTask(null);
    setModalOpen(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleSubmit = async (formData) => {
    setSubmitting(true);

    try {
      if (editingTask) {
        await editTask(editingTask.id, formData);
      } else {
        await addTask(formData);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (taskId) => {
    await removeTask(taskId);
  };

  const filters = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "completed", label: "Completed" },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Your Tasks</h2>
          <p className="text-sm text-muted-foreground">
            Manage and track everything in one place.
          </p>
        </div>

        <div className="flex gap-2">
          {filters.map(({ key, label }) => (
            <Button
              key={key}
              type="button"
              variant={filter === key ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(key)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <TaskList
        tasks={filteredTasks}
        loading={loading}
        emptyTitle={
          filter === "completed" ? "No completed tasks" : "No tasks yet"
        }
        emptyDescription={
          filter === "completed"
            ? "Complete tasks to see them here."
            : "Tap the button below to create your first task."
        }
        onToggleComplete={completeTask}
        onEdit={openEditModal}
        onDelete={handleDelete}
      />

      <Button
        type="button"
        size="lg"
        className="fixed bottom-6 right-6 z-40 h-14 gap-2 rounded-full px-6 shadow-lg"
        onClick={openCreateModal}
      >
        <Plus className="size-5" />
        New Task
      </Button>

      <TaskModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        task={editingTask}
        submitting={submitting}
      />
    </div>
  );
}
