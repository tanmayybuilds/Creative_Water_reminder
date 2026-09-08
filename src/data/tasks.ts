import {
  BookOpen,
  Atom,
  FileText,
  Code2,
  BookMarked,
  Palette,
  Dumbbell,
  Pencil,
} from "lucide-react";
import type { TaskType } from "@/types";

export interface TaskOption {
  type: TaskType;
  label: string;
  description: string;
  icon: typeof BookOpen;
}

export const TASK_OPTIONS: TaskOption[] = [
  {
    type: "study",
    label: "Study",
    description: "General study session",
    icon: BookOpen,
  },
  {
    type: "jee",
    label: "JEE Revision",
    description: "Exam prep grind",
    icon: Atom,
  },
  {
    type: "homework",
    label: "Homework",
    description: "Assignments & tasks",
    icon: FileText,
  },
  {
    type: "coding",
    label: "Coding",
    description: "Build something cool",
    icon: Code2,
  },
  {
    type: "reading",
    label: "Reading",
    description: "Books & articles",
    icon: BookMarked,
  },
  {
    type: "creative",
    label: "Creative Work",
    description: "Design, write, create",
    icon: Palette,
  },
  {
    type: "workout",
    label: "Workout",
    description: "Physical training",
    icon: Dumbbell,
  },
  {
    type: "custom",
    label: "Custom",
    description: "Define your own",
    icon: Pencil,
  },
];

export const TASK_LABELS: Record<TaskType, string> = {
  study: "Study",
  jee: "JEE Revision",
  homework: "Homework",
  coding: "Coding",
  reading: "Reading",
  creative: "Creative Work",
  workout: "Workout",
  custom: "Custom",
};
