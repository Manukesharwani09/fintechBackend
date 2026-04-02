import { Router } from "express";

import userRoutes from "./user.routes.js";
import authRoutes from "./auth.routes.js";
import financialRecordRoutes from "./financialRecord.routes.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

router.use("/users", userRoutes);
router.use("/auth", authRoutes);
router.use("/records", financialRecordRoutes);

export default router;
