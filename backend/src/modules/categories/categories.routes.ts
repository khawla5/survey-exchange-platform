import { Router } from "express";
import { categoriesController } from "@/modules/categories/categories.controller";

const router = Router();

router.get("/", categoriesController.list);
router.get("/:id", categoriesController.getById);

export default router;
