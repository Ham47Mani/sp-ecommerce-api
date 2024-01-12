import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { handleResponseError, handleResponseSuccess } from '../utils/handleResponse';
import { HttpStatusCode } from '../utils/httpStatusCodes';
import { BLOG, USER } from '../utils/modale.type';
import blogModel from '../model/blog.model';
import { createItem, deleteItem, getItem, getItems, updateItem } from '../utils/mongooseCruds';
import { isValidObjectId } from 'mongoose';
import { CustomRequest } from '../utils/costume.type';
import { cloudinaryUploadImg } from '../utils/cloudinary';
import { unlinkSync } from 'fs';


// ======================= Create a Blog =======================
export const createBlog = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { title, description, category, numViews, likes, dislikes, images, author} = req.body;
  // Check if fields is empty
  if (!title || !description || !category) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, 'All fields (title, category, description) are required');
    return;
  }
  try {
    // Create a new blog
    const blog: BLOG | null = await createItem(blogModel, {title, description, category, numViews, likes, dislikes, images, author});
    handleResponseSuccess(res, HttpStatusCode.CREATED, 'Blog created successfully', [blog]);    
  } catch (err: any) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, err.message);
  }
});

// ======================= Get all Blogs =======================
export const getAllBlogs = asyncHandler(async(req: Request, res: Response): Promise<void> => {
  try {
    // ------------- Filtring -------------
    const queryObj = {...req.query};// Get all query
    const excludeField = ['page', 'sort', 'limit', 'fields'];// An array contain an excluded filter
    excludeField.forEach(el => delete queryObj[el]);// Remove excluded filter from query
    // Use regex to trait the (<, <=, >=, >) inside query
    const queryStr = JSON.stringify(queryObj).replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

    // ------------- Sorting & Limiting Fields & Paginition &  -------------
    const {sort, fields, limit, page} = req.query;

    const allBlogs = await getItems(blogModel, JSON.parse(queryStr), sort as string, fields as string, page as string, limit as string);
    if(allBlogs.length == 0) {
      handleResponseSuccess(res, HttpStatusCode.OK, "There's no blogs", allBlogs);
      return;
    }    
    handleResponseSuccess(res, HttpStatusCode.OK, "All blogs", allBlogs);
  } catch (err: any) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, err.message);
  }
});

// ======================= Get a Blog =======================
export const getBlog = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const {id} = req.params;
  // Check if the id is a good ObjectId of mongoose
  if(!isValidObjectId(id)) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, "Invalid ObjectId");
    return;
  }
  try {
    const blog: BLOG | null = await blogModel
      .findByIdAndUpdate(
        id,
        { $inc: { numViews: 1 } },
        { new: true }
      )
      .populate('likes') // This line populates the 'likes' field
      .populate('dislikes'); // This line populates the 'dislikes' field
    if (blog) {
      handleResponseSuccess(res, HttpStatusCode.OK, `Blog ${blog.title} info`, [blog]);
      return;
    } else {
      handleResponseError(res, HttpStatusCode.NOTFOUND, `Blog not found`);
      return;
    }
  } catch (err: any) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, err.message);
  }
});

// ======================= Update a Blog =======================
export const updateBlog = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const {id} = req.params;
  const { title, description, category, numViews, isLiked, isDislike, likes, dislikes, images, author} = req.body;
  if(!id) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, 'ID require');
    return;
  }
  if(!isValidObjectId(id)) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, 'Invalid ObjectId');
    return;
  }
  try {
    const updatedBlog: BLOG | null = await updateItem(blogModel, { _id: id }, { title, description, category, numViews, isLiked, isDislike, likes, dislikes, images, author});
    if(!updatedBlog) {
      handleResponseError(res, HttpStatusCode.BADREQUEST, "Blog is not exsist");
      return;
    }
    handleResponseSuccess(res, HttpStatusCode.OK, `Blog ${updatedBlog!.title} Updated`, [updatedBlog]);
  } catch (err: any) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, err.message);
  }
});

// ======================= Delete a Blog =======================
export const deleteBlog = asyncHandler(async (req: Request, res: Response): Promise<void> => {
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
    const deletedBlog: BLOG | null = await deleteItem(blogModel, { _id: id });
    if(!deletedBlog) {
      handleResponseError(res, HttpStatusCode.BADREQUEST, "Blog not exsist");
      return;
    }
    handleResponseSuccess(res, HttpStatusCode.OK, `Blog ${deletedBlog!.title} Deleted`, [deletedBlog]);
  } catch (err: any) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, err.message);
  }
});

