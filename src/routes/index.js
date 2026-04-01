import { Router } from "express";

import userRoutes from "./user.routes.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

router.use("/users", userRoutes);

export default router;
