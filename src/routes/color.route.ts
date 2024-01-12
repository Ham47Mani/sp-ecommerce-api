import { Router } from "express";
import { authMiddleware, isAdmin } from "../middleware/authMiddleware";
import { createColor, deleteColor, getAllColor, getColor, updateColor } from "../controllers/color.controller";

const colorRouter: Router = Router();

colorRouter.post("/", authMiddleware, isAdmin, createColor);
colorRouter.get("/", authMiddleware, isAdmin, getAllColor);
colorRouter.get("/:id", authMiddleware, isAdmin, getColor);
colorRouter.put("/:id", authMiddleware, isAdmin, updateColor);
colorRouter.delete("/:id", authMiddleware, isAdmin, deleteColor);

export default colorRouter;