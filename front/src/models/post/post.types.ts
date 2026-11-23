export interface Post {
  id: string;
  user_id: string;
  title: string;
  content: string;
  view_count: number;
  author_nickname: string;
  created_at: string;
  updated_at: string;
}

export interface PostPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface PostListData {
  posts: Post[];
  pagination: PostPagination;
}

export interface PostListParams {
  page?: number;
  limit?: number;
  keyword?: string;
  searchType?: "all" | "title" | "content";
  sortBy?: "created_at" | "view_count" | "title";
  order?: "asc" | "desc";
}

export interface PostInput {
  title: string;
  content: string;
}

export interface PostResponseData {
  post: Post;
}

export interface PostDeleteData {
  id: string;
}

export interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
}
