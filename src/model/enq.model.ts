import { Schema, model } from "mongoose";
import { ENQUIRY } from "../utils/modale.type";
import { ENQSTATUS } from "../utils/costume.type";


// Category blog schema
const enqSchema: Schema<ENQUIRY> = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
    required: true
  },
  comment: String,
  status: {
    type: String,
    defaut: ENQSTATUS.Submitted,
    enum: Object.values(ENQSTATUS)
  }
}, { timestamps: true });

export default model<ENQUIRY>("Enquiry", enqSchema);