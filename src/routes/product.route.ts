import express, { Router } from "express";
import { addToWishList, createProduct, deleteProduct, getAllProducts, getProduct, ratingProduct, updateProduct, productUploadImages, productDeleteImage } from "../controllers/product.controller";
import { authMiddleware, isAdmin } from "../middleware/authMiddleware";
import prodCategoryRouter from "./prodCategory.route";
import brandRouter from "./brand.route";
import { productImgResize, uploadPhoto } from '../middleware/uploadImages';
import colorRouter from "./color.route";

const productRoute: Router = express.Router();

productRoute.use("/categorys", prodCategoryRouter);// Route blog category
productRoute.use("/brands", brandRouter);// Route brand
productRoute.use("/colors", colorRouter);// Route color

productRoute.post("/", authMiddleware, isAdmin, createProduct); // Create a new product
productRoute.get("/", getAllProducts); // Get all products
productRoute.get("/:id", getProduct); // Get a single product

productRoute.put("/uploads/", authMiddleware, isAdmin, uploadPhoto.array("images", 10),productImgResize, productUploadImages); // Upload product images

productRoute.put("/wishlist", authMiddleware, addToWishList); // Get a single product
productRoute.put("/rating", authMiddleware, ratingProduct); // Get a single product
productRoute.put("/:id",authMiddleware, isAdmin, updateProduct); // Update product

productRoute.delete("/delete-img/:id", authMiddleware, isAdmin, uploadPhoto.array("images", 10),productImgResize, productDeleteImage); // Delete product images
productRoute.delete("/:id",authMiddleware, isAdmin, deleteProduct); // Delete product

export default productRoute;