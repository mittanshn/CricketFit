import express from "express";
import cors from "cors";
import { randomUUID } from "crypto";
import { addSession, getSessions, PracticeSession } from "./store";
import { buildAnalytics, Role } from "./analytics";

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

const PORT = 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
