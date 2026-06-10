import Database from "better-sqlite3"
import path from "path"

type Record = {
  lastClaimDate: string | null
  rewardAmount: number
}

export const DAILY_REWARD_AMOUNT = 50

const DB_DIR = path.join(process.cwd(), "data")
const DB_FILE = path.join(DB_DIR, "dailyLogin.sqlite")

let db: Database.Database | null = null

function getDb() {
  if (db) return db
  try {
    // Ensure directory exists
    const fs = require("fs")
    if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true })
    db = new Database(DB_FILE)
    db.pragma("journal_mode = WAL")
    db.prepare(
      `CREATE TABLE IF NOT EXISTS daily_claims (
        user TEXT PRIMARY KEY,
        lastClaimDate TEXT,
        rewardAmount INTEGER
      )`
    ).run()
    return db
  } catch (e) {
    console.error("Failed to open sqlite DB:", e)
    throw e
  }
}

export async function getRecord(address: string): Promise<Record> {
  const db = getDb()
  const key = address.toLowerCase()
  const row = db.prepare("SELECT lastClaimDate, rewardAmount FROM daily_claims WHERE user = ?").get(key)
  if (row) {
    return { lastClaimDate: row.lastClaimDate, rewardAmount: row.rewardAmount }
  }
  const initial = { lastClaimDate: null, rewardAmount: DAILY_REWARD_AMOUNT }
  db.prepare("INSERT OR REPLACE INTO daily_claims (user, lastClaimDate, rewardAmount) VALUES (?, ?, ?)").run(key, initial.lastClaimDate, initial.rewardAmount)
  return initial
}

export async function setClaimed(address: string, dateIso: string) {
  const db = getDb()
  const key = address.toLowerCase()
  db.prepare("INSERT OR REPLACE INTO daily_claims (user, lastClaimDate, rewardAmount) VALUES (?, ?, ?)").run(key, dateIso, DAILY_REWARD_AMOUNT)
}

export async function resetStore() {
  const db = getDb()
  db.prepare("DELETE FROM daily_claims").run()
}
