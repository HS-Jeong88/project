import { chatWithRag } from "../services/rag.service.js";

// RAG 채팅
export const ragChatController = async (req, res, next) => {
  try {
    const result = await chatWithRag({
      question: req.validatedBody.question,
      conversationId: req.validatedBody.conversationId,
      userId: req.user.id,
    });

    return res.status(200).json({
      success: true,
      message: "AI 답변이 생성되었습니다.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
