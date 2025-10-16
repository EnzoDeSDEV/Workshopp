import { google } from "googleapis";
import express from "express";
import jwt from "jsonwebtoken";

const app = express();

app.get("/api/gmail/inbox", async (req, res) => {
  try {
    // Récupérer le token du front
    const authHeader = req.headers.authorization; // "Bearer <jwt>"
    if (!authHeader) return res.status(401).send("Pas de token");

    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: decoded.accessToken });

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });
    
    // Liste des messages
    const messages = await gmail.users.messages.list({ userId: "me", maxResults: 10 });

    // On peut ensuite récupérer le contenu de chaque mail
    const detailedMessages = await Promise.all(
      (messages.data.messages || []).map(async (m) => {
        const msg = await gmail.users.messages.get({ userId: "me", id: m.id });
        return {
          id: m.id,
          snippet: msg.data.snippet
        };
      })
    );

    res.json(detailedMessages);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur récupération inbox");
  }
});