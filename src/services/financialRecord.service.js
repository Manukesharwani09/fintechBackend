import BaseService from "./base.service.js";
import FinancialRecord from "../models/financialRecord.model.js";

class FinancialRecordService extends BaseService {
  constructor() {
    super(FinancialRecord);
  }

  listByUser(userId, params = {}) {
    const { page = 1, limit = 25, type, category, startDate, endDate } = params;

    const filter = { user: userId };

    if (type) {
      filter.type = type;
    }

    if (category) {
      filter.category = category;
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
}

const financialRecordService = new FinancialRecordService();

export default financialRecordService;
