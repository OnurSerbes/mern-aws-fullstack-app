import React, { useState } from "react";
import { TextField, Button, Box } from "@mui/material";
import axios from "../services/api";
import { useNavigate } from "react-router-dom";

const Login = ({ onAuthSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.post(
        "/auth/login",
        { username, password },
        { headers: { "Content-Type": "application/json" } }
      );
      console.log("Login response:", response);
      console.log("Login response data:", response.data);
      if (response.data.body) {
        const data = JSON.parse(response.data.body);
        console.log("Parsed login response data:", data);
        const token = data.token;
        const userId = data.userId; // Extract userId from the response
        if (token && userId) {
          localStorage.setItem("token", token);
          localStorage.setItem("userId", userId); // Store userId in local storage
          console.log("Stored token and userId in local storage");
          console.log("Navigating to /todolist");
          onAuthSuccess();
          navigate("/todolist");
        } else {
          setError("Invalid credentials");
        }
      } else {
        setError("Invalid response format");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Invalid credentials");
    }
    setLoading(false);
  };

  return (
    <Box component="form" sx={{ mt: 1 }} noValidate autoComplete="off">
      <TextField
        margin="normal"
        required
        fullWidth
        id="username"
        label="Username"
        name="username"
        autoComplete="username"
        autoFocus
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        name="password"
        label="Password"
        type="password"
        id="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && <Box sx={{ color: "red", mt: 1 }}>{error}</Box>}
      <Button
        type="button"
        fullWidth
        variant="contained"
        color="primary"
        onClick={handleLogin}
        disabled={loading}
      >
        {loading ? "Logging in..." : "Login"}
      </Button>
    </Box>
  );
};

export default Login;
