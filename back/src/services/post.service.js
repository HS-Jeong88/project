import {
  findPosts,
  findPostById,
  createPost,
  updatePost,
  findPostOwner,
  deletePost,
} from "../repositories/post.repository.js";

import AppError from "../utils/appError.js";

// 게시글 목록
export const getPostList = async (query) => {
  const result = await findPosts(query);

  const totalPages = Math.ceil(result.total / query.limit);

  return {
    posts: result.posts,
    pagination: {
      page: query.page,
      limit: query.limit,
      total: result.total,
      totalPages,
      hasPreviousPage: query.page > 1,
      hasNextPage: query.page < totalPages,
    },
  };
};

// 게시글 상세
export const getPostDetail = async (postId) => {
  const post = await findPostById(postId);

  if (!post) {
    throw new AppError("게시글을 찾을 수 없습니다.", 404);
  }

  return post;
};

// 게시글 작성
export const writePost = async ({ userId, title, content }) => {
  return await createPost({
    userId,
    title,
    content,
  });
};

// 게시글 수정
export const editPost = async ({ postId, userId, role, title, content }) => {
  const updatedPost = await updatePost({
    postId,
    userId,
    role,
    title,
    content,
  });

  if (updatedPost) {
    return updatedPost;
  }

  const existingPost = await findPostOwner(postId);

  if (!existingPost) {
    throw new AppError("게시글을 찾을 수 없습니다.", 404);
  }

  throw new AppError("본인이 작성한 게시글만 수정할 수 있습니다.", 403);
};

// 게시글 삭제
export const removePost = async ({ postId, userId, role }) => {
  const deletedPost = await deletePost({
    postId,
    userId,
    role,
  });

  if (deletedPost) {
    return deletedPost;
  }

  const existingPost = await findPostOwner(postId);

  if (!existingPost) {
    throw new AppError("게시글을 찾을 수 없습니다.", 404);
  }

  throw new AppError("본인이 작성한 게시글만 삭제할 수 있습니다.", 403);
};
