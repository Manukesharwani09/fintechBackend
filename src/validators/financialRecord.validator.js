import { z } from "zod";

import { RECORD_TYPE_VALUES } from "../constants/recordTypes.js";
import {
  objectIdSchema,
  queryNumber,
  optionalDateString,
} from "./common.validator.js";

const recordIdParamsSchema = z.object({
  id: objectIdSchema,
});

const createRecordBodySchema = z.object({
  amount: z
    .number({ invalid_type_error: "amount must be a number" })
    .gt(0, "amount must be a number greater than 0"),
  type: z.enum(RECORD_TYPE_VALUES, {
    errorMap: () => ({ message: "type must be one of: income, expense" }),
  }),
  category: z
    .string({ required_error: "category is required" })
    .trim()
    .min(1, "category is required"),
  description: z.string().trim().max(500).optional(),
  occurredAt: optionalDateString("occurredAt"),
});

const updateRecordBodySchema = z
  .object({
    amount: z
      .number({ invalid_type_error: "amount must be a number" })
      .gt(0, "amount must be a number greater than 0")
      .optional(),
    type: z
      .enum(RECORD_TYPE_VALUES, {
        errorMap: () => ({ message: "type must be one of: income, expense" }),
      })
      .optional(),
    category: z
      .string()
      .trim()
      .min(1, "category must be a non-empty string")
      .optional(),
    description: z.string().trim().max(500).optional(),
    occurredAt: optionalDateString("occurredAt"),
  })
  .strict();

const listRecordsQuerySchema = z.object({
  page: queryNumber("page", 1, 100000, 1),
  limit: queryNumber("limit", 1, 200, 10),
  type: z.enum(RECORD_TYPE_VALUES).optional(),
  category: z
    .string()
    .trim()
    .min(1, "category must be a non-empty string")
    .optional(),
  startDate: optionalDateString("startDate"),
  endDate: optionalDateString("endDate"),
});

const viewerListRecordsQuerySchema = z
  .object({
    page: queryNumber("page", 1, 100000, 1),
    limit: queryNumber("limit", 1, 200, 10),
  })
  .strict();

export {
  recordIdParamsSchema,
  createRecordBodySchema,
  updateRecordBodySchema,
  listRecordsQuerySchema,
  viewerListRecordsQuerySchema,
};
