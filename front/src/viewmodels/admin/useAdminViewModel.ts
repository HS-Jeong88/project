"use client";

import { useCallback, useEffect, useState } from "react";

import {
  deleteAdminComment,
  deleteAdminPost,
  getAdminComments,
  getAdminPosts,
  getAdminUsers,
  updateAdminUserRole,
  updateAdminUserStatus,
} from "@/models/admin/admin.model";

import type {
  AdminCommentListData,
  AdminPagination,
  AdminPostListData,
  AdminRole,
  AdminStatus,
  AdminUser,
  AdminUserListParams,
} from "@/models/admin/admin.types";

import type { Post } from "@/models/post/post.types";
import type { Comment } from "@/models/comment/comment.types";

// 회원 관리 ViewModel
export function useAdminUsersViewModel() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState<AdminPagination | null>(null);

  const [search, setSearch] = useState("");
  const [role, setRole] = useState<AdminRole | "">("");
  const [status, setStatus] = useState<AdminStatus | "">("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  // 최초 회원 목록 조회
  useEffect(() => {
    let cancelled = false;

    async function fetchUsers() {
      try {
        const result = await getAdminUsers({
          page: 1,
          limit: 10,
        });

        if (cancelled) return;

        setUsers(result.users);
        setPagination(result.pagination);
      } catch (error) {
        if (cancelled) return;

        setError(error instanceof Error ? error.message : "회원 목록을 불러오지 못했습니다.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchUsers();

    return () => {
      cancelled = true;
    };
  }, []);

  // 회원 목록 조회
  const loadUsers = useCallback(
    async (nextPage = 1, filters?: AdminUserListParams) => {
      setLoading(true);
      setError("");

      try {
        const result = await getAdminUsers({
          search: filters?.search ?? search,
          role: filters?.role ?? role,
          status: filters?.status ?? status,
          page: nextPage,
          limit: 10,
        });

        setUsers(result.users);
        setPagination(result.pagination);
      } catch (error) {
        setError(error instanceof Error ? error.message : "회원 목록을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    },
    [search, role, status],
  );

  const searchUsers = useCallback(() => {
    void loadUsers(1);
  }, [loadUsers]);

  // 회원 권한 변경
  const changeRole = useCallback(async (userId: string, nextRole: AdminRole) => {
    setUpdatingUserId(userId);
    setError("");

    try {
      const updatedUser = await updateAdminUserRole(userId, nextRole);

      setUsers((current) => current.map((user) => (user.id === userId ? updatedUser : user)));

      return true;
    } catch (error) {
      setError(error instanceof Error ? error.message : "회원 권한 변경에 실패했습니다.");

      return false;
    } finally {
      setUpdatingUserId(null);
    }
  }, []);

  // 회원 상태 변경
  const changeStatus = useCallback(async (userId: string, nextStatus: AdminStatus) => {
    setUpdatingUserId(userId);
    setError("");

    try {
      const updatedUser = await updateAdminUserStatus(userId, nextStatus);

      setUsers((current) => current.map((user) => (user.id === userId ? updatedUser : user)));

      return true;
    } catch (error) {
      setError(error instanceof Error ? error.message : "회원 상태 변경에 실패했습니다.");

      return false;
    } finally {
      setUpdatingUserId(null);
    }
  }, []);

  // 페이지 이동
  const changePage = useCallback(
    (nextPage: number) => {
      if (!pagination || nextPage < 1 || nextPage > pagination.totalPages) {
        return;
      }

      void loadUsers(nextPage);
    },
    [pagination, loadUsers],
  );

  return {
    users,
    pagination,
    search,
    setSearch,
    role,
    setRole,
    status,
    setStatus,
    loading,
    error,
    updatingUserId,
    searchUsers,
    changeRole,
    changeStatus,
    changePage,
  };
}

// 관리자 게시글 관리 ViewModel
export function useAdminPostsViewModel() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [pagination, setPagination] = useState<AdminPagination | null>(null);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 최초 게시글 목록 조회
  useEffect(() => {
    let cancelled = false;

    async function fetchPosts() {
      try {
        const result: AdminPostListData = await getAdminPosts({
          page: 1,
          limit: 10,
        });

        if (cancelled) return;

        setPosts(result.posts);
        setPagination(result.pagination);
      } catch (error) {
        if (cancelled) return;

        setError(error instanceof Error ? error.message : "게시글 목록을 불러오지 못했습니다.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchPosts();

    return () => {
      cancelled = true;
    };
  }, []);

  // 게시글 목록 조회
  const loadPosts = useCallback(
    async (nextPage = 1) => {
      setLoading(true);
      setError("");

      try {
        const result: AdminPostListData = await getAdminPosts({
          search,
          page: nextPage,
          limit: 10,
        });

        setPosts(result.posts);
        setPagination(result.pagination);
      } catch (error) {
        setError(error instanceof Error ? error.message : "게시글 목록을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    },
    [search],
  );

  const searchPosts = useCallback(() => {
    void loadPosts(1);
  }, [loadPosts]);

  // 게시글 삭제
  const removePost = useCallback(
    async (postId: string) => {
      if (!window.confirm("이 게시글을 삭제하시겠습니까?")) {
        return false;
      }

      setError("");

      try {
        await deleteAdminPost(postId);

        const currentPage = pagination?.page ?? 1;

        const nextPage = posts.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;

        await loadPosts(nextPage);

        return true;
      } catch (error) {
        setError(error instanceof Error ? error.message : "게시글 삭제에 실패했습니다.");

        return false;
      }
    },
    [posts, pagination, loadPosts],
  );

  // 페이지 이동
  const changePage = useCallback(
    (nextPage: number) => {
      if (!pagination || nextPage < 1 || nextPage > pagination.totalPages) {
        return;
      }

      void loadPosts(nextPage);
    },
    [pagination, loadPosts],
  );

  return {
    posts,
    pagination,
    search,
    setSearch,
    loading,
    error,
    searchPosts,
    removePost,
    changePage,
  };
}

// 관리자 댓글 관리 ViewModel
export function useAdminCommentsViewModel() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [pagination, setPagination] = useState<AdminPagination | null>(null);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 최초 댓글 목록 조회
  useEffect(() => {
    let cancelled = false;

    async function fetchComments() {
      try {
        const result: AdminCommentListData = await getAdminComments({
          page: 1,
          limit: 10,
        });

        if (cancelled) return;

        setComments(result.comments);
        setPagination(result.pagination);
      } catch (error) {
        if (cancelled) return;

        setError(error instanceof Error ? error.message : "댓글 목록을 불러오지 못했습니다.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchComments();

    return () => {
      cancelled = true;
    };
  }, []);

  // 댓글 목록 조회
  const loadComments = useCallback(
    async (nextPage = 1) => {
      setLoading(true);
      setError("");

      try {
        const result: AdminCommentListData = await getAdminComments({
          search,
          page: nextPage,
          limit: 10,
        });

        setComments(result.comments);
        setPagination(result.pagination);
      } catch (error) {
        setError(error instanceof Error ? error.message : "댓글 목록을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    },
    [search],
  );

  const searchComments = useCallback(() => {
    void loadComments(1);
  }, [loadComments]);

  // 댓글 삭제
  const removeComment = useCallback(
    async (commentId: string) => {
      if (!window.confirm("이 댓글을 삭제하시겠습니까?")) {
        return false;
      }

      setError("");

      try {
        await deleteAdminComment(commentId);

        const currentPage = pagination?.page ?? 1;

        const nextPage = comments.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;

        await loadComments(nextPage);

        return true;
      } catch (error) {
        setError(error instanceof Error ? error.message : "댓글 삭제에 실패했습니다.");

        return false;
      }
    },
    [comments, pagination, loadComments],
  );

  // 페이지 이동
  const changePage = useCallback(
    (nextPage: number) => {
      if (!pagination || nextPage < 1 || nextPage > pagination.totalPages) {
        return;
      }

      void loadComments(nextPage);
    },
    [pagination, loadComments],
  );

  return {
    comments,
    pagination,
    search,
    setSearch,
    loading,
    error,
    searchComments,
    removeComment,
    changePage,
  };
}
