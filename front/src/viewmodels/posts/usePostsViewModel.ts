"use client";

import { useCallback, useEffect, useState } from "react";

import { deletePost, getPosts } from "@/models/post/post.model";

import type { Post, PostListParams, PostPagination } from "@/models/post/post.types";

export const usePostsViewModel = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [pagination, setPagination] = useState<PostPagination | null>(null);

  const [keyword, setKeyword] = useState("");
  const [searchType, setSearchType] = useState<PostListParams["searchType"]>("all");

  const [sortBy, setSortBy] = useState<PostListParams["sortBy"]>("created_at");

  const [order, setOrder] = useState<PostListParams["order"]>("desc");

  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 최초 데이터 요청
  useEffect(() => {
    let cancelled = false;

    const fetchInitialPosts = async () => {
      try {
        const result = await getPosts({
          page: 1,
          limit: 10,
          keyword: "",
          searchType: "all",
          sortBy: "created_at",
          order: "desc",
        });

        if (cancelled) return;

        setPosts(result.posts);
        setPagination(result.pagination);
      } catch (error) {
        if (cancelled) return;

        setError(error instanceof Error ? error.message : "게시글을 불러오지 못했습니다.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void fetchInitialPosts();

    return () => {
      cancelled = true;
    };
  }, []);

  // 검색, 정렬, 페이지 변경 등에 사용하는 요청 함수
  const loadPosts = useCallback(
    async (overrides: Partial<PostListParams> = {}) => {
      setLoading(true);
      setError("");

      const params: PostListParams = {
        page,
        limit: 10,
        keyword,
        searchType,
        sortBy,
        order,
        ...overrides,
      };

      try {
        const result = await getPosts(params);

        setPosts(result.posts);
        setPagination(result.pagination);

        if (overrides.page !== undefined) {
          setPage(overrides.page);
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : "게시글을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    },
    [page, keyword, searchType, sortBy, order],
  );

  const search = useCallback(() => {
    void loadPosts({ page: 1 });
  }, [loadPosts]);

  const changePage = useCallback(
    (nextPage: number) => {
      if (!pagination || nextPage < 1 || nextPage > pagination.totalPages) {
        return;
      }

      void loadPosts({ page: nextPage });
    },
    [pagination, loadPosts],
  );

  const changeSort = useCallback(
    (nextSortBy: PostListParams["sortBy"], nextOrder: PostListParams["order"]) => {
      setSortBy(nextSortBy);
      setOrder(nextOrder);

      void loadPosts({
        page: 1,
        sortBy: nextSortBy,
        order: nextOrder,
      });
    },
    [loadPosts],
  );

  const removePost = useCallback(
    async (postId: string) => {
      const confirmed = window.confirm("정말 이 게시글을 삭제하시겠습니까?");

      if (!confirmed) {
        return false;
      }

      try {
        await deletePost(postId);

        const currentPage = pagination?.page ?? 1;
        const nextPage = posts.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;

        await loadPosts({ page: nextPage });

        return true;
      } catch (error) {
        setError(error instanceof Error ? error.message : "게시글 삭제에 실패했습니다.");

        return false;
      }
    },
    [pagination, posts, loadPosts],
  );

  return {
    posts,
    pagination,
    keyword,
    setKeyword,
    searchType,
    setSearchType,
    sortBy,
    order,
    loading,
    error,
    search,
    changePage,
    changeSort,
    removePost,
    reload: loadPosts,
  };
}
