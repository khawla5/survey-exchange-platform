import { Router } from "express";
import { pollsController } from "@/modules/polls/polls.controller";
import { optionalAuth, requireAuth } from "@/middlewares/auth";

const router = Router();

router.get("/", optionalAuth, pollsController.list);
router.get("/:id", optionalAuth, pollsController.getById);

router.post("/", requireAuth, pollsController.create);
router.put("/:id", requireAuth, pollsController.update);
router.post("/:id/publish", requireAuth, pollsController.publish);
router.delete("/:id", requireAuth, pollsController.remove);
router.post("/:id/bookmark", requireAuth, pollsController.bookmark);
router.post("/:id/report", requireAuth, pollsController.report);
router.post("/:id/complete", requireAuth, pollsController.complete);

export default router;
