import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { handleResponseError, handleResponseSuccess } from '../utils/handleResponse';
import { HttpStatusCode } from '../utils/httpStatusCodes';
import { createItem, deleteItem, getItem, getItems, updateItem } from '../utils/mongooseCruds';
import { isValidObjectId } from 'mongoose';
import { ENQUIRY } from '../utils/modale.type';
import enqModel from '../model/enq.model';

// ======================= Create an Enquiry =======================
export const createEnquiry = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const enquiry: ENQUIRY = req.body;
  // Check if fields is empty
  if (!enquiry) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, 'Enquiry name, email, mobile, comment are required');
    return;
  }
  try {
    // Create new Enquiry
    const newEnq = await createItem(enqModel, {...enquiry});
    handleResponseSuccess(res, HttpStatusCode.CREATED, 'Enquiry created successfully', [newEnq]);
  } catch (err: any) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, err.message);
  }
});

// ======================= Get a Enquiry =======================
export const getEnquiry = asyncHandler(async (req: Request, res: Response): Promise<void> => {
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
    // Get Enquiry
    const enquiry: ENQUIRY | null = await getItem(enqModel, {_id: id});
    if(!enquiry) {
      handleResponseError(res, HttpStatusCode.BADREQUEST, 'Enquiry not found');
    }
    handleResponseSuccess(res, HttpStatusCode.OK, `Enquiry ${enquiry!.name}`, [enquiry]);
  } catch (err: any) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, err.message);
  }
});

// ======================= Get All Enquiry =======================
export const getAllEnquiry = asyncHandler(async(req: Request, res: Response): Promise<void> => {
  try {
    // ------------- Filtring -------------
    const queryObj = {...req.query};// Get all query
    const excludeField = ['page', 'sort', 'limit', 'fields'];// An array contain an excluded filter
    excludeField.forEach(el => delete queryObj[el]);// Remove excluded filter from query
    // Use regex to trait the (<, <=, >=, >) inside query
    const queryStr = JSON.stringify(queryObj).replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

    // ------------- Sorting & Limiting Fields & Paginition &  -------------
    const {sort, fields, limit, page} = req.query;

    const allEnquiry = await getItems(enqModel, JSON.parse(queryStr), sort as string, fields as string, page as string, limit as string);
    if(allEnquiry.length == 0) {
      handleResponseSuccess(res, HttpStatusCode.OK, "There's no Enquiry ", allEnquiry);
      return;
    }    
    handleResponseSuccess(res, HttpStatusCode.OK, "All Enquiry", allEnquiry);
  } catch (err: any) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, err.message);
  }
});

// ======================= Update a Enquiry =======================
export const updateEnquiry = asyncHandler(async (req: Request, res: Response): Promise<void> => {
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
    // Update Enquiry
    const enquiry: ENQUIRY = req.body;
    const updateEnquiry = await updateItem(enqModel, {_id: id}, {...enquiry});
    if(!updateEnquiry) {
      handleResponseError(res, HttpStatusCode.BADREQUEST, 'Enquiry not found');
    }
    handleResponseSuccess(res, HttpStatusCode.OK, `Enquiry ${updateEnquiry!.name} Updated`, [updateEnquiry]);
  } catch (err: any) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, err.message);
  }
});

// ======================= Delete Enquiry =======================
export const deleteEnquiry = asyncHandler(async (req: Request, res: Response): Promise<void> => {
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
    // Delete Enquiry
    const deleteEnquiry: ENQUIRY | null = await deleteItem(enqModel, {_id: id});
    if(!deleteEnquiry) {
      handleResponseError(res, HttpStatusCode.BADREQUEST, 'Enquiry not found');
    }
    handleResponseSuccess(res, HttpStatusCode.OK, `Enquiry ${deleteEnquiry!.name} Deleted`, [deleteEnquiry]);
  } catch (err: any) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, err.message);
  }
});