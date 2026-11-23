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

export async function getPosts(params: PostListParams = {}): Promise<PostListData> {
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
}

export async function getPost(postId: string): Promise<Post> {
  const response = await apiClient.get<ApiEnvelope<PostResponseData>>(
    `/posts/${encodeURIComponent(postId)}`,
    {
      auth: false,
    },
  );

  return response.data.post;
}

export async function createPost(input: PostInput): Promise<Post> {
  const response = await apiClient.post<ApiEnvelope<PostResponseData>>("/posts", input);

  return response.data.post;
}

export async function updatePost(postId: string, input: Partial<PostInput>): Promise<Post> {
  const response = await apiClient.patch<ApiEnvelope<PostResponseData>>(
    `/posts/${encodeURIComponent(postId)}`,
    input,
  );

  return response.data.post;
}

export async function deletePost(postId: string): Promise<string> {
  const response = await apiClient.delete<ApiEnvelope<PostDeleteData>>(
    `/posts/${encodeURIComponent(postId)}`,
  );

  return response.data.id;
}
