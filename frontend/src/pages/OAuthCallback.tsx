import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function OAuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token);
      navigate("/inbox");
    } else {
      alert("Erreur d'authentification");
      navigate("/");
    }
  }, [location.search, navigate]);

  return <div>Connexion en cours...</div>;
}