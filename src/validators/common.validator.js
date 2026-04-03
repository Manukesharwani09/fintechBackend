import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const objectIdSchema = z
  .string({ required_error: "id is required" })
  .regex(objectIdRegex, "Invalid id format");

const optionalTrimmedString = (max = 255) =>
  z
    .string()
    .trim()
    .min(1, "Must not be empty")
    .max(max, `Must be at most ${max} characters`)
    .optional();

const queryNumber = (field, min, max, fallback) =>
  z.coerce
    .number({ invalid_type_error: `${field} must be a number` })
    .int(`${field} must be an integer`)
    .min(min, `${field} must be greater than or equal to ${min}`)
    .max(max, `${field} must be less than or equal to ${max}`)
    .default(fallback);

const queryBoolean = (field) =>
  z.preprocess(
    (value) => {
      if (typeof value === "boolean") {
        return value;
      }

      if (typeof value === "string") {
        const normalized = value.trim().toLowerCase();
        if (normalized === "true") {
          return true;
        }
        if (normalized === "false") {
          return false;
        }
      }

      return value;
    },
    z.boolean({ invalid_type_error: `${field} must be true or false` }),
  );

const optionalDateString = (field) =>
  z
    .string()
    .refine((value) => !Number.isNaN(new Date(value).getTime()), {
      message: `${field} must be a valid date`,
    })
    .optional();

export {
  objectIdSchema,
  optionalTrimmedString,
  queryNumber,
  queryBoolean,
  optionalDateString,
};
