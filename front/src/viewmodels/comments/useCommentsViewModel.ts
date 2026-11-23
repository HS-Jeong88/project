"use client";

import { useCallback, useEffect, useState } from "react";

import {
  createComment,
  deleteComment,
  getComments,
  updateComment,
} from "@/models/comment/comment.model";

import type { Comment, CommentPagination } from "@/models/comment/comment.types";

export function useCommentsViewModel(postId: string) {
  const [comments, setComments] = useState<Comment[]>([]);

  const [pagination, setPagination] = useState<CommentPagination | null>(null);

  const [content, setContent] = useState("");
  const [replyContent, setReplyContent] = useState("");

  const [replyParentId, setReplyParentId] = useState<string | null>(null);

  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  // 최초 댓글 목록 조회
  useEffect(() => {
    if (!postId) return;

    let cancelled = false;

    async function fetchComments() {
      try {
        const result = await getComments(postId, 1, 10);

        if (cancelled) return;

        setComments(result.comments);
        setPagination(result.pagination);
        setPage(1);
        setError("");
      } catch (error) {
        if (cancelled) return;

        setError(error instanceof Error ? error.message : "댓글을 불러오지 못했습니다.");
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
  }, [postId]);

  // 댓글 목록 조회
  const loadComments = useCallback(
    async (nextPage = page) => {
      if (!postId) return;

      setLoading(true);
      setError("");

      try {
        const result = await getComments(postId, nextPage, 10);

        setComments(result.comments);
        setPagination(result.pagination);
        setPage(nextPage);

        return true;
      } catch (error) {
        setError(error instanceof Error ? error.message : "댓글을 불러오지 못했습니다.");

        return false;
      } finally {
        setLoading(false);
      }
    },
    [postId, page],
  );

  // 일반 댓글 작성
  const submitComment = useCallback(async () => {
    const trimmedContent = content.trim();

    if (!trimmedContent) {
      setError("댓글 내용을 입력해 주세요.");
      return false;
    }

    if (trimmedContent.length > 2000) {
      setError("댓글은 2,000자 이내로 입력해 주세요.");
      return false;
    }

    setSubmitting(true);
    setError("");

    try {
      await createComment(postId, {
        content: trimmedContent,
      });

      setContent("");

      // 최신 댓글이 위에 표시되므로 첫 페이지로 이동
      await loadComments(1);

      return true;
    } catch (error) {
      setError(error instanceof Error ? error.message : "댓글 작성에 실패했습니다.");

      return false;
    } finally {
      setSubmitting(false);
    }
  }, [postId, content, loadComments]);

  // 답글 작성 시작
  const startReply = useCallback((parentCommentId: string) => {
    setReplyParentId(parentCommentId);
    setReplyContent("");
    setError("");
  }, []);

  // 답글 작성 취소
  const cancelReply = useCallback(() => {
    setReplyParentId(null);
    setReplyContent("");
    setError("");
  }, []);

  // 답글 작성
  const submitReply = useCallback(async () => {
    const trimmedContent = replyContent.trim();

    if (!replyParentId) {
      setError("답글을 작성할 댓글을 선택해 주세요.");
      return false;
    }

    if (!trimmedContent) {
      setError("답글 내용을 입력해 주세요.");
      return false;
    }

    if (trimmedContent.length > 2000) {
      setError("답글은 2,000자 이내로 입력해 주세요.");
      return false;
    }

    setSubmitting(true);
    setError("");

    try {
      await createComment(postId, {
        content: trimmedContent,
        parentCommentId: replyParentId,
      });

      setReplyContent("");
      setReplyParentId(null);

      await loadComments();

      return true;
    } catch (error) {
      setError(error instanceof Error ? error.message : "답글 작성에 실패했습니다.");

      return false;
    } finally {
      setSubmitting(false);
    }
  }, [postId, replyContent, replyParentId, loadComments]);

  // 댓글 및 답글 수정
  const editComment = useCallback(
    async (commentId: string, nextContent: string) => {
      const trimmedContent = nextContent.trim();

      if (!trimmedContent) {
        setError("댓글 내용을 입력해 주세요.");
        return false;
      }

      if (trimmedContent.length > 2000) {
        setError("댓글은 2,000자 이내로 입력해 주세요.");
        return false;
      }

      setSubmitting(true);
      setError("");

      try {
        await updateComment(commentId, {
          content: trimmedContent,
        });

        await loadComments();

        return true;
      } catch (error) {
        setError(error instanceof Error ? error.message : "댓글 수정에 실패했습니다.");

        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [loadComments],
  );

  // 댓글 및 답글 삭제
  const removeComment = useCallback(
    async (commentId: string) => {
      const confirmed = window.confirm(
        "이 댓글을 삭제하시겠습니까?\n부모 댓글을 삭제하면 답글도 함께 삭제됩니다.",
      );

      if (!confirmed) return false;

      setSubmitting(true);
      setError("");

      try {
        await deleteComment(commentId);

        const currentPage = pagination?.page ?? 1;

        const nextPage = comments.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;

        await loadComments(nextPage);

        return true;
      } catch (error) {
        setError(error instanceof Error ? error.message : "댓글 삭제에 실패했습니다.");

        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [pagination, comments, loadComments],
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

    content,
    setContent,

    replyContent,
    setReplyContent,
    replyParentId,

    page,
    loading,
    submitting,
    error,

    submitComment,
    startReply,
    cancelReply,
    submitReply,

    editComment,
    removeComment,
    changePage,

    reload: loadComments,
  };
}
