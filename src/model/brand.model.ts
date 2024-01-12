import { Schema, model } from "mongoose";
import { BRAND } from "../utils/modale.type";


// Category blog schema
const brandSchema: Schema<BRAND> = new Schema({
  title: {
    type: String,
    required: true,
    unique: true,
    index: true
  }
}, { timestamps: true });

export default model<BRAND>("Brand", brandSchema);