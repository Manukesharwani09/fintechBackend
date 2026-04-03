import rateLimit from "express-rate-limit";

const buildRateLimitHandler = (message) => (req, res) => {
  const resetTime = req.rateLimit?.resetTime;
  let retryAfterSeconds = 60; // default fallback
  if (resetTime instanceof Date) {
    retryAfterSeconds = Math.max(
      1,
      Math.ceil((resetTime.getTime() - Date.now()) / 1000),
    );
  }

  res.set("Retry-After", retryAfterSeconds.toString());
  // Format retryAfter as a human-friendly string for the message
  const minutes = Math.floor(retryAfterSeconds / 60);
  const seconds = retryAfterSeconds % 60;
  let retryAfterString = "";
  if (minutes > 0) {
    retryAfterString += `${minutes} minute${minutes > 1 ? "s" : ""}`;
    if (seconds > 0)
      retryAfterString += ` ${seconds} second${seconds > 1 ? "s" : ""}`;
  } else {
    retryAfterString = `${seconds} second${seconds !== 1 ? "s" : ""}`;
  }

  res.set("Retry-After", retryAfterSeconds.toString());
  res.status(429).json({
    message: `${message} Retry after ${retryAfterString}.`,
    error: "Too Many Requests",
    retryAfter: retryAfterSeconds,
  });
};

const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many requests from this IP. Please try again later.",
    error: "Too Many Requests",
  },
  handler: buildRateLimitHandler(
    "Too many requests from this IP. Please try again later.",
  ),
});

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many authentication attempts. Please try again later.",
    error: "Too Many Requests",
  },
  handler: buildRateLimitHandler(
    "Too many authentication attempts. Please try again later.",
  ),
});

export { globalRateLimiter, authRateLimiter };
