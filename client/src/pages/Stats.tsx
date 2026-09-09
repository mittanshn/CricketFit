import { useEffect, useState } from "react";
import axios from "axios";
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

function average(total: number, count: number): string {
  return count > 0 ? (total / count).toFixed(2) : "-";
}

function Stats() {
  const [games, setGames] = useState<GameEntry[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get<GameEntry[]>("http://localhost:5001/games")
      .then((response) => setGames(response.data))
      .catch(() => setError("Could not load stats. Is the server running?"));
  }, []);

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

  return (
    <div className="app">
      <h1 className="title">Cricket Stats</h1>
      <p className="subtitle">Career batting, bowling, and fielding record</p>

      {error && <p style={{ color: "#f87171" }}>{error}</p>}

      {games && games.length === 0 && <p>No games logged yet.</p>}

      {games && games.length > 0 && (
        <>
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
