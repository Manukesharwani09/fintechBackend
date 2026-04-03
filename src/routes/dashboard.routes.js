import { Router } from "express";
import dashboardController from "../controllers/dashboard.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/rbac.middleware.js";
import { RBAC_POLICIES } from "../constants/rbacPolicies.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import { recentActivityQuerySchema } from "../validators/dashboard.validator.js";

const router = Router();

router.use(authenticate);
router.use(authorizeRoles(...RBAC_POLICIES.DASHBOARD_VIEW));

router.get("/total-income", dashboardController.totalIncome);
router.get("/total-expenses", dashboardController.totalExpenses);
router.get("/net-balance", dashboardController.netBalance);
router.get(
  "/recent-activity",
  validateRequest({ query: recentActivityQuerySchema }),
  dashboardController.recentActivity,
);

export default router;
