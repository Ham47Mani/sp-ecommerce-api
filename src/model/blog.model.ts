import { Schema, model } from "mongoose";
import { BLOG } from "../utils/modale.type";


// Create blog schema
const blogSchema: Schema<BLOG> = new Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  numViews: {
    type: Number,
    default: 0
  },
  likes: [{
    type: Schema.Types.ObjectId,
    ref: "User"
  }],
  dislikes: [{
    type: Schema.Types.ObjectId,
    ref: "User"
  }],
  images: {
    type: [String]
  },
  author: {
    type: String,
    default: "Admin"
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  timestamps: true
});

export default model<BLOG>("Blog", blogSchema);