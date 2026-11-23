"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import MainLayout from "@/components/layout/MainLayout";
import CommentsSection from "@/components/comments/CommentsSection";

import { useAuth } from "@/providers/AuthProvider";
import { usePostDetailViewModel } from "@/viewmodels/posts/usePostDetailViewModel";

export default function PostDetailPage() {
  const params = useParams<{ postId: string }>();
  const router = useRouter();

  const postId = params.postId;

  const { user } = useAuth();

  const { post, loading, error, removePost } = usePostDetailViewModel(postId);

  const currentUserId = String(user?.id ?? user?.userId ?? "");

  const isOwner = Boolean(post) && currentUserId !== "" && currentUserId === String(post?.user_id);

  const isAdmin = user?.role === "ADMIN";

  const canManage = isOwner || isAdmin;

  const handleDelete = async () => {
    const success = await removePost();

    if (success) {
      router.push("/posts");
    }
  };

  return (
    <MainLayout>
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <Link
            href="/posts"
            className="text-sm font-semibold text-slate-500 transition hover:text-blue-600"
          >
            ← 게시글 목록으로
          </Link>
        </div>

        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white py-20 text-center text-slate-500">
            게시글을 불러오는 중입니다.
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-white p-8 text-center">
            <p className="text-sm text-red-600">{error}</p>

            <Link
              href="/posts"
              className="mt-5 inline-block rounded-lg bg-slate-800 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-700"
            >
              목록으로 돌아가기
            </Link>
          </div>
        ) : !post ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            게시글을 찾을 수 없습니다.
          </div>
        ) : (
          <>
            <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
              <header className="border-b border-slate-200 pb-6">
                <h1 className="break-words text-2xl font-bold leading-relaxed text-slate-900 md:text-3xl">
                  {post.title}
                </h1>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                    <span className="font-semibold text-slate-700">{post.author_nickname}</span>

                    <span>{new Date(post.created_at).toLocaleString("ko-KR")}</span>

                    <span>조회 {post.view_count}</span>
                  </div>

                  {canManage && (
                    <div className="flex gap-2">
                      <Link
                        href={`/posts/${post.id}/edit`}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                      >
                        수정
                      </Link>

                      <button
                        type="button"
                        onClick={handleDelete}
                        className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                      >
                        삭제
                      </button>
                    </div>
                  )}
                </div>
              </header>

              <div className="min-h-64 whitespace-pre-wrap break-words py-8 text-sm leading-8 text-slate-700">
                {post.content}
              </div>

              <footer className="border-t border-slate-200 pt-5">
                <Link
                  href="/posts"
                  className="inline-flex rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  목록
                </Link>
              </footer>
            </article>

            <CommentsSection postId={post.id} />
          </>
        )}
      </div>
    </MainLayout>
  );
}
