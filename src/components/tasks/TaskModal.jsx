import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  EMPTY_TASK_FORM,
  TASK_CATEGORIES,
  TASK_PRIORITIES,
} from "@/constants/tasks";
import { taskToFormData } from "@/services/taskService";
import { cn } from "@/lib/utils";

const inputClassName =
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-ring focus:ring-3 focus:ring-ring/50";

export default function TaskModal({
  open,
  onClose,
  onSubmit,
  task = null,
  submitting = false,
}) {
  const [formData, setFormData] = useState(EMPTY_TASK_FORM);
  const [error, setError] = useState(null);
  const isEditing = Boolean(task);

  useEffect(() => {
    if (!open) {
      return;
    }

    setFormData(task ? taskToFormData(task) : EMPTY_TASK_FORM);
    setError(null);
  }, [open, task]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && open) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.title.trim()) {
      setError("Title is required.");
      return;
    }

    if (!formData.deadline) {
      setError("Deadline is required.");
      return;
    }

    try {
      setError(null);
      await onSubmit(formData);
      onClose();
    } catch (submitError) {
      setError(submitError.message || "Something went wrong.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-label="Close modal"
      />

      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold">
              {isEditing ? "Edit Task" : "New Task"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isEditing
                ? "Update your task details"
                : "Add a new task to your schedule"}
            </p>
          </div>
          <Button type="button" variant="ghost" size="icon-sm" onClick={onClose}>
            <X />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              className={inputClassName}
              placeholder="What needs to be done?"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className={cn(inputClassName, "resize-none")}
              placeholder="Add more details..."
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="deadline" className="text-sm font-medium">
                Deadline
              </label>
              <input
                id="deadline"
                name="deadline"
                type="datetime-local"
                value={formData.deadline}
                onChange={handleChange}
                className={inputClassName}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="estimatedDuration" className="text-sm font-medium">
                Estimated Duration (min)
              </label>
              <input
                id="estimatedDuration"
                name="estimatedDuration"
                type="number"
                min="0"
                value={formData.estimatedDuration}
                onChange={handleChange}
                className={inputClassName}
                placeholder="60"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={inputClassName}
              >
                {TASK_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="priority" className="text-sm font-medium">
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className={inputClassName}
              >
                {TASK_PRIORITIES.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting
                ? "Saving..."
                : isEditing
                  ? "Save Changes"
                  : "Create Task"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
