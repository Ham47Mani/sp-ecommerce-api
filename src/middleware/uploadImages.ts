import { NextFunction, Request, Response } from "express";
import multer, { StorageEngine } from "multer";
import path from "path";
import fs, { unlinkSync } from "fs";
import sharp from "sharp";

// Storage configuration
const multerStorage: StorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../public/images"));// Specify the destination folder
  },
  filename: (req, file, cb) => {
    const uniqueSuffix: string = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;    
    const originalname = file.originalname.split('.')[0]; // Extracting filename without extension
    cb(null, `${originalname}-${uniqueSuffix}.jpeg`);
  }
});

// File filter
const multerFilter = (req: any, file: Express.Multer.File, cb: any) => {
  if(file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb({message: "Unsupported file format"}, false);
  }
};

// Configure multer
export const uploadPhoto = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: { fieldSize: 1000000 }
});

// Create a middleware to resize and save products images
export const productImgResize = async(req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const files = req.files;
    
    // Check if there's no files
    if (!files || (Array.isArray(files) && !files.length)) {
      return next(); // No files uploaded, skip resizing
    }
    // Check if there's more then one file and convert it to array
    let images: Express.Multer.File[] = [];
    
    if (Array.isArray(files)) {
      images = files;
    } else if (files['images']) {
      images = Array.isArray(files['images']) ? files['images'] : [files['images']];
    }
    const validImages = images.filter(file => file); // Filter out undefined/null files
    if (!validImages.length) {
      return next(); // No valid images, skip resizing
    }

    // Ensure the directory exists
    const directory = 'public/images/products/';
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }

    await Promise.all(images.map(async (file) => {
      await sharp(file.path)
        .resize(300, 300)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/images/products/${file.filename}`);
        unlinkSync(`public/images/products/${file.filename}`);
    }));
    next();
  } catch (err) {
    console.log("Errrrrror : ", err);
    // Handle errors here
    next(err);
  }
};

// Create a middleware to resize and save products images
export const blogImgResize = async(req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const files = req.files;
    // Check if there's no files
    if (!files || (Array.isArray(files) && !files.length)) {
      return next(); // No files uploaded, skip resizing
    }
    // Check if there's more then one file and convert it to array
    let images: Express.Multer.File[] = [];
    if (Array.isArray(files)) {
      images = files;
    } else if (files['images']) {
      images = Array.isArray(files['images']) ? files['images'] : [files['images']];
    }
    const validImages = images.filter(file => file); // Filter out undefined/null files
    if (!validImages.length) {
      return next(); // No valid images, skip resizing
    }

    // Ensure the directory exists
    const directory = 'public/images/blogs/';
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }

    await Promise.all(images.map(async (file) => {
      await sharp(file.path)
        .resize(300, 300)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/images/blogs/${file.filename}`);
        unlinkSync(`public/images/blogs/${file.filename}`);
    }));
    next();
  } catch (err) {
    // Handle errors here
    next(err);
  }
};