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

// === Fonction d’envoi d’email ===
router.post("/send", authMiddleware, async (req, res) => {
  const { to, subject, text } = req.body;
  const { access_token } = req.user; // récupéré du JWT généré après OAuth

  if (!to || !subject || !text)
    return res.status(400).json({ message: "Champs manquants" });

  try {
    // Authentification OAuth2
    const oAuth2Client = new google.auth.OAuth2();
    oAuth2Client.setCredentials({ access_token });

    const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

    // Format du mail (MIME)
    const messageParts = [
      `To: ${to}`,
      `Subject: ${subject}`,
      "Content-Type: text/plain; charset=utf-8",
      "",
      text,
    ];
    const message = messageParts.join("\n");

    // Encodage base64 URL-safe
    const encodedMessage = Buffer.from(message)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    // Envoi via Gmail API
    await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw: encodedMessage },
    });

    res.status(200).json({ message: "Email envoyé avec succès ✅" });
  } catch (error) {
    console.error("Erreur envoi mail:", error);
    res.status(500).json({ message: "Erreur lors de l’envoi du mail" });
  }
});
export default router;