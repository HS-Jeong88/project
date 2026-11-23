import { z } from "zod";

export const ragChatSchema = z.object({
  question: z
    .string()
    .trim()
    .min(1, "질문을 입력해 주세요.")
    .max(2000, "질문은 2,000자 이하여야 합니다."),

  conversationId: z.string().uuid("올바른 대화방 ID가 아닙니다.").optional(),
});
