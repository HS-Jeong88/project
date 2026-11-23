import { Router } from "express";

import { ragChatController } from "../controllers/rag.controller.js";

import {
  getConversationListController,
  getConversationDetailController,
  deleteConversationController,
} from "../controllers/conversation.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import rateLimit from "../middlewares/rateLimit.middleware.js";

import { ragChatSchema } from "../validators/rag.validator.js";

const router = Router();

// =========================================
// AI 질문 요청
// POST /api/v1/rag/chat
// =========================================

router.post(
  "/chat",
  rateLimit({
    windowMs: 60 * 1000,
    maxRequests: 5,
    keyPrefix: "rag-chat",
    message: "AI 질문 요청이 너무 많습니다. 1분 후 다시 시도해 주세요.",
  }),
  authenticate,
  validate(ragChatSchema),
  ragChatController,
);

// =========================================
// 대화방 목록
// GET /api/v1/rag/conversations
// =========================================

router.get("/conversations", authenticate, getConversationListController);

// =========================================
// 대화방 상세
// GET /api/v1/rag/conversations/:conversationId
// =========================================

router.get("/conversations/:conversationId", authenticate, getConversationDetailController);

// =========================================
// 대화방 삭제
// DELETE /api/v1/rag/conversations/:conversationId
// =========================================

router.delete("/conversations/:conversationId", authenticate, deleteConversationController);

export default router;
