import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import apiRouter from "./routes/index.js";

import { notFoundHandler, errorHandler } from "./middlewares/error.middleware.js";

const app = express();

app.disable("x-powered-by");

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

const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5500")
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

app.use(morgan("dev"));

app.use(
  express.json({
    limit: "1mb",
  }),
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "1mb",
  }),
);

app.use(cookieParser());

app.use("/api/v1", apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
