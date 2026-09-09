import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import AddPractice from "./pages/AddPractice";
import Analytics from "./pages/Analytics";
import Planner from "./pages/Planner";
import AddGame from "./pages/AddGame";
import Stats from "./pages/Stats";

function App() {
  return (
    <BrowserRouter>
      <nav className="navbar">
        <Link to="/">Dashboard</Link>
        <Link to="/practice">Add Practice</Link>
        <Link to="/planner">Planner</Link>
        <Link to="/game">Log Game</Link>
        <Link to="/analytics">Analytics</Link>
        <Link to="/stats">Stats</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Dashboard />} />

        <Route path="/practice" element={<AddPractice />} />

        <Route path="/planner" element={<Planner />} />

        <Route path="/game" element={<AddGame />} />

        <Route path="/analytics" element={<Analytics />} />

        <Route path="/stats" element={<Stats />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

