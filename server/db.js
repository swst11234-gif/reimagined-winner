const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

const DEFAULT_DB_PATH = "./data/orders.db";

function resolveDbPath() {
  const envPath = process.env.DB_PATH && process.env.DB_PATH.trim();
  const target = envPath || DEFAULT_DB_PATH;
  return path.isAbsolute(target) ? target : path.resolve(process.cwd(), target);
}

function initDb() {
  const dbPath = resolveDbPath();
  const dir = path.dirname(dbPath);
  fs.mkdirSync(dir, { recursive: true });

  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      status TEXT NOT NULL
    );
  `);

  return { db, dbPath };
}

module.exports = {
  initDb,
};
