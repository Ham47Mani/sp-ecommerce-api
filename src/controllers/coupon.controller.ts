import { Request, Response } from "express";
import { handleResponseError, handleResponseSuccess } from "../utils/handleResponse";
import { HttpStatusCode } from "../utils/httpStatusCodes";
import asyncHandler from 'express-async-handler';
import { COUPON } from "../utils/modale.type";
import { createItem, deleteItem, getItem, getItems, updateItem } from "../utils/mongooseCruds";
import couponModel from "../model/coupon.model";
import { isValidObjectId } from "mongoose";


// ======================= Create a Coupon =======================
export const createCoupon = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { name, expiry, discount} = req.body;
  // Check if fields is empty
  if (!name || !expiry || !discount) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, 'All fields (name, expiry, discount) are required');
    return;
  }
  try {
    const coupon: COUPON | null = await getItem(couponModel, {name});
    
    if(coupon){
      handleResponseError(res, HttpStatusCode.BADREQUEST, "Coupon already exists, please change coupon name");
      return;
    }
    // Create new product
    const newCoupon = await createItem(couponModel, {name, expiry, discount});
    handleResponseSuccess(res, HttpStatusCode.CREATED, 'Coupon created successfully', [newCoupon]);
  } catch (err: any) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, err.message);
  }
});

// ======================= Get All a Coupon =======================
export const getAllCoupons = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    // ------------- Filtring -------------
    const queryObj = {...req.query};// Get all query
    const excludeField = ['page', 'sort', 'limit', 'fields'];// An array contain an excluded filter
    excludeField.forEach(el => delete queryObj[el]);// Remove excluded filter from query
    // Use regex to trait the (<, <=, >=, >) inside query
    const queryStr = JSON.stringify(queryObj).replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

    // ------------- Sorting & Limiting Fields & Paginition &  -------------
    const {sort, fields, limit, page} = req.query;

    const allCoupons = await getItems(couponModel, JSON.parse(queryStr), sort as string, fields as string, page as string, limit as string);
    if(allCoupons.length == 0) {
      handleResponseSuccess(res, HttpStatusCode.OK, "There's no coupon", allCoupons);
      return;
    }    
    handleResponseSuccess(res, HttpStatusCode.OK, "All coupons", allCoupons);
  } catch (err: any) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, err.message);
  }
});

// ======================= Get a Coupon =======================
export const getCoupon = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const {id} = req.params;
  // Check if there's no id
  if(!id) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, "ID is required");
    return;
  }
  // Check if the id is a good ObjectId of mongoose
  if(!isValidObjectId(id)) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, "Invalid ObjectId");
    return;
  }
  try {
    const coupon: COUPON | null = await getItem(couponModel, { _id: id });
    if(coupon)
      handleResponseSuccess(res, HttpStatusCode.OK,`Coupon ${coupon!.name} info`, [coupon]);
    else
      handleResponseError(res, HttpStatusCode.NOTFOUND, `Coupon not found`);
  } catch (err: any) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, err.message);
  }
});

// ======================= Update a Coupon =======================
export const updateCoupons = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const {name, expiry, discount} = req.body;
  const {id} = req.params;
  // Check if there's no id
  if(!id) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, "ID is required");
    return;
  }
  // Check if the id is a good ObjectId of mongoose
  if(!isValidObjectId(id)) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, "Invalid ObjectId");
    return;
  }
  try {
    const updatedCoupon: COUPON | null = await updateItem(couponModel, { _id: id }, {name, expiry, discount});
    if(updatedCoupon)
      handleResponseSuccess(res, HttpStatusCode.OK,`Coupon ${updatedCoupon!.name} updated`, [updatedCoupon]);
    else
      handleResponseError(res, HttpStatusCode.NOTFOUND, `Coupon not found`);
  } catch (err: any) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, err.message);
  }
});

// ======================= Delete a Coupon =======================
export const deleteCoupons = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const {id} = req.params;
  // Check if there's no id
  if(!id) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, "ID is required");
    return;
  }
  // Check if the id is a good ObjectId of mongoose
  if(!isValidObjectId(id)) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, "Invalid ObjectId");
    return;
  }
  try {
    const deletedCoupon: COUPON | null = await deleteItem(couponModel, { _id: id });
    if(deletedCoupon)
      handleResponseSuccess(res, HttpStatusCode.OK,`Coupon ${deletedCoupon!.name} deleted`, [deletedCoupon]);
    else
      handleResponseError(res, HttpStatusCode.NOTFOUND, `Coupon not found`);
  } catch (err: any) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, err.message);
  }
});