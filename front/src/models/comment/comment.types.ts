export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  parent_comment_id: string | null;
  content: string;
  author_nickname: string;
  created_at: string;
  updated_at: string;
  replies?: Comment[];
}

export interface CommentPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface CommentListData {
  comments: Comment[];
  pagination: CommentPagination;
}

export interface CommentInput {
  content: string;
  parentCommentId?: string | null;
}

export interface CommentResponseData {
  comment: Comment;
}

export interface CommentDeleteData {
  id: string;
}

export interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
}
