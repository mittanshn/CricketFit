import { useEffect } from "react";
import axios from "axios";
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import AddPractice from "./pages/AddPractice";
import Analytics from "./pages/Analytics";
import Planner from "./pages/Planner";
import AddGame from "./pages/AddGame";
import Stats from "./pages/Stats";
import Onboarding from "./pages/Onboarding";
import Coach from "./pages/Coach";

function OnboardingGate({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    axios
      .get("http://localhost:5001/profile")
      .then((response) => {
        if (!response.data.onboarded && location.pathname !== "/onboarding") {
          navigate("/onboarding");
        }
      })
      .catch(() => {});
  }, [location.pathname, navigate]);

  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <OnboardingGate>
        <nav className="navbar">
          <Link to="/">Dashboard</Link>
          <Link to="/practice">Add Practice</Link>
          <Link to="/planner">Planner</Link>
          <Link to="/game">Log Game</Link>
          <Link to="/analytics">Analytics</Link>
          <Link to="/stats">Stats</Link>
          <Link to="/coach">AI Coach</Link>
          <Link to="/onboarding">Profile</Link>
        </nav>

        <Routes>
          <Route path="/" element={<Dashboard />} />

          <Route path="/practice" element={<AddPractice />} />

          <Route path="/planner" element={<Planner />} />

          <Route path="/game" element={<AddGame />} />

          <Route path="/analytics" element={<Analytics />} />

          <Route path="/stats" element={<Stats />} />

          <Route path="/coach" element={<Coach />} />

          <Route path="/onboarding" element={<Onboarding />} />
        </Routes>
      </OnboardingGate>
    </BrowserRouter>
  );
}

export default App;
