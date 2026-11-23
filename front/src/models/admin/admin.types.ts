import type { Post } from "@/models/post/post.types";
import type { Comment } from "@/models/comment/comment.types";

export type AdminRole = "USER" | "ADMIN";
export type AdminStatus = "ACTIVE" | "SUSPENDED";

export interface AdminUser {
  id: string;
  email: string;
  nickname: string;
  role: AdminRole;
  status: AdminStatus;
  created_at: string;
  updated_at: string;
}

export interface AdminUserDetail extends AdminUser {
  post_count: number;
  comment_count: number;
}

export interface AdminPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface AdminUserListData {
  users: AdminUser[];
  pagination: AdminPagination;
}

export interface AdminPostListData {
  posts: Post[];
  pagination: AdminPagination;
}

export interface AdminCommentListData {
  comments: Comment[];
  pagination: AdminPagination;
}

export interface AdminListParams {
  search?: string;
  page?: number;
  limit?: number;
}

export interface AdminUserListParams extends AdminListParams {
  role?: AdminRole | "";
  status?: AdminStatus | "";
}

export interface AdminUserResponseData {
  user: AdminUser;
}

export interface AdminDeleteResponseData {
  id: string;
}

export interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
}
