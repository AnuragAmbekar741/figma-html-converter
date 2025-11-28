import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import figmaOauthRoutes from "./routes/figma-oauth.routes";
import figmaFileRoutes from "./routes/figma-file.routes";

const app = express();
const PORT = process.env.PORT || 3000;

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log("Origin:", req.headers.origin);
  console.log("Referer:", req.headers.referer);
  next();
});

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

app.use("/auth/figma", figmaOauthRoutes);
app.use("/file/figma", figmaFileRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
