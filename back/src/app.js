import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import apiRouter from "./routes/index.js";

import { notFoundHandler, errorHandler } from "./middlewares/error.middleware.js";

const app = express();

app.disable("x-powered-by");

// 프록시 신뢰 설정
const trustProxyValue = process.env.TRUST_PROXY?.trim().toLowerCase();

if (trustProxyValue && trustProxyValue !== "false" && trustProxyValue !== "0") {
  if (!/^[1-9]\d*$/.test(trustProxyValue)) {
    throw new Error("TRUST_PROXY에는 false 또는 양의 정수(프록시 홉 수)를 설정해야 합니다.");
  }

  app.set("trust proxy", Number(trustProxyValue));
} else {
  app.set("trust proxy", false);
}

// Helmet
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "upgrade-insecure-requests": null,
      },
    },
  }),
);

// CORS
const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      const error = new Error("허용되지 않은 CORS Origin입니다.");
      error.statusCode = 403;
      error.code = "CORS_ORIGIN_DENIED";

      return callback(error);
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 204,
  }),
);

// HTTP 로그
app.use(morgan("dev"));

// JSON 파싱
app.use(
  express.json({
    limit: "1mb",
  }),
);

// URL 인코딩 파싱
app.use(
  express.urlencoded({
    extended: true,
    limit: "1mb",
  }),
);

// Cookie 파싱
app.use(cookieParser());

// API 라우터
app.use("/api/v1", apiRouter);

// 404 및 에러 처리
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
