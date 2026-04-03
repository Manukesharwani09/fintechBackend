import asyncHandler from "../utils/asyncHandler.js";
import dashboardService from "../services/dashboard.service.js";

const badRequest = (message) => {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
};

const totalIncome = asyncHandler(async (_req, res) => {
  const total = await dashboardService.getTotalIncome();
  res.status(200).json({ data: { totalIncome: total } });
});

const totalExpenses = asyncHandler(async (_req, res) => {
  const total = await dashboardService.getTotalExpenses();
  res.status(200).json({ data: { totalExpenses: total } });
});

const netBalance = asyncHandler(async (_req, res) => {
  const summary = await dashboardService.getNetBalance();
  res.status(200).json({ data: summary });
});

const categoryBreakdown = asyncHandler(async (_req, res) => {
  const data = await dashboardService.getCategoryBreakdown();
  res.status(200).json({ data });
});

const monthlyTrends = asyncHandler(async (_req, res) => {
  const data = await dashboardService.getMonthlyTrends();
  res.status(200).json({ data });
});

const recentActivity = asyncHandler(async (req, res) => {
  const limit = req.query.limit ? Number(req.query.limit) : 10;

  if (Number.isNaN(limit) || limit < 1 || limit > 100) {
    throw badRequest("limit must be a number between 1 and 100");
  }

  const data = await dashboardService.getRecentActivity(limit);
  res.status(200).json({ data });
});

export default {
  totalIncome,
  totalExpenses,
  netBalance,
  categoryBreakdown,
  monthlyTrends,
  recentActivity,
};
