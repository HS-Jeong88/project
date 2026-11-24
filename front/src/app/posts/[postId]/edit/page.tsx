"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

import MainLayout from "@/components/layout/MainLayout";
import { useAuth } from "@/providers/AuthProvider";
import { usePostDetailViewModel } from "@/viewmodels/posts/usePostDetailViewModel";
import { usePostEditorViewModel } from "@/viewmodels/posts/usePostEditorViewModel";

const PostEditPage = () => {
  const params = useParams<{ postId: string }>();
  const router = useRouter();

  const { user, isLoading: authLoading } = useAuth();

  const { post, loading: postLoading, error: postError } = usePostDetailViewModel(params.postId);

  const { title, setTitle, content, setContent, loading, initialLoading, error, submit } =
    usePostEditorViewModel(params.postId);

  const canManage = Boolean(
    post &&
    user &&
    (String(user.id ?? user.userId) === String(post.user_id) ||
      user.role?.toUpperCase() === "ADMIN"),
  );

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!authLoading && user && post && !canManage) {
      router.replace(`/posts/${post.id}`);
    }
  }, [authLoading, user, post, canManage, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const updatedPost = await submit();

    if (updatedPost) {
      router.push(`/posts/${updatedPost.id}`);
      router.refresh();
    }
  };

  if (authLoading || postLoading || initialLoading || !user || !post || !canManage) {
    return (
      <MainLayout>
        <div className="py-20 text-center text-sm text-slate-400">
          {postError || "게시글 정보를 확인하고 있습니다..."}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mx-auto max-w-4xl">
        <div className="mb-7">
          <Link
            href={`/posts/${post.id}`}
            className="text-sm font-semibold text-slate-500 hover:text-blue-600"
          >
            ← 게시글 상세
          </Link>

          <h1 className="mt-5 text-3xl font-extrabold text-slate-900">게시글 수정</h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 sm:p-8"
        >
          <div>
            <label htmlFor="title" className="mb-2 block text-sm font-bold text-slate-700">
              제목
            </label>

            <input
              id="title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={200}
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <p className="mt-2 text-right text-xs text-slate-400">{title.length}/200</p>
          </div>

          <div>
            <label htmlFor="content" className="mb-2 block text-sm font-bold text-slate-700">
              내용
            </label>

            <textarea
              id="content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              maxLength={50000}
              required
              rows={14}
              className="w-full resize-y rounded-lg border border-slate-300 px-4 py-3 text-sm leading-7 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <p className="mt-2 text-right text-xs text-slate-400">{content.length}/50,000</p>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
          )}

          <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
            <Link
              href={`/posts/${post.id}`}
              className="rounded-lg border border-slate-200 px-5 py-3 text-center text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              취소
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "수정 중..." : "수정 완료"}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

export default PostEditPage;
