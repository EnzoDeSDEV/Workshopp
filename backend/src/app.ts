import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import mailRoutes from "./routes/mail";

dotenv.config();
const app = express();
app.use(express.json());

// routes
app.use("/api/auth", authRoutes);
app.use("/api/mail", mailRoutes);

export default app;