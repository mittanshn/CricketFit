import fs from "fs";
import path from "path";
import { SessionType } from "./store";

export type PlannedExercise = {
  id: string;
  name: string;
  detail: string;
};

export type DayPlan = {
  date: string;
  sessionType: SessionType;
  exercises: PlannedExercise[];
};

const DATA_DIR = path.join(__dirname, "..", "data");
const DATA_FILE = path.join(DATA_DIR, "plans.json");

function ensureStore(): void {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "{}");
}

function readAll(): Record<string, DayPlan> {
  ensureStore();
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
}

function writeAll(plans: Record<string, DayPlan>): void {
  fs.writeFileSync(DATA_FILE, JSON.stringify(plans, null, 2));
}

export function getPlansInRange(start: string, end: string): DayPlan[] {
  const plans = readAll();
  return Object.values(plans)
    .filter((plan) => plan.date >= start && plan.date <= end)
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function upsertPlan(
  date: string,
  sessionType: SessionType,
  exercises: PlannedExercise[],
): DayPlan {
  const plans = readAll();
  const plan: DayPlan = { date, sessionType, exercises };
  plans[date] = plan;
  writeAll(plans);
  return plan;
}

export function deletePlan(date: string): void {
  const plans = readAll();
  delete plans[date];
  writeAll(plans);
}
