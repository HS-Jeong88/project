"use client";

import Link from "next/link";
import { type SubmitEvent, type ChangeEvent } from "react";

import MainLayout from "@/components/layout/MainLayout";
import { usePostsViewModel } from "@/viewmodels/posts/usePostsViewModel";
import { useAuth } from "@/providers/AuthProvider";

const formatDate = (date: string) => {
  return new Date(date).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const PostsPage = () => {
  const {
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
  } = usePostsViewModel();

  const { user, isLoading: authLoading } = useAuth();

  const canManage = (postUserId: string) => {
    if (!user) {
      return false;
    }

    return (
      String(user.id ?? user.userId) === String(postUserId) || user.role?.toUpperCase() === "ADMIN"
    );
  };

  const handleSearch = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    search();
  };

  return (
    <MainLayout>
      <div className="flex flex-col gap-6">
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="text-xs font-extrabold tracking-widest text-blue-600">BOARD</span>

            <h1 className="mt-3 text-3xl font-extrabold text-slate-900">게시글</h1>

            <p className="mt-2 text-sm text-slate-500">다양한 이야기를 공유해 보세요.</p>
          </div>

          <Link
            href="/posts/create"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
          >
            + 게시글 작성
          </Link>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
            <select
              value={searchType}
              onChange={(event: ChangeEvent<HTMLSelectElement>) => setSearchType(event.target.value as "all" | "title" | "content")}
              className="rounded-lg border border-slate-300 px-3 py-3 text-sm outline-none focus:border-blue-500"
            >
              <option value="all">전체</option>
              <option value="title">제목</option>
              <option value="content">내용</option>
            </select>

            <input
              value={keyword}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setKeyword(event.target.value)}
              placeholder="검색어를 입력하세요."
              maxLength={100}
              className="min-w-0 flex-1 rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
            />

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-slate-800 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-700 disabled:opacity-50"
            >
              검색
            </button>
          </form>
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="flex flex-col justify-between gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center">
            <div className="text-sm font-bold text-slate-800">
              게시글 목록
              {pagination && (
                <span className="ml-2 font-normal text-slate-400">총 {pagination.total}개</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <select
                value={`${sortBy}:${order}`}
                onChange={(event) => {
                  const [nextSort, nextOrder] = event.target.value.split(":");

                  changeSort(
                    nextSort as "created_at" | "view_count" | "title",
                    nextOrder as "asc" | "desc",
                  );
                }}
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none"
              >
                <option value="created_at:desc">최신순</option>
                <option value="created_at:asc">오래된순</option>
                <option value="view_count:desc">조회수 높은순</option>
                <option value="title:asc">제목 오름차순</option>
                <option value="title:desc">제목 내림차순</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center text-sm text-slate-400">
              게시글을 불러오는 중입니다...
            </div>
          ) : error ? (
            <div className="px-5 py-12 text-center text-sm text-red-600">{error}</div>
          ) : posts.length === 0 ? (
            <div className="py-20 text-center">
              <p className="font-semibold text-slate-700">게시글이 없습니다.</p>
              <p className="mt-2 text-sm text-slate-400">
                검색어를 변경하거나 새 게시글을 작성해 보세요.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {posts.map((post) => (
                <article key={post.id} className="px-5 py-5 transition hover:bg-slate-50">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row">
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/posts/${post.id}`}
                        className="break-words text-base font-bold text-slate-800 hover:text-blue-600"
                      >
                        {post.title}
                      </Link>

                      <p className="mt-2 line-clamp-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-500">
                        {post.content}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                        <span>{post.author_nickname}</span>

                        <span>{formatDate(post.created_at)}</span>

                        <span>조회 {post.view_count}</span>
                      </div>
                    </div>

                    {!authLoading && canManage(post.user_id) && (
                      <div className="flex shrink-0 items-center gap-2">
                        <Link
                          href={`/posts/${post.id}/edit`}
                          className="rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-white"
                        >
                          수정
                        </Link>

                        <button
                          type="button"
                          onClick={() => void removePost(post.id)}
                          className="rounded-md border border-red-100 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                        >
                          삭제
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}

          {pagination && pagination.totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-2 border-t border-slate-200 px-4 py-5">
              <button
                type="button"
                disabled={!pagination.hasPreviousPage || loading}
                onClick={() => changePage(pagination.page - 1)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:opacity-40"
              >
                이전
              </button>

              {Array.from({ length: pagination.totalPages }, (_, index) => index + 1).map(
                (pageNumber) => (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => changePage(pageNumber)}
                    disabled={loading}
                    className={`h-9 min-w-9 rounded-lg px-3 text-sm font-semibold ${
                      pagination.page === pageNumber
                        ? "bg-blue-600 text-white"
                        : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {pageNumber}
                  </button>
                ),
              )}

              <button
                type="button"
                disabled={!pagination.hasNextPage || loading}
                onClick={() => changePage(pagination.page + 1)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:opacity-40"
              >
                다음
              </button>
            </div>
          )}
        </section>
      </div>
    </MainLayout>
  );
};

export default PostsPage;
