import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { handleResponseError, handleResponseSuccess } from '../utils/handleResponse';
import { HttpStatusCode } from '../utils/httpStatusCodes';
import { createItem, deleteItem, getItem, getItems, updateItem } from '../utils/mongooseCruds';
import categoryModel from '../model/prodCategory.model';
import { isValidObjectId } from 'mongoose';
import prodCategoryModel from '../model/prodCategory.model';

// ======================= Create a Blog Category =======================
export const createBlogCategory = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { title} = req.body;
  // Check if fields is empty
  if (!title) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, 'Category title are required');
    return;
  }
  try {
    // Create new Blog category
    const newCategory = await createItem(categoryModel, {title});
    handleResponseSuccess(res, HttpStatusCode.CREATED, 'Category created successfully', [newCategory]);
  } catch (err: any) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, err.message);
  }
});

// ======================= Get a Blog Category =======================
export const getBlogCategory = asyncHandler(async (req: Request, res: Response): Promise<void> => {
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
    // Get Blog category
    const prodCategory = await getItem(categoryModel, {_id: id});
    if(!prodCategory) {
      handleResponseError(res, HttpStatusCode.BADREQUEST, 'Blog category not found');
    }
    handleResponseSuccess(res, HttpStatusCode.OK, `Blog category ${prodCategory!.title}`, [prodCategory]);
  } catch (err: any) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, err.message);
  }
});

// ======================= Get All Blogs Categorys =======================
export const getAllBlogCategory = asyncHandler(async(req: Request, res: Response): Promise<void> => {
  try {
    // ------------- Filtring -------------
    const queryObj = {...req.query};// Get all query
    const excludeField = ['page', 'sort', 'limit', 'fields'];// An array contain an excluded filter
    excludeField.forEach(el => delete queryObj[el]);// Remove excluded filter from query
    // Use regex to trait the (<, <=, >=, >) inside query
    const queryStr = JSON.stringify(queryObj).replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

    // ------------- Sorting & Limiting Fields & Paginition &  -------------
    const {sort, fields, limit, page} = req.query;

    const allProdCategory = await getItems(prodCategoryModel, JSON.parse(queryStr), sort as string, fields as string, page as string, limit as string);
    if(allProdCategory.length == 0) {
      handleResponseSuccess(res, HttpStatusCode.OK, "There's no Blog category ", allProdCategory);
      return;
    }    
    handleResponseSuccess(res, HttpStatusCode.OK, "All Blogs category", allProdCategory);
  } catch (err: any) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, err.message);
  }
});

// ======================= Update a Blog Category =======================
export const updateBlogCategory = asyncHandler(async (req: Request, res: Response): Promise<void> => {
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
    const updateCategory = await updateItem(categoryModel, {_id: id}, {title});
    if(!updateCategory) {
      handleResponseError(res, HttpStatusCode.BADREQUEST, 'Blog category not found');
    }
    handleResponseSuccess(res, HttpStatusCode.OK, `Blog category ${updateCategory!.title} Updated`, [updateCategory]);
  } catch (err: any) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, err.message);
  }
});

// ======================= Delete a Blog Category =======================
export const deleteBlogCategory = asyncHandler(async (req: Request, res: Response): Promise<void> => {
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
    // Delete Blog category
    const deleteCategory = await deleteItem(categoryModel, {_id: id});
    if(!deleteCategory) {
      handleResponseError(res, HttpStatusCode.BADREQUEST, 'Blog category not found');
    }
    handleResponseSuccess(res, HttpStatusCode.OK, `Blog category ${deleteCategory!.title} Deleted`, [deleteCategory]);
  } catch (err: any) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, err.message);
  }
});