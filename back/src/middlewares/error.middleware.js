export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    code: "NOT_FOUND",
    message: "요청한 API를 찾을 수 없습니다.",
    path: req.originalUrl,
  });
};

export const errorHandler = (error, req, res, next) => {
  console.error("[ERROR]", {
    name: error.name,
    message: error.message,
    path: req.originalUrl,
    method: req.method,
    statusCode: error.statusCode || 500,
    code: error.code,
  });

  if (res.headersSent) {
    return next(error);
  }

  let statusCode = error.statusCode || 500;
  let code = error.code || "INTERNAL_SERVER_ERROR";
  let message = error.message || "서버 내부 오류가 발생했습니다.";

  // JWT 오류
  if (
    error.name === "JsonWebTokenError" ||
    error.name === "TokenExpiredError" ||
    error.name === "NotBeforeError"
  ) {
    statusCode = 401;
    code = "INVALID_TOKEN";
    message = "인증 토큰이 올바르지 않거나 만료되었습니다.";
  }

  // PostgreSQL 오류
  if (error.code === "23505") {
    statusCode = 409;
    code = "DUPLICATE_RESOURCE";
    message = "이미 사용 중인 값입니다.";
  } else if (error.code === "23503") {
    statusCode = 400;
    code = "FOREIGN_KEY_VIOLATION";
    message = "연결된 데이터가 존재하지 않거나 참조할 수 없습니다.";
  } else if (error.code === "23502") {
    statusCode = 400;
    code = "REQUIRED_FIELD_MISSING";
    message = "필수 입력값이 누락되었습니다.";
  } else if (error.code === "22P02") {
    statusCode = 400;
    code = "INVALID_DATA_FORMAT";
    message = "입력 데이터 형식이 올바르지 않습니다.";
  }

  // 운영상 오류(AppError)는 의도한 메시지를 유지
  if (statusCode >= 500 && error.isOperational !== true) {
    statusCode = 500;
    code = "INTERNAL_SERVER_ERROR";
    message = "서버 내부 오류가 발생했습니다.";
  }

  return res.status(statusCode).json({
    success: false,
    code,
    message,
  });
};
