import { Router } from "express";

import authRouter from "./auth.routes.js";
import adminRouter from "./admin.routes.js";
import postRouter from "./post.routes.js";
import commentRouter from "./comment.routes.js";
import ragRouter from "./rag.routes.js";

import rateLimit from "../middlewares/rateLimit.middleware.js";

const router = Router();

router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "서버가 정상적으로 실행 중입니다.",
  });
});

// 인증 관련 API 요청 제한
router.use(
  "/auth",
  rateLimit({
    windowMs: 60 * 1000,
    maxRequests: 30,
    keyPrefix: "auth",
    message: "인증 요청이 너무 많습니다. 1분 후 다시 시도해 주세요.",
  }),
);

router.use("/auth", authRouter);
router.use("/admin", adminRouter);
router.use("/posts", postRouter);
router.use("/", commentRouter);
router.use("/rag", ragRouter);

export default router;
