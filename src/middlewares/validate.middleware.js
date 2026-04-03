import { ZodError } from "zod";

const badRequest = (errors) => {
  const error = new Error("Validation failed");
  error.statusCode = 400;
  error.errors = errors;
  return error;
};

const formatIssues = (zodError, scope) =>
  zodError.issues.map((issue) => {
    const path = issue.path.length ? `${scope}.${issue.path.join(".")}` : scope;
    return {
      field: path,
      message: issue.message,
      code: issue.code,
    };
  });

const parseWithSchema = (schema, payload, scope) => {
  if (!schema) {
    return { data: payload, errors: [] };
  }

  const result = schema.safeParse(payload);
  if (result.success) {
    return { data: result.data, errors: [] };
  }

  const zodError =
    result.error instanceof ZodError
      ? result.error
      : new ZodError(result.error?.issues || []);

  return { data: payload, errors: formatIssues(zodError, scope) };
};

const validateRequest =
  (schema = {}) =>
  (req, _res, next) => {
    const bodyResult = parseWithSchema(schema.body, req.body, "body");
    const paramsResult = parseWithSchema(schema.params, req.params, "params");
    const queryResult = parseWithSchema(schema.query, req.query, "query");

    const errors = [
      ...bodyResult.errors,
      ...paramsResult.errors,
      ...queryResult.errors,
    ];

    if (errors.length) {
      return next(badRequest(errors));
    }

    req.body = bodyResult.data;
    req.params = paramsResult.data;
    req.query = queryResult.data;

    return next();
  };

export { validateRequest };
