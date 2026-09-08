import { INTERVENTIONS } from "./data/interventions";
import type {
  InterventionContent,
  InterventionStage,
  RoastIntensity,
  FocusEventType,
  TaskType,
} from "@/types";

export interface SelectorParams {
  stage: InterventionStage;
  intensity: RoastIntensity;
  eventType: FocusEventType;
  taskType?: TaskType;
  lastInterventionId?: string;
}

/**
 * Selects an appropriate intervention taking into account the stage, intensity,
 * event trigger, task context, and cooldown on recently displayed interventions.
 */
export function selectIntervention({
  stage,
  intensity,
  eventType,
  taskType,
  lastInterventionId,
}: SelectorParams): InterventionContent {
  // 1. Task-specific candidates (e.g. JEE or Coding specific roasts)
  if (taskType) {
    const taskCandidates = INTERVENTIONS.filter(
      (item) =>
        item.intensity.includes(intensity) &&
        item.tag?.toLowerCase().includes(taskType.toLowerCase()) &&
        item.id !== lastInterventionId
    );

    if (taskCandidates.length > 0) {
      const randomIndex = Math.floor(Math.random() * taskCandidates.length);
      return taskCandidates[randomIndex];
    }
  }

  // 2. Exact match on stage + intensity + event type
  let candidates = INTERVENTIONS.filter(
    (item) =>
      item.stage === stage &&
      item.intensity.includes(intensity) &&
      item.eventTypes.includes(eventType)
  );

  // 3. Fallback: match on stage + intensity (any event type)
  if (candidates.length === 0) {
    candidates = INTERVENTIONS.filter(
      (item) => item.stage === stage && item.intensity.includes(intensity)
    );
  }

  // 4. Fallback: match on intensity only
  if (candidates.length === 0) {
    candidates = INTERVENTIONS.filter((item) =>
      item.intensity.includes(intensity)
    );
  }

  // 5. Fallback: all interventions
  if (candidates.length === 0) {
    candidates = INTERVENTIONS;
  }

  // Apply cooldown: filter out last displayed intervention if alternatives exist
  if (candidates.length > 1 && lastInterventionId) {
    const withoutLast = candidates.filter((item) => item.id !== lastInterventionId);
    if (withoutLast.length > 0) {
      candidates = withoutLast;
    }
  }

  const selectedIndex = Math.floor(Math.random() * candidates.length);
  return candidates[selectedIndex];
}
