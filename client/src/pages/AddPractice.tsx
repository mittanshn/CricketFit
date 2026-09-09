import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AddPractice() {
  const navigate = useNavigate();

  const [sessionType, setSessionType] = useState("Batting");
  const [duration, setDuration] = useState("");
  const [intensity, setIntensity] = useState("Medium");
  const [performanceRating, setPerformanceRating] = useState("");
  const [fatigueLevel, setFatigueLevel] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    if (!duration) {
      setError("Duration is required.");
      return;
    }

    setSaving(true);

    try {
      await axios.post("http://localhost:5001/practice", {
        sessionType,
        duration: Number(duration),
        intensity,
        performanceRating: performanceRating ? Number(performanceRating) : 0,
        fatigueLevel: fatigueLevel ? Number(fatigueLevel) : 0,
      });

      navigate("/");
    } catch {
      setError("Could not save practice session. Is the server running?");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="app">
      <h1 className="title">Add Practice Session</h1>

      <form className="practice-form" onSubmit={handleSubmit}>
        <select
          value={sessionType}
          onChange={(event) => setSessionType(event.target.value)}
        >
          <option value="Batting">Batting</option>
          <option value="Bowling">Bowling</option>
          <option value="Fitness">Fitness</option>
          <option value="Rest">Rest</option>
        </select>

        <input
          type="number"
          min="0"
          placeholder="Duration (minutes)"
          value={duration}
          onChange={(event) => setDuration(event.target.value)}
        />

        <select
          value={intensity}
          onChange={(event) => setIntensity(event.target.value)}
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>

        <input
          type="number"
          min="0"
          max="10"
          placeholder="Performance Rating (0-10)"
          value={performanceRating}
          onChange={(event) => setPerformanceRating(event.target.value)}
        />

        <input
          type="number"
          min="0"
          max="10"
          placeholder="Fatigue Level (0-10)"
          value={fatigueLevel}
          onChange={(event) => setFatigueLevel(event.target.value)}
        />

        {error && <p style={{ color: "#f87171" }}>{error}</p>}

        <button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save Practice"}
        </button>
      </form>
    </div>
  );
}

export default AddPractice;
