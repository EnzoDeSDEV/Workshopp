import React, { useState } from "react";
import { sendMail } from "../api/api";

export default function Compose() {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [text, setText] = useState("");
  const [status, setStatus] = useState("");

  const handleSend = async () => {
    setStatus("Envoi en cours...");
    try {
      await sendMail(to, subject, text);
      setStatus("✅ Mail envoyé avec succès !");
      setTo("");
      setSubject("");
      setText("");
    } catch (error: any) {
      setStatus("❌ Erreur : " + error.message);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-semibold mb-4">📧 Nouveau message</h2>

      <input
        type="email"
        placeholder="Destinataire"
        value={to}
        onChange={(e) => setTo(e.target.value)}
        className="w-full mb-3 p-2 border rounded"
      />

      <input
        type="text"
        placeholder="Sujet"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        className="w-full mb-3 p-2 border rounded"
      />

      <textarea
        placeholder="Votre message..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full mb-3 p-2 border rounded h-40"
      />

      <button
        onClick={handleSend}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Envoyer
      </button>

      {status && <p className="mt-3 text-sm">{status}</p>}
    </div>
  );
}