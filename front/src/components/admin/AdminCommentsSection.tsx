"use client";

import { type SubmitEvent, type ChangeEvent } from "react";

import { useAdminCommentsViewModel } from "@/viewmodels/admin/useAdminViewModel";

const AdminCommentsSection = () => {
  const {
    comments,
    pagination,
    search,
    setSearch,
    loading,
    error,
    searchComments,
    removeComment,
    changePage,
  } = useAdminCommentsViewModel();

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    searchComments();
  };

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900">댓글 관리</h2>
        <p className="mt-1 text-sm text-slate-500">전체 댓글을 조회하고 관리합니다.</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex gap-2 rounded-xl border border-slate-200 bg-white p-4"
      >
        <input
          type="text"
          value={search}
          onChange={(event: ChangeEvent<HTMLInputElement>) => setSearch(event.target.value)}
          placeholder="댓글 내용 검색"
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
        <table className="w-full min-w-[750px] text-left text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="px-4 py-4">댓글 내용</th>
              <th className="px-4 py-4">작성자</th>
              <th className="px-4 py-4">작성일</th>
              <th className="px-4 py-4">관리</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-slate-500">
                  댓글을 불러오는 중입니다.
                </td>
              </tr>
            ) : comments.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-slate-500">
                  검색 결과가 없습니다.
                </td>
              </tr>
            ) : (
              comments.map((comment) => (
                <tr key={comment.id}>
                  <td className="max-w-md px-4 py-4">
                    <p className="line-clamp-2 whitespace-pre-wrap break-words text-slate-700">
                      {comment.content}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">게시글 ID: {comment.post_id}</p>
                  </td>

                  <td className="px-4 py-4 text-slate-600">{comment.author_nickname}</td>

                  <td className="px-4 py-4 text-slate-500">
                    {new Date(comment.created_at).toLocaleDateString("ko-KR")}
                  </td>

                  <td className="px-4 py-4">
                    <button
                      type="button"
                      onClick={() => void removeComment(comment.id)}
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

export default AdminCommentsSection;
