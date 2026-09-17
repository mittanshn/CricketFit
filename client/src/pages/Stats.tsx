import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import DashboardCard from "../components/DashboardCard";

type GameEntry = {
  id: string;
  date: string;
  opponent: string;
  matchType: string;
  battingRuns: number;
  battingBalls: number;
  fours: number;
  sixes: number;
  dismissal: string;
  oversBowled: number;
  runsConceded: number;
  wickets: number;
  catches: number;
  runOuts: number;
  notes: string;
};

type PracticeSession = {
  date: string;
  sessionType: "Batting" | "Bowling" | "Fielding" | "Fitness" | "Rest";
  duration: number;
};

function average(total: number, count: number): string {
  return count > 0 ? (total / count).toFixed(2) : "-";
}

function buildMatchLinkage(games: GameEntry[], sessions: PracticeSession[]): {
  lastGame: GameEntry;
  insights: string[];
} | null {
  if (games.length === 0) return null;

  const sortedGames = [...games].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
  const lastGame = sortedGames[0];
  const gameDate = new Date(lastGame.date);
  const weekBefore = new Date(gameDate);
  weekBefore.setDate(weekBefore.getDate() - 7);

  const priorSessions = sessions.filter((s) => {
    const d = new Date(s.date);
    return d >= weekBefore && d < gameDate;
  });

  const minutesByType: Record<string, number> = {};
  for (const s of priorSessions) {
    minutesByType[s.sessionType] = (minutesByType[s.sessionType] || 0) + s.duration;
  }

  const battingMinutes = minutesByType["Batting"] || 0;
  const bowlingMinutes = minutesByType["Bowling"] || 0;
  const fieldingMinutes = minutesByType["Fielding"] || 0;
  const strikeRate =
    lastGame.battingBalls > 0 ? (lastGame.battingRuns / lastGame.battingBalls) * 100 : 0;

  const insights: string[] = [];

  if (lastGame.battingBalls > 0 && strikeRate < 100 && battingMinutes < 120) {
    insights.push(
      `You only trained batting for ${battingMinutes} minutes in the week before your game against ${lastGame.opponent} — more nets time could help your strike rate.`,
    );
  }

  if (lastGame.oversBowled > 0 && lastGame.wickets === 0 && bowlingMinutes < 90) {
    insights.push(
      `You bowled ${lastGame.oversBowled} overs without a wicket against ${lastGame.opponent}, with only ${bowlingMinutes} minutes of bowling practice that week — consider more bowling drills before your next game.`,
    );
  }

  if (fieldingMinutes === 0 && lastGame.catches === 0) {
    insights.push(
      "You didn't log any fielding practice in the week before your last game — a bit of catching practice could sharpen you up.",
    );
  }

  if (insights.length === 0) {
    insights.push(
      `Your training matched up well with your last game against ${lastGame.opponent}. Keep it up.`,
    );
  }

  return { lastGame, insights };
}

