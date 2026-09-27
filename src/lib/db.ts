import Dexie, { type Table } from "dexie";
import type { CompletedSessionRecord } from "@/types";

export interface UserSettingsRecord {
  key: string;
  value: unknown;
}

export interface GamificationRecord {
  id: string;
  xp: number;
  streak: number;
  level: number;
  lastActiveDate: string;
}

export interface HydrationLogRecord {
  id?: number;
  timestamp: number;
  amountMl: number;
  dateStr: string; // YYYY-MM-DD
}

export class LockinDatabase extends Dexie {
  sessions!: Table<CompletedSessionRecord, string>;
  settings!: Table<UserSettingsRecord, string>;
  gamification!: Table<GamificationRecord, string>;
  hydration!: Table<HydrationLogRecord, number>;

  constructor() {
    super("LockinDB");

    // Version 1 (Initial schema)
    this.version(1).stores({
      sessions: "++id, startTime, status, mode",
      settings: "key",
      gamification: "id",
    });

    // Version 2 (Production Focus Timer schema with UUID string IDs)
    this.version(2).stores({
      sessions: "id, startedAt, completedAt, status, taskType, roastIntensity",
      settings: "key",
      gamification: "id",
    });

    // Version 3 (Hydration logs and water reminder daily tracking)
    this.version(3).stores({
      sessions: "id, startedAt, completedAt, status, taskType, roastIntensity",
      settings: "key",
      gamification: "id",
      hydration: "++id, timestamp, dateStr, amountMl",
    });
  }
}

export const db = new LockinDatabase();

/**
 * Persists a single hydration intake entry into Dexie.
 */
export async function logHydrationEntry(amountMl: number): Promise<number> {
  const now = new Date();
  const dateStr = now.toISOString().split("T")[0];
  try {
    const id = await db.hydration.add({
      timestamp: now.getTime(),
      amountMl,
      dateStr,
    });
    return Number(id);
  } catch (err) {
    console.error("Failed to log hydration in Dexie:", err);
    return 0;
  }
}

/**
 * Calculates total water consumed today in milliliters.
 */
export async function getTodayHydrationTotal(): Promise<number> {
  const todayStr = new Date().toISOString().split("T")[0];
  try {
    const logs = await db.hydration.where("dateStr").equals(todayStr).toArray();
    return logs.reduce((sum, item) => sum + item.amountMl, 0);
  } catch (err) {
    console.warn("Could not retrieve today's hydration from Dexie:", err);
    return 0;
  }
}
