import { useState } from "react";
import { Plus } from "lucide-react";
import AISummary from "@/components/dashboard/AISummary";
import ProductivityScore from "@/components/dashboard/ProductivityScore";
import TodaysTasks from "@/components/dashboard/TodaysTasks";
import UpcomingDeadlines from "@/components/dashboard/UpcomingDeadlines";
import WelcomeCard from "@/components/dashboard/WelcomeCard";
import TaskModal from "@/components/tasks/TaskModal";
import { Button } from "@/components/ui/button";
import { useTasks } from "@/hooks/useTasks";
import FutureConsequenceCard from "@/components/ai/FutureConsequenceCard";
import DeadlineCrashCard from "@/components/ai/DeadlineCrashCard";
import { generateAIResponse } from "@/services/aiService";

export default function Dashboard() {
  const { tasks, loading, addTask, editTask, removeTask, completeTask } =
    useTasks();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [futureLoading, setFutureLoading] = useState(false);
  const [futureResult, setFutureResult] = useState(null);
  const [deadlineCrashLoading, setDeadlineCrashLoading] = useState(false);
  const [deadlineCrashResult, setDeadlineCrashResult] = useState(null);

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

  const handleFutureAnalysis = async () => {
    setFutureLoading(true);
    try {
      const result = await generateAIResponse("future-consequence", tasks);
      setFutureResult(result);
    } finally {
      setFutureLoading(false);
    }
  };

  const handleDeadlineCrashAnalysis = async () => {
    setDeadlineCrashLoading(true);
  
    try {
      const result = await generateAIResponse("deadline-crash", tasks);
      setDeadlineCrashResult(result);
    } finally {
      setDeadlineCrashLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <WelcomeCard />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <TodaysTasks
            tasks={tasks}
            loading={loading}
            onToggleComplete={completeTask}
            onEdit={openEditModal}
            onDelete={handleDelete}
          />
          <UpcomingDeadlines tasks={tasks} loading={loading} />
        </div>

        <div className="space-y-6">
          <ProductivityScore />
          <AISummary />
          <FutureConsequenceCard
            loading={futureLoading}
            result={futureResult}
            onAnalyze={handleFutureAnalysis}
          />
          <DeadlineCrashCard
            loading={deadlineCrashLoading}
            result={deadlineCrashResult}
            onAnalyze={handleDeadlineCrashAnalysis}
          />
        </div>
      </div>

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