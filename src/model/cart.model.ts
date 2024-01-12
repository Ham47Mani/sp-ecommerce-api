import { Schema, model } from "mongoose";
import { CART } from '../utils/modale.type';


// Create blog schema
const cartSchema: Schema<CART> = new Schema({
  products: [{
    productID: { type: Schema.Types.ObjectId, ref: "Product", required: true},
    count: { type: Number, required: true},
    color: { type: String},
    price: { type: Number, required: true}
  }],
  cartTotal: { type: Number, required: true},
  totalAfterDiscount: { type: Number},
  orderBy: { type: Schema.Types.ObjectId, ref: "User", required: true}
}, {
  timestamps: true
});

export default model<CART>("Cart", cartSchema);