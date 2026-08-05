import { Router } from "express";
import { pointsController } from "@/modules/points/points.controller";
import { requireAuth } from "@/middlewares/auth";

const router = Router();

router.use(requireAuth);
router.get("/", pointsController.balance);
router.get("/history", pointsController.history);

export default router;
