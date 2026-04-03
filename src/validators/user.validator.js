import { z } from "zod";

import { USER_ROLE_VALUES } from "../constants/userRoles.js";
import { USER_STATUS_VALUES } from "../constants/userStatuses.js";
import {
  objectIdSchema,
  optionalTrimmedString,
  queryBoolean,
  queryNumber,
} from "./common.validator.js";

const userIdParamsSchema = z.object({
  userId: objectIdSchema,
});

const userListQuerySchema = z.object({
  page: queryNumber("page", 1, 100000, 1),
  limit: queryNumber("limit", 1, 200, 25),
  status: z.enum(USER_STATUS_VALUES).optional(),
  role: z.enum(USER_ROLE_VALUES).optional(),
  includeDeleted: queryBoolean("includeDeleted").optional(),
});

const createUserBodySchema = z.object({
  email: z
    .string({ required_error: "email is required" })
    .trim()
    .email("email must be a valid email address"),
  password: z
    .string({ required_error: "password is required" })
    .min(8, "password must be at least 8 characters")
    .max(128, "password must be at most 128 characters"),
  firstName: optionalTrimmedString(64),
  lastName: optionalTrimmedString(64),
  timezone: optionalTrimmedString(64),
  role: z.enum(USER_ROLE_VALUES).optional(),
});

const updateUserBodySchema = z
  .object({
    email: z
      .string()
      .trim()
      .email("email must be a valid email address")
      .optional(),
    firstName: optionalTrimmedString(64),
    lastName: optionalTrimmedString(64),
    timezone: optionalTrimmedString(64),
  })
  .strict();

const updateUserRoleBodySchema = z.object({
  role: z.enum(USER_ROLE_VALUES, {
    errorMap: () => ({ message: "role is invalid" }),
  }),
});

const updateUserStatusBodySchema = z.object({
  status: z.enum(USER_STATUS_VALUES, {
    errorMap: () => ({ message: "status is invalid" }),
  }),
});

export {
  userIdParamsSchema,
  userListQuerySchema,
  createUserBodySchema,
  updateUserBodySchema,
  updateUserRoleBodySchema,
  updateUserStatusBodySchema,
};
