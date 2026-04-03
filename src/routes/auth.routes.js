import { Router } from "express";

import authController from "../controllers/auth.controller.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import { loginBodySchema } from "../validators/auth.validator.js";

const router = Router();

router.post("/register", authController.registrationDisabled);
router.post(
  "/login",
  validateRequest({ body: loginBodySchema }),
  authController.login,
);
router.post("/refresh", authController.refreshSession);
router.post("/logout", authController.logout);

export default router;
