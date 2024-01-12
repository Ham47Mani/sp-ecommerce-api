import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { handleResponseError, handleResponseSuccess } from '../utils/handleResponse';
import { HttpStatusCode } from '../utils/httpStatusCodes';
import { createItem, deleteItem, getItem, getItems, updateItem } from '../utils/mongooseCruds';
import { isValidObjectId } from 'mongoose';
import brandModel from '../model/brand.model';

// ======================= Create a Brand =======================
export const createBrand = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { title} = req.body;
  // Check if fields is empty
  if (!title) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, 'Brand title are required');
    return;
  }
  try {
    // Create new Brand
    const newBrand = await createItem(brandModel, {title});
    handleResponseSuccess(res, HttpStatusCode.CREATED, 'Brand created successfully', [newBrand]);
  } catch (err: any) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, err.message);
  }
});

// ======================= Get a Brand =======================
export const getBrand = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const {id} = req.params;
  if(!id) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, 'ID require');
    return;
  }
  if(!isValidObjectId(id)) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, 'Invalid ObjectId');
    return;
  }
  try {
    // Get Brand
    const brand = await getItem(brandModel, {_id: id});
    if(!brand) {
      handleResponseError(res, HttpStatusCode.BADREQUEST, 'Brand not found');
    }
    handleResponseSuccess(res, HttpStatusCode.OK, `Brand ${brand!.title}`, [brand]);
  } catch (err: any) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, err.message);
  }
});

// ======================= Get All Brand =======================
export const getAllBrand = asyncHandler(async(req: Request, res: Response): Promise<void> => {
  try {
    // ------------- Filtring -------------
    const queryObj = {...req.query};// Get all query
    const excludeField = ['page', 'sort', 'limit', 'fields'];// An array contain an excluded filter
    excludeField.forEach(el => delete queryObj[el]);// Remove excluded filter from query
    // Use regex to trait the (<, <=, >=, >) inside query
    const queryStr = JSON.stringify(queryObj).replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

    // ------------- Sorting & Limiting Fields & Paginition &  -------------
    const {sort, fields, limit, page} = req.query;

    const allBrands = await getItems(brandModel, JSON.parse(queryStr), sort as string, fields as string, page as string, limit as string);
    if(allBrands.length == 0) {
      handleResponseSuccess(res, HttpStatusCode.OK, "There's no Brand ", allBrands);
      return;
    }    
    handleResponseSuccess(res, HttpStatusCode.OK, "All Brand", allBrands);
  } catch (err: any) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, err.message);
  }
});

// ======================= Update a Brand =======================
export const updateBrand = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const {id} = req.params;
  if(!id) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, 'ID require');
    return;
  }
  if(!isValidObjectId(id)) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, 'Invalid ObjectId');
    return;
  }
  try {
    // Update Blog category
    const { title } = req.body;
    const updateBrand = await updateItem(brandModel, {_id: id}, {title});
    if(!updateBrand) {
      handleResponseError(res, HttpStatusCode.BADREQUEST, 'Brand not found');
    }
    handleResponseSuccess(res, HttpStatusCode.OK, `Brand ${updateBrand!.title} Updated`, [updateBrand]);
  } catch (err: any) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, err.message);
  }
});

// ======================= Delete a Blog Category =======================
export const deleteBrand = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const {id} = req.params;
  if(!id) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, 'ID require');
    return;
  }
  if(!isValidObjectId(id)) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, 'Invalid ObjectId');
    return;
  }
  try {
    // Delete Brand
    const deleteBrand = await deleteItem(brandModel, {_id: id});
    if(!deleteBrand) {
      handleResponseError(res, HttpStatusCode.BADREQUEST, 'Brand not found');
    }
    handleResponseSuccess(res, HttpStatusCode.OK, `Brand ${deleteBrand!.title} Deleted`, [deleteBrand]);
  } catch (err: any) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, err.message);
  }
});