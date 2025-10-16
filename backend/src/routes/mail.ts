import express from "express";
import { google } from "googleapis";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// GET inbox
router.get("/inbox", authMiddleware, async (req: any, res) => {
  try {
    const oAuth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID!,
      process.env.GOOGLE_CLIENT_SECRET!
    );
    oAuth2Client.setCredentials({ access_token: req.user.accessToken });

    const gmail = google.gmail({ version: "v1", auth: oAuth2Client });
    const result = await gmail.users.messages.list({ userId: "me", maxResults: 10 });

    const messages = [];

    if (result.data.messages) {
      for (const msg of result.data.messages) {
        const messageData = await gmail.users.messages.get({ userId: "me", id: msg.id! });
        const payload = messageData.data.payload!;
        const headers = payload.headers!;
        const from = headers.find(h => h.name === "From")?.value || "";
        const subject = headers.find(h => h.name === "Subject")?.value || "";
        const body = payload.parts?.[0]?.body?.data || "";
        messages.push({ from, subject, body });
      }
    }

    res.json({ messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la récupération des mails" });
  }
});

// POST send mail
router.post("/send", authMiddleware, async (req: any, res) => {
  try {
    const { to, subject, text } = req.body;

    const oAuth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID!,
      process.env.GOOGLE_CLIENT_SECRET!
    );
    oAuth2Client.setCredentials({ access_token: req.user.accessToken });

    const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

    const raw = Buffer.from(`To: ${to}\r\nSubject: ${subject}\r\n\r\n${text}`)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw },
    });

    res.json({ status: "ok" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de l'envoi du mail" });
  }
});

export default router;