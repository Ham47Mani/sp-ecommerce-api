import { Schema, model } from "mongoose";
import { ORDER } from '../utils/modale.type';
import { ORDERSTATUS } from "../utils/costume.type";


// Create blog schema
const orderSchema: Schema<ORDER> = new Schema({
  products: [{
    productID: { type: Schema.Types.ObjectId, ref: "Product", required: true},
    count: { type: Number, required: true},
    color: { type: String}
  }],
  paymentIntent: {},
  orderStatus: {
    type: String,
    defaut: ORDERSTATUS.NotProcessed,
    enum: Object.values(ORDERSTATUS)
  },
  orderBy: { type: Schema.Types.ObjectId, ref: "User", required: true}
}, {
  timestamps: true
});

export default model<ORDER>("Order", orderSchema);