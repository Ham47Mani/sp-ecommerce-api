import express, { Express } from "express";
import dotenv from "dotenv";
import { dbConnect } from "./config/dbConnect";
import authRouter from "./routes/auth.route";
import { errorHandler, notFound } from "./middleware/erroHandling";
import cookieParser from "cookie-parser";
import productRoute from "./routes/product.route";
import morgan from "morgan";
import rfs from "rotating-file-stream";
import fs from "fs";
import path from "path";
import blogRouter from './routes/blog.route';
import couponRouter from "./routes/coupon.route";
import enqRouter from "./routes/enq.route";

// Use dotenv package to use envirenment variable
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;// Get PRT from .env file

// Middleware
app.use(express.urlencoded({extended: false}));// Middleware for extract body of request
app.use(express.json());// Middleware for json
app.use(cookieParser());// Middleware for cookies

// Log middleware
const createAccessLogStream = () => {// Function to create a rotating stream for logs
  const logDirectory = path.join(__dirname, 'log');
  // Ensure 'log' directory exists
  fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);
  return fs.createWriteStream(path.join(logDirectory, "access.log"));
};
app.use(morgan('combined', { stream: createAccessLogStream() }));

// Connect to database
dbConnect();

// Routes
app.use("/api/users", authRouter);
app.use("/api/products", productRoute);
app.use("/api/blogs", blogRouter);
app.use("/api/coupons", couponRouter);
app.use("/api/enquiry", enqRouter);

// Error Middleware
app.use(notFound);
app.use(errorHandler);

// Start listening
app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));
