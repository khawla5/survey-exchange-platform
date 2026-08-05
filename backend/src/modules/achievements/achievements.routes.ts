import { Router } from "express";
import { achievementsController } from "@/modules/achievements/achievements.controller";
import { optionalAuth } from "@/middlewares/auth";

const router = Router();

router.get("/", optionalAuth, achievementsController.list);

export default router;
