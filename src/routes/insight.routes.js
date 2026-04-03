import { Router } from "express";

import insightController from "../controllers/insight.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/rbac.middleware.js";
import { RBAC_POLICIES } from "../constants/rbacPolicies.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import {
  topSpendingQuerySchema,
  dateRangeSummaryQuerySchema,
  trendMonthsQuerySchema,
} from "../validators/insight.validator.js";

const router = Router();

router.use(authenticate);
router.use(authorizeRoles(...RBAC_POLICIES.RECORDS_VIEW));

router.get("/income-vs-expense", insightController.incomeVsExpense);
router.get(
  "/top-spending-categories",
  validateRequest({ query: topSpendingQuerySchema }),
  insightController.topSpendingCategories,
);
router.get(
  "/date-range-summary",
  validateRequest({ query: dateRangeSummaryQuerySchema }),
  insightController.dateRangeSummary,
);
router.get(
  "/savings-trend",
  validateRequest({ query: trendMonthsQuerySchema }),
  insightController.savingsTrend,
);
router.get(
  "/cash-flow-trend",
  validateRequest({ query: trendMonthsQuerySchema }),
  insightController.cashFlowTrend,
);
router.get("/category-breakdown", insightController.categoryBreakdown);
router.get(
  "/monthly-trends",
  validateRequest({ query: trendMonthsQuerySchema }),
  insightController.monthlyTrends,
);

export default router;
