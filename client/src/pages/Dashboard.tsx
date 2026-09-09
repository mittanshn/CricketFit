import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import DashboardCard from "../components/DashboardCard";

type PracticeSession = {
  id: string;
  date: string;
  sessionType: "Batting" | "Bowling" | "Fitness" | "Rest";
  duration: number;
  intensity: "Low" | "Medium" | "High";
  performanceRating: number;
  fatigueLevel: number;
};

function getWeekStart(date: Date): Date {
  const day = date.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  const monday = new Date(date);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(date.getDate() + diff);
  return monday;
}

function Dashboard() {
  const [sessions, setSessions] = useState<PracticeSession[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get<PracticeSession[]>("http://localhost:5001/practice")
      .then((response) => setSessions(response.data))
      .catch(() => setError("Could not load sessions. Is the server running?"));
  }, []);

  const weekStart = getWeekStart(new Date());
  const thisWeekSessions = (sessions ?? []).filter(
    (s) => new Date(s.date) >= weekStart,
  );

  const sessionsThisWeek = thisWeekSessions.length;
  const fitnessWorkouts = thisWeekSessions.filter(
    (s) => s.sessionType === "Fitness",
  ).length;
  const totalMinutes = thisWeekSessions.reduce((sum, s) => sum + s.duration, 0);

  return (
    <div className="app">
      <h1 className="title">CricketFit</h1>

      <p className="subtitle">Cricket Practice & Fitness Tracker</p>

      {error && <p style={{ color: "#f87171" }}>{error}</p>}

      <div className="cards-container">
        <DashboardCard
          title="Cricket Sessions"
          value={`${sessionsThisWeek} Sessions This Week`}
        />

        <DashboardCard
          title="Fitness Workouts"
          value={`${fitnessWorkouts} Workouts Completed`}
        />

        <DashboardCard
          title="Training Minutes"
          value={`${totalMinutes} Total Minutes`}
        />
      </div>

      <Link to="/practice">
        <button className="add-button">Add Session</button>
      </Link>
    </div>
  );
}

export default Dashboard;
