import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const DISMISSALS = [
  "Not Out",
  "Bowled",
  "Caught",
  "LBW",
  "Run Out",
  "Stumped",
  "Other",
];

function AddGame() {
  const navigate = useNavigate();

  const [opponent, setOpponent] = useState("");
  const [matchType, setMatchType] = useState("");
  const [battingRuns, setBattingRuns] = useState("");
  const [battingBalls, setBattingBalls] = useState("");
  const [fours, setFours] = useState("");
  const [sixes, setSixes] = useState("");
  const [dismissal, setDismissal] = useState("Not Out");
  const [oversBowled, setOversBowled] = useState("");
  const [runsConceded, setRunsConceded] = useState("");
  const [wickets, setWickets] = useState("");
  const [catches, setCatches] = useState("");
  const [runOuts, setRunOuts] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    if (!opponent.trim() || !matchType.trim()) {
      setError("Opponent and match type are required.");
      return;
    }

    setSaving(true);

    try {
      await axios.post("http://localhost:5001/games", {
        opponent,
        matchType,
        battingRuns: Number(battingRuns) || 0,
        battingBalls: Number(battingBalls) || 0,
        fours: Number(fours) || 0,
        sixes: Number(sixes) || 0,
        dismissal,
        oversBowled: Number(oversBowled) || 0,
        runsConceded: Number(runsConceded) || 0,
        wickets: Number(wickets) || 0,
        catches: Number(catches) || 0,
        runOuts: Number(runOuts) || 0,
        notes,
      });

      navigate("/stats");
    } catch {
      setError("Could not save the game. Is the server running?");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="app">
      <h1 className="title">Log Game</h1>

      <form className="practice-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Opponent"
          value={opponent}
          onChange={(event) => setOpponent(event.target.value)}
        />

        <input
          type="text"
          placeholder="Match Type (e.g. T20, Club Match)"
          value={matchType}
          onChange={(event) => setMatchType(event.target.value)}
        />

        <h2 className="form-section-title">Batting</h2>

        <input
          type="number"
          min="0"
          placeholder="Runs"
          value={battingRuns}
          onChange={(event) => setBattingRuns(event.target.value)}
        />

        <input
          type="number"
          min="0"
          placeholder="Balls Faced"
          value={battingBalls}
          onChange={(event) => setBattingBalls(event.target.value)}
        />

        <input
          type="number"
          min="0"
          placeholder="Fours"
          value={fours}
          onChange={(event) => setFours(event.target.value)}
        />

        <input
          type="number"
          min="0"
          placeholder="Sixes"
          value={sixes}
          onChange={(event) => setSixes(event.target.value)}
        />

        <select value={dismissal} onChange={(event) => setDismissal(event.target.value)}>
          {DISMISSALS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <h2 className="form-section-title">Bowling</h2>

        <input
          type="number"
          min="0"
          step="0.1"
          placeholder="Overs Bowled"
          value={oversBowled}
          onChange={(event) => setOversBowled(event.target.value)}
        />

        <input
          type="number"
          min="0"
          placeholder="Runs Conceded"
          value={runsConceded}
          onChange={(event) => setRunsConceded(event.target.value)}
        />

        <input
          type="number"
          min="0"
          placeholder="Wickets"
          value={wickets}
          onChange={(event) => setWickets(event.target.value)}
        />

        <h2 className="form-section-title">Fielding</h2>

        <input
          type="number"
          min="0"
          placeholder="Catches"
          value={catches}
          onChange={(event) => setCatches(event.target.value)}
        />

        <input
          type="number"
          min="0"
          placeholder="Run Outs"
          value={runOuts}
          onChange={(event) => setRunOuts(event.target.value)}
        />

        <textarea
          placeholder="Notes from the game"
          rows={4}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
        />

        {error && <p style={{ color: "#f87171" }}>{error}</p>}

        <button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save Game"}
        </button>
      </form>
    </div>
  );
}

export default AddGame;
