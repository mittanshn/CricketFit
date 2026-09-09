import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import AddPractice from "./pages/AddPractice";
import Analytics from "./pages/Analytics";
import Planner from "./pages/Planner";

function App() {
  return (
    <BrowserRouter>
      <nav className="navbar">
        <Link to="/">Dashboard</Link>
        <Link to="/practice">Add Practice</Link>
        <Link to="/planner">Planner</Link>
        <Link to="/analytics">Analytics</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Dashboard />} />

        <Route path="/practice" element={<AddPractice />} />

        <Route path="/planner" element={<Planner />} />

        <Route path="/analytics" element={<Analytics />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

