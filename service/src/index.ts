import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import figmaOauthRoutes from "./routes/figma-oauth.routes";
import figmaFileRoutes from "./routes/figma-file.routes";
console.log("Figma Client ID configured:", !!process.env.FIGMA_CLIENT_ID);
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

app.use("/auth/figma", figmaOauthRoutes);
app.use("/file/figma", figmaFileRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
