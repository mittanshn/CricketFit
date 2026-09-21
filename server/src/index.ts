import dotenv from "dotenv";
dotenv.config();

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
import { askCoach, CoachMessage } from "./coach";

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

app.post("/demo/seed", (req, res) => {
  function daysAgoIso(days: number): string {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString();
  }

  function dateKeyOffset(offset: number): string {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return d.toISOString().slice(0, 10);
  }

  const demoSessions: Array<Omit<PracticeSession, "id" | "date"> & { daysAgo: number }> = [
    { daysAgo: 13, sessionType: "Batting", duration: 60, intensity: "Medium", performanceRating: 7, fatigueLevel: 5, notes: "Worked on cover drives", drills: "Cover drives, pull shots", balls: 80, videoUrl: "" },
    { daysAgo: 12, sessionType: "Bowling", duration: 45, intensity: "High", performanceRating: 8, fatigueLevel: 6, notes: "Good yorker consistency", drills: "Yorkers, bouncers", balls: 60, videoUrl: "" },
    { daysAgo: 10, sessionType: "Fielding", duration: 30, intensity: "Medium", performanceRating: 7, fatigueLevel: 4, notes: "Sharper reflexes today", drills: "Slip catching, ground fielding", balls: 0, videoUrl: "" },
    { daysAgo: 9, sessionType: "Fitness", duration: 45, intensity: "High", performanceRating: 8, fatigueLevel: 7, notes: "Strong session", drills: "", balls: 0, videoUrl: "" },
    { daysAgo: 7, sessionType: "Batting", duration: 75, intensity: "High", performanceRating: 6, fatigueLevel: 7, notes: "Struggled early against spin", drills: "Playing spin, footwork", balls: 90, videoUrl: "" },
    { daysAgo: 6, sessionType: "Bowling", duration: 40, intensity: "Medium", performanceRating: 7, fatigueLevel: 5, notes: "Consistent line and length", drills: "Line and length", balls: 55, videoUrl: "" },
    { daysAgo: 4, sessionType: "Fitness", duration: 30, intensity: "Low", performanceRating: 7, fatigueLevel: 3, notes: "Active recovery", drills: "", balls: 0, videoUrl: "" },
    { daysAgo: 3, sessionType: "Fielding", duration: 25, intensity: "Low", performanceRating: 8, fatigueLevel: 3, notes: "Good catching drills", drills: "High catches", balls: 0, videoUrl: "" },
    { daysAgo: 1, sessionType: "Batting", duration: 60, intensity: "Medium", performanceRating: 8, fatigueLevel: 5, notes: "Feeling good at the crease", drills: "Nets", balls: 85, videoUrl: "" },
    { daysAgo: 0, sessionType: "Bowling", duration: 50, intensity: "High", performanceRating: 6, fatigueLevel: 8, notes: "Tired legs, need recovery", drills: "Variations", balls: 65, videoUrl: "" },
  ];

  for (const template of demoSessions) {
    const { daysAgo, ...rest } = template;
    addSession({ ...rest, id: randomUUID(), date: daysAgoIso(daysAgo) });
  }

  addGame({
    id: randomUUID(),
    date: daysAgoIso(8),
    opponent: "Riverside CC",
    matchType: "T20",
    battingRuns: 42,
    battingBalls: 30,
    fours: 4,
    sixes: 2,
    dismissal: "Caught",
    oversBowled: 3,
    runsConceded: 22,
    wickets: 1,
    catches: 1,
    runOuts: 0,
    notes: "Started slow, found timing after 10 balls.",
  });

  addGame({
    id: randomUUID(),
    date: daysAgoIso(1),
    opponent: "Oakfield CC",
    matchType: "Club Match",
    battingRuns: 18,
    battingBalls: 20,
    fours: 1,
    sixes: 0,
    dismissal: "Bowled",
    oversBowled: 4,
    runsConceded: 28,
    wickets: 2,
    catches: 0,
    runOuts: 1,
    notes: "Got bowled by a good yorker; bowling was tidy.",
  });

  const demoPlans: Array<{
    offset: number;
    sessionType: "Batting" | "Bowling" | "Fielding" | "Fitness" | "Stretching & Mobility" | "Rest";
    exercises: { id: string; name: string; detail: string }[];
  }> = [
    { offset: 0, sessionType: "Batting", exercises: [{ id: randomUUID(), name: "Nets", detail: "Playing spin off the front foot" }] },
    { offset: 1, sessionType: "Fitness", exercises: [{ id: randomUUID(), name: "Sprint intervals", detail: "6x100m" }] },
    { offset: 2, sessionType: "Bowling", exercises: [{ id: randomUUID(), name: "Drills", detail: "Yorkers, 4 sets of 10" }] },
    { offset: 3, sessionType: "Rest", exercises: [] },
    { offset: 4, sessionType: "Fielding", exercises: [{ id: randomUUID(), name: "Catching drills", detail: "High catches and slips" }] },
    { offset: 5, sessionType: "Stretching & Mobility", exercises: [{ id: randomUUID(), name: "Mobility routine", detail: "Hips, shoulders, ankles" }] },
    { offset: 6, sessionType: "Rest", exercises: [] },
  ];

  for (const plan of demoPlans) {
    upsertPlan(dateKeyOffset(plan.offset), plan.sessionType, plan.exercises);
  }

  res.status(201).json({ message: "Demo data seeded" });
});

app.post("/coach/ask", async (req, res) => {
  const { question, history } = req.body as {
    question?: string;
    history?: CoachMessage[];
  };

  if (!question || !question.trim()) {
    res.status(400).json({ message: "question is required" });
    return;
  }

  try {
    const answer = await askCoach(question, Array.isArray(history) ? history : []);
    res.json({ answer });
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_CONFIGURED") {
      res.status(500).json({
        message:
          "The AI Coach isn't set up yet. Add ANTHROPIC_API_KEY to server/.env and restart the server.",
      });
      return;
    }
    console.error(error);
    res.status(500).json({ message: "Could not reach the AI Coach right now." });
  }
});

const PORT = 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
