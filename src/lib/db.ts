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

export class LockinDatabase extends Dexie {
  sessions!: Table<CompletedSessionRecord, string>;
  settings!: Table<UserSettingsRecord, string>;
  gamification!: Table<GamificationRecord, string>;

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
  }
}

export const db = new LockinDatabase();
