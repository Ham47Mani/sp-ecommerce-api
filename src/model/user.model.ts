import { CallbackWithoutResultAndOptionalError, Schema, model } from "mongoose";
import { USER } from "../utils/modale.type";
import { hashPassword, isMatchedPassword } from "../utils/bcrypt.util";
import { createHash, randomBytes } from "crypto";

// Create user schema
const userSchema: Schema<USER> = new Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    mobile: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "user"
    },
    isBlocked: {
      type: Boolean,
      default: false
    },
    cart: {
      type: [{ type: Schema.Types.Mixed }],
      default: [],
    },
    address: {
      type: String,
    },
    wishList: [{
      type: Schema.Types.ObjectId,
      ref: "Product"
    }],
    refreshToken: {
      type: String
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date
  }, {
    timestamps: true// Add timestamps option to automatically generate createdAt and updatedAt fields
  }
);

// Crypt the password before save it
userSchema.pre("save", async function (next: CallbackWithoutResultAndOptionalError) {
  if(!this.isModified('password')) {
    next();
  }
  const hashedPassword = await hashPassword(this.password);
  this.password = hashedPassword;
});

// Check match password
userSchema.methods.isPasswordMatched = async function (entrePassword: string) : Promise<boolean> {
  return isMatchedPassword(entrePassword, this.password);
};

// Create password reset token
userSchema.methods.createPasswordToken = async function(): Promise<string> {
  const resetToken = randomBytes(32).toString("hex");
  this.passwordResetToken = createHash("sha256").update(resetToken).digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;// 10 minutes
  return resetToken;
};

export default model<USER>("User", userSchema);