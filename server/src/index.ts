import express from "express";
import cors from "cors";
import { randomUUID } from "crypto";
import { addSession, getSessions, PracticeSession, SessionType } from "./store";
import { buildAnalytics, Role } from "./analytics";
import { deletePlan, getPlansInRange, upsertPlan, PlannedExercise } from "./planStore";

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
  const { sessionType, duration, intensity, performanceRating, fatigueLevel } = req.body;

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
    sessionType: SessionType;
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

const PORT = 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
