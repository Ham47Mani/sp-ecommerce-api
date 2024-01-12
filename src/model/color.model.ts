import { Schema, model } from "mongoose";
import { BRAND, COLOR } from "../utils/modale.type";


// Category blog schema
const colorSchema: Schema<COLOR> = new Schema({
  title: {
    type: String,
    required: true,
    unique: true,
    index: true
  }
}, { timestamps: true });

export default model<COLOR>("Color", colorSchema);