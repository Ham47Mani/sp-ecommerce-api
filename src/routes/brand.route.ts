import { Router } from "express";
import { authMiddleware, isAdmin } from "../middleware/authMiddleware";
import { createBrand, deleteBrand, getAllBrand, getBrand, updateBrand } from "../controllers/brand.controller";

const brandRouter: Router = Router();

brandRouter.post("/", authMiddleware, isAdmin, createBrand);
brandRouter.get("/", authMiddleware, isAdmin, getAllBrand);
brandRouter.get("/:id", authMiddleware, isAdmin, getBrand);
brandRouter.put("/:id", authMiddleware, isAdmin, updateBrand);
brandRouter.delete("/:id", authMiddleware, isAdmin, deleteBrand);

export default brandRouter;