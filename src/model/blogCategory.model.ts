import { Schema, model } from "mongoose";
import { BLOGCATEGORY } from "../utils/modale.type";


// Category blog schema
const prodCaterogySchema: Schema<BLOGCATEGORY> = new Schema({
  title: {
    type: String,
    required: true,
    unique: true,
    index: true
  }
}, { timestamps: true });

export default model<BLOGCATEGORY>("blogCategory", prodCaterogySchema);