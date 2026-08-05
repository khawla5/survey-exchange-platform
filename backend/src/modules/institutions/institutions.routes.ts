import { Router } from "express";
import { institutionsController } from "@/modules/institutions/institutions.controller";

const router = Router();

router.get("/", institutionsController.list);
router.get("/:id", institutionsController.getById);
router.get("/:id/members", institutionsController.members);

export default router;
