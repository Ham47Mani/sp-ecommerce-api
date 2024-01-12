import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { handleResponseError, handleResponseSuccess } from '../utils/handleResponse';
import { HttpStatusCode } from '../utils/httpStatusCodes';
import { createItem, deleteItem, getItem, getItems, updateItem } from '../utils/mongooseCruds';
import productModale from '../model/product.model';
import { isValidObjectId } from 'mongoose';
import { PRODUCT, USER } from '../utils/modale.type';
import slugify from 'slugify';
import { CustomRequest } from '../utils/costume.type';
import userModel from '../model/user.model';
import { cloudinaryDeleteImg, cloudinaryUploadImg } from '../utils/cloudinary';
import { existsSync, unlinkSync } from 'fs';

// ======================= Create a Product =======================
export const createProduct = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { title, description, price} = req.body;
  // Check if fields is empty
  if (!title || !description || !price) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, 'All fields (titre, price, description) are required');
    return;
  }
  try {
    const slug = slugify(title);
    const product: PRODUCT | null = await getItem(productModale, {slug});
    
    if(product){
      handleResponseError(res, HttpStatusCode.BADREQUEST, "Please change the title or slug");
      return;
    }
    // Create new product
    const newProduct = await createItem(productModale, {...req.body, slug});
    handleResponseSuccess(res, HttpStatusCode.CREATED, 'Product created successfully', [newProduct]);    
  } catch (err: any) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, err.message);
  }
});

// ======================= Get All Products =======================
export const getAllProducts = asyncHandler(async(req: Request, res: Response): Promise<void> => {
  try {
    // ------------- Filtring -------------
    const queryObj = {...req.query};// Get all query
    const excludeField = ['page', 'sort', 'limit', 'fields'];// An array contain an excluded filter
    excludeField.forEach(el => delete queryObj[el]);// Remove excluded filter from query
    // Use regex to trait the (<, <=, >=, >) inside query
    const queryStr = JSON.stringify(queryObj).replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

    // ------------- Sorting & Limiting Fields & Paginition &  -------------
    const {sort, fields, limit, page} = req.query;

    const allProducts = await getItems(productModale, JSON.parse(queryStr), sort as string, fields as string, page as string, limit as string);
    if(allProducts.length == 0) {
      handleResponseSuccess(res, HttpStatusCode.OK, "There's no product", allProducts);
      return;
    }    
    handleResponseSuccess(res, HttpStatusCode.OK, "All products", allProducts);
  } catch (err: any) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, err.message);
  }
});

// ======================= Get a Product =======================
export const getProduct = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const {id} = req.params;
  // Check if the id is a good ObjectId of mongoose
  if(!isValidObjectId(id)) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, "Invalid ObjectId");
    return;
  }
  try {
    const product: PRODUCT | null = await getItem(productModale, { _id: id });
    if(product)
      handleResponseSuccess(res, HttpStatusCode.OK,`Product ${product!.title} info`, [product]);
    else
      handleResponseError(res, HttpStatusCode.NOTFOUND, `Product not found`);
  } catch (err: any) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, err.message);
  }
});

// ======================= Update a Product =======================
export const updateProduct = asyncHandler(async (req: Request, res: Response): Promise<void> => {
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
    const slug = req.body.title ? slugify(req.body.title) : undefined;
    const product: PRODUCT | null = await getItem(productModale, {slug});
    if(product){
      handleResponseError(res, HttpStatusCode.BADREQUEST, "Please change the title or slug");
      return;
    }
    const updatedProduct: PRODUCT | null = await updateItem(productModale, { _id: id }, {...req.body, slug});
    if(!updatedProduct) {
      handleResponseError(res, HttpStatusCode.BADREQUEST, "Product not exsist");
      return;
    }
    handleResponseSuccess(res, HttpStatusCode.OK, `Product ${updatedProduct!.title} Updated`, [updatedProduct]);
  } catch (err: any) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, err.message);
  }
});

// ======================= Delete a Product =======================
export const deleteProduct = asyncHandler(async (req: Request, res: Response): Promise<void> => {
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
    const deletedProduct: PRODUCT | null = await deleteItem(productModale, { _id: id });
    if(!deletedProduct) {
      handleResponseError(res, HttpStatusCode.BADREQUEST, "Product not exsist");
      return;
    }
    handleResponseSuccess(res, HttpStatusCode.OK, `Product ${deletedProduct!.title} Deleted`, [deletedProduct]);
  } catch (err: any) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, err.message);
  }
});

