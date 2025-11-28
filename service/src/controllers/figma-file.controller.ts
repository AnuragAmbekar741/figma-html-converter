import { Request, Response } from "express";
import { FigmaFileService } from "../services/figma-file.service";

const figmaFileService = new FigmaFileService();

export class FigmaFileController {
  async getFile(req: Request, res: Response): Promise<void> {
    try {
      // Read token from HTTP-only cookie instead of Authorization header
      const accessToken = req.cookies?.figma_access_token;

      if (!accessToken) {
        res.status(401).json({
          error: "Missing or invalid access token",
        });
        return;
      }

      const { fileKey } = req.params;

      if (!fileKey) {
        res.status(400).json({
          error: "File key is required",
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

      const fileData = await figmaFileService.getFile(
        accessToken,
        fileKey,
        options
      );

      res.json({
        success: true,
        file: fileData,
      });
    } catch (error) {
      console.error("Get file error:", error);
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
}
