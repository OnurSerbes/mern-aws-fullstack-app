import React, { useState } from "react";
import { TextField, Button, Box } from "@mui/material";
import axios from "../services/api";
import { useNavigate } from "react-router-dom";

const Register = ({ onAuthSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.post(
        "/auth/register",
        { username, password },
        { headers: { "Content-Type": "application/json" } }
      );
      console.log("Register response:", response);
      console.log("Register response data:", response.data);
      if (response.data.statusCode === 200 || response.status === 200) {
        // Auto login after successful registration
        await handleLogin(username, password);
      } else {
        setError("Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setError("Registration failed. Please try again.");
    }
    setLoading(false);
  };

  const handleLogin = async (username, password) => {
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
        const token = data.token;
        if (token) {
          localStorage.setItem("token", token);
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
        onClick={handleRegister}
        disabled={loading}
      >
        {loading ? "Registering..." : "Register"}
      </Button>
    </Box>
  );
};

export default Register;
