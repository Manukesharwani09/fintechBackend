import { Router } from "express";

import userController from "../controllers/user.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/rbac.middleware.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import { USER_ROLES } from "../constants/userRoles.js";

const router = Router();

router.get(
  "/",
  authenticate,
  authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.ANALYST),
  validateRequest({
    query: (query) => {
      const errors = [];
      if (query.page && Number.isNaN(Number(query.page))) {
        errors.push({ field: "page", message: "page must be a number" });
      }
      if (query.limit && Number.isNaN(Number(query.limit))) {
        errors.push({ field: "limit", message: "limit must be a number" });
      }
      return errors;
    },
  }),
  userController.listUsers,
);

export default router;