// ======================= Like | Dislike a Blog =======================
export const likeBlog = (like:boolean, dislike: boolean) => {
  return asyncHandler(async (req: CustomRequest, res: Response): Promise<void> => {
    const { blogId } = req.body;
    if(!blogId) {// Check if blogId is not empty
      handleResponseError(res, HttpStatusCode.BADREQUEST, 'ID require');
      return;
    }
    if(!isValidObjectId(blogId)) {// Check if the blogId is a valid mongo objectId
      handleResponseError(res, HttpStatusCode.BADREQUEST, 'Invalid ObjectId');
      return;
    }
    // Find the blog which you want to be liked
    const blog: BLOG | null = await getItem(blogModel, {_id: blogId});// Get blog
    const loginUserId: USER | null = req.user?.id;// Get user
    if(!blog) {
      handleResponseError(res, HttpStatusCode.BADREQUEST, 'Blog does not exists');
    }
    const alreadyLiked: string | undefined = blog?.likes?.find(userId => userId.toString() === loginUserId?.toString());// Find it the user has liked the blog
    const alreadyDisliked: string | undefined = blog?.dislikes?.find(userId => userId.toString() === loginUserId?.toString());// Find it the user has disliked the blog
    // Like a blog
    if(like) {
      if(alreadyDisliked){
        const blog: BLOG | null = await updateItem(blogModel, {_id: blogId}, {
          $pull: {dislikes: loginUserId},
          $push: {likes: loginUserId},
        });
        handleResponseSuccess(res, HttpStatusCode.OK, "Like a blog success", [blog]);
        return;
      }
      if(alreadyLiked) {
        const blog: BLOG | null = await updateItem(blogModel, {_id: blogId}, {
          $pull: {likes: loginUserId},
        });
        handleResponseSuccess(res, HttpStatusCode.OK, "Delete like a blog success", [blog]);
        return;
      } else {
        const blog: BLOG | null = await updateItem(blogModel, {_id: blogId}, {
          $push: {likes: loginUserId},
        });
        handleResponseSuccess(res, HttpStatusCode.OK, "Like a blog success", [blog]);
        return;
      }
    }
    
    // Dislike a blog
    if(dislike) {
      if(alreadyDisliked){
        const blog: BLOG | null = await updateItem(blogModel, {_id: blogId}, {
          $pull: {dislikes: loginUserId}
        });
        handleResponseSuccess(res, HttpStatusCode.OK, "Delete dislike a blog success", [blog]);
        return;
      } else if(alreadyLiked) {
        const blog: BLOG | null = await updateItem(blogModel, {_id: blogId}, {
          $pull: {likes: loginUserId},
          $push: {dislikes: loginUserId}
        });
        handleResponseSuccess(res, HttpStatusCode.OK, "Delete like and dislike a blog success", [blog]);
      } else {
        const blog: BLOG | null = await updateItem(blogModel, {_id: blogId}, {
          $push: {dislikes: loginUserId}
        });
        handleResponseSuccess(res, HttpStatusCode.OK, "Dislike a blog success", [blog]);
      }
    }
  });
};

// ======================= Upload product images =======================
export const blogUploadImages = asyncHandler(async (req: Request, res: Response): Promise<void> => {
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
    const blog: BLOG | null = await getItem(blogModel, {_id: id});
    if(!blog) {
      handleResponseError(res, HttpStatusCode.BADREQUEST, `There's no blog with this ID`);
      return;
    }
    const uploader = (path: string) => cloudinaryUploadImg(path);
    const files: any = req.files;
    if(!files || files.length === 0) {
      handleResponseError(res, HttpStatusCode.BADREQUEST, `There's no file to uploads`);
      return;
    }
    // Uploads all filles in cloudinary and get all path
    const urls: string[] = [];
    for(const file of files) {
      const {path} = file;
      const newPath = await uploader(path);
      urls.push(newPath.url);
      try {
        unlinkSync(path);
      } catch (err: any) {
        console.log("Error Unlink file :", err.message);        
      }
    }
    // Update the user (add all filles urls)
    const updateBlog: BLOG | null = await updateItem(blogModel, {_id: id}, {
      images: urls
    });
    handleResponseSuccess(res, HttpStatusCode.OK, `Files uploads successfuly`, [updateBlog]);
  } catch (err: any) {
    handleResponseError(res, HttpStatusCode.NOTFOUND, err.message);
  }
});