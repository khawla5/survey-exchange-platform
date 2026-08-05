import { Router } from "express";
import { dashboardController } from "@/modules/dashboard/dashboard.controller";
import { requireAuth } from "@/middlewares/auth";

const router = Router();

router.use(requireAuth);
router.get("/statistics", dashboardController.statistics);
router.get("/recommendations", dashboardController.recommendations);

export default router;
