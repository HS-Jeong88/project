import {
  findConversationsByUserId,
  findConversationByIdAndUserId,
  findMessagesByConversationId,
  deleteConversation,
} from "../repositories/conversation.repository.js";

import AppError from "../utils/appError.js";

// =========================================
// 1. 대화방 목록 조회
// =========================================

export const getConversationList = async (userId, query = {}) => {
  if (!userId) {
    throw new AppError("로그인이 필요합니다.", 401);
  }

  const limit = Number(query.limit ?? 50);
  const offset = Number(query.offset ?? 0);

  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new AppError("대화방 조회 개수가 올바르지 않습니다.", 400);
  }

  if (!Number.isInteger(offset) || offset < 0) {
    throw new AppError("대화방 조회 시작 위치가 올바르지 않습니다.", 400);
  }

  return await findConversationsByUserId({
    userId,
    limit,
    offset,
  });
};

// =========================================
// 2. 대화방 상세 조회
// =========================================

export const getConversationDetail = async ({ conversationId, userId }) => {
  if (!userId) {
    throw new AppError("로그인이 필요합니다.", 401);
  }

  if (!conversationId) {
    throw new AppError("대화방 ID가 필요합니다.", 400);
  }

  const conversation = await findConversationByIdAndUserId({
    conversationId,
    userId,
  });

  if (!conversation) {
    throw new AppError("대화방을 찾을 수 없습니다.", 404);
  }

  const messages = await findMessagesByConversationId(conversationId);

  return {
    conversation,
    messages,
  };
};

// =========================================
// 3. 대화방 소유권 확인
// =========================================

export const ensureConversationOwner = async ({ conversationId, userId }) => {
  if (!userId) {
    throw new AppError("로그인이 필요합니다.", 401);
  }

  const conversation = await findConversationByIdAndUserId({
    conversationId,
    userId,
  });

  if (!conversation) {
    throw new AppError("대화방을 찾을 수 없습니다.", 404);
  }

  return conversation;
};

// =========================================
// 4. 대화방 삭제
// =========================================

export const removeConversation = async ({ conversationId, userId }) => {
  await ensureConversationOwner({
    conversationId,
    userId,
  });

  const deleted = await deleteConversation({
    conversationId,
    userId,
  });

  if (!deleted) {
    throw new AppError("대화방을 삭제하지 못했습니다.", 404);
  }

  return {
    conversationId,
  };
};
