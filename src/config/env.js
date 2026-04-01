import path from "path";
import dotenv from "dotenv";
import ms from "ms";

const envFile = path.resolve(process.cwd(), ".env");
dotenv.config({ path: envFile });

const parseCsv = (value = "") =>
  value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

const accessCookieMs = ms(process.env.JWT_EXPIRES_IN);
const refreshCookieMs = ms(process.env.REFRESH_TOKEN_EXPIRES_IN);

const config = {
  nodeEnv: process.env.NODE_ENV || "development",
  isProduction: (process.env.NODE_ENV || "").toLowerCase() === "production",
  port: Number(process.env.PORT) || 4000,
  corsAllowedOrigins: parseCsv(process.env.CORS_ALLOWED_ORIGINS || ""),
  mongoUri: process.env.MONGO_URI,
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
    refreshSecret: process.env.REFRESH_TOKEN_SECRET,
    refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
    accessCookieMaxAgeMs: accessCookieMs,
    refreshCookieMaxAgeMs: refreshCookieMs,
  },
  bcrypt: {
    saltRounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 12,
  },
};

export default config;
