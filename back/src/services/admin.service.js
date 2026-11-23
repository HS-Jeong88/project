import {
  findUsers,
  countUsers,
  findUserDetail,
  findUserForManagement,
  changeUserRole,
  changeUserStatus,
  findAllPosts,
  countAllPosts,
  deletePostById,
  findAllComments,
  countAllComments,
  deleteCommentById,
} from "../repositories/admin.repository.js";

import AppError from "../utils/appError.js";

const createPagination = ({ page, limit, total }) => {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasPreviousPage: page > 1,
    hasNextPage: page < totalPages,
  };
};

// 사용자 목록
export const getAdminUsers = async ({ search, role, status, page, limit }) => {
  const offset = (page - 1) * limit;

  const filters = {
    search,
    role,
    status,
  };

  const [users, total] = await Promise.all([
    findUsers({
      ...filters,
      limit,
      offset,
    }),
    countUsers(filters),
  ]);

  return {
    users,
    pagination: createPagination({
      page,
      limit,
      total,
    }),
  };
};

// 사용자 상세
export const getAdminUserDetail = async (userId) => {
  const user = await findUserDetail(userId);

  if (!user) {
    throw new AppError("사용자를 찾을 수 없습니다.", 404);
  }

  return user;
};

// 사용자 권한 변경
export const updateAdminUserRole = async ({ userId, role, adminId }) => {
  const target = await findUserForManagement(userId);

  if (!target) {
    throw new AppError("사용자를 찾을 수 없습니다.", 404);
  }

  if (userId === adminId && target.role !== role) {
    throw new AppError("자신의 관리자 권한은 변경할 수 없습니다.", 400);
  }

  const result = await changeUserRole({
    userId,
    role,
  });

  if (result.notFound) {
    throw new AppError("사용자를 찾을 수 없습니다.", 404);
  }

  if (result.lastAdmin) {
    throw new AppError("마지막 활성 관리자 계정의 권한은 변경할 수 없습니다.", 409);
  }

  return result.user;
};

// 사용자 계정 상태 변경
export const updateAdminUserStatus = async ({ userId, status, adminId }) => {
  const target = await findUserForManagement(userId);

  if (!target) {
    throw new AppError("사용자를 찾을 수 없습니다.", 404);
  }

  if (userId === adminId && status === "SUSPENDED") {
    throw new AppError("자신의 계정은 정지할 수 없습니다.", 400);
  }

  const result = await changeUserStatus({
    userId,
    status,
  });

  if (result.notFound) {
    throw new AppError("사용자를 찾을 수 없습니다.", 404);
  }

  if (result.lastAdmin) {
    throw new AppError("마지막 활성 관리자 계정은 정지할 수 없습니다.", 409);
  }

  return result.user;
};

// 전체 게시글 목록
export const getAdminPosts = async ({ search, page, limit }) => {
  const offset = (page - 1) * limit;

  const [posts, total] = await Promise.all([
    findAllPosts({
      search,
      limit,
      offset,
    }),
    countAllPosts(search),
  ]);

  return {
    posts,
    pagination: createPagination({
      page,
      limit,
      total,
    }),
  };
};

// 관리자 게시글 삭제
export const removeAdminPost = async (postId) => {
  const deleted = await deletePostById(postId);

  if (!deleted) {
    throw new AppError("게시글을 찾을 수 없습니다.", 404);
  }

  return deleted;
};

// 전체 댓글 목록
export const getAdminComments = async ({ search, page, limit }) => {
  const offset = (page - 1) * limit;

  const [comments, total] = await Promise.all([
    findAllComments({
      search,
      limit,
      offset,
    }),
    countAllComments(search),
  ]);

  return {
    comments,
    pagination: createPagination({
      page,
      limit,
      total,
    }),
  };
};

// 관리자 댓글 삭제
export const removeAdminComment = async (commentId) => {
  const deleted = await deleteCommentById(commentId);

  if (!deleted) {
    throw new AppError("댓글을 찾을 수 없습니다.", 404);
  }

  return deleted;
};
