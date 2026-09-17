import fs from "fs";
import path from "path";

export type ReadinessEntry = {
  date: string;
  soreness: number;
  energy: number;
  sleep: number;
  pain: number;
};

const DATA_DIR = path.join(__dirname, "..", "data");
const DATA_FILE = path.join(DATA_DIR, "readiness.json");

function ensureStore(): void {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "{}");
}

function readAll(): Record<string, ReadinessEntry> {
  ensureStore();
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
}

function writeAll(entries: Record<string, ReadinessEntry>): void {
  fs.writeFileSync(DATA_FILE, JSON.stringify(entries, null, 2));
}

export function getReadiness(date: string): ReadinessEntry | null {
  const entries = readAll();
  return entries[date] ?? null;
}

export function saveReadiness(entry: ReadinessEntry): ReadinessEntry {
  const entries = readAll();
  entries[entry.date] = entry;
  writeAll(entries);
  return entry;
}
