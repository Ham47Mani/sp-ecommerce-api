import { Request } from "express";
import { USER } from "./modale.type";
import { Types } from "mongoose";

// ---------------- CustomRequest ----------------
export interface CustomRequest extends Request {
  user?: USER; // Modify 'any' to match your user type if possible
  role?: ROLE
}

// ---------------- Role type ----------------
export type ROLE = "user" | "admin";

// ---------------- Email Data type ----------------
export interface EMAILDATA {
  to: string; // List of receivers
  subject: string; // Subject line
  text: string; // Plain text body
  html?: string; // HTML body (optional)
}

// ---------------- Define ORDER interface ----------------
export interface OrderProduct {
  productID: Types.ObjectId;
  count: number;
  color?: string;
  price?: number
}

// ---------------- Order Status Type ----------------
export enum ORDERSTATUS {
  NotProcessed = "Not Processed",
  CashOnDelivery = "Cash on Delivery",
  Processing = "Processing",
  Dispatched = "Dispatched",
  Cancelled = "Cancelled",
  Delivered = "Delivered",
}

// ---------------- Order Status Type ----------------
export enum ENQSTATUS {
  Submitted = "Submitted",
  Contacted = "Contacted",
  In_Progress = "In Progress"
}