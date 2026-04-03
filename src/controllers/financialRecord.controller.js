import asyncHandler from "../utils/asyncHandler.js";
import financialRecordService from "../services/financialRecord.service.js";

const createRecord = asyncHandler(async (req, res) => {
  const { amount, type, category, description, occurredAt } = req.body;

  const record = await financialRecordService.createRecord({
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
    page,
    limit,
    type,
    category,
    startDate,
    endDate,
    search,
    q,
    sortBy,
    sortOrder,
  } = req.query;

  const result = await financialRecordService.listRecords({
    page,
    limit,
    type,
    category,
    startDate,
    endDate,
    search,
    q,
    sortBy,
    sortOrder,
  });

  res.status(200).json({
    data: result.items,
    meta: result.meta,
  });
});

const getAllRecordsForViewer = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;

  const result = await financialRecordService.listRecords({
    page,
    limit,
  });

  res.status(200).json({
    data: result.items,
    meta: result.meta,
  });
});

const getRecordById = asyncHandler(async (req, res) => {
  const record = await financialRecordService.getRecordById(req.params.id);

  res.status(200).json({ data: record });
});

const updateRecord = asyncHandler(async (req, res) => {
  const updated = await financialRecordService.updateRecordById(
    req.params.id,
    req.body,
  );

  res.status(200).json({
    data: updated,
    message: "Record updated successfully",
  });
});

const deleteRecord = asyncHandler(async (req, res) => {
  await financialRecordService.softDeleteRecordById(req.params.id);

  res.status(200).json({
    message: "Record deleted successfully",
  });
});

const restoreRecord = asyncHandler(async (req, res) => {
  const restored = await financialRecordService.restoreRecordById(
    req.params.id,
  );

  res.status(200).json({
    data: restored,
    message: "Record restored successfully",
  });
});

export default {
  createRecord,
  getAllRecords,
  getAllRecordsForViewer,
  getRecordById,
  updateRecord,
  deleteRecord,
  restoreRecord,
};
