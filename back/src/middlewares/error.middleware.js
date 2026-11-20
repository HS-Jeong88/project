const errorHandler = (err, _req, res, _next) => {
  const candidateStatusCode = Number(err.statusCode ?? err.status);
  const statusCode = Number.isInteger(candidateStatusCode) ? candidateStatusCode : 500;

  res.status(statusCode).json({
    status: "error",
    statusCode,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export default errorHandler;
