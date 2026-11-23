import { z } from "zod";

const postIdSchema = z.string().uuid("올바르지 않은 게시글 ID입니다.");

export const postIdParamSchema = z.object({
  postId: postIdSchema,
});

export const createPostSchema = z.object({
  title: z.string().trim().min(1, "제목을 입력해주세요.").max(200, "제목은 200자 이하여야 합니다."),

  content: z
    .string()
    .trim()
    .min(1, "내용을 입력해주세요.")
    .max(50000, "내용은 50,000자 이하여야 합니다."),
});

export const updatePostSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "제목을 입력해주세요.")
      .max(200, "제목은 200자 이하여야 합니다.")
      .optional(),

    content: z
      .string()
      .trim()
      .min(1, "내용을 입력해주세요.")
      .max(50000, "내용은 50,000자 이하여야 합니다.")
      .optional(),
  })
  .refine((data) => data.title !== undefined || data.content !== undefined, {
    message: "수정할 제목 또는 내용을 입력해주세요.",
  });

export const postListQuerySchema = z.object({
  page: z.coerce.number().int().min(1, "페이지는 1 이상이어야 합니다.").default(1),

  limit: z.coerce
    .number()
    .int()
    .min(1, "페이지당 게시글 수는 1 이상이어야 합니다.")
    .max(100, "페이지당 게시글 수는 최대 100개입니다.")
    .default(10),

  keyword: z.string().trim().max(100, "검색어는 100자 이하여야 합니다.").default(""),

  searchType: z.enum(["all", "title", "content"]).default("all"),

  sortBy: z.enum(["created_at", "view_count", "title"]).default("created_at"),

  order: z.enum(["asc", "desc"]).default("desc"),
});
