import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./SignIn.css";

const SignIn: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const apiHost = import.meta.env.VITE_API_HOST;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await axios.post(`${apiHost}/api/v1/auth/sign-in`, {
        email,
        password,
      });

      if (response.data && response.data.data.accessToken) {
        localStorage.setItem("accessToken", response.data.accessToken);

        navigate("/");
      } else {
        setError("Login failed. Please try again.");
      }
    } catch (err) {
      setError(
        "An error occurred. Please check your credentials and try again."
      );
      console.error("Error during sign-in:", err);
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-title">Sign In</h2>
      {error && <p className="error-message">{error}</p>}
      <form className="form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
        </div>
        <button type="submit" className="form-button">
          Sign In
        </button>
      </form>
      <Link to="/sign-up" className="redirect-link">
        Don't have an account? Sign Up
      </Link>
    </div>
  );
};

export default SignIn;
