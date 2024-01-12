import { Schema, model } from "mongoose";
import { PRODCATEGORY } from "../utils/modale.type";


// Category blog schema
const prodCaterogySchema: Schema<PRODCATEGORY> = new Schema({
  title: {
    type: String,
    required: true,
    unique: true,
    index: true
  }
}, { timestamps: true });

export default model<PRODCATEGORY>("prodCategory", prodCaterogySchema);