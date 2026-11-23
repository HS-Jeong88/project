const createValidator = (schema, source, target) => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        code: "VALIDATION_ERROR",
        message: "입력값이 올바르지 않습니다.",
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    req[target] = result.data;
    next();
  };
};

export const validate = (schema) => {
  return createValidator(schema, "body", "validatedBody");
};

export const validateParams = (schema) => {
  return createValidator(schema, "params", "validatedParams");
};

export const validateQuery = (schema) => {
  return createValidator(schema, "query", "validatedQuery");
};
