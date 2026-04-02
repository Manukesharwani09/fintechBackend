import { Router } from "express";

import userController from "../controllers/user.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/rbac.middleware.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import { USER_ROLES, USER_ROLE_VALUES } from "../constants/userRoles.js";
import { USER_STATUS_VALUES } from "../constants/userStatuses.js";
import { RBAC_POLICIES } from "../constants/rbacPolicies.js";

const router = Router();

const validateObjectIdParam = (params) => {
  const errors = [];
  if (!params.userId || !/^[0-9a-fA-F]{24}$/.test(params.userId)) {
    errors.push({ field: "userId", message: "Valid userId is required" });
  }
  return errors;
};

const validateUserQuery = (query) => {
  const errors = [];
  if (query.page && Number.isNaN(Number(query.page))) {
    errors.push({ field: "page", message: "page must be a number" });
  }
  if (query.limit && Number.isNaN(Number(query.limit))) {
    errors.push({ field: "limit", message: "limit must be a number" });
  }
  if (
    query.includeDeleted !== undefined &&
    !["true", "false"].includes(String(query.includeDeleted))
  ) {
    errors.push({
      field: "includeDeleted",
      message: "includeDeleted must be true or false",
    });
  }
  return errors;
};

const validateCreateUserBody = (body) => {
  const errors = [];
  if (typeof body.email !== "string" || !body.email.trim()) {
    errors.push({ field: "email", message: "email is required" });
  }
  if (typeof body.password !== "string" || body.password.length < 8) {
    errors.push({
      field: "password",
      message: "password must be at least 8 characters",
    });
  }
  if (body.role && !USER_ROLE_VALUES.includes(body.role)) {
    errors.push({ field: "role", message: "role is invalid" });
  }
  return errors;
};

const validateRoleBody = (body) => {
  const errors = [];
  if (!USER_ROLE_VALUES.includes(body.role)) {
    errors.push({ field: "role", message: "role is invalid" });
  }
  return errors;
};

const validateStatusBody = (body) => {
  const errors = [];
  if (!USER_STATUS_VALUES.includes(body.status)) {
    errors.push({ field: "status", message: "status is invalid" });
  }
  return errors;
};

router.use(authenticate);

router.get(
  "/",
  authorizeRoles(...RBAC_POLICIES.USERS_MANAGE),
  validateRequest({ query: validateUserQuery }),
  userController.listUsers,
);

router.get(
  "/:userId",
  authorizeRoles(...RBAC_POLICIES.USERS_MANAGE),
  validateRequest({ params: validateObjectIdParam, query: validateUserQuery }),
  userController.getUserById,
);

router.post(
  "/",
  authorizeRoles(...RBAC_POLICIES.USERS_MANAGE),
  validateRequest({ body: validateCreateUserBody }),
  userController.createUser,
);

router.patch(
  "/:userId",
  authorizeRoles(...RBAC_POLICIES.USERS_MANAGE),
  validateRequest({ params: validateObjectIdParam }),
  userController.updateUser,
);

router.patch(
  "/:userId/role",
  authorizeRoles(...RBAC_POLICIES.USERS_MANAGE),
  validateRequest({ params: validateObjectIdParam, body: validateRoleBody }),
  userController.assignUserRole,
);

router.patch(
  "/:userId/status",
  authorizeRoles(...RBAC_POLICIES.USERS_MANAGE),
  validateRequest({ params: validateObjectIdParam, body: validateStatusBody }),
  userController.updateUserStatus,
);

router.delete(
  "/:userId",
  authorizeRoles(...RBAC_POLICIES.USERS_MANAGE),
  validateRequest({ params: validateObjectIdParam }),
  userController.softDeleteUser,
);

router.patch(
  "/:userId/restore",
  authorizeRoles(...RBAC_POLICIES.USERS_MANAGE),
  validateRequest({ params: validateObjectIdParam }),
  userController.restoreUser,
);

export default router;
