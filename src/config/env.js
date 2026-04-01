import path from "path";
import dotenv from "dotenv";

const envFile = path.resolve(process.cwd(), ".env");
dotenv.config({ path: envFile });

const parseCsv = (value = "") =>
  value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

const config = {
  nodeEnv: process.env.NODE_ENV || "development",
  isProduction: (process.env.NODE_ENV || "").toLowerCase() === "production",
  port: Number(process.env.PORT) || 4000,
  corsAllowedOrigins: parseCsv(process.env.CORS_ALLOWED_ORIGINS || ""),
  mongoUri:
    process.env.MONGO_URI || "mongodb://127.0.0.1:27017/finance_dashboard",
};

export default config;
