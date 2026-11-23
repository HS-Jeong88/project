import { Router } from "express";

import {
  registerController,
  loginController,
  refreshController,
  logoutController,
  meController,
} from "../controllers/auth.controller.js";

import { registerSchema, loginSchema } from "../validators/auth.validator.js";

import { validate } from "../middlewares/validation.middleware.js";

import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

// 회원가입
router.post("/register", validate(registerSchema), registerController);

// 로그인
router.post("/login", validate(loginSchema), loginController);

// Access Token 갱신
router.post("/refresh", refreshController);

// 로그아웃
router.post("/logout", logoutController);

// 로그인 사용자 확인
router.get("/me", authenticate, meController);

export default router;
