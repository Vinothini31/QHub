// frontend/src/components/Signup.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // useNavigate for redirect
import "../styles/Signup.css";
import API from "../api"; // ✅ Added API import

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.password2) {
      alert("Passwords do not match!");
      return;
    }

    try {
      // ✅ Use API instance instead of hardcoded fetch
      const response = await API.post("/users/register/", formData);

      console.log(response.data);

      alert("Signup successful!");
      setFormData({ username: "", email: "", password: "", password2: "" });
      navigate("/login"); // redirect to login page

    } catch (error) {
      console.error("Error:", error.response?.data || error);
      alert(
        "Signup failed: " +
          JSON.stringify(error.response?.data || "Something went wrong. Please try again.")
      );
    }
  };

  return (
    <div className="login-page">
      <h1 className="app-heading">Sign up for QHub</h1>

      <div className="signup-container">
        <h2>Sign Up</h2>
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
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
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
          <input
            type="password"
            name="password2"
            placeholder="Confirm Password"
            value={formData.password2}
            onChange={handleChange}
            required
          />
          <button type="submit">Sign Up</button>
        </form>

        <p className="login-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
