"use client";

import { useAdminUsersViewModel } from "@/viewmodels/admin/useAdminViewModel";

import type { AdminRole, AdminStatus } from "@/models/admin/admin.types";

export default function AdminUsersSection() {
  const {
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
  } = useAdminUsersViewModel();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    searchUsers();
  };

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900">회원 관리</h2>
        <p className="mt-1 text-sm text-slate-500">회원의 권한과 계정 상태를 관리합니다.</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-4"
      >
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="이메일 또는 닉네임 검색"
          className="min-w-48 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
        />

        <select
          value={role}
          onChange={(event) => setRole(event.target.value as AdminRole | "")}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">전체 권한</option>
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
        </select>

        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as AdminStatus | "")}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">전체 상태</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="SUSPENDED">SUSPENDED</option>
        </select>

        <button
          type="submit"
          className="rounded-lg bg-slate-800 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-700"
        >
          검색
        </button>
      </form>

      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[850px] text-left text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="px-4 py-4">회원 정보</th>
              <th className="px-4 py-4">가입일</th>
              <th className="px-4 py-4">권한</th>
              <th className="px-4 py-4">계정 상태</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-slate-500">
                  회원 목록을 불러오는 중입니다.
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-slate-500">
                  검색 결과가 없습니다.
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const isUpdating = updatingUserId === user.id;

                return (
                  <tr key={user.id}>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-slate-800">{user.nickname}</p>
                      <p className="mt-1 text-xs text-slate-500">{user.email}</p>
                    </td>

                    <td className="px-4 py-4 text-slate-500">
                      {new Date(user.created_at).toLocaleDateString("ko-KR")}
                    </td>

                    <td className="px-4 py-4">
                      <select
                        value={user.role}
                        disabled={isUpdating}
                        onChange={(event) =>
                          void changeRole(user.id, event.target.value as AdminRole)
                        }
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs disabled:opacity-50"
                      >
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>

                    <td className="px-4 py-4">
                      <select
                        value={user.status}
                        disabled={isUpdating}
                        onChange={(event) =>
                          void changeStatus(user.id, event.target.value as AdminStatus)
                        }
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs disabled:opacity-50"
                      >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="SUSPENDED">SUSPENDED</option>
                      </select>

                      {isUpdating && <span className="ml-2 text-xs text-slate-400">처리 중</span>}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">전체 {pagination.total}명</p>

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
}
