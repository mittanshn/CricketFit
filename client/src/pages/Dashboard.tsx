import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import DashboardCard from "../components/DashboardCard";

type PracticeSession = {
  id: string;
  date: string;
  sessionType: "Batting" | "Bowling" | "Fielding" | "Fitness" | "Rest";
  duration: number;
  intensity: "Low" | "Medium" | "High";
  performanceRating: number;
  fatigueLevel: number;
};

type TodaysPlan = {
  isRestDay: boolean;
  readinessNote: string;
  cricketSession: {
    source: "plan" | "role";
    sessionType: string;
    title: string;
    description: string;
    durationMinutes: number;
    intensity: string;
    exercises: { name: string; detail: string }[];
  } | null;
  fitnessWorkout: {
    category: string;
    title: string;
    description: string;
    durationMinutes: number;
    intensity: string;
  } | null;
};

function getWeekStart(date: Date): Date {
  const day = date.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  const monday = new Date(date);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(date.getDate() + diff);
  return monday;
}

function todayKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function Dashboard() {
  const navigate = useNavigate();

  const [sessions, setSessions] = useState<PracticeSession[] | null>(null);
  const [error, setError] = useState("");

  const [readinessChecked, setReadinessChecked] = useState<boolean | null>(null);
  const [soreness, setSoreness] = useState(3);
  const [energy, setEnergy] = useState(7);
  const [sleep, setSleep] = useState(7);
  const [pain, setPain] = useState(0);
  const [savingReadiness, setSavingReadiness] = useState(false);

  const [plan, setPlan] = useState<TodaysPlan | null>(null);

  useEffect(() => {
    axios
      .get<PracticeSession[]>("http://localhost:5001/practice")
      .then((response) => setSessions(response.data))
      .catch(() => setError("Could not load sessions. Is the server running?"));
  }, []);

  useEffect(() => {
    axios
      .get(`http://localhost:5001/readiness/${todayKey()}`)
      .then((response) => setReadinessChecked(response.data !== null))
      .catch(() => setReadinessChecked(true));
  }, []);

  useEffect(() => {
    if (readinessChecked) {
      axios
        .get<TodaysPlan>("http://localhost:5001/todays-plan", { params: { date: todayKey() } })
        .then((response) => setPlan(response.data))
        .catch(() => {});
    }
  }, [readinessChecked]);

  async function submitReadiness() {
    setSavingReadiness(true);
    try {
      await axios.put(`http://localhost:5001/readiness/${todayKey()}`, {
        soreness,
        energy,
        sleep,
        pain,
      });
      setReadinessChecked(true);
    } catch {
      setError("Could not save your readiness check-in.");
    } finally {
      setSavingReadiness(false);
    }
  }

  function startSession(params: {
    sessionType: string;
    duration: number;
    notes: string;
    drills?: string;
  }) {
    const search = new URLSearchParams({
      sessionType: params.sessionType,
      duration: String(params.duration),
      notes: params.notes,
      ...(params.drills ? { drills: params.drills } : {}),
    });
    navigate(`/practice?${search.toString()}`);
  }

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

      {readinessChecked === false && (
        <div className="readiness-card">
          <h2>How are you feeling today?</h2>

          <label>
            Soreness ({soreness}/10)
            <input
              type="range"
              min="0"
              max="10"
              value={soreness}
              onChange={(event) => setSoreness(Number(event.target.value))}
            />
          </label>

          <label>
            Energy ({energy}/10)
            <input
              type="range"
              min="0"
              max="10"
              value={energy}
              onChange={(event) => setEnergy(Number(event.target.value))}
            />
          </label>

          <label>
            Sleep Quality ({sleep}/10)
            <input
              type="range"
              min="0"
              max="10"
              value={sleep}
              onChange={(event) => setSleep(Number(event.target.value))}
            />
          </label>

          <label>
            Pain ({pain}/10)
            <input
              type="range"
              min="0"
              max="10"
              value={pain}
              onChange={(event) => setPain(Number(event.target.value))}
            />
          </label>

          <button className="add-button" disabled={savingReadiness} onClick={submitReadiness}>
            {savingReadiness ? "Saving..." : "See Today's Plan"}
          </button>
        </div>
      )}

      {readinessChecked && plan && (
        <div className="todays-plan">
          <h2 className="stats-section-title" style={{ margin: "0 0 12px" }}>
            Today's Plan
          </h2>

          {plan.isRestDay && (
            <div className="plan-card">
              <p>Rest day today — recovery is part of training.</p>
            </div>
          )}

          {!plan.isRestDay && (
            <div className="plan-cards">
              {plan.cricketSession && (
                <div className="plan-card">
                  <span className="plan-card-tag">
                    {plan.cricketSession.source === "plan" ? "From your planner" : "Recommended for your role"}
                  </span>
                  <h3>{plan.cricketSession.title}</h3>
                  <p>{plan.cricketSession.description}</p>
                  <p className="plan-card-meta">
                    {plan.cricketSession.durationMinutes} min · {plan.cricketSession.intensity} intensity
                  </p>
                  {plan.cricketSession.exercises.length > 0 && (
                    <ul>
                      {plan.cricketSession.exercises.map((exercise, index) => (
                        <li key={index}>
                          {exercise.name}
                          {exercise.detail ? ` — ${exercise.detail}` : ""}
                        </li>
                      ))}
                    </ul>
                  )}
                  <button
                    className="add-button"
                    onClick={() =>
                      startSession({
                        sessionType: plan.cricketSession!.sessionType,
                        duration: plan.cricketSession!.durationMinutes,
                        notes: plan.cricketSession!.description,
                        drills: plan.cricketSession!.exercises.map((e) => e.name).join(", "),
                      })
                    }
                  >
                    Start
                  </button>
                </div>
              )}

              {plan.fitnessWorkout && (
                <div className="plan-card">
                  <span className="plan-card-tag">{plan.readinessNote}</span>
                  <h3>{plan.fitnessWorkout.title}</h3>
                  <p>{plan.fitnessWorkout.description}</p>
                  <p className="plan-card-meta">
                    {plan.fitnessWorkout.durationMinutes} min · {plan.fitnessWorkout.intensity} intensity
                  </p>
                  <button
                    className="add-button"
                    onClick={() =>
                      startSession({
                        sessionType: "Fitness",
                        duration: plan.fitnessWorkout!.durationMinutes,
                        notes: plan.fitnessWorkout!.description,
                      })
                    }
                  >
                    Start
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

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
