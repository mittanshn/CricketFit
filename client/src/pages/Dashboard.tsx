import { useState } from "react";
import DashboardCard from "../components/DashboardCard";
import AddPractice from "./AddPractice";

function Dashboard() {
    const [sessions, setSessions] = useState(3);
  return (
    <div className="app">
      <h1 className="title">CricketFit</h1>

      <p className="subtitle">
        Cricket Practice & Fitness Tracker
      </p>

      <div className="cards-container">
        <DashboardCard
          title="Cricket Sessions"
          value={`${sessions} Sessions This Week`}
        />

        <DashboardCard
          title="Fitness Workouts"
          value="2 Workouts Completed"
        />

        <DashboardCard
          title="Training Minutes"
          value="270 Total Minutes"
        />
      </div>
      <button
        className="add-button"
        onClick={() => setSessions(sessions + 1)}
        >
        Add Session
        </button>

        <AddPractice />
    </div>
  );
}

export default Dashboard;