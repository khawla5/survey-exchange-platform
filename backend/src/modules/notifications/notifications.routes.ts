import { Router } from "express";
import { notificationsController } from "@/modules/notifications/notifications.controller";
import { requireAuth } from "@/middlewares/auth";

const router = Router();

router.use(requireAuth);
router.get("/", notificationsController.list);
router.put("/read-all", notificationsController.markAllRead);
router.put("/:id/read", notificationsController.markRead);
router.delete("/:id", notificationsController.remove);

export default router;
