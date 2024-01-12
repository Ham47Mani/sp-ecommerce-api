import dotenv from 'dotenv';
import { UploadApiErrorResponse, UploadApiResponse, v2 as cloudinary } from 'cloudinary';

interface CloudinaryResult {
  url: string;
  path: string;
}

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const cloudinaryUploadImg = async (fileToUpload: string, type: "image" | "video" | "raw" | "auto" = "image"): Promise<any> => {
  return new Promise((resolve, reject) => {
    try {
      cloudinary.uploader.upload(fileToUpload, { resource_type: type }, (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
        if (error || !result) {
          reject(error || new Error('No result received from Cloudinary.'));
        } else {
          resolve({
            url: result.url,
            asset_id: result.asset_id,
            public_id: result.public_id
          });
        }
      });
    } catch (err: any) {
      reject(err);
    }
  });
};

export const cloudinaryDeleteImg = async (fileToDelete: string, type: "image" | "video" | "raw" | "auto" = "image"): Promise<any> => {
  return new Promise((resolve, reject) => {
    try {
      cloudinary.uploader.destroy(fileToDelete, { resource_type: type }, (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
        if (error || !result) {
          reject(error || new Error('No result received from Cloudinary.'));
        } else {
          resolve({
            url: result.url,
            asset_id: result.asset_id,
            public_id: result.public_id
          });
        }
      });
    } catch (err: any) {
      reject(err);
    }
  });
};