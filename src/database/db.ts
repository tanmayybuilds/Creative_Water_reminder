import Database from "@tauri-apps/plugin-sql";

let dbInstance: Database | null = null;

/**
 * Initializes and returns the local SQLite database instance.
 * Automatically handles schema migrations and works offline.
 */
export async function getDatabase(): Promise<Database | null> {
  if (dbInstance) return dbInstance;

  // Check if running within Tauri native shell
  if (typeof window !== "undefined" && "__TAURI_INTERNALS__" in window) {
    try {
      dbInstance = await Database.load("sqlite:lockin.db");
      return dbInstance;
    } catch (error) {
      console.warn("Could not load native SQLite database:", error);
      return null;
    }
  }

  return null;
}

/**
 * Initializes database tables and default schema.
 */
export async function initDatabase(): Promise<void> {
  const db = await getDatabase();
  if (!db) {
    // In web/dev mode, SQLite is mocked or handled via localStorage fallback
    return;
  }

  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS break_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_type TEXT NOT NULL,
        interval_minutes INTEGER NOT NULL,
        timestamp INTEGER NOT NULL
      );
    `);
  } catch (error) {
    console.error("Failed to initialize SQLite tables:", error);
  }
}
