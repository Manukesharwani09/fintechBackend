import BaseService from "./base.service.js";
import FinancialRecord from "../models/financialRecord.model.js";

const buildError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const normalizeCategory = (category) =>
  typeof category === "string" ? category.trim().toLowerCase() : category;

class FinancialRecordService extends BaseService {
  constructor() {
    super(FinancialRecord);
  }

  async createRecord(payload) {
    return this.create({
      amount: payload.amount,
      type: payload.type,
      category: normalizeCategory(payload.category),
      description: payload.description,
      occurredAt: payload.occurredAt,
    });
  }

  async listRecords(params = {}) {
    const { page = 1, limit = 10, type, category, startDate, endDate } = params;

    const filter = {};

    if (type) {
      filter.type = type;
    }

    if (category) {
      filter.category = normalizeCategory(category);
    }

    if (startDate || endDate) {
      filter.occurredAt = {};
      if (startDate) {
        filter.occurredAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.occurredAt.$lte = new Date(endDate);
      }
    }

    return this.paginate(filter, {
      page,
      limit,
      sort: { occurredAt: -1, createdAt: -1 },
    });
  }

  async getRecordById(recordId) {
    const record = await this.findOne({ _id: recordId });
    if (!record) {
      throw buildError("Record not found", 404);
    }
    return record;
  }

  async updateRecordById(recordId, payload) {
    const updates = {};

    if (payload.amount !== undefined) {
      updates.amount = payload.amount;
    }
    if (payload.type !== undefined) {
      updates.type = payload.type;
    }
    if (payload.category !== undefined) {
      updates.category = normalizeCategory(payload.category);
    }
    if (payload.description !== undefined) {
      updates.description = payload.description;
    }
    if (payload.occurredAt !== undefined) {
      updates.occurredAt = payload.occurredAt;
    }

    if (!Object.keys(updates).length) {
      throw buildError("No fields provided for update", 400);
    }

    const record = await this.model.findOneAndUpdate(
      { _id: recordId, isDeleted: false },
      { $set: updates },
      { new: true, runValidators: true },
    );

    if (!record) {
      throw buildError("Record not found", 404);
    }

    return record;
  }

  async softDeleteRecordById(recordId) {
    const result = await this.model.findOneAndUpdate(
      { _id: recordId, isDeleted: false },
      { $set: { isDeleted: true, deletedAt: new Date() } },
      { new: true },
    );

    if (!result) {
      throw buildError("Record not found", 404);
    }

    return result;
  }

  async restoreRecordById(recordId) {
    const result = await this.model.findOneAndUpdate(
      { _id: recordId, isDeleted: true },
      { $set: { isDeleted: false, deletedAt: null } },
      { new: true, includeDeleted: true },
    );

    if (!result) {
      throw buildError("Record not found", 404);
    }

    return result;
  }
}

const financialRecordService = new FinancialRecordService();

export default financialRecordService;
