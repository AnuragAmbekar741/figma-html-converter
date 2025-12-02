import { Request, Response } from "express";
import { FigmaFileService } from "../services/figma-file.service";
import { LangChainService } from "../services/langchain.service";
import { HtmlStorageService } from "../services/html-storage.service";
import { JsonStorageService } from "../services/json-storage.service";
import { FigmaExtractorService } from "../services/figma-extractor.service";
import path from "path";

const figmaFileService = new FigmaFileService();
const htmlStorageService = new HtmlStorageService();
const jsonStorageService = new JsonStorageService();

export class FigmaFileController {
  async getFile(req: Request, res: Response): Promise<void> {
    try {
      const { fileKey } = req.params;

      if (!fileKey) {
        res.status(400).json({
          error: "File key is required",
        });
        return;
      }

      console.log(`[GetFile] Checking for fileKey: ${fileKey}`);

      // Check if complete JSON already exists
      if (jsonStorageService.completeJSONExists(fileKey)) {
        console.log(
          `[GetFile] Found existing complete JSON for fileKey: ${fileKey}, skipping Figma API call`
        );

        // Read the existing complete JSON
        const fileData = jsonStorageService.readCompleteJSON(fileKey);

        // Check if minimized JSON exists, if not create it
        let minimizedJsonFileName: string;
        if (jsonStorageService.minimizedJSONExists(fileKey)) {
          minimizedJsonFileName = `${fileKey}.json`;
          console.log(
            `[GetFile] Found existing minimized JSON for fileKey: ${fileKey}`
          );
        } else {
          // Extract and save minimized JSON if it doesn't exist
          console.log(
            `[GetFile] Creating minimized JSON for fileKey: ${fileKey}`
          );
          const figmaExtractor = new FigmaExtractorService();
          const extractedData = figmaExtractor.extractEssentialData(fileData);
          minimizedJsonFileName = jsonStorageService.saveMinimizedJSON(
            extractedData,
            fileKey
          );
        }

        const completeJsonFileName = `${fileKey}.json`;

        res.json({
          success: true,
          file: fileData,
          savedFiles: {
            completeJson: completeJsonFileName,
            minimizedJson: minimizedJsonFileName,
          },
          cached: true, // Indicate this was from cache
        });
        return;
      }

      // If JSON doesn't exist, fetch from Figma API
      console.log(
        `[GetFile] No existing JSON found, fetching from Figma API for fileKey: ${fileKey}`
      );

      // Read token from HTTP-only cookie instead of Authorization header
      const accessToken = req.cookies?.figma_access_token;

      if (!accessToken) {
        res.status(401).json({
          error: "Missing or invalid access token",
        });
        return;
      }

      // Extract optional query parameters
      const options = {
        version: req.query.version as string | undefined,
        ids: req.query.ids as string | undefined,
        depth: req.query.depth
          ? parseInt(req.query.depth as string)
          : undefined,
        geometry: req.query.geometry as string | undefined,
        plugin_data: req.query.plugin_data as string | undefined,
        branch_data: req.query.branch_data === "true",
      };

      // Fetch file data from Figma
      const fileData = await figmaFileService.getFile(
        accessToken,
        fileKey,
        options
      );

      // Save complete JSON to output/json/{fileKey}.json
      const completeJsonFileName = jsonStorageService.saveCompleteJSON(
        fileData,
        fileKey
      );

      // Extract and save minimized JSON
      const figmaExtractor = new FigmaExtractorService();
      const extractedData = figmaExtractor.extractEssentialData(fileData);

      // Save minimized JSON to output/minimized/{fileKey}.json
      const minimizedJsonFileName = jsonStorageService.saveMinimizedJSON(
        extractedData,
        fileKey
      );

      res.json({
        success: true,
        file: fileData,
        savedFiles: {
          completeJson: completeJsonFileName,
          minimizedJson: minimizedJsonFileName,
        },
        cached: false, // Indicate this was fetched from Figma
      });
    } catch (error) {
      console.error("Get file error:", error);

      // Provide more specific error messages
      if (error instanceof Error) {
        if (
          error.message.includes("Access denied") ||
          error.message.includes("403")
        ) {
          res.status(403).json({
            error: error.message,
          });
          return;
        }
        if (
          error.message.includes("Unauthorized") ||
          error.message.includes("401")
        ) {
          res.status(401).json({
            error: error.message,
          });
          return;
        }
        if (
          error.message.includes("not found") ||
          error.message.includes("404")
        ) {
          res.status(404).json({
            error: error.message,
          });
          return;
        }
      }

      res.status(500).json({
        error: "Failed to get file",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Get specific nodes from a file
   */
  async getFileNodes(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({
          error: "Missing or invalid authorization header",
        });
        return;
      }

      const accessToken = authHeader.substring(7);
      const { fileKey } = req.params;
      const { ids } = req.query;

      if (!fileKey) {
        res.status(400).json({
          error: "File key is required",
        });
        return;
      }

      if (!ids || typeof ids !== "string") {
        res.status(400).json({
          error: "Node IDs (ids) query parameter is required",
        });
        return;
      }

      const options = {
        version: req.query.version as string | undefined,
        depth: req.query.depth
          ? parseInt(req.query.depth as string)
          : undefined,
        geometry: req.query.geometry as string | undefined,
        plugin_data: req.query.plugin_data as string | undefined,
      };

      const nodesData = await figmaFileService.getFileNodes(
        accessToken,
        fileKey,
        ids,
        options
      );

      res.json({
        success: true,
        nodes: nodesData,
      });
    } catch (error) {
      console.error("Get file nodes error:", error);
      res.status(500).json({
        error: "Failed to get file nodes",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async getFileImages(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({
          error: "Missing or invalid authorization header",
        });
        return;
      }

      const accessToken = authHeader.substring(7);
      const { fileKey } = req.params;
      const { ids } = req.query;

      if (!fileKey) {
        res.status(400).json({
          error: "File key is required",
        });
        return;
      }

      if (!ids || typeof ids !== "string") {
        res.status(400).json({
          error: "Node IDs (ids) query parameter is required",
        });
        return;
      }

      const options = {
        scale: req.query.scale
          ? parseFloat(req.query.scale as string)
          : undefined,
        format: req.query.format as "jpg" | "png" | "svg" | "pdf" | undefined,
        svg_outline_text: req.query.svg_outline_text === "true",
        svg_include_id: req.query.svg_include_id === "true",
        svg_include_node_id: req.query.svg_include_node_id === "true",
        svg_simplify_stroke: req.query.svg_simplify_stroke === "true",
        contents_only: req.query.contents_only !== "false", // default true
        use_absolute_bounds: req.query.use_absolute_bounds === "true",
        version: req.query.version as string | undefined,
      };

      const imagesData = await figmaFileService.getFileImages(
        accessToken,
        fileKey,
        ids,
        options
      );

      res.json({
        success: true,
        images: imagesData,
      });
    } catch (error) {
      console.error("Get file images error:", error);
      res.status(500).json({
        error: "Failed to get file images",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async getFileImageFills(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({
          error: "Missing or invalid authorization header",
        });
        return;
      }

      const accessToken = authHeader.substring(7);
      const { fileKey } = req.params;

      if (!fileKey) {
        res.status(400).json({
          error: "File key is required",
        });
        return;
      }

      const imageFillsData = await figmaFileService.getFileImageFills(
        accessToken,
        fileKey
      );

      res.json({
        success: true,
        imageFills: imageFillsData,
      });
    } catch (error) {
      console.error("Get file image fills error:", error);
      res.status(500).json({
        error: "Failed to get file image fills",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Convert Figma file to HTML
   * Uses saved minimized JSON if available, otherwise fetches from Figma
   */
  async convertFileToHTML(req: Request, res: Response): Promise<void> {
    try {
      const { fileKey } = req.params;
      // Get model from query parameter (optional)
      const model = (req.query.model as "openai" | "gemini") || undefined;

      if (!fileKey) {
        res.status(400).json({
          error: "File key is required",
        });
        return;
      }

      console.log(`[Convert] Starting conversion for fileKey: ${fileKey}`);

      let fileDataForLLM: any;

      // Check if minimized JSON exists - use complete JSON if available
      if (jsonStorageService.completeJSONExists(fileKey)) {
        // Read the complete JSON file (raw Figma response)
        fileDataForLLM = jsonStorageService.readCompleteJSON(fileKey);
        console.log(
          `[Convert] Using saved complete JSON for fileKey: ${fileKey}`
        );
      } else {
        // Fallback: fetch from Figma (requires access token)
        const accessToken = req.cookies?.figma_access_token;

        if (!accessToken) {
          res.status(401).json({
            error:
              "Missing or invalid access token. Please fetch the file first to save the JSON files.",
          });
          return;
        }

        console.log(
          `[Convert] Complete JSON not found for fileKey: ${fileKey}, fetching from Figma...`
        );
        fileDataForLLM = await figmaFileService.getFile(accessToken, fileKey);

        // Save the complete JSON for future use
        jsonStorageService.saveCompleteJSON(fileDataForLLM, fileKey);
        console.log(`[Convert] Saved complete JSON for future use: ${fileKey}`);

        // Also extract and save minimized JSON
        const figmaExtractor = new FigmaExtractorService();
        const extractedData =
          figmaExtractor.extractEssentialData(fileDataForLLM);
        jsonStorageService.saveMinimizedJSON(extractedData, fileKey);
        console.log(
          `[Convert] Saved minimized JSON for future use: ${fileKey}`
        );
      }

      console.log(`[Convert] Starting LLM conversion...`);
      // Convert to HTML using LLM - pass model if provided
      const langchainService = new LangChainService(model);
      const html = await langchainService.convertFigmaToHTML(fileDataForLLM);
      console.log(
        `[Convert] LLM conversion completed. HTML length: ${html?.length || 0}`
      );

      if (!html || html.trim().length === 0) {
        throw new Error("Generated HTML is empty");
      }

      // Get fileName from the data
      const fileName = fileDataForLLM.name || fileKey;
      console.log(`[Convert] Saving HTML with fileName: ${fileName}`);

      try {
        const htmlFileName = htmlStorageService.saveHTML(html, fileName);
        const htmlFileNameOnly = path.basename(htmlFileName);
        console.log(`[Convert] HTML saved successfully: ${htmlFileNameOnly}`);

        res.json({
          success: true,
          html: html,
          fileName: fileName,
          savedFileName: htmlFileNameOnly, // Only filename, e.g., "file_1234567890.html"
        });
      } catch (saveError) {
        console.error(`[Convert] Error saving HTML file:`, saveError);
        // Still return the HTML even if save fails
        res.json({
          success: true,
          html: html,
          fileName: fileName,
          savedFileName: null,
          warning: "HTML generated but failed to save to file",
        });
      }
    } catch (error) {
      console.error("[Convert] Convert file to HTML error:", error);
      res.status(500).json({
        error: "Failed to convert file to HTML",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}
