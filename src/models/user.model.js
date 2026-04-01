import mongoose from "mongoose";

import buildBaseSchema from "./baseModel.js";
import { USER_ROLES, USER_ROLE_VALUES } from "../constants/userRoles.js";
import { USER_STATUS, USER_STATUS_VALUES } from "../constants/userStatuses.js";

const userDefinition = {
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    unique: true,
  },
  passwordHash: {
    type: String,
    required: true,
    select: false,
  },
  refreshTokenHash: {
    type: String,
    default: null,
    select: false,
  },
  refreshTokenExpiresAt: {
    type: Date,
    default: null,
    select: false,
  },
  role: {
    type: String,
    enum: USER_ROLE_VALUES,
    default: USER_ROLES.VIEWER,
    index: true,
  },
  status: {
    type: String,
    enum: USER_STATUS_VALUES,
    default: USER_STATUS.ACTIVE,
    index: true,
  },
  lastLoginAt: {
    type: Date,
    default: null,
  },
  profile: {
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    timezone: { type: String, trim: true },
  },
  metadata: {
    type: Map,
    of: String,
    default: {},
  },
};

const UserSchema = buildBaseSchema(userDefinition, { collection: "users" });

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ role: 1, status: 1, isDeleted: 1 });

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
