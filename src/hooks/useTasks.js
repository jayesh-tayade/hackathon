import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  createTask,
  deleteTask,
  subscribeToTasks,
  taskFormToFirestore,
  toggleTaskComplete,
  updateTask,
} from "@/services/taskService";

export function useTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      setTasks([]);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToTasks(
      user.uid,
      (nextTasks) => {
        setTasks(nextTasks);
        setLoading(false);
      },
      (subscriptionError) => {
        setError(subscriptionError.message);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [user]);

  const addTask = useCallback(
    async (formData) => {
      if (!user) {
        throw new Error("You must be logged in to create tasks.");
      }

      return createTask(user.uid, taskFormToFirestore(formData));
    },
    [user],
  );

  const editTask = useCallback(
    async (taskId, formData) => {
      if (!user) {
        throw new Error("You must be logged in to edit tasks.");
      }

      await updateTask(user.uid, taskId, taskFormToFirestore(formData));
    },
    [user],
  );

  const removeTask = useCallback(
    async (taskId) => {
      if (!user) {
        throw new Error("You must be logged in to delete tasks.");
      }

      await deleteTask(user.uid, taskId);
    },
    [user],
  );

  const completeTask = useCallback(
    async (taskId, completed) => {
      if (!user) {
        throw new Error("You must be logged in to update tasks.");
      }

      await toggleTaskComplete(user.uid, taskId, completed);
    },
    [user],
  );

  return {
    tasks,
    loading,
    error,
    addTask,
    editTask,
    removeTask,
    completeTask,
  };
}
