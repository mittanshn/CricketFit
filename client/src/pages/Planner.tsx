import { useEffect, useState } from "react";
import axios from "axios";

type SessionType = "Batting" | "Bowling" | "Fitness" | "Stretching & Mobility" | "Rest";

type PlannedExercise = {
  id: string;
  name: string;
  detail: string;
};

type DayPlan = {
  date: string;
  sessionType: SessionType;
  exercises: PlannedExercise[];
};

const SESSION_TYPES: SessionType[] = [
  "Batting",
  "Bowling",
  "Fitness",
  "Stretching & Mobility",
  "Rest",
];

const EXERCISE_CATEGORIES = ["Drills", "Nets", "Match Scenario"] as const;

function isBatOrBowl(sessionType: SessionType): boolean {
  return sessionType === "Batting" || sessionType === "Bowling";
}

function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getWeekStart(date: Date): Date {
  const day = date.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  const monday = new Date(date);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(date.getDate() + diff);
  return monday;
}

function addDays(date: Date, amount: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

function emptyPlan(date: string): DayPlan {
  return { date, sessionType: "Rest", exercises: [] };
}

function makeExerciseId(): string {
  return Math.random().toString(36).slice(2);
}

function Planner() {
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));
  const [plans, setPlans] = useState<Record<string, DayPlan>>({});
  const [savingDate, setSavingDate] = useState<string | null>(null);
  const [error, setError] = useState("");

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const weekEnd = days[6];

  useEffect(() => {
    const start = toDateKey(weekStart);
    const end = toDateKey(weekEnd);

    axios
      .get<DayPlan[]>("http://localhost:5001/plans", { params: { start, end } })
      .then((response) => {
        const byDate: Record<string, DayPlan> = {};
        for (const plan of response.data) {
          byDate[plan.date] = plan;
        }
        setPlans(byDate);
      })
      .catch(() => setError("Could not load the planner. Is the server running?"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekStart]);

  function getPlanFor(date: Date): DayPlan {
    const key = toDateKey(date);
    return plans[key] ?? emptyPlan(key);
  }

  function updatePlan(date: string, update: Partial<DayPlan>) {
    setPlans((prev) => ({
      ...prev,
      [date]: { ...(prev[date] ?? emptyPlan(date)), ...update },
    }));
  }

  function addExercise(date: string) {
    const plan = plans[date] ?? emptyPlan(date);
    updatePlan(date, {
      exercises: [...plan.exercises, { id: makeExerciseId(), name: "", detail: "" }],
    });
  }

  function updateExercise(
    date: string,
    id: string,
    field: "name" | "detail",
    value: string,
  ) {
    const plan = plans[date] ?? emptyPlan(date);
    updatePlan(date, {
      exercises: plan.exercises.map((exercise) =>
        exercise.id === id ? { ...exercise, [field]: value } : exercise,
      ),
    });
  }

  function removeExercise(date: string, id: string) {
    const plan = plans[date] ?? emptyPlan(date);
    updatePlan(date, {
      exercises: plan.exercises.filter((exercise) => exercise.id !== id),
    });
  }

  async function savePlan(date: string) {
    const plan = plans[date] ?? emptyPlan(date);
    setSavingDate(date);
    setError("");

    try {
      await axios.put(`http://localhost:5001/plans/${date}`, {
        sessionType: plan.sessionType,
        exercises: plan.exercises.filter((exercise) => exercise.name.trim() !== ""),
      });
    } catch {
      setError("Could not save the plan for that day.");
    } finally {
      setSavingDate(null);
    }
  }

  return (
    <div className="app">
      <h1 className="title">Weekly Planner</h1>
      <p className="subtitle">Plan your practices for the week ahead</p>

      {error && <p style={{ color: "#f87171" }}>{error}</p>}

      <div className="week-nav">
        <button onClick={() => setWeekStart(addDays(weekStart, -7))}>
          &larr; Previous Week
        </button>
        <span>
          {weekStart.toLocaleDateString(undefined, { month: "short", day: "numeric" })} –{" "}
          {weekEnd.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
        </span>
        <button onClick={() => setWeekStart(getWeekStart(new Date()))}>This Week</button>
        <button onClick={() => setWeekStart(addDays(weekStart, 7))}>
          Next Week &rarr;
        </button>
      </div>

      <div className="planner-grid">
        {days.map((date) => {
          const key = toDateKey(date);
          const plan = getPlanFor(date);

          return (
            <div className="day-card" key={key}>
              <h2>
                {date.toLocaleDateString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </h2>

              <select
                value={plan.sessionType}
                onChange={(event) => {
                  const nextType = event.target.value as SessionType;
                  updatePlan(key, {
                    sessionType: nextType,
                    exercises: nextType === "Rest" ? [] : plan.exercises,
                  });
                }}
              >
                {SESSION_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              {plan.sessionType !== "Rest" && (
                <div className="exercise-list">
                  {plan.exercises.map((exercise) => (
                    <div className="exercise-row" key={exercise.id}>
                      {isBatOrBowl(plan.sessionType) ? (
                        <select
                          value={exercise.name}
                          onChange={(event) =>
                            updateExercise(key, exercise.id, "name", event.target.value)
                          }
                        >
                          <option value="">Select Type</option>
                          {EXERCISE_CATEGORIES.map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          placeholder="Exercise"
                          value={exercise.name}
                          onChange={(event) =>
                            updateExercise(key, exercise.id, "name", event.target.value)
                          }
                        />
                      )}
                      <input
                        type="text"
                        placeholder={
                          isBatOrBowl(plan.sessionType)
                            ? exercise.name === "Drills"
                              ? "Describe the drill"
                              : "Describe what you're working on"
                            : "Sets/reps/notes"
                        }
                        value={exercise.detail}
                        onChange={(event) =>
                          updateExercise(key, exercise.id, "detail", event.target.value)
                        }
                      />
                      <button
                        type="button"
                        className="remove-exercise"
                        onClick={() => removeExercise(key, exercise.id)}
                        aria-label="Remove exercise"
                      >
                        &times;
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    className="add-exercise"
                    onClick={() => addExercise(key)}
                  >
                    + Add Exercise
                  </button>
                </div>
              )}

              <button
                type="button"
                className="save-day"
                disabled={savingDate === key}
                onClick={() => savePlan(key)}
              >
                {savingDate === key ? "Saving..." : "Save Day"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Planner;
