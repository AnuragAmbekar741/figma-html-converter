import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import figmaRoutes from "./routes/figma.routes";

console.log("Figma Client ID configured:", !!process.env.FIGMA_CLIENT_ID);
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

app.use("/auth/figma", figmaRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
