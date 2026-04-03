import FinancialRecord from "../models/financialRecord.model.js";
import { RECORD_TYPES } from "../constants/recordTypes.js";

class DashboardService {
  async getTotalByType(type) {
    const [result] = await FinancialRecord.aggregate([
      { $match: { isDeleted: false, type } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    return result?.total || 0;
  }

  async getTotalIncome() {
    return this.getTotalByType(RECORD_TYPES.INCOME);
  }

  async getTotalExpenses() {
    return this.getTotalByType(RECORD_TYPES.EXPENSE);
  }

  async getNetBalance() {
    const [income, expenses] = await Promise.all([
      this.getTotalIncome(),
      this.getTotalExpenses(),
    ]);

    return {
      totalIncome: income,
      totalExpenses: expenses,
      netBalance: income - expenses,
    };
  }

  async getCategoryBreakdown() {
    return FinancialRecord.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: {
            type: "$type",
            category: "$category",
          },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.type": 1, total: -1 } },
      {
        $group: {
          _id: "$_id.type",
          categories: {
            $push: {
              category: "$_id.category",
              total: "$total",
              count: "$count",
            },
          },
          typeTotal: { $sum: "$total" },
        },
      },
      {
        $project: {
          _id: 0,
          type: "$_id",
          typeTotal: 1,
          categories: 1,
        },
      },
    ]);
  }

  async getMonthlyTrends() {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    return FinancialRecord.aggregate([
      {
        $match: {
          isDeleted: false,
          occurredAt: { $gte: start },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$occurredAt" },
            month: { $month: "$occurredAt" },
            type: "$type",
          },
          total: { $sum: "$amount" },
        },
      },
      {
        $group: {
          _id: { year: "$_id.year", month: "$_id.month" },
          income: {
            $sum: {
              $cond: [{ $eq: ["$_id.type", RECORD_TYPES.INCOME] }, "$total", 0],
            },
          },
          expenses: {
            $sum: {
              $cond: [
                { $eq: ["$_id.type", RECORD_TYPES.EXPENSE] },
                "$total",
                0,
              ],
            },
          },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          income: 1,
          expenses: 1,
          net: { $subtract: ["$income", "$expenses"] },
        },
      },
    ]);
  }

  async getRecentActivity(limit = 10) {
    return FinancialRecord.find({ isDeleted: false })
      .sort({ occurredAt: -1, createdAt: -1 })
      .limit(limit)
      .lean();
  }
}

const dashboardService = new DashboardService();

export default dashboardService;
