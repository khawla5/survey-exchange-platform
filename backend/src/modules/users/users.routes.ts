import { Router } from "express";
import { usersController } from "@/modules/users/users.controller";
import { requireAuth } from "@/middlewares/auth";

const router = Router();

router.use(requireAuth);

router.get("/me", usersController.me);
router.put("/profile", usersController.updateProfile);
router.put("/security/password", usersController.changePassword);
router.get("/sessions", usersController.sessions);
router.delete("/sessions/:id", usersController.revokeSession);
router.delete("/account", usersController.deleteAccount);

export default router;
