import { apiClient } from "@/lib/api/apiClient";

import type {
  ApiEnvelope,
  Post,
  PostDeleteData,
  PostInput,
  PostListData,
  PostListParams,
  PostResponseData,
} from "./post.types";

export const getPosts = async (params: PostListParams = {}): Promise<PostListData> => {
  const searchParams = new URLSearchParams();

  searchParams.set("page", String(params.page ?? 1));
  searchParams.set("limit", String(params.limit ?? 10));
  searchParams.set("sortBy", params.sortBy ?? "created_at");
  searchParams.set("order", params.order ?? "desc");
  searchParams.set("searchType", params.searchType ?? "all");

  if (params.keyword?.trim()) {
    searchParams.set("keyword", params.keyword.trim());
  }

  const response = await apiClient.get<ApiEnvelope<PostListData>>(
    `/posts?${searchParams.toString()}`,
    {
      auth: false,
    },
  );

  return response.data;
};

export const getPost = async (postId: string): Promise<Post> => {
  const response = await apiClient.get<ApiEnvelope<PostResponseData>>(
    `/posts/${encodeURIComponent(postId)}`,
    {
      auth: false,
    },
  );

  return response.data.post;
};

export const createPost = async (input: PostInput): Promise<Post> => {
  const response = await apiClient.post<ApiEnvelope<PostResponseData>>("/posts", input);

  return response.data.post;
};

export const updatePost = async (postId: string, input: Partial<PostInput>): Promise<Post> => {
  const response = await apiClient.patch<ApiEnvelope<PostResponseData>>(
    `/posts/${encodeURIComponent(postId)}`,
    input,
  );

  return response.data.post;
};

export const deletePost = async (postId: string): Promise<string> => {
  const response = await apiClient.delete<ApiEnvelope<PostDeleteData>>(
    `/posts/${encodeURIComponent(postId)}`,
  );

  return response.data.id;
};
