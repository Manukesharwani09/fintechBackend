const badRequest = (errors) => {
  const error = new Error("Validation failed");
  error.statusCode = 400;
  error.errors = errors;
  return error;
};

const runValidation = (validator, source, label) => {
  if (!validator) {
    return [];
  }

  const result = validator(source);
  if (result === true || result === undefined || result === null) {
    return [];
  }

  if (typeof result === "string") {
    return [{ field: label, message: result }];
  }

  if (Array.isArray(result)) {
    return result.map((entry) =>
      typeof entry === "string"
        ? { field: label, message: entry }
        : {
            field: entry.field || label,
            message: entry.message || "Invalid value",
          },
    );
  }

  return [{ field: label, message: "Invalid request" }];
};

const validateRequest =
  (schema = {}) =>
  (req, _res, next) => {
    const errors = [
      ...runValidation(schema.body, req.body, "body"),
      ...runValidation(schema.params, req.params, "params"),
      ...runValidation(schema.query, req.query, "query"),
    ];

    if (errors.length) {
      return next(badRequest(errors));
    }

    return next();
  };

export { validateRequest };
