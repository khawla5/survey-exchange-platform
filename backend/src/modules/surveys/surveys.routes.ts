import { Router } from "express";
import { surveysController } from "@/modules/surveys/surveys.controller";
import { optionalAuth, requireAuth } from "@/middlewares/auth";

const router = Router();

router.get("/", optionalAuth, surveysController.list);
router.get("/:id", optionalAuth, surveysController.getById);

router.post("/", requireAuth, surveysController.create);
router.put("/:id", requireAuth, surveysController.update);
router.post("/:id/publish", requireAuth, surveysController.publish);
router.delete("/:id", requireAuth, surveysController.remove);
router.post("/:id/bookmark", requireAuth, surveysController.bookmark);
router.post("/:id/report", requireAuth, surveysController.report);
router.post("/:id/complete", requireAuth, surveysController.complete);

export default router;
