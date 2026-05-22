import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import AddPractice from "./pages/AddPractice";
import Analytics from "./pages/Analytics";

function App() {
  return (
    <BrowserRouter>
      <nav className="navbar">
        <Link to="/">Dashboard</Link>
        <Link to="/practice">Add Practice</Link>
        <Link to="/analytics">Analytics</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Dashboard />} />

        <Route path="/practice" element={<AddPractice />} />

        <Route path="/analytics" element={<Analytics />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

