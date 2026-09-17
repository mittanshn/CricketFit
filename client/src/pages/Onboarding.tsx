import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ROLES = [
  { value: "batsman", label: "Batsman" },
  { value: "bowler", label: "Bowler" },
  { value: "battingAllrounder", label: "Batting All-Rounder" },
  { value: "bowlingAllrounder", label: "Bowling All-Rounder" },
  { value: "wicketkeeper", label: "Wicketkeeper" },
];

const SKILL_LEVELS = ["beginner", "intermediate", "advanced", "elite"];

function Onboarding() {
  const navigate = useNavigate();

  const [role, setRole] = useState("battingAllrounder");
  const [skillLevel, setSkillLevel] = useState("intermediate");
  const [focus, setFocus] = useState("");
  const [weeklyAvailability, setWeeklyAvailability] = useState("4");
  const [upcomingMatchDate, setUpcomingMatchDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:5001/profile")
      .then((response) => {
        const profile = response.data;
        if (profile.onboarded) {
          setRole(profile.role);
          setSkillLevel(profile.skillLevel);
          setFocus(profile.focus);
          setWeeklyAvailability(String(profile.weeklyAvailability));
          setUpcomingMatchDate(profile.upcomingMatchDate ?? "");
        }
      })
      .catch(() => {});
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setSaving(true);

    try {
      await axios.put("http://localhost:5001/profile", {
        role,
        skillLevel,
        focus,
        weeklyAvailability: Number(weeklyAvailability) || 0,
        upcomingMatchDate: upcomingMatchDate || null,
      });

      navigate("/");
    } catch {
      setError("Could not save your profile. Is the server running?");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="app">
      <h1 className="title">Welcome to CricketFit</h1>
      <p className="subtitle">Tell us about yourself so we can plan your training</p>

      <form className="practice-form" onSubmit={handleSubmit}>
        <select value={role} onChange={(event) => setRole(event.target.value)}>
          {ROLES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select value={skillLevel} onChange={(event) => setSkillLevel(event.target.value)}>
          {SKILL_LEVELS.map((level) => (
            <option key={level} value={level}>
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </option>
          ))}
        </select>

        <textarea
          placeholder="What do you want to work on? (goals)"
          rows={3}
          value={focus}
          onChange={(event) => setFocus(event.target.value)}
        />

        <input
          type="number"
          min="1"
          max="14"
          placeholder="Sessions per week you can commit to"
          value={weeklyAvailability}
          onChange={(event) => setWeeklyAvailability(event.target.value)}
        />

        <label style={{ textAlign: "left", color: "#94a3b8", fontSize: 14 }}>
          Upcoming match date (optional)
        </label>
        <input
          type="date"
          value={upcomingMatchDate}
          onChange={(event) => setUpcomingMatchDate(event.target.value)}
        />

        {error && <p style={{ color: "#f87171" }}>{error}</p>}

        <button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Start Training"}
        </button>
      </form>
    </div>
  );
}

export default Onboarding;
