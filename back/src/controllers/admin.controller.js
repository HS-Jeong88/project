import {
  getAdminUsers,
  getAdminUserDetail,
  updateAdminUserRole,
  updateAdminUserStatus,
  getAdminPosts,
  removeAdminPost,
  getAdminComments,
  removeAdminComment,
} from "../services/admin.service.js";

// 사용자 목록
export const getAdminUsersController = async (req, res, next) => {
  try {
    const result = await getAdminUsers(req.validatedQuery);

    return res.status(200).json({
      success: true,
      message: "사용자 목록을 조회했습니다.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// 사용자 상세
export const getAdminUserDetailController = async (req, res, next) => {
  try {
    const user = await getAdminUserDetail(req.validatedParams.userId);

    return res.status(200).json({
      success: true,
      message: "사용자 정보를 조회했습니다.",
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 사용자 권한 변경
export const updateAdminUserRoleController = async (req, res, next) => {
  try {
    const user = await updateAdminUserRole({
      userId: req.validatedParams.userId,
      role: req.validatedBody.role,
      adminId: req.user.id,
    });

    return res.status(200).json({
      success: true,
      message: "사용자 권한이 변경되었습니다.",
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 사용자 상태 변경
export const updateAdminUserStatusController = async (req, res, next) => {
  try {
    const user = await updateAdminUserStatus({
      userId: req.validatedParams.userId,
      status: req.validatedBody.status,
      adminId: req.user.id,
    });

    return res.status(200).json({
      success: true,
      message: "사용자 계정 상태가 변경되었습니다.",
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 전체 게시글 목록
export const getAdminPostsController = async (req, res, next) => {
  try {
    const result = await getAdminPosts(req.validatedQuery);

    return res.status(200).json({
      success: true,
      message: "전체 게시글을 조회했습니다.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// 게시글 삭제
export const deleteAdminPostController = async (req, res, next) => {
  try {
    const result = await removeAdminPost(req.validatedParams.postId);

    return res.status(200).json({
      success: true,
      message: "게시글이 삭제되었습니다.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// 전체 댓글 목록
export const getAdminCommentsController = async (req, res, next) => {
  try {
    const result = await getAdminComments(req.validatedQuery);

    return res.status(200).json({
      success: true,
      message: "전체 댓글을 조회했습니다.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// 댓글 삭제
export const deleteAdminCommentController = async (req, res, next) => {
  try {
    const result = await removeAdminComment(req.validatedParams.commentId);

    return res.status(200).json({
      success: true,
      message: "댓글이 삭제되었습니다.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
