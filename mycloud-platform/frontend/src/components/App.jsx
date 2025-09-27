// App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />          {/* Login page */}
        <Route path="/dashboard" element={<Dashboard />} /> {/* Dashboard */}
      </Routes>
    </Router>
  );
}

export default App;
