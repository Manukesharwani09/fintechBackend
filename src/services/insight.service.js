import FinancialRecord from "../models/financialRecord.model.js";
import { RECORD_TYPES } from "../constants/recordTypes.js";

const getIncomeVsExpense = async () => {
  const [totals] = await FinancialRecord.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: null,
        totalIncome: {
          $sum: {
            $cond: [{ $eq: ["$type", RECORD_TYPES.INCOME] }, "$amount", 0],
          },
        },
        totalExpenses: {
          $sum: {
            $cond: [{ $eq: ["$type", RECORD_TYPES.EXPENSE] }, "$amount", 0],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        totalIncome: 1,
        totalExpenses: 1,
      },
    },
  ]);

  const totalIncome = totals?.totalIncome || 0;
  const totalExpenses = totals?.totalExpenses || 0;

  return {
    totalIncome,
    totalExpenses,
    ratio: totalExpenses === 0 ? null : totalIncome / totalExpenses,
  };
};

const getTopSpendingCategories = async (limit = 5) =>
  FinancialRecord.aggregate([
    { $match: { isDeleted: false, type: RECORD_TYPES.EXPENSE } },
    {
      $group: {
        _id: "$category",
        totalSpent: { $sum: "$amount" },
        transactionCount: { $sum: 1 },
      },
    },
    { $sort: { totalSpent: -1 } },
    { $limit: limit },
    {
      $project: {
        _id: 0,
        category: "$_id",
        totalSpent: 1,
        transactionCount: 1,
      },
    },
  ]);

const getDateRangeSummary = async (startDate, endDate) => {
  const match = { isDeleted: false };

  if (startDate || endDate) {
    match.occurredAt = {};
    if (startDate) {
      match.occurredAt.$gte = new Date(startDate);
    }
    if (endDate) {
      match.occurredAt.$lte = new Date(endDate);
    }
  }

  const [result] = await FinancialRecord.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalIncome: {
          $sum: {
            $cond: [{ $eq: ["$type", RECORD_TYPES.INCOME] }, "$amount", 0],
          },
        },
        totalExpenses: {
          $sum: {
            $cond: [{ $eq: ["$type", RECORD_TYPES.EXPENSE] }, "$amount", 0],
          },
        },
      },
    },
  ]);

  const totalIncome = result?.totalIncome || 0;
  const totalExpenses = result?.totalExpenses || 0;

  return {
    range: {
      startDate: startDate || null,
      endDate: endDate || null,
    },
    totalIncome,
    totalExpenses,
    netBalance: totalIncome - totalExpenses,
  };
};

const getSavingsTrend = async (months = 12) => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);

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
        },
        income: {
          $sum: {
            $cond: [{ $eq: ["$type", RECORD_TYPES.INCOME] }, "$amount", 0],
          },
        },
        expenses: {
          $sum: {
            $cond: [{ $eq: ["$type", RECORD_TYPES.EXPENSE] }, "$amount", 0],
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
        netSavings: { $subtract: ["$income", "$expenses"] },
      },
    },
  ]);
};

const getCashFlowTrend = async (months = 12) => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);

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
        },
        income: {
          $sum: {
            $cond: [{ $eq: ["$type", RECORD_TYPES.INCOME] }, "$amount", 0],
          },
        },
        expenses: {
          $sum: {
            $cond: [{ $eq: ["$type", RECORD_TYPES.EXPENSE] }, "$amount", 0],
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
      },
    },
  ]);
};

const getCategoryBreakdown = async () =>
  FinancialRecord.aggregate([
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

const getMonthlyTrends = async (months = 12) => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);

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
            $cond: [{ $eq: ["$_id.type", RECORD_TYPES.EXPENSE] }, "$total", 0],
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
};

const getRecentActivity = async (limit = 10) =>
  FinancialRecord.find({ isDeleted: false })
    .sort({ occurredAt: -1, createdAt: -1 })
    .limit(limit)
    .lean();

export default {
  getIncomeVsExpense,
  getTopSpendingCategories,
  getDateRangeSummary,
  getSavingsTrend,
  getCashFlowTrend,
  getCategoryBreakdown,
  getMonthlyTrends,
  getRecentActivity,
};
