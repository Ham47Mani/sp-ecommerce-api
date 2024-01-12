import { Router } from "express";
import { createProdCategory, deleteProdCategory, getAllProdCategory, getProdCategory, updateProdCategory } from "../controllers/prodCategory.controller";
import { authMiddleware, isAdmin } from "../middleware/authMiddleware";

const prodCategoryRouter: Router = Router();

prodCategoryRouter.post("/", authMiddleware, isAdmin, createProdCategory);
prodCategoryRouter.get("/", authMiddleware, isAdmin, getAllProdCategory);
prodCategoryRouter.get("/:id", authMiddleware, isAdmin, getProdCategory);
prodCategoryRouter.put("/:id", authMiddleware, isAdmin, updateProdCategory);
prodCategoryRouter.delete("/:id", authMiddleware, isAdmin, deleteProdCategory);

export default prodCategoryRouter;