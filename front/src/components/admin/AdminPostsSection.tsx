"use client";

import Link from "next/link";
import { type SubmitEvent, type ChangeEvent } from "react";

import { useAdminPostsViewModel } from "@/viewmodels/admin/useAdminViewModel";

const AdminPostsSection = () => {
  const {
    posts,
    pagination,
    search,
    setSearch,
    loading,
    error,
    searchPosts,
    removePost,
    changePage,
  } = useAdminPostsViewModel();

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    searchPosts();
  };

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900">게시글 관리</h2>
        <p className="mt-1 text-sm text-slate-500">전체 게시글을 조회하고 관리합니다.</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex gap-2 rounded-xl border border-slate-200 bg-white p-4"
      >
        <input
          type="text"
          value={search}
          onChange={(event: ChangeEvent<HTMLInputElement>) => setSearch(event.target.value)}
          placeholder="게시글 검색"
          className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
        />

        <button
          type="submit"
          className="rounded-lg bg-slate-800 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-700"
        >
          검색
        </button>
      </form>

      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-187.5 text-left text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="px-4 py-4">제목</th>
              <th className="px-4 py-4">작성자</th>
              <th className="px-4 py-4">조회수</th>
              <th className="px-4 py-4">작성일</th>
              <th className="px-4 py-4">관리</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                  게시글을 불러오는 중입니다.
                </td>
              </tr>
            ) : posts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                  검색 결과가 없습니다.
                </td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr key={post.id}>
                  <td className="max-w-xs px-4 py-4">
                    <Link
                      href={`/posts/${post.id}`}
                      className="line-clamp-2 font-semibold text-slate-800 hover:text-blue-600"
                    >
                      {post.title}
                    </Link>
                  </td>

                  <td className="px-4 py-4 text-slate-600">{post.author_nickname}</td>

                  <td className="px-4 py-4 text-slate-500">{post.view_count}</td>

                  <td className="px-4 py-4 text-slate-500">
                    {new Date(post.created_at).toLocaleDateString("ko-KR")}
                  </td>

                  <td className="px-4 py-4">
                    <button
                      type="button"
                      onClick={() => void removePost(post.id)}
                      className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">전체 {pagination.total}개</p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!pagination.hasPreviousPage || loading}
              onClick={() => changePage(pagination.page - 1)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:opacity-40"
            >
              이전
            </button>

            <span className="text-sm text-slate-600">
              {pagination.page} / {pagination.totalPages}
            </span>

            <button
              type="button"
              disabled={!pagination.hasNextPage || loading}
              onClick={() => changePage(pagination.page + 1)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:opacity-40"
            >
              다음
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default AdminPostsSection;
