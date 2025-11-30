import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import fs from "fs";
import path from "path";
import figmaOauthRoutes from "./routes/figma-oauth.routes";
import figmaFileRoutes from "./routes/figma-file.routes";
import { LangChainService } from "./services/langchain.service";
import { HtmlStorageService } from "./services/html-storage.service";

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

// Test endpoint to extract data from test-response.json
app.get("/test/extract", (_, res) => {
  res.json({
    message: "Extractor service removed - sending full data to LLM",
  });
});

const htmlStorageService = new HtmlStorageService();

// Test endpoint to convert direct file data to HTML using LLM
app.get("/test/convert", async (_, res) => {
  try {
    console.log("=== TEST CONVERT TO HTML ===");

    const testFilePath = path.join(
      __dirname,
      "../test-resp/test-response.json"
    );
    const testData = JSON.parse(fs.readFileSync(testFilePath, "utf-8"));

    const fileData = testData.file || testData;

    if (!fileData) {
      return res.status(400).json({
        error: "file data not found in test file",
      });
    }

    const langchainService = new LangChainService();
    const html = await langchainService.convertFigmaToHTML(fileData);

    // Save HTML to output folder
    const fileName = fileData.name || "test-response";
    const savedPath = htmlStorageService.saveHTML(html, fileName);
    const savedFileName = path.basename(savedPath);

    res.json({
      success: true,
      html,
      fileName: fileName,
      savedFileName: savedFileName,
      savedPath: savedPath,
    });
  } catch (error) {
    console.error("Test convert error:", error);
    res.status(500).json({
      error: "Failed to convert to HTML",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

app.use("/auth/figma", figmaOauthRoutes);
app.use("/file/figma", figmaFileRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
