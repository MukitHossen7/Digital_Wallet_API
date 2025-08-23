import { model, Schema } from "mongoose";
import { IAuthsProviders, IsActive, IUser, Role } from "./user.interface";

const authsSchema = new Schema<IAuthsProviders>(
  {
    provider: {
      type: String,
      required: true,
    },
    providerID: {
      type: String,
      required: true,
    },
  },
  {
    versionKey: false,
    _id: false,
  }
);

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "name is required"],
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    picture: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: String,
      enum: Object.values(IsActive),
      default: IsActive.ACTIVE,
    },
    role: {
      type: String,
      enum: Object.values(Role),
      default: Role.USER,
    },
    commissionRate: {
      type: Number,
    },
    auths: [authsSchema],
  },
  { versionKey: false, timestamps: true }
);

export const User = model<IUser>("User", userSchema);
