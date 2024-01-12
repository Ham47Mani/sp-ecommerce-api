import { Router } from "express";
import { createCoupon, deleteCoupons, getAllCoupons, getCoupon, updateCoupons } from "../controllers/coupon.controller";
import { authMiddleware, isAdmin } from "../middleware/authMiddleware";


const couponRouter: Router = Router();

couponRouter.post("/", authMiddleware, isAdmin, createCoupon);
couponRouter.get("/", authMiddleware, isAdmin, getAllCoupons);
couponRouter.get("/:id", authMiddleware, isAdmin, getCoupon);
couponRouter.put("/:id", authMiddleware, isAdmin, updateCoupons);
couponRouter.delete("/:id", authMiddleware, isAdmin, deleteCoupons);

export default couponRouter;