import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";

const getTasksCollection = (userId) =>
  collection(db, "users", userId, "tasks");

export const subscribeToTasks = (userId, callback, onError) => {
  const tasksQuery = query(
    getTasksCollection(userId),
    orderBy("deadline", "asc"),
  );

  return onSnapshot(
    tasksQuery,
    (snapshot) => {
      const tasks = snapshot.docs.map((taskDoc) => ({
        id: taskDoc.id,
        ...taskDoc.data(),
      }));
      callback(tasks);
    },
    onError,
  );
};

export const createTask = async (userId, taskData) => {
  const docRef = await addDoc(getTasksCollection(userId), {
    ...taskData,
    completed: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
};

export const updateTask = async (userId, taskId, taskData) => {
  const taskRef = doc(db, "users", userId, "tasks", taskId);

  await updateDoc(taskRef, {
    ...taskData,
    updatedAt: serverTimestamp(),
  });
};

export const deleteTask = async (userId, taskId) => {
  const taskRef = doc(db, "users", userId, "tasks", taskId);
  await deleteDoc(taskRef);
};

export const toggleTaskComplete = async (userId, taskId, completed) => {
  await updateTask(userId, taskId, { completed });
};

export const formatDateTimeLocal = (date) => {
  const pad = (value) => String(value).padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const taskFormToFirestore = (formData) => ({
  title: formData.title.trim(),
  description: formData.description.trim(),
  deadline: Timestamp.fromDate(new Date(formData.deadline)),
  estimatedDuration: Number(formData.estimatedDuration) || 0,
  category: formData.category.trim(),
  priority: formData.priority,
});

export const taskToFormData = (task) => ({
  title: task.title || "",
  description: task.description || "",
  deadline: task.deadline?.toDate
    ? formatDateTimeLocal(task.deadline.toDate())
    : "",
  estimatedDuration: task.estimatedDuration?.toString() || "",
  category: task.category || "",
  priority: task.priority || "medium",
});

export const getTaskDeadlineDate = (task) => {
  if (!task.deadline) {
    return null;
  }

  return task.deadline.toDate ? task.deadline.toDate() : new Date(task.deadline);
};

export const isSameDay = (dateA, dateB) =>
  dateA.getFullYear() === dateB.getFullYear() &&
  dateA.getMonth() === dateB.getMonth() &&
  dateA.getDate() === dateB.getDate();

export const isToday = (task) => {
  const deadline = getTaskDeadlineDate(task);
  return deadline ? isSameDay(deadline, new Date()) : false;
};

export const isUpcoming = (task) => {
  const deadline = getTaskDeadlineDate(task);
  if (!deadline || task.completed) {
    return false;
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const deadlineDay = new Date(deadline);
  deadlineDay.setHours(0, 0, 0, 0);

  return deadlineDay > now;
};
