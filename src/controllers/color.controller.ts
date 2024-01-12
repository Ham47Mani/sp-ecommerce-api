import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { handleResponseError, handleResponseSuccess } from '../utils/handleResponse';
import { HttpStatusCode } from '../utils/httpStatusCodes';
import { createItem, deleteItem, getItem, getItems, updateItem } from '../utils/mongooseCruds';
import { isValidObjectId } from 'mongoose';
import colorModel from '../model/color.model';

// ======================= Create a Color =======================
export const createColor = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { title} = req.body;
  // Check if fields is empty
  if (!title) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, 'Color title are required');
    return;
  }
  try {
    // Create new Color
    const newColor = await createItem(colorModel, {title});
    handleResponseSuccess(res, HttpStatusCode.CREATED, 'Color created successfully', [newColor]);
  } catch (err: any) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, err.message);
  }
});

// ======================= Get a Color =======================
export const getColor = asyncHandler(async (req: Request, res: Response): Promise<void> => {
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
    // Get Color
    const Color = await getItem(colorModel, {_id: id});
    if(!Color) {
      handleResponseError(res, HttpStatusCode.BADREQUEST, 'Color not found');
    }
    handleResponseSuccess(res, HttpStatusCode.OK, `Color ${Color!.title}`, [Color]);
  } catch (err: any) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, err.message);
  }
});

// ======================= Get All Color =======================
export const getAllColor = asyncHandler(async(req: Request, res: Response): Promise<void> => {
  try {
    // ------------- Filtring -------------
    const queryObj = {...req.query};// Get all query
    const excludeField = ['page', 'sort', 'limit', 'fields'];// An array contain an excluded filter
    excludeField.forEach(el => delete queryObj[el]);// Remove excluded filter from query
    // Use regex to trait the (<, <=, >=, >) inside query
    const queryStr = JSON.stringify(queryObj).replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

    // ------------- Sorting & Limiting Fields & Paginition &  -------------
    const {sort, fields, limit, page} = req.query;

    const allColors = await getItems(colorModel, JSON.parse(queryStr), sort as string, fields as string, page as string, limit as string);
    if(allColors.length == 0) {
      handleResponseSuccess(res, HttpStatusCode.OK, "There's no Color ", allColors);
      return;
    }    
    handleResponseSuccess(res, HttpStatusCode.OK, "All Color", allColors);
  } catch (err: any) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, err.message);
  }
});

// ======================= Update a Color =======================
export const updateColor = asyncHandler(async (req: Request, res: Response): Promise<void> => {
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
    const updateColor = await updateItem(colorModel, {_id: id}, {title});
    if(!updateColor) {
      handleResponseError(res, HttpStatusCode.BADREQUEST, 'Color not found');
    }
    handleResponseSuccess(res, HttpStatusCode.OK, `Color ${updateColor!.title} Updated`, [updateColor]);
  } catch (err: any) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, err.message);
  }
});

// ======================= Delete a Blog Category =======================
export const deleteColor = asyncHandler(async (req: Request, res: Response): Promise<void> => {
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
    // Delete Color
    const deleteColor = await deleteItem(colorModel, {_id: id});
    if(!deleteColor) {
      handleResponseError(res, HttpStatusCode.BADREQUEST, 'Color not found');
    }
    handleResponseSuccess(res, HttpStatusCode.OK, `Color ${deleteColor!.title} Deleted`, [deleteColor]);
  } catch (err: any) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, err.message);
  }
});