function Stats() {
  const [games, setGames] = useState<GameEntry[] | null>(null);
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [error, setError] = useState("");
  const [seeding, setSeeding] = useState(false);

  function loadGames() {
    axios
      .get<GameEntry[]>("http://localhost:5001/games")
      .then((response) => setGames(response.data))
      .catch(() => setError("Could not load stats. Is the server running?"));
  }

  useEffect(() => {
    loadGames();
    axios
      .get<PracticeSession[]>("http://localhost:5001/practice")
      .then((response) => setSessions(response.data))
      .catch(() => {});
  }, []);

  async function loadSampleData() {
    setSeeding(true);
    try {
      await axios.post("http://localhost:5001/demo/seed");
      loadGames();
    } catch {
      setError("Could not load sample data.");
    } finally {
      setSeeding(false);
    }
  }

  const list = games ?? [];

  const totalRuns = list.reduce((sum, g) => sum + g.battingRuns, 0);
  const totalBalls = list.reduce((sum, g) => sum + g.battingBalls, 0);
  const totalFours = list.reduce((sum, g) => sum + g.fours, 0);
  const totalSixes = list.reduce((sum, g) => sum + g.sixes, 0);
  const notOuts = list.filter((g) => g.dismissal === "Not Out").length;
  const dismissals = list.length - notOuts;
  const highestScore = list.reduce((max, g) => Math.max(max, g.battingRuns), 0);
  const strikeRate = totalBalls > 0 ? (totalRuns / totalBalls) * 100 : 0;

  const totalWickets = list.reduce((sum, g) => sum + g.wickets, 0);
  const totalOvers = list.reduce((sum, g) => sum + g.oversBowled, 0);
  const totalRunsConceded = list.reduce((sum, g) => sum + g.runsConceded, 0);
  const economyRate = totalOvers > 0 ? totalRunsConceded / totalOvers : 0;

  const totalCatches = list.reduce((sum, g) => sum + g.catches, 0);
  const totalRunOuts = list.reduce((sum, g) => sum + g.runOuts, 0);

  const sortedGames = [...list].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  const linkage = buildMatchLinkage(list, sessions);

  return (
    <div className="app">
      <h1 className="title">Cricket Stats</h1>
      <p className="subtitle">Career batting, bowling, and fielding record</p>

      {error && <p style={{ color: "#f87171" }}>{error}</p>}

      {games && games.length === 0 && (
        <div className="empty-state-card">
          <h2>No games logged yet</h2>
          <p>Log a match to start building your career stats, or explore with sample data.</p>
          <div className="empty-state-actions">
            <Link to="/game">
              <button className="add-button">Log Your First Game</button>
            </Link>
            <button className="add-button secondary" disabled={seeding} onClick={loadSampleData}>
              {seeding ? "Loading..." : "Load Sample Data"}
            </button>
          </div>
        </div>
      )}

      {games && games.length > 0 && (
        <>
          {linkage && (
            <div className="plan-card" style={{ width: "100%", maxWidth: 900, marginBottom: 24 }}>
              <span className="plan-card-tag">
                Ahead of your game vs {linkage.lastGame.opponent}
              </span>
              <ul>
                {linkage.insights.map((insight, index) => (
                  <li key={index}>{insight}</li>
                ))}
              </ul>
            </div>
          )}

          <h2 className="stats-section-title">Batting</h2>
          <div className="cards-container">
            <DashboardCard title="Innings" value={`${list.length}`} />
            <DashboardCard title="Runs" value={`${totalRuns}`} />
            <DashboardCard title="Average" value={average(totalRuns, dismissals)} />
            <DashboardCard title="Strike Rate" value={strikeRate.toFixed(1)} />
            <DashboardCard title="Highest Score" value={`${highestScore}`} />
            <DashboardCard title="4s / 6s" value={`${totalFours} / ${totalSixes}`} />
          </div>

          <h2 className="stats-section-title">Bowling</h2>
          <div className="cards-container">
            <DashboardCard title="Wickets" value={`${totalWickets}`} />
            <DashboardCard title="Overs" value={`${totalOvers}`} />
            <DashboardCard title="Runs Conceded" value={`${totalRunsConceded}`} />
            <DashboardCard title="Average" value={average(totalRunsConceded, totalWickets)} />
            <DashboardCard title="Economy" value={economyRate.toFixed(2)} />
          </div>

          <h2 className="stats-section-title">Fielding</h2>
          <div className="cards-container">
            <DashboardCard title="Catches" value={`${totalCatches}`} />
            <DashboardCard title="Run Outs" value={`${totalRunOuts}`} />
          </div>

          <h2 className="stats-section-title">Game Log</h2>
          <div className="game-log">
            {sortedGames.map((game) => (
              <div className="game-entry" key={game.id}>
                <div className="game-entry-header">
                  <strong>{game.opponent}</strong>
                  <span>{game.matchType}</span>
                  <span>{new Date(game.date).toLocaleDateString()}</span>
                </div>
                <div className="game-entry-stats">
                  <span>
                    {game.battingRuns} ({game.battingBalls}) — {game.dismissal}
                  </span>
                  <span>
                    {game.wickets}/{game.runsConceded} in {game.oversBowled} overs
                  </span>
                  <span>
                    {game.catches} catches, {game.runOuts} run outs
                  </span>
                </div>
                {game.notes && <p className="game-entry-notes">{game.notes}</p>}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Stats;
