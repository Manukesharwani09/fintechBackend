import { Router } from "express";

import dashboardController from "../controllers/dashboard.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/rbac.middleware.js";
import { RBAC_POLICIES } from "../constants/rbacPolicies.js";
import { USER_ROLES } from "../constants/userRoles.js";

const router = Router();

router.use(authenticate);

router.get(
  "/total-income",
  authorizeRoles(...RBAC_POLICIES.DASHBOARD_VIEW),
  dashboardController.totalIncome,
);

router.get(
  "/total-expenses",
  authorizeRoles(...RBAC_POLICIES.DASHBOARD_VIEW),
  dashboardController.totalExpenses,
);

router.get(
  "/net-balance",
  authorizeRoles(...RBAC_POLICIES.DASHBOARD_VIEW),
  dashboardController.netBalance,
);

router.get(
  "/category-breakdown",
  authorizeRoles(...RBAC_POLICIES.RECORDS_VIEW),
  dashboardController.categoryBreakdown,
);

router.get(
  "/monthly-trends",
  authorizeRoles(...RBAC_POLICIES.RECORDS_VIEW),
  dashboardController.monthlyTrends,
);

router.get(
  "/recent-activity",
  authorizeRoles(...RBAC_POLICIES.RECORDS_VIEW),
  dashboardController.recentActivity,
);

export default router;
