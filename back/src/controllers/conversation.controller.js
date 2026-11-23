import {
  getConversationList,
  getConversationDetail,
  removeConversation,
} from "../services/conversation.service.js";

// =========================================
// 1. 대화방 목록 조회
// GET /api/v1/rag/conversations
// =========================================

export const getConversationListController = async (req, res, next) => {
  try {
    const conversations = await getConversationList(req.user.id, req.query);

    return res.status(200).json({
      success: true,
      message: "대화방 목록을 조회했습니다.",
      data: {
        conversations,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =========================================
// 2. 대화방 상세 조회
// GET /api/v1/rag/conversations/:conversationId
// =========================================

export const getConversationDetailController = async (req, res, next) => {
  try {
    const result = await getConversationDetail({
      conversationId: req.params.conversationId,
      userId: req.user.id,
    });

    return res.status(200).json({
      success: true,
      message: "대화 기록을 조회했습니다.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// =========================================
// 3. 대화방 삭제
// DELETE /api/v1/rag/conversations/:conversationId
// =========================================

export const deleteConversationController = async (req, res, next) => {
  try {
    const result = await removeConversation({
      conversationId: req.params.conversationId,
      userId: req.user.id,
    });

    return res.status(200).json({
      success: true,
      message: "대화방을 삭제했습니다.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
