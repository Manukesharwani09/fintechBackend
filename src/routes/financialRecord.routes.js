import { Router } from "express";

import financialRecordController from "../controllers/financialRecord.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/rbac.middleware.js";
import { RBAC_POLICIES } from "../constants/rbacPolicies.js";
import { USER_ROLES } from "../constants/userRoles.js";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  authorizeRoles(...RBAC_POLICIES.RECORDS_MANAGE),
  financialRecordController.createRecord,
);

router.get(
  "/",
  authorizeRoles(...RBAC_POLICIES.RECORDS_VIEW),
  financialRecordController.getAllRecords,
);

router.get(
  "/viewer",
  authorizeRoles(USER_ROLES.VIEWER),
  financialRecordController.getAllRecordsForViewer,
);

router.get(
  "/:id",
  authorizeRoles(...RBAC_POLICIES.RECORDS_VIEW),
  financialRecordController.getRecordById,
);

router.patch(
  "/:id",
  authorizeRoles(...RBAC_POLICIES.RECORDS_MANAGE),
  financialRecordController.updateRecord,
);

router.delete(
  "/:id",
  authorizeRoles(...RBAC_POLICIES.RECORDS_MANAGE),
  financialRecordController.deleteRecord,
);

router.patch(
  "/:id/restore",
  authorizeRoles(...RBAC_POLICIES.RECORDS_MANAGE),
  financialRecordController.restoreRecord,
);

export default router;
