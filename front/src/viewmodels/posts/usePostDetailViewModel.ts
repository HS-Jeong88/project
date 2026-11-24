"use client";

import { useCallback, useEffect, useState } from "react";

import { deletePost, getPost } from "@/models/post/post.model";

import type { Post } from "@/models/post/post.types";

export const usePostDetailViewModel = (postId: string) => {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 최초 게시글 요청
  useEffect(() => {
    let cancelled = false;

    const fetchPost = async () => {
      if (!postId) {
        setError("게시글 번호가 올바르지 않습니다.");
        setLoading(false);
        return;
      }

      try {
        const result = await getPost(postId);

        if (cancelled) return;

        setPost(result);
      } catch (error) {
        if (cancelled) return;

        setError(error instanceof Error ? error.message : "게시글을 불러오지 못했습니다.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void fetchPost();

    return () => {
      cancelled = true;
    };
  }, [postId]);

  // 새로고침 요청
  const loadPost = useCallback(async () => {
    if (!postId) {
      setError("게시글 번호가 올바르지 않습니다.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await getPost(postId);
      setPost(result);
    } catch (error) {
      setError(error instanceof Error ? error.message : "게시글을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [postId]);

  const removePost = useCallback(async () => {
    if (!post) {
      return false;
    }

    if (!window.confirm("게시글을 삭제하시겠습니까?")) {
      return false;
    }

    try {
      await deletePost(post.id);
      return true;
    } catch (error) {
      setError(error instanceof Error ? error.message : "게시글 삭제에 실패했습니다.");

      return false;
    }
  }, [post]);

  return {
    post,
    loading,
    error,
    reload: loadPost,
    removePost,
  };
}
