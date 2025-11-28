import { Router } from "express";
import { FigmaController } from "../controllers/figma.controller";

const router = Router();
const figmaController = new FigmaController();

// Initiate OAuth flow
router.get("/authorize", (req, res) => figmaController.authorize(req, res));

// OAuth callback
router.get("/callback", (req, res) => figmaController.callback(req, res));

// Get user info (requires Bearer token)
router.get("/me", (req, res) => figmaController.getUserInfo(req, res));

export default router;
