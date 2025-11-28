import { Router } from "express";
import { FigmaOauthController } from "../controllers/figma-oauth.controller";

const router = Router();
const figmaOauthController = new FigmaOauthController();

// Initiate OAuth flow
router.get("/authorize", (req, res) =>
  figmaOauthController.authorize(req, res)
);

// OAuth callback
router.get("/callback", (req, res) => figmaOauthController.callback(req, res));

// Get user info (requires Bearer token)
router.get("/me", (req, res) => figmaOauthController.getUserInfo(req, res));

export default router;
