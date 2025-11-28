import { Router } from "express";
import { FigmaFileController } from "../controllers/figma-file.controller";

const router = Router();
const figmaFileController = new FigmaFileController();

// File routes
router.get("/:fileKey", (req, res) => figmaFileController.getFile(req, res));
router.get("/:fileKey/nodes", (req, res) =>
  figmaFileController.getFileNodes(req, res)
);
router.get("/:fileKey/images", (req, res) =>
  figmaFileController.getFileImages(req, res)
);
router.get("/:fileKey/image-fills", (req, res) =>
  figmaFileController.getFileImageFills(req, res)
);

export default router;
