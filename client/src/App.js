import React, { useEffect, useState } from "react";
import { Route, Routes, Navigate, useNavigate } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import TodoPage from "./pages/TodoPage";

const App = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("Retrieved token from localStorage:", token);
    if (token) {
      setIsAuthenticated(true);
      console.log("Navigating to /todolist");
      navigate("/todolist");
    } else {
      console.log("Navigating to /auth");
      navigate("/auth");
    }
  }, [navigate]);

  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route
        path="/todolist"
        element={isAuthenticated ? <TodoPage /> : <Navigate to="/auth" />}
      />
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? "/todolist" : "/auth"} />}
      />
    </Routes>
  );
};

export default App;
