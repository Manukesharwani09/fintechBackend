import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import config from "../src/config/env.js";
import routes from "../src/routes/index.js";
import {
  notFoundHandler,
  errorHandler,
} from "../src/middlewares/errorHandler.js";
import {
  globalRateLimiter,
  authRateLimiter,
} from "../src/middlewares/rateLimit.middleware.js";
import { connectDatabase } from "../src/config/database.js";

const app = express();

// Simple health check endpoint for deployment troubleshooting
app.get("/api/v1/ping", (_req, res) => res.json({ message: "pong" }));

const allowedOrigins = config.corsAllowedOrigins;
const corsOptions = allowedOrigins.length
  ? {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }

        return callback(new Error("Not allowed by CORS"));
      },
      credentials: true,
    }
  : { origin: true, credentials: true };

app.use(cors(corsOptions));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());

// In serverless mode, ensure a live connection per invocation while reusing cache.
app.use(async (_req, _res, next) => {
  try {
    await connectDatabase();
    return next();
  } catch (error) {
    return next(error);
  }
});

app.use("/api/v1/auth", authRateLimiter);
app.use("/api/v1", globalRateLimiter);
app.use("/api/v1", routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
