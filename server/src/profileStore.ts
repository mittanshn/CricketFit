import fs from "fs";
import path from "path";

export type PlayerRole =
  | "batsman"
  | "bowler"
  | "battingAllrounder"
  | "bowlingAllrounder"
  | "wicketkeeper";

export type SkillLevel = "beginner" | "intermediate" | "advanced" | "elite";

export type WeeklyTargets = {
  sessions: number;
  minutes: number;
  balls: number;
  fitnessSessions: number;
};

export type PlayerProfile = {
  onboarded: boolean;
  role: PlayerRole;
  skillLevel: SkillLevel;
  focus: string;
  weeklyAvailability: number;
  upcomingMatchDate: string | null;
  weeklyTargets: WeeklyTargets;
};

const DEFAULT_PROFILE: PlayerProfile = {
  onboarded: false,
  role: "battingAllrounder",
  skillLevel: "intermediate",
  focus: "",
  weeklyAvailability: 4,
  upcomingMatchDate: null,
  weeklyTargets: {
    sessions: 4,
    minutes: 240,
    balls: 200,
    fitnessSessions: 2,
  },
};

const DATA_DIR = path.join(__dirname, "..", "data");
const DATA_FILE = path.join(DATA_DIR, "profile.json");

function ensureStore(): void {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_PROFILE, null, 2));
  }
}

export function getProfile(): PlayerProfile {
  ensureStore();
  const stored = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  return { ...DEFAULT_PROFILE, ...stored };
}

export function saveProfile(profile: PlayerProfile): PlayerProfile {
  ensureStore();
  fs.writeFileSync(DATA_FILE, JSON.stringify(profile, null, 2));
  return profile;
}
