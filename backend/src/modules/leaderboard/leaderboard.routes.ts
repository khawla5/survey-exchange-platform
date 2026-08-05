import { Router } from "express";
import { leaderboardController } from "@/modules/leaderboard/leaderboard.controller";

const router = Router();

router.get("/", leaderboardController.list);

export default router;
