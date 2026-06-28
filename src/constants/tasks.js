export const TASK_PRIORITIES = ["low", "medium", "high"];

export const TASK_CATEGORIES = [
  "Work",
  "Personal",
  "Study",
  "Health",
  "Other",
];

export const PRIORITY_STYLES = {
  low: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  medium: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  high: "bg-red-500/10 text-red-700 dark:text-red-400",
};

export const EMPTY_TASK_FORM = {
  title: "",
  description: "",
  deadline: "",
  estimatedDuration: "",
  category: "Work",
  priority: "medium",
};
