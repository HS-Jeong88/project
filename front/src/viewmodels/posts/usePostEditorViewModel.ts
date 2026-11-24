"use client";

import { useCallback, useEffect, useState } from "react";

import { createPost, getPost, updatePost } from "@/models/post/post.model";

import type { PostInput } from "@/models/post/post.types";

export const usePostEditorViewModel = (postId?: string) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(Boolean(postId));
  const [error, setError] = useState("");

  const isEditMode = Boolean(postId);

  useEffect(() => {
    if (typeof postId !== "string" || postId.length === 0) {
      return;
    }

    const currentPostId: string = postId;

    let cancelled = false;

    const fetchPost = async (id: string): Promise<void> => {
      try {
        const post = await getPost(id);

        if (cancelled) return;

        setTitle(post.title);
        setContent(post.content);
      } catch (error) {
        if (cancelled) return;

        setError(error instanceof Error ? error.message : "게시글을 불러오지 못했습니다.");
      } finally {
        if (!cancelled) {
          setInitialLoading(false);
        }
      }
    };

    void fetchPost(currentPostId);

    return () => {
      cancelled = true;
    };
  }, [postId]);

  const submit = useCallback(async () => {
    setError("");

    const input: PostInput = {
      title: title.trim(),
      content: content.trim(),
    };

    if (!input.title || !input.content) {
      setError("제목과 내용을 모두 입력해 주세요.");
      return null;
    }

    if (input.title.length > 200) {
      setError("제목은 200자 이내로 입력해 주세요.");
      return null;
    }

    if (input.content.length > 50000) {
      setError("내용은 50,000자 이내로 입력해 주세요.");
      return null;
    }

    setLoading(true);

    try {
      if (postId) {
        return await updatePost(postId, input);
      }

      return await createPost(input);
    } catch (error) {
      setError(error instanceof Error ? error.message : "게시글 저장에 실패했습니다.");

      return null;
    } finally {
      setLoading(false);
    }
  }, [title, content, postId]);

  return {
    title,
    setTitle,
    content,
    setContent,
    loading,
    initialLoading,
    error,
    isEditMode,
    submit,
  };
}
