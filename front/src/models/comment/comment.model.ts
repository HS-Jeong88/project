import { apiClient } from "@/lib/api/apiClient";

import type {
  ApiEnvelope,
  Comment,
  CommentDeleteData,
  CommentInput,
  CommentListData,
  CommentResponseData,
} from "./comment.types";

// 댓글 목록 조회
export const getComments = async (postId: string, page = 1, limit = 10): Promise<CommentListData> => {
  const searchParams = new URLSearchParams();

  searchParams.set("page", String(page));
  searchParams.set("limit", String(limit));

  const response = await apiClient.get<ApiEnvelope<CommentListData>>(
    `/posts/${encodeURIComponent(postId)}/comments?${searchParams.toString()}`,
    { auth: false },
  );

  return response.data;
};

// 댓글 및 답글 작성
export const createComment = async (postId: string, input: CommentInput): Promise<Comment> => {
  const response = await apiClient.post<ApiEnvelope<CommentResponseData>>(
    `/posts/${encodeURIComponent(postId)}/comments`,
    input,
  );

  return response.data.comment;
};

// 댓글 및 답글 수정
export const updateComment = async (commentId: string, input: CommentInput): Promise<Comment> => {
  const response = await apiClient.patch<ApiEnvelope<CommentResponseData>>(
    `/comments/${encodeURIComponent(commentId)}`,
    input,
  );

  return response.data.comment;
};

// 댓글 및 답글 삭제
export const deleteComment = async (commentId: string): Promise<string> => {
  const response = await apiClient.delete<ApiEnvelope<CommentDeleteData>>(
    `/comments/${encodeURIComponent(commentId)}`,
  );

  return response.data.id;
};
