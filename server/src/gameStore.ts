import fs from "fs";
import path from "path";

export type Dismissal =
  | "Not Out"
  | "Bowled"
  | "Caught"
  | "LBW"
  | "Run Out"
  | "Stumped"
  | "Other";

export type GameEntry = {
  id: string;
  date: string;
  opponent: string;
  matchType: string;
  battingRuns: number;
  battingBalls: number;
  fours: number;
  sixes: number;
  dismissal: Dismissal;
  oversBowled: number;
  runsConceded: number;
  wickets: number;
  catches: number;
  runOuts: number;
  notes: string;
};

const DATA_DIR = path.join(__dirname, "..", "data");
const DATA_FILE = path.join(DATA_DIR, "games.json");

function ensureStore(): void {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "[]");
}

export function getGames(): GameEntry[] {
  ensureStore();
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
}

export function addGame(game: GameEntry): void {
  const games = getGames();
  games.push(game);
  fs.writeFileSync(DATA_FILE, JSON.stringify(games, null, 2));
}
