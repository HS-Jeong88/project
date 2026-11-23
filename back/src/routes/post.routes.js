import { Router } from "express";

import {
  getPostListController,
  getPostDetailController,
  createPostController,
  updatePostController,
  deletePostController,
} from "../controllers/post.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";

import { validate } from "../middlewares/validation.middleware.js";

import { validateQuery, validateParams } from "../middlewares/query.middleware.js";

import {
  postIdParamSchema,
  createPostSchema,
  updatePostSchema,
  postListQuerySchema,
} from "../validators/post.validator.js";

const router = Router();

// 게시글 목록
router.get("/", validateQuery(postListQuerySchema), getPostListController);

// 게시글 작성
router.post("/", authenticate, validate(createPostSchema), createPostController);

// 게시글 상세
router.get("/:postId", validateParams(postIdParamSchema), getPostDetailController);

// 게시글 수정
router.patch(
  "/:postId",
  authenticate,
  validateParams(postIdParamSchema),
  validate(updatePostSchema),
  updatePostController,
);

// 게시글 삭제
router.delete("/:postId", authenticate, validateParams(postIdParamSchema), deletePostController);

export default router;
