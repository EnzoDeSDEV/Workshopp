import React, { useEffect, useState } from "react";
import { fetchInbox } from "../api/api";
import { useNavigate } from "react-router-dom"; // ✅ IMPORT DU HOOK
import "../assets/Inbox.css"; // ✅ IMPORT DU CSS

interface Mail {
  id: string;
  snippet: string;
  from: string;
  subject: string;
}

export default function Inbox() {
  const [mails, setMails] = useState<Mail[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // ✅ INITIALISATION DU HOOK

  useEffect(() => {
    const getMails = async () => {
      try {
        const data = await fetchInbox();
        setMails(data);
      } catch (err: any) {
        console.error("Erreur récupération mails :", err.message);
        alert("Impossible de récupérer les mails : " + err.message);
      } finally {
        setLoading(false);
      }
    };

    getMails();
  }, []);

  if (loading) return <div>Chargement des mails...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📥 Boîte de réception</h1>

      {/* ✅ BOUTON DE REDIRECTION */}
      <button
        onClick={() => navigate("/compose")}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-4"
      >
        ✉️ Nouveau message
      </button>

      {mails.length === 0 ? (
        <p>Aucun mail trouvé</p>
      ) : (
        <ul>
          {mails.map((mail) => (
            <li key={mail.id} className="mb-3 border-b pb-2">
              <strong>De :</strong> {mail.from} <br />
              <strong>Sujet :</strong> {mail.subject} <br />
              <strong>Extrait :</strong> {mail.snippet}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}