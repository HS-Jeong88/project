const validateSchema = (schema, source, target) => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "요청값이 올바르지 않습니다.",
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

export const validateQuery = (schema) => {
  return validateSchema(schema, "query", "validatedQuery");
};

export const validateParams = (schema) => {
  return validateSchema(schema, "params", "validatedParams");
};
