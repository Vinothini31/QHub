// frontend/src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Signup from "./components/Signup";
import Login from "./components/Login";
import ChatPage from "./pages/ChatPage";
import Documents from "./pages/Documents";

import "./App.css";



function App() {
  return (
    <Router>
      <div className="app-container">
        {/* Page Routing */}
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/documents" element={<Documents />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
