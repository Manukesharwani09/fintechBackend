import { Router } from "express";

import insightController from "../controllers/insight.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/rbac.middleware.js";
import { RBAC_POLICIES } from "../constants/rbacPolicies.js";

const router = Router();

router.use(authenticate);
router.use(authorizeRoles(...RBAC_POLICIES.RECORDS_VIEW));

router.get("/income-vs-expense", insightController.incomeVsExpense);
router.get("/top-spending-categories", insightController.topSpendingCategories);
router.get("/date-range-summary", insightController.dateRangeSummary);
router.get("/savings-trend", insightController.savingsTrend);
router.get("/cash-flow-trend", insightController.cashFlowTrend);
router.get("/category-breakdown", insightController.categoryBreakdown);
router.get("/monthly-trends", insightController.monthlyTrends);

export default router;
