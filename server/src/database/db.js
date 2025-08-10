import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database file path
const DB_PATH = path.join(__dirname, '../../data/tank_configurator.db');

let db = null;

// Initialize database connection
const initDB = async () => {
  if (!db) {
    // Create data directory if it doesn't exist
    const dataDir = path.dirname(DB_PATH);
    await import('fs').then(fs => {
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
    });

    db = await open({
      filename: DB_PATH,
      driver: sqlite3.Database
    });

    console.log('Connected to SQLite database');
  }
  return db;
};

// Get database instance
const getDB = async () => {
  if (!db) {
    await initDB();
  }
  return db;
};

export { getDB, initDB };