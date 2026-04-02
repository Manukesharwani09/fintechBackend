import asyncHandler from "../utils/asyncHandler.js";
import financialRecordService from "../services/financialRecord.service.js";
import { RECORD_TYPE_VALUES } from "../constants/recordTypes.js";
import mongoose from "mongoose";

const badRequest = (message) => {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
};

const isValidDate = (value) => !Number.isNaN(new Date(value).getTime());
const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const createRecord = asyncHandler(async (req, res) => {
  const { amount, type, category, description, occurredAt } = req.body;

  if (typeof amount !== "number" || amount <= 0) {
    throw badRequest("amount must be a number greater than 0");
  }

  if (!RECORD_TYPE_VALUES.includes(type)) {
    throw badRequest("type must be one of: income, expense");
  }

  if (typeof category !== "string" || !category.trim()) {
    throw badRequest("category is required");
  }

  if (occurredAt !== undefined && !isValidDate(occurredAt)) {
    throw badRequest("occurredAt must be a valid date");
  }

  const record = await financialRecordService.createForUser(req.user.id, {
    amount,
    type,
    category,
    description,
    occurredAt,
  });

  res.status(201).json({
    data: record,
    message: "Record created successfully",
  });
});

const getAllRecords = asyncHandler(async (req, res) => {
  const {
    page = "1",
    limit = "10",
    type,
    category,
    startDate,
    endDate,
  } = req.query;

  if (Number.isNaN(Number(page)) || Number(page) < 1) {
    throw badRequest("page must be a number greater than or equal to 1");
  }

  if (Number.isNaN(Number(limit)) || Number(limit) < 1) {
    throw badRequest("limit must be a number greater than or equal to 1");
  }

  if (type && !RECORD_TYPE_VALUES.includes(type)) {
    throw badRequest("type must be one of: income, expense");
  }

  if (startDate && !isValidDate(startDate)) {
    throw badRequest("startDate must be a valid date");
  }

  if (endDate && !isValidDate(endDate)) {
    throw badRequest("endDate must be a valid date");
  }

  const result = await financialRecordService.listByUser(req.user.id, {
    page: Number(page),
    limit: Number(limit),
    type,
    category,
    startDate,
    endDate,
  });

  res.status(200).json({
    data: result.items,
    meta: result.meta,
  });
});

const getRecordById = asyncHandler(async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    throw badRequest("Invalid record id");
  }

  const record = await financialRecordService.getByIdForUser(
    req.params.id,
    req.user.id,
  );

  res.status(200).json({ data: record });
});

const updateRecord = asyncHandler(async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    throw badRequest("Invalid record id");
  }

  const allowedFields = [
    "amount",
    "category",
    "type",
    "description",
    "occurredAt",
  ];
  const payload = {};

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      payload[field] = req.body[field];
    }
  });

  if (
    payload.amount !== undefined &&
    (typeof payload.amount !== "number" || payload.amount <= 0)
  ) {
    throw badRequest("amount must be a number greater than 0");
  }

  if (
    payload.type !== undefined &&
    !RECORD_TYPE_VALUES.includes(payload.type)
  ) {
    throw badRequest("type must be one of: income, expense");
  }

  if (
    payload.category !== undefined &&
    (typeof payload.category !== "string" || !payload.category.trim())
  ) {
    throw badRequest("category must be a non-empty string");
  }

  if (payload.occurredAt !== undefined && !isValidDate(payload.occurredAt)) {
    throw badRequest("occurredAt must be a valid date");
  }

  const updated = await financialRecordService.updateByIdForUser(
    req.params.id,
    req.user.id,
    payload,
  );

  res.status(200).json({
    data: updated,
    message: "Record updated successfully",
  });
});

const deleteRecord = asyncHandler(async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    throw badRequest("Invalid record id");
  }

  await financialRecordService.softDeleteByIdForUser(
    req.params.id,
    req.user.id,
  );

  res.status(200).json({
    message: "Record deleted successfully",
  });
});

const restoreRecord = asyncHandler(async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    throw badRequest("Invalid record id");
  }

  const restored = await financialRecordService.restoreByIdForUser(
    req.params.id,
    req.user.id,
  );

  res.status(200).json({
    data: restored,
    message: "Record restored successfully",
  });
});

export default {
  createRecord,
  getAllRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
  restoreRecord,
};
