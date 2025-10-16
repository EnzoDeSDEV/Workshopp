import express from "express";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
console.log("🔑 GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);
console.log("🔑 GOOGLE_CALLBACK_URL:", process.env.GOOGLE_CALLBACK_URL);

const router = express.Router();

// Passport Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
      scope: ["profile", "email", "https://www.googleapis.com/auth/gmail.readonly", "https://www.googleapis.com/auth/gmail.send"]
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, { profile, accessToken, refreshToken });
    }
  )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj: any, done) => done(null, obj));

// Routes OAuth
router.get("/google", passport.authenticate("google"));

router.get("/google/callback", passport.authenticate("google", { failureRedirect: "/" }), (req: any, res) => {
  const user = req.user;
  const token = jwt.sign(
    { email: user.profile.emails[0].value, accessToken: user.accessToken, refreshToken: user.refreshToken },
    process.env.JWT_SECRET!,
    { expiresIn: "1h" }
  );
  res.redirect(`http://localhost:5173/oauth/callback?token=${token}`);
});

export default router;