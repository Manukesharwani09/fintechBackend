import asyncHandler from "../utils/asyncHandler.js";
import insightService from "../services/insight.service.js";

const incomeVsExpense = asyncHandler(async (_req, res) => {
  const data = await insightService.getIncomeVsExpense();
  res.status(200).json({ data });
});

const topSpendingCategories = asyncHandler(async (req, res) => {
  const { limit } = req.query;

  const data = await insightService.getTopSpendingCategories(limit);
  res.status(200).json({ data });
});

const dateRangeSummary = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const data = await insightService.getDateRangeSummary(startDate, endDate);
  res.status(200).json({ data });
});

const savingsTrend = asyncHandler(async (req, res) => {
  const { months } = req.query;
  const data = await insightService.getSavingsTrend(months);
  res.status(200).json({ data });
});

const cashFlowTrend = asyncHandler(async (req, res) => {
  const { months } = req.query;
  const data = await insightService.getCashFlowTrend(months);
  res.status(200).json({ data });
});

const categoryBreakdown = asyncHandler(async (_req, res) => {
  const data = await insightService.getCategoryBreakdown();
  res.status(200).json({ data });
});

const monthlyTrends = asyncHandler(async (req, res) => {
  const { months } = req.query;
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
