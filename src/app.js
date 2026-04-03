import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import config from "./config/env.js";
import routes from "./routes/index.js";
import { notFoundHandler, errorHandler } from "./middlewares/errorHandler.js";
import {
  globalRateLimiter,
  authRateLimiter,
} from "./middlewares/rateLimit.middleware.js";

const app = express();

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
  : { origin: true };

app.use(cors(corsOptions));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());

app.use("/api/v1/auth", authRateLimiter);
app.use("/api/v1", globalRateLimiter);

app.use("/api/v1", routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
