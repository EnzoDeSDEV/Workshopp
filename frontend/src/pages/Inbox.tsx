import React, { useEffect, useState } from "react";
import { fetchInbox } from "../api/api";

interface Mail {
  id: string;
  snippet: string;
  from: string;
  subject: string;
}

export default function Inbox() {
  const [mails, setMails] = useState<Mail[]>([]);
  const [loading, setLoading] = useState(true);

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
    <div>
      <h1>Inbox</h1>
      {mails.length === 0 ? (
        <p>Aucun mail trouvé</p>
      ) : (
        <ul>
          {mails.map((mail) => (
            <li key={mail.id} style={{ marginBottom: "1rem" }}>
              <strong>De :</strong> {mail.from} <br />
              <strong>Sujet :</strong> {mail.subject} <br />
              <strong>Snippet :</strong> {mail.snippet}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}