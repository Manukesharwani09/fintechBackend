import config from "../config/env.js";

const notFoundHandler = (req, _res, next) => {
  const error = new Error(`Route ${req.originalUrl} not found`);
  error.statusCode = 404;
  next(error);
};

const errorHandler = (err, _req, res, _next) => {
  const statusCode = err.statusCode || err.status || 500;
  const response = {
    message: err.message || "Internal server error",
  };

  if (err.errors) {
    response.errors = err.errors;
  }

  if (!config.isProduction && err.stack) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

export { notFoundHandler, errorHandler };
