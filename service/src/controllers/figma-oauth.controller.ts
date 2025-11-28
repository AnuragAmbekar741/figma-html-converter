import { Request, Response } from "express";
import { FigmaOauthService } from "../services/figma-oauth.service";
import { figmaConfig } from "../config/figma.config";

const figmaService = new FigmaOauthService();

export class FigmaOauthController {
  authorize(req: Request, res: Response): void {
    console.log("=== AUTHORIZE REQUEST RECEIVED ===");
    console.log("Method:", req.method);
    console.log("URL:", req.url);
    console.log("Headers:", req.headers);
    console.log("Query params:", req.query);
    console.log("Origin:", req.headers.origin);

    const state = figmaConfig.state;
    const authUrl = figmaService.getAuthorizationUrl(state);

    console.log("Generated Figma Auth URL:", authUrl);
    console.log("Redirecting to Figma...");

    res.redirect(authUrl);
  }

  async callback(req: Request, res: Response): Promise<void> {
    try {
      const { code, state, error } = req.query;
      if (error) {
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        res.redirect(
          `${frontendUrl}?error=${encodeURIComponent(error as string)}`
        );
        return;
      }

      if (state !== figmaConfig.state) {
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        res.redirect(`${frontendUrl}?error=invalid_state`);
        return;
      }

      if (!code || typeof code !== "string") {
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        res.redirect(`${frontendUrl}?error=missing_code`);
        return;
      }

      // Exchange code for access token
      const tokens = await figmaService.exchangeCodeForToken(code);

      // Set HTTP-only cookies
      res.cookie("figma_access_token", tokens.access_token, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      if (tokens.refresh_token) {
        res.cookie("figma_refresh_token", tokens.refresh_token, {
          httpOnly: true,
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 30, // 30 days
        });
      }

      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      res.redirect(`${frontendUrl}/home`);
    } catch (error) {
      console.error("OAuth callback error:", error);
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      res.redirect(`${frontendUrl}?error=oauth_failed`);
    }
  }

  async getUserInfo(req: Request, res: Response): Promise<void> {
    try {
      // Read token from HTTP-only cookie instead of Authorization header
      const accessToken = req.cookies?.figma_access_token;

      if (!accessToken) {
        res.status(401).json({
          error: "Missing or invalid access token",
        });
        return;
      }

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

  async logout(req: Request, res: Response): Promise<void> {
    res.clearCookie("figma_access_token");
    res.clearCookie("figma_refresh_token");
    res.json({ success: true, message: "Logged out successfully" });
  }
}
