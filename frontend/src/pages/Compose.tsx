import React, { useState } from "react";
import { sendMail } from "../api/api";
import { useNavigate } from "react-router-dom";

export default function Compose() {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [text, setText] = useState("");
  const navigate = useNavigate();

  const handleSend = async () => {
    try {
      await sendMail(to, subject, text);
      alert("Mail envoyé !");
      navigate("/inbox");
    } catch (err: any) {
      console.error(err);
      alert("Erreur lors de l'envoi : " + err.message);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Composer un mail</h1>
      <div style={{ marginBottom: "10px" }}>
        <input
          type="email"
          placeholder="Destinataire"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          style={{ width: "100%", padding: "8px" }}
        />
      </div>
      <div style={{ marginBottom: "10px" }}>
        <input
          type="text"
          placeholder="Sujet"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          style={{ width: "100%", padding: "8px" }}
        />
      </div>
      <div style={{ marginBottom: "10px" }}>
        <textarea
          placeholder="Message"
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ width: "100%", height: "150px", padding: "8px" }}
        />
      </div>
      <button
        onClick={handleSend}
        style={{ padding: "10px 20px", fontSize: "16px" }}
      >
        Envoyer
      </button>
    </div>
  );
}