import { Router } from "express";

import {
  getCommentsController,
  createCommentController,
  updateCommentController,
  deleteCommentController,
} from "../controllers/comment.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";

import { validate, validateParams, validateQuery } from "../middlewares/validation.middleware.js";

import {
  commentCreateSchema,
  commentUpdateSchema,
  commentIdParamSchema,
  postCommentParamsSchema,
  commentListQuerySchema,
} from "../validators/comment.validator.js";

const router = Router();

// 게시글의 댓글 목록
router.get(
  "/posts/:postId/comments",
  validateParams(postCommentParamsSchema),
  validateQuery(commentListQuerySchema),
  getCommentsController,
);

// 댓글 작성
router.post(
  "/posts/:postId/comments",
  authenticate,
  validateParams(postCommentParamsSchema),
  validate(commentCreateSchema),
  createCommentController,
);

// 댓글 수정
router.patch(
  "/comments/:commentId",
  authenticate,
  validateParams(commentIdParamSchema),
  validate(commentUpdateSchema),
  updateCommentController,
);

// 댓글 삭제
router.delete(
  "/comments/:commentId",
  authenticate,
  validateParams(commentIdParamSchema),
  deleteCommentController,
);

export default router;
