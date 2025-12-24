// frontend/src/components/Login.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/Login.css";
import API from "../api"; // ✅ Added API import

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Use API instance from api.js
      const response = await API.post("/token/", formData);

      const data = response.data;
      console.log("Login response:", data);

      alert("Login successful!");

      // ✅ Save tokens correctly
      localStorage.setItem("token", data.access);
      localStorage.setItem("refresh_token", data.refresh);

      // Small delay to ensure token is saved before redirect
      setTimeout(() => {
        navigate("/chat");
      }, 100);

    } catch (error) {
      console.error("Error:", error.response?.data || error);
      alert("Login failed: " + JSON.stringify(error.response?.data));
    }
  };

  return (
    <div className="login-page">
      <h1 className="app-heading">Log in to QHub</h1>

      <div className="login-container">
        <h2>Login</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <button type="submit">Login</button>
        </form>

        <p className="signup-link">
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
