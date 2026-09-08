-- Migration 01: Initial local database schema for LOCKIN desktop
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS break_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT NOT NULL,
  interval_minutes INTEGER NOT NULL,
  timestamp INTEGER NOT NULL
);
