import { Router } from "express";
import financialRecordController from "../controllers/financialRecord.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/rbac.middleware.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import { RBAC_POLICIES } from "../constants/rbacPolicies.js";
import { USER_ROLES } from "../constants/userRoles.js";
import {
  recordIdParamsSchema,
  createRecordBodySchema,
  updateRecordBodySchema,
  listRecordsQuerySchema,
  viewerListRecordsQuerySchema,
} from "../validators/financialRecord.validator.js";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  authorizeRoles(...RBAC_POLICIES.RECORDS_MANAGE),
  validateRequest({ body: createRecordBodySchema }),
  financialRecordController.createRecord,
);

router.get(
  "/",
  authorizeRoles(...RBAC_POLICIES.RECORDS_VIEW),
  validateRequest({ query: listRecordsQuerySchema }),
  financialRecordController.getAllRecords,
);

router.get(
  "/viewer",
  authorizeRoles(USER_ROLES.VIEWER),
  validateRequest({ query: viewerListRecordsQuerySchema }),
  financialRecordController.getAllRecordsForViewer,
);

router.get(
  "/:id",
  authorizeRoles(...RBAC_POLICIES.RECORDS_VIEW),
  validateRequest({ params: recordIdParamsSchema }),
  financialRecordController.getRecordById,
);

router.patch(
  "/:id",
  authorizeRoles(...RBAC_POLICIES.RECORDS_MANAGE),
  validateRequest({
    params: recordIdParamsSchema,
    body: updateRecordBodySchema,
  }),
  financialRecordController.updateRecord,
);

router.delete(
  "/:id",
  authorizeRoles(...RBAC_POLICIES.RECORDS_MANAGE),
  validateRequest({ params: recordIdParamsSchema }),
  financialRecordController.deleteRecord,
);

router.patch(
  "/:id/restore",
  authorizeRoles(...RBAC_POLICIES.RECORDS_MANAGE),
  validateRequest({ params: recordIdParamsSchema }),
  financialRecordController.restoreRecord,
);

export default router;
