import express, { Router } from "express";
import { applyCoupon, block, createOrder, deleteUser, emptyCart, forgetPasswordToken, getAllUsers, getUser, getUserCart, getUserOrders, getWishlist, handleRefreshToken, loginAdmin, loginUser, logout, registerUser, resetPassword, saveUserAddress, updateOrderStatus, updatePassword, updateUser, userCart } from "../controllers/user.controller";
import { authMiddleware, isAdmin } from "../middleware/authMiddleware";

const authRouter: Router  = express.Router();

authRouter.post("/register", registerUser);// Signup a user
authRouter.post("/login", loginUser); // Login
authRouter.post("/admin-login", loginAdmin); // Admin Login
authRouter.post("/cart", authMiddleware, userCart); // Add to Cart
authRouter.post("/logout", logout); // Logout
authRouter.post("/apply-coupon", authMiddleware, applyCoupon); // Apply Coupon
authRouter.post("/cash-order", authMiddleware, createOrder); // Create an order

authRouter.get("/refresh", handleRefreshToken);// Refresh token
authRouter.get("/wishlist",authMiddleware, getWishlist);// Get User Wishlist
authRouter.get("/cart",authMiddleware, getUserCart);// Get User Cart
authRouter.get("/orders",authMiddleware, getUserOrders());// Get User Orders (user it self)
authRouter.get("/orders/:id",authMiddleware, getUserOrders(false));// Get a User Orders
authRouter.get("/", authMiddleware, isAdmin, getAllUsers);// Get all users
authRouter.get("/:id", authMiddleware, isAdmin, getUser);// Get a user

authRouter.delete("/empty-cart", authMiddleware, emptyCart);// Delete a user cart (empty cart)
authRouter.delete("/:id", authMiddleware, isAdmin, deleteUser);// Delete a user

authRouter.post("/forget-password-token", forgetPasswordToken);// Forget password token
authRouter.put("/reset-password/:token", resetPassword);// Forget password token
authRouter.put("/password", authMiddleware, updatePassword);// Update password

authRouter.put("/save-address", authMiddleware, saveUserAddress);// Update user address
authRouter.put("/orders/:id", authMiddleware, isAdmin, updateOrderStatus);// Update order status
authRouter.put("/edit", authMiddleware, updateUser);// Update user profile
authRouter.put("/:id", authMiddleware, isAdmin, updateUser);// Update a user

authRouter.put("/block/:id", authMiddleware, isAdmin, block(true));// Block a user
authRouter.put("/unblock/:id", authMiddleware, isAdmin, block(false));// Unblock a user

export default authRouter;