import {
  findPostById,
  findCommentsByPostId,
  countCommentsByPostId,
  findCommentById,
  createComment,
  updateComment,
  deleteComment,
} from "../repositories/comment.repository.js";

import AppError from "../utils/appError.js";

const ensurePostExists = async (postId) => {
  const post = await findPostById(postId);

  if (!post) {
    throw new AppError("게시글을 찾을 수 없습니다.", 404);
  }

  return post;
};

const ensureCommentExists = async (commentId) => {
  const comment = await findCommentById(commentId);

  if (!comment) {
    throw new AppError("댓글을 찾을 수 없습니다.", 404);
  }

  return comment;
};

const ensureOwnerOrAdmin = (comment, user) => {
  if (comment.user_id !== user.id && user.role !== "ADMIN") {
    throw new AppError("본인이 작성한 댓글만 수정하거나 삭제할 수 있습니다.", 403);
  }
};

// 게시글 댓글 목록
export const getComments = async ({ postId, page, limit }) => {
  await ensurePostExists(postId);

  const offset = (page - 1) * limit;

  const [comments, total] = await Promise.all([
    findCommentsByPostId({
      postId,
      offset,
      limit,
    }),
    countCommentsByPostId(postId),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    comments,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages,
    },
  };
};

// 댓글 및 답글 작성
export const addComment = async ({ postId, userId, content, parentCommentId = null }) => {
  await ensurePostExists(postId);

  if (parentCommentId) {
    const parentComment = await ensureCommentExists(parentCommentId);

    // 다른 게시글의 댓글에는 답글을 작성할 수 없음
    if (parentComment.post_id !== postId) {
      throw new AppError("현재 게시글에 속한 댓글에만 답글을 작성할 수 있습니다.", 400);
    }

    // 답글에는 다시 답글을 작성할 수 없음
    if (parentComment.parent_comment_id !== null) {
      throw new AppError("답글에는 다시 답글을 작성할 수 없습니다.", 400);
    }
  }

  return await createComment({
    postId,
    userId,
    content,
    parentCommentId,
  });
};

// 댓글 수정
export const editComment = async ({ commentId, content, user }) => {
  const comment = await ensureCommentExists(commentId);

  ensureOwnerOrAdmin(comment, user);

  return await updateComment({
    commentId,
    content,
  });
};

// 댓글 삭제
export const removeComment = async ({ commentId, user }) => {
  const comment = await ensureCommentExists(commentId);

  ensureOwnerOrAdmin(comment, user);

  await deleteComment(commentId);

  return {
    id: commentId,
  };
};
