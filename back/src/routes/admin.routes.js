import { Router } from "express";

import { authenticate, authorizeRoles } from "../middlewares/auth.middleware.js";

import { validate, validateParams, validateQuery } from "../middlewares/validation.middleware.js";

import {
  adminUserIdSchema,
  adminPostIdSchema,
  adminCommentIdSchema,
  adminUserListQuerySchema,
  adminContentListQuerySchema,
  updateUserRoleSchema,
  updateUserStatusSchema,
} from "../validators/admin.validator.js";

import {
  getAdminUsersController,
  getAdminUserDetailController,
  updateAdminUserRoleController,
  updateAdminUserStatusController,
  getAdminPostsController,
  deleteAdminPostController,
  getAdminCommentsController,
  deleteAdminCommentController,
} from "../controllers/admin.controller.js";

const router = Router();

// 모든 관리자 API는 ADMIN 권한 필요
router.use(authenticate);
router.use(authorizeRoles("ADMIN"));

// 관리자 권한 확인
router.get("/check", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "관리자 권한이 확인되었습니다.",
    data: {
      user: req.user,
    },
  });
});

// 사용자 목록
router.get("/users", validateQuery(adminUserListQuerySchema), getAdminUsersController);

// 사용자 상세
router.get("/users/:userId", validateParams(adminUserIdSchema), getAdminUserDetailController);

// 사용자 권한 변경
router.patch(
  "/users/:userId/role",
  validateParams(adminUserIdSchema),
  validate(updateUserRoleSchema),
  updateAdminUserRoleController,
);

// 사용자 계정 상태 변경
router.patch(
  "/users/:userId/status",
  validateParams(adminUserIdSchema),
  validate(updateUserStatusSchema),
  updateAdminUserStatusController,
);

// 전체 게시글 목록
router.get("/posts", validateQuery(adminContentListQuerySchema), getAdminPostsController);

// 관리자 게시글 삭제
router.delete("/posts/:postId", validateParams(adminPostIdSchema), deleteAdminPostController);

// 전체 댓글 목록
router.get("/comments", validateQuery(adminContentListQuerySchema), getAdminCommentsController);

// 관리자 댓글 삭제
router.delete(
  "/comments/:commentId",
  validateParams(adminCommentIdSchema),
  deleteAdminCommentController,
);

export default router;
