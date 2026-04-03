import asyncHandler from "../utils/asyncHandler.js";
import insightService from "../services/insight.service.js";

const badRequest = (message) => {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
};

const parseMonths = (value, fallback = 12) => {
  const months = value === undefined ? fallback : Number(value);
  if (Number.isNaN(months) || months < 1 || months > 24) {
    throw badRequest("months must be a number between 1 and 24");
  }
  return months;
};

const incomeVsExpense = asyncHandler(async (_req, res) => {
  const data = await insightService.getIncomeVsExpense();
  res.status(200).json({ data });
});

const topSpendingCategories = asyncHandler(async (req, res) => {
  const limit = req.query.limit === undefined ? 5 : Number(req.query.limit);
  if (Number.isNaN(limit) || limit < 1 || limit > 20) {
    throw badRequest("limit must be a number between 1 and 20");
  }

  const data = await insightService.getTopSpendingCategories(limit);
  res.status(200).json({ data });
});

const dateRangeSummary = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  if (startDate && Number.isNaN(new Date(startDate).getTime())) {
    throw badRequest("startDate must be a valid date");
  }
  if (endDate && Number.isNaN(new Date(endDate).getTime())) {
    throw badRequest("endDate must be a valid date");
  }

  const data = await insightService.getDateRangeSummary(startDate, endDate);
  res.status(200).json({ data });
});

const savingsTrend = asyncHandler(async (req, res) => {
  const months = parseMonths(req.query.months, 12);
  const data = await insightService.getSavingsTrend(months);
  res.status(200).json({ data });
});

const cashFlowTrend = asyncHandler(async (req, res) => {
  const months = parseMonths(req.query.months, 12);
  const data = await insightService.getCashFlowTrend(months);
  res.status(200).json({ data });
});

const categoryBreakdown = asyncHandler(async (_req, res) => {
  const data = await insightService.getCategoryBreakdown();
  res.status(200).json({ data });
});

const monthlyTrends = asyncHandler(async (req, res) => {
  const months = parseMonths(req.query.months, 12);
  const data = await insightService.getMonthlyTrends(months);
  res.status(200).json({ data });
});

export default {
  incomeVsExpense,
  topSpendingCategories,
  dateRangeSummary,
  savingsTrend,
  cashFlowTrend,
  categoryBreakdown,
  monthlyTrends,
};
