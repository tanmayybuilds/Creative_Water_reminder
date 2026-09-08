import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/plugin-notification";

export interface BreakNotificationPayload {
  title?: string;
  body?: string;
}

const DEFAULT_TITLE = "LOCKIN — Time for a break";
const DEFAULT_BODY = "Step away from the screen and take a short break.";

/**
 * Triggers a desktop notification when a break is due.
 * Uses native Tauri notifications if available, otherwise falls back gracefully.
 */
export async function triggerBreakNotification(
  payload: BreakNotificationPayload = {}
): Promise<boolean> {
  const title = payload.title || DEFAULT_TITLE;
  const body = payload.body || DEFAULT_BODY;

  // 1. Tauri Native Notification (Desktop)
  if (typeof window !== "undefined" && "__TAURI_INTERNALS__" in window) {
    try {
      let granted = await isPermissionGranted();
      if (!granted) {
        const permission = await requestPermission();
        granted = permission === "granted";
      }

      if (granted) {
        sendNotification({
          title,
          body,
        });
        return true;
      }
    } catch (error) {
      console.warn("[NotificationService] Tauri notification notice:", error);
    }
  }

  // 2. Web Notification Fallback (for local development preview in browser)
  if (typeof window !== "undefined" && "Notification" in window) {
    try {
      if (Notification.permission === "granted") {
        new Notification(title, { body });
        return true;
      } else if (Notification.permission !== "denied") {
        const perm = await Notification.requestPermission();
        if (perm === "granted") {
          new Notification(title, { body });
          return true;
        }
      }
    } catch (error) {
      console.warn("[NotificationService] Web notification fallback notice:", error);
    }
  }

  return false;
}