// ======================= Add to wish list a Product =======================
export const addToWishList = asyncHandler(async (req: CustomRequest, res: Response): Promise<void> => {
  const _id = req.user?.id;
  const { prodId } = req.body
  try {
    let user: USER | null = await getItem(userModel, {_id});
    if(!user) {
      handleResponseError(res, HttpStatusCode.NOTFOUND, "User not exists");
      return;
    }
    const alreadyAdded = user.wishList.find((id) => id.toString() === prodId);
    if(alreadyAdded) {
      user = await updateItem(userModel, {_id}, { $pull: {wishList: prodId} });
    } else {
      user = await updateItem(userModel, {_id}, { $push: {wishList: prodId} });
    }
    handleResponseSuccess(res, HttpStatusCode.OK, "Wishlist | Unwishlist success", [user]);
  } catch (err: any) {
    handleResponseError(res, HttpStatusCode.NOTFOUND, err.message);
  }
});

// ======================= Rating a Product =======================
export const ratingProduct = asyncHandler(async (req: CustomRequest, res: Response): Promise<void> => {
  const _id = req.user?.id;
  const {star, comment, prodId} = req.body;

  try {
    const product: PRODUCT | null = await getItem(productModale, {_id: prodId});
    if(!product) {
      handleResponseError(res, HttpStatusCode.BADREQUEST, "Product not exists - Check the prodId");
      return;
    }
    // Check if user ratin this product before or not
    const alreadyRated = product?.ratings.find((userId) => userId.postBy.toString() === _id.toString());    
    if(alreadyRated) {      
      const updateRateProduct: any = await updateItem(productModale, 
        { _id: prodId, 'ratings': {$elemMatch: alreadyRated} },
        {$set: {"ratings.$.star": star, "ratings.$.comment": comment}
      });
    } else {
      const rateProduct = await updateItem(productModale, {_id: prodId}, {
        $push: {
          ratings: {
            star: star,
            comment: comment,
            postBy: _id,
          }
        }
      });
    }
    const getAllRating = await getItem(productModale, {_id: prodId});
    const totalRating = getAllRating?.ratings.length;
    const ratingSum = getAllRating?.ratings
    .map((item: { star: any; }) => item.star)
    .reduce((prev: any, curr: any) => prev + curr, 0);
    const actualRating = (totalRating != null) ? Math.round(ratingSum / totalRating) : 0;
    const finalyProductRating = await updateItem(productModale, {_id: prodId}, {
      totalRating: actualRating
    });
    handleResponseSuccess(res, HttpStatusCode.OK, `Product ${finalyProductRating?.title} rated with ${finalyProductRating?.totalRating} Star`, [finalyProductRating]);
    totalRating
  } catch (err: any) {
    handleResponseError(res, HttpStatusCode.NOTFOUND, err.message);
  }
});

// ======================= Upload product images =======================
export const productUploadImages = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const uploader = (path: string) => cloudinaryUploadImg(path);
    const files: any = req.files;
    if(!files || files.length === 0) {
      handleResponseError(res, HttpStatusCode.BADREQUEST, `There's no file to uploads`);
      return;
    }
    // Uploads all filles in cloudinary and get all path
    const urls: any[] = [];
    for(const file of files) {
      const {path} = file;
      const newPath = await uploader(path);
      urls.push(newPath);
      try {
        unlinkSync(path);
      } catch (err: any) {
        console.log("Error Unlink file :", err.message);        
      }
    }
    handleResponseSuccess(res, HttpStatusCode.OK, `Files uploads successfuly`, [urls]);
  } catch (err: any) {
    handleResponseError(res, HttpStatusCode.NOTFOUND, err.message);
  }
});

// ======================= Delete product image =======================
export const productDeleteImage = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const {id} = req.params;
  if(!id) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, `public_id is required`);
  }
  try {
    const deleted = await cloudinaryDeleteImg(id);
    handleResponseSuccess(res, HttpStatusCode.OK, `File deleted`, [deleted]);
  } catch (err: any) {
    handleResponseError(res, HttpStatusCode.NOTFOUND, err.message);
  }
});