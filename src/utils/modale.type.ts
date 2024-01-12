import { Document, Types } from "mongoose";
import { ORDERSTATUS, OrderProduct, ROLE } from "./costume.type";

// ---------------- User Modal Type ----------------
export interface USER extends Document {
  firstName: string,
  lastName: string,
  mobile: string,
  email: string,
  password: string,
  role: ROLE,
  isBlocked: boolean,
  cart: any[],
  address: string,
  wishList: Types.ObjectId[],
  refreshToken: string,
  passwordChangedAt: Date,
  passwordResetExpires: Date | null,
  passwordResetToken: string | null,

  // Add the "isPasswordMatched" to the interface
  isPasswordMatched(enteredPassword: string): Promise<boolean>; 
  // Add the "createPasswordToken" to the interface
  createPasswordToken(): Promise<string>;
};

// ---------------- Product Modal Type ----------------
export interface PRODUCT extends Document {
  title: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  brand: 'Apple' | 'Samsung' | 'Lenovo';
  quantity: number;
  sold: number;
  images: string[];
  color: Types.ObjectId[];
  tags: string[];
  ratings: {
    star: number,
    comment: string,
    postBy: string
  }[];
  totalRating: string;
  createdAt: Date;
  updatedAt: Date;
};

// ---------------- Blog Modal Type ----------------
export interface BLOG extends Document {
  title: string;
  description: string;
  category: string;
  numViews?: number;
  likes?: Array<string>;
  dislikes?: Array<string>;
  images?: string[];
  author?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

// ---------------- Product Category Modal Type ----------------
export interface PRODCATEGORY extends Document {
  title: string
};

// ---------------- Blog Category Modal Type ----------------
export interface BLOGCATEGORY extends Document {
  title: string
};

// ---------------- Brand Modal Type ----------------
export interface BRAND extends Document {
  title: string
};

// ---------------- Brand Modal Type ----------------
export interface COUPON extends Document {
  name: string;
  expiry: Date;
  discount: number
};

// ---------------- Order Modal Type ----------------
export interface ORDER extends Document {
  products: OrderProduct[];
  paymentIntent?: any;
  orderStatus?: ORDERSTATUS;
  orderBy: Types.ObjectId;
};

// ---------------- Cart Modal Type ----------------
export interface CART extends Document, ORDER {
  cartTotal: number,
  totalAfterDiscount: number
};

// ---------------- Color Modal Type ----------------
export interface COLOR extends Document {
  title: string
};

// ---------------- ENQ Modal Type ----------------
export interface ENQUIRY extends Document {
  name: string,
  email: string,
  mobile: string,
  comment: string,
  status: string
};

