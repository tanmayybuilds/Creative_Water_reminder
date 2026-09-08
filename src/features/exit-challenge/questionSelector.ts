import { EXIT_QUESTIONS } from "./data/questions";
import type { ExitQuestion } from "@/types";

const RECENT_QUESTIONS_KEY = "lockin_recent_exit_questions";
const MAX_RECENT_HISTORY = 8;

function getRecentQuestionIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_QUESTIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRecentQuestionId(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const recent = getRecentQuestionIds();
    const updated = [id, ...recent.filter((qId) => qId !== id)].slice(0, MAX_RECENT_HISTORY);
    localStorage.setItem(RECENT_QUESTIONS_KEY, JSON.stringify(updated));
  } catch {}
}

/**
 * Selects a random personality question while avoiding recent questions.
 */
export function selectExitQuestion(preferredQuestionId?: string): ExitQuestion {
  if (preferredQuestionId) {
    const matched = EXIT_QUESTIONS.find((q) => q.id === preferredQuestionId);
    if (matched) return matched;
  }

  const recentIds = getRecentQuestionIds();
  const available = EXIT_QUESTIONS.filter((q) => !recentIds.includes(q.id));
  const pool = available.length > 0 ? available : EXIT_QUESTIONS;

  const selectedIndex = Math.floor(Math.random() * pool.length);
  const chosen = pool[selectedIndex];

  saveRecentQuestionId(chosen.id);
  return chosen;
}
