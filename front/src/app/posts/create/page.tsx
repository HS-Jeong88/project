"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import MainLayout from "@/components/layout/MainLayout";
import { useAuth } from "@/providers/AuthProvider";
import { usePostEditorViewModel } from "@/viewmodels/posts/usePostEditorViewModel";

export default function PostCreatePage() {
  const router = useRouter();

  const { user, isLoading: authLoading } = useAuth();

  const { title, setTitle, content, setContent, loading, error, submit } = usePostEditorViewModel();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const post = await submit();

    if (post) {
      router.push(`/posts/${post.id}`);
      router.refresh();
    }
  };

  if (authLoading || !user) {
    return (
      <MainLayout>
        <div className="py-20 text-center text-sm text-slate-400">
          로그인 상태를 확인하고 있습니다...
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mx-auto max-w-4xl">
        <div className="mb-7">
          <Link href="/posts" className="text-sm font-semibold text-slate-500 hover:text-blue-600">
            ← 게시글 목록
          </Link>

          <h1 className="mt-5 text-3xl font-extrabold text-slate-900">게시글 작성</h1>

          <p className="mt-2 text-sm text-slate-500">다른 사용자와 공유할 내용을 작성해 주세요.</p>
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
              placeholder="제목을 입력하세요."
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
              placeholder="게시글 내용을 입력하세요."
              className="w-full resize-y rounded-lg border border-slate-300 px-4 py-3 text-sm leading-7 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <p className="mt-2 text-right text-xs text-slate-400">{content.length}/50,000</p>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
          )}

          <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
            <Link
              href="/posts"
              className="rounded-lg border border-slate-200 px-5 py-3 text-center text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              취소
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "등록 중..." : "게시글 등록"}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
