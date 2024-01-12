import { Router } from "express";
import { createBlog, getBlog, getAllBlogs, updateBlog, deleteBlog, likeBlog, blogUploadImages } from '../controllers/blog.controller';
import { authMiddleware, isAdmin } from "../middleware/authMiddleware";
import blogCategoryRouter from "./blogCategory.route";
import { blogImgResize, uploadPhoto } from "../middleware/uploadImages";


const blogRouter: Router = Router();

blogRouter.use("/categorys", blogCategoryRouter);// Route blog category

blogRouter.post("/", authMiddleware, isAdmin, createBlog);// Create a blog
blogRouter.put("/like", authMiddleware, likeBlog(true, false));// Like a blog
blogRouter.put("/dislike", authMiddleware, likeBlog(false, true));// Dislike a blog
blogRouter.put("/uploads/:id", authMiddleware, isAdmin, uploadPhoto.array("images", 2),blogImgResize, blogUploadImages); // Upload blog images
blogRouter.put("/:id", authMiddleware, isAdmin, updateBlog);// Update a blog

blogRouter.get("/", getAllBlogs);// Get a blogs
blogRouter.get("/:id", getBlog);// Get a blog and invrement numViews

blogRouter.delete("/:id", authMiddleware, isAdmin, deleteBlog);// Delete a blog

export default blogRouter;