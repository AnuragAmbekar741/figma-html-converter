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
        // Redirect to frontend with error
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        res.redirect(
          `${frontendUrl}?error=${encodeURIComponent(error as string)}`
        );
        return;
      }

      if (!code || typeof code !== "string") {
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        res.redirect(`${frontendUrl}?error=missing_code`);
        return;
      }

      // Exchange code for access token
      const tokens = await figmaService.exchangeCodeForToken(code);

      // Get user info
      const userInfo = await figmaService.getUserInfo(tokens.access_token);

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

      // Redirect to frontend WITHOUT tokens in URL
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      res.redirect(`${frontendUrl}/`);
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
}
