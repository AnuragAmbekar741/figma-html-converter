import { Request, Response } from "express";
import { FigmaOauthService } from "../services/figma-oauth.service";

const figmaService = new FigmaOauthService();

export class FigmaOauthController {
  authorize(req: Request, res: Response): void {
    const state = req.query.state as string | undefined;
    const authUrl = figmaService.getAuthorizationUrl(state);
    res.redirect(authUrl);
  }

  async callback(req: Request, res: Response): Promise<void> {
    try {
      const { code, state, error } = req.query;

      if (error) {
        res.status(400).json({
          error: "OAuth error",
          message: error,
        });
        return;
      }

      if (!code || typeof code !== "string") {
        res.status(400).json({
          error: "Missing authorization code",
        });
        return;
      }

      // Exchange code for access token
      const tokens = await figmaService.exchangeCodeForToken(code);

      // Get user info
      const userInfo = await figmaService.getUserInfo(tokens.access_token);

      res.json({
        success: true,
        user: userInfo,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        state,
      });
    } catch (error) {
      console.error("OAuth callback error:", error);
      res.status(500).json({
        error: "Failed to complete OAuth flow",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async getUserInfo(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({
          error: "Missing or invalid authorization header",
        });
        return;
      }

      const accessToken = authHeader.substring(7);
      const userInfo = await figmaService.getUserInfo(accessToken);

      res.json({
        success: true,
        user: userInfo,
      });
    } catch (error) {
      console.error("Get user info error:", error);
      res.status(500).json({
        error: "Failed to get user info",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}
