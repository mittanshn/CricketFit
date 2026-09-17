import { useEffect, useState } from "react";
import axios from "axios";
import DashboardCard from "../components/DashboardCard";

type Role = "batsman" | "bowler" | "battingAllrounder" | "bowlingAllrounder";

type AnalyticsResponse =
  | { hasData: false }
  | {
      hasData: true;
      latestWeek: string;
      totalMinutes: number;
      minutesByType: Record<string, number>;
      avgFatigue: number;
      avgPerformance: number;
      battingStatus: string;
      bowlingStatus: string | null;
      fatigueRecommendation: string;
      trainingReadinessScore: number;
      insights: string[];
    };

const ROLE_LABELS: Record<Role, string> = {
  batsman: "Batsman",
  bowler: "Bowler",
  battingAllrounder: "Batting All-Rounder",
  bowlingAllrounder: "Bowling All-Rounder",
};

function Analytics() {
  const [role, setRole] = useState<Role>(
    () => (localStorage.getItem("cricketfit-role") as Role) || "battingAllrounder",
  );
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    localStorage.setItem("cricketfit-role", role);

    axios
      .get<AnalyticsResponse>("http://localhost:5001/analytics", {
        params: { role },
      })
      .then((response) => setData(response.data))
      .catch(() => setError("Could not load analytics. Is the server running?"));
  }, [role]);

  return (
    <div className="app">
      <h1 className="title">Analytics</h1>
      <p className="subtitle">Training analytics and progress</p>

      {error && <p style={{ color: "#f87171" }}>{error}</p>}

      <div style={{ marginBottom: 24 }}>
        <label htmlFor="role-select" style={{ marginRight: 8 }}>
          Role:
        </label>
        <select
          id="role-select"
          value={role}
          onChange={(event) => setRole(event.target.value as Role)}
        >
          {Object.entries(ROLE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {data && !data.hasData && (
        <p>No practice sessions yet. Add one to see your analytics.</p>
      )}

      {data && data.hasData && (
        <>
          <p className="subtitle">Week of {data.latestWeek}</p>

          <div className="cards-container">
            <DashboardCard
              title="Total Minutes"
              value={`${data.totalMinutes} min`}
            />
            <DashboardCard
              title="Avg Performance"
              value={`${data.avgPerformance.toFixed(1)} / 10`}
            />
            <DashboardCard
              title="Avg Fatigue"
              value={`${data.avgFatigue.toFixed(1)} / 10`}
            />
            <DashboardCard
              title="Training Readiness"
              value={`${data.trainingReadinessScore} / 100`}
            />
          </div>

          <div className="cards-container" style={{ marginTop: 20 }}>
            <div className="card">
              <h2>Minutes by Type</h2>
              <ul>
                {Object.entries(data.minutesByType).map(([type, minutes]) => (
                  <li key={type}>
                    {type}: {minutes} min
                  </li>
                ))}
              </ul>
            </div>

            <div className="card">
              <h2>Recommendations</h2>
              <ul>
                <li>{data.battingStatus}</li>
                {data.bowlingStatus && <li>{data.bowlingStatus}</li>}
                <li>{data.fatigueRecommendation}</li>
              </ul>
            </div>
          </div>

          {data.insights.length > 0 && (
            <div className="card" style={{ width: "100%", maxWidth: 620, marginTop: 20 }}>
              <h2>Insights</h2>
              <ul>
                {data.insights.map((insight, index) => (
                  <li key={index}>{insight}</li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Analytics;
