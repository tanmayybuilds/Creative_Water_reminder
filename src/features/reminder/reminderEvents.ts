import type { BreakEvent, BreakEventType } from "./types";

export type BreakEventListener = (event: BreakEvent) => void;

const listeners = new Set<BreakEventListener>();

/**
 * Subscribes a listener function to break events.
 * Returns an unsubscribe function.
 */
export function subscribeToBreakEvents(listener: BreakEventListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Emits a break event to all registered listeners.
 */
export function emitBreakEvent(event: BreakEvent): void {
  listeners.forEach((listener) => {
    try {
      listener(event);
    } catch (error) {
      console.error(`[BreakEventBus] Error handling event ${event.type}:`, error);
    }
  });
}

/**
 * Helper to construct and emit a typed break event cleanly.
 */
export function dispatchBreakEvent(
  type: BreakEventType,
  state: {
    intervalMinutes: number;
    consecutiveDismissals: number;
    totalDismissals: number;
    breaksAccepted: number;
  },
  metadata?: Record<string, unknown>
): BreakEvent {
  const event: BreakEvent = {
    type,
    timestamp: Date.now(),
    intervalMinutes: state.intervalMinutes,
    consecutiveDismissals: state.consecutiveDismissals,
    totalDismissals: state.totalDismissals,
    breaksAccepted: state.breaksAccepted,
    metadata,
  };

  emitBreakEvent(event);
  return event;
}
