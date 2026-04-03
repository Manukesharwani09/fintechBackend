import { Router } from "express";

import userController from "../controllers/user.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/rbac.middleware.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import { RBAC_POLICIES } from "../constants/rbacPolicies.js";
import {
  userIdParamsSchema,
  userListQuerySchema,
  createUserBodySchema,
  updateUserBodySchema,
  updateUserRoleBodySchema,
  updateUserStatusBodySchema,
} from "../validators/user.validator.js";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  authorizeRoles(...RBAC_POLICIES.USERS_MANAGE),
  validateRequest({ query: userListQuerySchema }),
  userController.listUsers,
);

router.get(
  "/:userId",
  authorizeRoles(...RBAC_POLICIES.USERS_MANAGE),
  validateRequest({ params: userIdParamsSchema, query: userListQuerySchema }),
  userController.getUserById,
);

router.post(
  "/",
  authorizeRoles(...RBAC_POLICIES.USERS_MANAGE),
  validateRequest({ body: createUserBodySchema }),
  userController.createUser,
);

router.patch(
  "/:userId",
  authorizeRoles(...RBAC_POLICIES.USERS_MANAGE),
  validateRequest({ params: userIdParamsSchema, body: updateUserBodySchema }),
  userController.updateUser,
);

router.patch(
  "/:userId/role",
  authorizeRoles(...RBAC_POLICIES.USERS_MANAGE),
  validateRequest({
    params: userIdParamsSchema,
    body: updateUserRoleBodySchema,
  }),
  userController.assignUserRole,
);

router.patch(
  "/:userId/status",
  authorizeRoles(...RBAC_POLICIES.USERS_MANAGE),
  validateRequest({
    params: userIdParamsSchema,
    body: updateUserStatusBodySchema,
  }),
  userController.updateUserStatus,
);

router.delete(
  "/:userId",
  authorizeRoles(...RBAC_POLICIES.USERS_MANAGE),
  validateRequest({ params: userIdParamsSchema }),
  userController.softDeleteUser,
);

router.patch(
  "/:userId/restore",
  authorizeRoles(...RBAC_POLICIES.USERS_MANAGE),
  validateRequest({ params: userIdParamsSchema }),
  userController.restoreUser,
);

export default router;
