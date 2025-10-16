import { Request, Response } from "express";
import querystring from "querystring";
import jwt from "jsonwebtoken";

/**
 * NOTE: exemple générique OAuth2.0 : tu dois configurer CLIENT_ID, CLIENT_SECRET, AUTH_URL & TOKEN_URL
 */

const CLIENT_ID = process.env.OAUTH_CLIENT_ID!;
const REDIRECT_URI = process.env.OAUTH_REDIRECT_URI!;
const AUTH_URL = process.env.OAUTH_AUTH_URL!;
const TOKEN_URL = process.env.OAUTH_TOKEN_URL!;
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export const startOAuth = (req: Request, res: Response) => {
  const params = querystring.stringify({
    response_type: "code",
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: "openid email profile",
    state: "state123"
  });
  res.redirect(`${AUTH_URL}?${params}`);
};

// Callback minimal : échange le code pour token (exemple simple, tu peux utiliser simple-oauth2)
export const oauthCallback = async (req: Request, res: Response) => {
  const code = req.query.code as string | undefined;
  if (!code) return res.status(400).send("Missing code");
  // Ici tu échangerais code -> access_token auprès du provider (HTTP POST)
  // Pour la démo on simule une userinfo
  const fakeUser = { id: "u123", email: "etudiant@uni.edu", name: "Étudiant" };
  const token = jwt.sign(fakeUser, JWT_SECRET, { expiresIn: "2h" });
  // renvoie token (ou redirige vers frontend avec le token)
  res.json({ token });
};