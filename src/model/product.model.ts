import { Schema, Types, model } from "mongoose";
import { PRODUCT } from "../utils/modale.type";

// Create product schema
const productSchema: Schema<PRODUCT> = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  brand: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true
  },
  sold: {
    type: Number,
    default: 0
  },
  images: {
    type: [String]
  },
  color: [{
    type: Types.ObjectId,
    ref: "Color",
    required: true
  }],
  tags: [{
    type: String,
    required: true
  }],
  ratings: [{
    star: Number,
    comment: { type: String },
    postBy: { type: Schema.Types.ObjectId, ref: "User"},
  }],
  totalRating: {
    type: String,
    default: "0"
  }
}, {
  timestamps: true
});

export default model<PRODUCT>("Product", productSchema);