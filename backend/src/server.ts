import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { google } from "googleapis";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

const PORT = 4000;

// === GOOGLE AUTH CONFIG ===
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const REDIRECT_URI = "http://localhost:4000/api/auth/google/callback";

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

// 1️⃣ Start auth
app.get("/api/auth/google", (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/gmail.send",
      "https://www.googleapis.com/auth/gmail.modify",
    ],
  });
  res.redirect(url);
});

// 2️⃣ Callback
app.get("/api/auth/google/callback", async (req, res) => {
  const code = req.query.code as string;

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const jwtToken = jwt.sign(
      {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    const encodedToken = encodeURIComponent(jwtToken);
    res.redirect(`http://localhost:5173/oauth/callback?token=${encodedToken}`);
  } catch (error) {
    console.error("OAuth callback error:", error);
    res.status(500).send("Authentication failed");
  }
});

// Middleware pour JWT
function authMiddleware(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Pas de token" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token invalide" });
  }
}

// 3️⃣ Inbox Gmail
app.get("/api/gmail/inbox", authMiddleware, async (req: any, res) => {
  try {
    const client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET);
    client.setCredentials({ access_token: req.user.accessToken });

    const gmail = google.gmail({ version: "v1", auth: client });
    const messagesList = await gmail.users.messages.list({ userId: "me", maxResults: 10 });

    const detailedMessages = await Promise.all(
      (messagesList.data.messages || []).map(async (m) => {
        const msg = await gmail.users.messages.get({ userId: "me", id: m.id });
        const headers = msg.data.payload?.headers || [];
        const from = headers.find((h) => h.name === "From")?.value || "Inconnu";
        const subject = headers.find((h) => h.name === "Subject")?.value || "(Pas de sujet)";
        return {
          id: m.id,
          snippet: msg.data.snippet,
          from,
          subject,
        };
      })
    );

    res.json(detailedMessages);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur récupération inbox");
  }
});

// 4️⃣ Send Mail
app.post("/api/mail/send", authMiddleware, async (req: any, res) => {
  try {
    const { to, subject, text } = req.body;

    const client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET);
    client.setCredentials({ access_token: req.user.accessToken });

    const gmail = google.gmail({ version: "v1", auth: client });
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

app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
});