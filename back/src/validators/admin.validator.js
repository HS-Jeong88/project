import { z } from "zod";

export const adminUserIdSchema = z.object({
  userId: z.string().uuid("올바르지 않은 사용자 ID입니다."),
});

export const adminPostIdSchema = z.object({
  postId: z.string().uuid("올바르지 않은 게시글 ID입니다."),
});

export const adminCommentIdSchema = z.object({
  commentId: z.string().uuid("올바르지 않은 댓글 ID입니다."),
});

export const adminUserListQuerySchema = z.object({
  search: z.string().trim().max(100).default(""),

  role: z.enum(["USER", "ADMIN"]).optional(),

  status: z.enum(["ACTIVE", "SUSPENDED"]).optional(),

  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const adminContentListQuerySchema = z.object({
  search: z.string().trim().max(100).default(""),

  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const updateUserRoleSchema = z.object({
  role: z.enum(["USER", "ADMIN"], {
    errorMap: () => ({
      message: "권한은 USER 또는 ADMIN이어야 합니다.",
    }),
  }),
});

export const updateUserStatusSchema = z.object({
  status: z.enum(["ACTIVE", "SUSPENDED"], {
    errorMap: () => ({
      message: "상태는 ACTIVE 또는 SUSPENDED이어야 합니다.",
    }),
  }),
});
