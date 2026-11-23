import { apiClient } from "@/lib/api/apiClient";

import type {
  AdminCommentListData,
  AdminDeleteResponseData,
  AdminListParams,
  AdminPagination,
  AdminPostListData,
  AdminRole,
  AdminStatus,
  AdminUser,
  AdminUserListData,
  AdminUserListParams,
  AdminUserResponseData,
  ApiEnvelope,
} from "./admin.types";

function createSearchParams(params: AdminListParams): URLSearchParams {
  const searchParams = new URLSearchParams();

  searchParams.set("page", String(params.page ?? 1));
  searchParams.set("limit", String(params.limit ?? 10));

  if (params.search?.trim()) {
    searchParams.set("search", params.search.trim());
  }

  return searchParams;
}

// 회원 목록 조회
export async function getAdminUsers(params: AdminUserListParams = {}): Promise<AdminUserListData> {
  const searchParams = createSearchParams(params);

  if (params.role) {
    searchParams.set("role", params.role);
  }

  if (params.status) {
    searchParams.set("status", params.status);
  }

  const response = await apiClient.get<ApiEnvelope<AdminUserListData>>(
    `/admin/users?${searchParams.toString()}`,
  );

  return response.data;
}

// 회원 역할 변경
export async function updateAdminUserRole(userId: string, role: AdminRole): Promise<AdminUser> {
  const response = await apiClient.patch<ApiEnvelope<AdminUserResponseData>>(
    `/admin/users/${encodeURIComponent(userId)}/role`,
    { role },
  );

  return response.data.user;
}

// 회원 상태 변경
export async function updateAdminUserStatus(
  userId: string,
  status: AdminStatus,
): Promise<AdminUser> {
  const response = await apiClient.patch<ApiEnvelope<AdminUserResponseData>>(
    `/admin/users/${encodeURIComponent(userId)}/status`,
    { status },
  );

  return response.data.user;
}

// 관리자 게시글 목록 조회
export async function getAdminPosts(params: AdminListParams = {}): Promise<AdminPostListData> {
  const searchParams = createSearchParams(params);

  const response = await apiClient.get<ApiEnvelope<AdminPostListData>>(
    `/admin/posts?${searchParams.toString()}`,
  );

  return response.data;
}

// 관리자 게시글 삭제
export async function deleteAdminPost(postId: string): Promise<string> {
  const response = await apiClient.delete<ApiEnvelope<AdminDeleteResponseData>>(
    `/admin/posts/${encodeURIComponent(postId)}`,
  );

  return response.data.id;
}

// 관리자 댓글 목록 조회
export async function getAdminComments(
  params: AdminListParams = {},
): Promise<AdminCommentListData> {
  const searchParams = createSearchParams(params);

  const response = await apiClient.get<ApiEnvelope<AdminCommentListData>>(
    `/admin/comments?${searchParams.toString()}`,
  );

  return response.data;
}

// 관리자 댓글 삭제
export async function deleteAdminComment(commentId: string): Promise<string> {
  const response = await apiClient.delete<ApiEnvelope<AdminDeleteResponseData>>(
    `/admin/comments/${encodeURIComponent(commentId)}`,
  );

  return response.data.id;
}
