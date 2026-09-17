import express from "express";
import cors from "cors";
import { randomUUID } from "crypto";
import { addSession, getSessions, PracticeSession } from "./store";
import { buildAnalytics, Role } from "./analytics";
import {
  deletePlan,
  getPlansInRange,
  upsertPlan,
  PlannedExercise,
  PlanSessionType,
} from "./planStore";
import { addGame, getGames, GameEntry, Dismissal } from "./gameStore";
import { getProfile, saveProfile, PlayerProfile } from "./profileStore";
import { getReadiness, saveReadiness, ReadinessEntry } from "./readinessStore";
import { SESSION_TEMPLATES } from "./templates";
import { buildTodaysPlan } from "./todaysPlan";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("CricketFit API is running");
});

app.get("/practice", (req, res) => {
  res.json(getSessions());
});

app.post("/practice", (req, res) => {
  const {
    sessionType,
    duration,
    intensity,
    performanceRating,
    fatigueLevel,
    notes,
    drills,
    balls,
    videoUrl,
  } = req.body;

  if (!sessionType || !duration) {
    res.status(400).json({ message: "sessionType and duration are required" });
    return;
  }

  const session: PracticeSession = {
    id: randomUUID(),
    date: new Date().toISOString(),
    sessionType,
    duration: Number(duration),
    intensity: intensity || "Medium",
    performanceRating: Number(performanceRating) || 0,
    fatigueLevel: Number(fatigueLevel) || 0,
    notes: notes || "",
    drills: drills || "",
    balls: Number(balls) || 0,
    videoUrl: videoUrl || "",
  };

  addSession(session);

  res.status(201).json({ message: "Practice session saved", session });
});

app.get("/analytics", (req, res) => {
  const role = (req.query.role as Role) || "battingAllrounder";
  res.json(buildAnalytics(getSessions(), role));
});

app.get("/plans", (req, res) => {
  const { start, end } = req.query;

  if (
    typeof start !== "string" ||
    typeof end !== "string" ||
    !DATE_RE.test(start) ||
    !DATE_RE.test(end)
  ) {
    res.status(400).json({ message: "start and end query params (YYYY-MM-DD) are required" });
    return;
  }

  res.json(getPlansInRange(start, end));
});

app.put("/plans/:date", (req, res) => {
  const { date } = req.params;

  if (!DATE_RE.test(date)) {
    res.status(400).json({ message: "date must be in YYYY-MM-DD format" });
    return;
  }

  const { sessionType, exercises } = req.body as {
    sessionType: PlanSessionType;
    exercises: PlannedExercise[];
  };

  if (!sessionType) {
    res.status(400).json({ message: "sessionType is required" });
    return;
  }

  const plan = upsertPlan(date, sessionType, Array.isArray(exercises) ? exercises : []);
  res.json(plan);
});

app.delete("/plans/:date", (req, res) => {
  const { date } = req.params;

  if (!DATE_RE.test(date)) {
    res.status(400).json({ message: "date must be in YYYY-MM-DD format" });
    return;
  }

  deletePlan(date);
  res.status(204).send();
});

app.get("/games", (req, res) => {
  res.json(getGames());
});

app.post("/games", (req, res) => {
  const {
    opponent,
    matchType,
    battingRuns,
    battingBalls,
    fours,
    sixes,
    dismissal,
    oversBowled,
    runsConceded,
    wickets,
    catches,
    runOuts,
    notes,
  } = req.body;

  if (!opponent || !matchType) {
    res.status(400).json({ message: "opponent and matchType are required" });
    return;
  }

  const game: GameEntry = {
    id: randomUUID(),
    date: new Date().toISOString(),
    opponent,
    matchType,
    battingRuns: Number(battingRuns) || 0,
    battingBalls: Number(battingBalls) || 0,
    fours: Number(fours) || 0,
    sixes: Number(sixes) || 0,
    dismissal: (dismissal as Dismissal) || "Not Out",
    oversBowled: Number(oversBowled) || 0,
    runsConceded: Number(runsConceded) || 0,
    wickets: Number(wickets) || 0,
    catches: Number(catches) || 0,
    runOuts: Number(runOuts) || 0,
    notes: notes || "",
  };

  addGame(game);

  res.status(201).json({ message: "Game saved", game });
});

app.get("/profile", (req, res) => {
  res.json(getProfile());
});

app.put("/profile", (req, res) => {
  const { role, skillLevel, focus, weeklyAvailability, upcomingMatchDate } = req.body;

  const sessions = Number(weeklyAvailability) || 0;

  const profile: PlayerProfile = {
    onboarded: true,
    role: role || "battingAllrounder",
    skillLevel: skillLevel || "intermediate",
    focus: focus || "",
    weeklyAvailability: sessions,
    upcomingMatchDate: upcomingMatchDate || null,
    weeklyTargets: {
      sessions,
      minutes: sessions * 60,
      balls: sessions * 50,
      fitnessSessions: Math.max(1, Math.round(sessions / 2)),
    },
  };

  res.json(saveProfile(profile));
});

app.get("/readiness/:date", (req, res) => {
  const { date } = req.params;

  if (!DATE_RE.test(date)) {
    res.status(400).json({ message: "date must be in YYYY-MM-DD format" });
    return;
  }

  res.json(getReadiness(date));
});

app.put("/readiness/:date", (req, res) => {
  const { date } = req.params;

  if (!DATE_RE.test(date)) {
    res.status(400).json({ message: "date must be in YYYY-MM-DD format" });
    return;
  }

  const { soreness, energy, sleep, pain } = req.body;

  const entry: ReadinessEntry = {
    date,
    soreness: Number(soreness) || 0,
    energy: Number(energy) || 0,
    sleep: Number(sleep) || 0,
    pain: Number(pain) || 0,
  };

  res.json(saveReadiness(entry));
});

app.get("/templates", (req, res) => {
  res.json(SESSION_TEMPLATES);
});

app.get("/todays-plan", (req, res) => {
  const { date } = req.query;

  if (typeof date !== "string" || !DATE_RE.test(date)) {
    res.status(400).json({ message: "date query param (YYYY-MM-DD) is required" });
    return;
  }

  const profile = getProfile();
  const readiness = getReadiness(date);
  const [dayPlan] = getPlansInRange(date, date);

  res.json(buildTodaysPlan(profile, readiness, dayPlan ?? null));
});

const PORT = 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
