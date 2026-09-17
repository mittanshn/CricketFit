import axios from "axios";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

function isBatOrBowl(sessionType: string): boolean {
  return sessionType === "Batting" || sessionType === "Bowling";
}

function AddPractice() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [sessionType, setSessionType] = useState(searchParams.get("sessionType") || "Batting");
  const [duration, setDuration] = useState(searchParams.get("duration") || "");
  const [intensity, setIntensity] = useState("Medium");
  const [performanceRating, setPerformanceRating] = useState("");
  const [fatigueLevel, setFatigueLevel] = useState("");
  const [notes, setNotes] = useState(searchParams.get("notes") || "");
  const [drills, setDrills] = useState(searchParams.get("drills") || "");
  const [balls, setBalls] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
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
        notes,
        drills,
        balls: balls ? Number(balls) : 0,
        videoUrl,
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
          <option value="Fielding">Fielding</option>
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
          type="text"
          placeholder="Drills (e.g. Yorkers, cover drives)"
          value={drills}
          onChange={(event) => setDrills(event.target.value)}
        />

        {isBatOrBowl(sessionType) && (
          <input
            type="number"
            min="0"
            placeholder={sessionType === "Batting" ? "Balls Faced" : "Balls Bowled"}
            value={balls}
            onChange={(event) => setBalls(event.target.value)}
          />
        )}

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

        <input
          type="text"
          placeholder="Video Link (optional)"
          value={videoUrl}
          onChange={(event) => setVideoUrl(event.target.value)}
        />

        <textarea
          placeholder="Notes"
          rows={4}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
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
