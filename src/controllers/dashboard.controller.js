import asyncHandler from "../utils/asyncHandler.js";
import dashboardService from "../services/dashboard.service.js";

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
  const { limit } = req.query;

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
