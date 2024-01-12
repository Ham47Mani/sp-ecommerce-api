import { Schema, model } from "mongoose";
import { COUPON } from "../utils/modale.type";

const couponSchema: Schema<COUPON> = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  expiry: {
    type: Date,
    required: true,
  },
  discount: {
    type: Number,
    required: true
  }
});

export default model<COUPON>("Coupon", couponSchema);