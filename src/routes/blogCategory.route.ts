import { Router } from "express";
import { authMiddleware, isAdmin } from "../middleware/authMiddleware";
import { createBlogCategory, deleteBlogCategory, getAllBlogCategory, getBlogCategory, updateBlogCategory } from "../controllers/blogCategory.controller";

const blogCategoryRouter: Router = Router();

blogCategoryRouter.post("/", authMiddleware, isAdmin, createBlogCategory);
blogCategoryRouter.get("/", authMiddleware, isAdmin, getAllBlogCategory);
blogCategoryRouter.get("/:id", authMiddleware, isAdmin, getBlogCategory);
blogCategoryRouter.put("/:id", authMiddleware, isAdmin, updateBlogCategory);
blogCategoryRouter.delete("/:id", authMiddleware, isAdmin, deleteBlogCategory);

export default blogCategoryRouter;