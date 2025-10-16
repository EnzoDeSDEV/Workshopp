import React from "react";

export default function Login() {
  const handleLogin = () => {
    window.location.href = "http://localhost:4000/api/auth/google";
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Bienvenue</h1>
      <button onClick={handleLogin} style={{ padding: "10px 20px", fontSize: "16px" }}>
        Se connecter avec Google
      </button>
    </div>
  );
}