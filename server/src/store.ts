import fs from "fs";
import path from "path";

export type SessionType = "Batting" | "Bowling" | "Fielding" | "Fitness" | "Rest";
export type Intensity = "Low" | "Medium" | "High";

export type PracticeSession = {
  id: string;
  date: string;
  sessionType: SessionType;
  duration: number;
  intensity: Intensity;
  performanceRating: number;
  fatigueLevel: number;
  notes: string;
  drills: string;
  balls: number;
  videoUrl: string;
};

const DATA_DIR = path.join(__dirname, "..", "data");
const DATA_FILE = path.join(DATA_DIR, "sessions.json");

function ensureStore(): void {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "[]");
}

export function getSessions(): PracticeSession[] {
  ensureStore();
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
}

export function addSession(session: PracticeSession): void {
  const sessions = getSessions();
  sessions.push(session);
  fs.writeFileSync(DATA_FILE, JSON.stringify(sessions, null, 2));
}
