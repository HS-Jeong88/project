import { z } from "zod";

export const commentCreateSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "댓글 내용을 입력해주세요.")
    .max(2000, "댓글은 2000자 이하여야 합니다."),
});

export const commentUpdateSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "댓글 내용을 입력해주세요.")
    .max(2000, "댓글은 2000자 이하여야 합니다."),
});

export const commentIdParamSchema = z.object({
  commentId: z.string().uuid("올바르지 않은 댓글 ID입니다."),
});

export const postCommentParamsSchema = z.object({
  postId: z.string().uuid("올바르지 않은 게시글 ID입니다."),
});

export const commentListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(100).default(10),
});
