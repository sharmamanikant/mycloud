import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import VMList from "./components/VMList";
import CreateVMForm from "./components/CreateVMForm";
import SecurityGroups from "./components/SecurityGroups";
import Login from "./components/Login";
import Register from "./components/Register";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  const handleAuth = (t) => {
    localStorage.setItem("token", t);
    setToken(t);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  if (!token) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/register" element={<Register setToken={handleAuth} />} />
          <Route path="*" element={<Login setToken={handleAuth} />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <div className="flex h-screen bg-gray-100">
        <Sidebar onLogout={handleLogout} />
        <div className="flex-1 p-6 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/vms" element={<VMList />} />
            <Route path="/vms/create" element={<CreateVMForm />} />
            <Route path="/security-groups" element={<SecurityGroups />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;

