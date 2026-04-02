const forbid = (message = "Forbidden") => {
  const error = new Error(message);
  error.statusCode = 403;
  return error;
};

const authorizeRoles = (...roles) => {
  const allowedRoles = new Set(roles);

  return (req, _res, next) => {
    if (!req.user) {
      return next(forbid("Authentication context missing"));
    }

    if (!allowedRoles.has(req.user.role)) {
      return next(forbid("Insufficient role permissions"));
    }

    return next();
  };
};

export { authorizeRoles };
