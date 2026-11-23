"use client";

import { useState } from "react";
import Link from "next/link";

import { useAuth } from "@/providers/AuthProvider";
import { useCommentsViewModel } from "@/viewmodels/comments/useCommentsViewModel";

import type { Comment } from "@/models/comment/comment.types";

interface CommentsSectionProps {
  postId: string;
}

export default function CommentsSection({ postId }: CommentsSectionProps) {
  const { user } = useAuth();

  const {
    comments,
    pagination,

    content,
    setContent,

    replyContent,
    setReplyContent,
    replyParentId,

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
  } = useCommentsViewModel(postId);

  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);

  const [editingContent, setEditingContent] = useState("");

  const currentUserId = String(user?.id ?? user?.userId ?? "");

  const isAdmin = user?.role === "ADMIN";

  // 댓글 수정 시작
  const handleEditStart = (commentId: string, commentContent: string) => {
    setEditingCommentId(commentId);
    setEditingContent(commentContent);
  };

  // 댓글 수정 취소
  const handleEditCancel = () => {
    setEditingCommentId(null);
    setEditingContent("");
  };

  // 댓글 수정 완료
  const handleEditSubmit = async (commentId: string) => {
    const success = await editComment(commentId, editingContent);

    if (success) {
      handleEditCancel();
    }
  };

  // 일반 댓글 작성
  const handleCreateSubmit = async () => {
    await submitComment();
  };

  // 답글 작성
  const handleReplySubmit = async () => {
    await submitReply();
  };

  // 댓글 또는 답글 렌더링
  const renderComment = (comment: Comment, isReply = false) => {
    const isOwner = currentUserId !== "" && currentUserId === String(comment.user_id);

    const canManage = isOwner || isAdmin;

    const isEditing = editingCommentId === comment.id;

    const isReplying = replyParentId === comment.id;

    return (
      <article
        key={comment.id}
        className={isReply ? "border-l-2 border-slate-200 py-4 pl-4 sm:ml-6 sm:pl-5" : "py-5"}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            {/* 작성자 정보 */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-slate-800">{comment.author_nickname}</span>

              {isOwner && (
                <span className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600">
                  작성자
                </span>
              )}

              {isReply && (
                <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                  답글
                </span>
              )}

              <time className="text-xs text-slate-400">
                {new Date(comment.created_at).toLocaleString("ko-KR")}
              </time>
            </div>

            {/* 댓글 내용 또는 수정 입력창 */}
            {isEditing ? (
              <div className="mt-3">
                <textarea
                  value={editingContent}
                  onChange={(event) => setEditingContent(event.target.value)}
                  maxLength={2000}
                  rows={3}
                  className="w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-blue-400"
                />

                <div className="mt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleEditCancel}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    취소
                  </button>

                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => void handleEditSubmit(comment.id)}
                    className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    수정 완료
                  </button>
                </div>
              </div>
            ) : (
              <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">
                {comment.content}
              </p>
            )}
          </div>

          {/* 댓글 관리 버튼 */}
          {!isEditing && (
            <div className="flex shrink-0 flex-wrap justify-end gap-2">
              {canManage && (
                <>
                  <button
                    type="button"
                    onClick={() => handleEditStart(comment.id, comment.content)}
                    className="text-xs font-semibold text-slate-500 hover:text-blue-600"
                  >
                    수정
                  </button>

                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => void removeComment(comment.id)}
                    className="text-xs font-semibold text-slate-500 hover:text-red-600 disabled:opacity-50"
                  >
                    삭제
                  </button>
                </>
              )}

              {/* 답글에는 답글 버튼을 표시하지 않음 */}
              {!isReply && user && (
                <button
                  type="button"
                  onClick={() => (isReplying ? cancelReply() : startReply(comment.id))}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                >
                  {isReplying ? "답글 취소" : "답글"}
                </button>
              )}
            </div>
          )}
        </div>

        {/* 답글 작성 영역 */}
        {!isReply && isReplying && user && (
          <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50/50 p-4">
            <div className="mb-2 text-xs font-semibold text-slate-600">
              {comment.author_nickname}님에게 답글 작성
            </div>

            <textarea
              value={replyContent}
              onChange={(event) => setReplyContent(event.target.value)}
              maxLength={2000}
              rows={3}
              placeholder="답글을 입력해 주세요."
              className="w-full resize-y rounded-lg border border-slate-200 bg-white p-3 text-sm outline-none transition focus:border-blue-400"
            />

            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-slate-400">{replyContent.length} / 2,000자</span>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={cancelReply}
                  disabled={submitting}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  취소
                </button>

                <button
                  type="button"
                  onClick={() => void handleReplySubmit()}
                  disabled={submitting}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? "등록 중..." : "답글 등록"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 답글 목록 */}
        {!isReply && comment.replies && comment.replies.length > 0 && (
          <div className="mt-3">{comment.replies.map((reply) => renderComment(reply, true))}</div>
        )}
      </article>
    );
  };

  return (
    <section className="mt-10 border-t border-slate-200 pt-8">
      {/* 제목 */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">
          댓글
          {pagination && (
            <span className="ml-2 text-base font-medium text-slate-500">{pagination.total}</span>
          )}
        </h2>
      </div>

      {/* 일반 댓글 작성 */}
      {user ? (
        <div className="mb-8 rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-3 text-sm font-semibold text-slate-700">{user.nickname}</div>

          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            maxLength={2000}
            rows={4}
            placeholder="댓글을 입력해 주세요."
            className="w-full resize-y rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
          />

          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-slate-400">{content.length} / 2,000자</span>

            <button
              type="button"
              onClick={() => void handleCreateSubmit()}
              disabled={submitting}
              className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "등록 중..." : "댓글 등록"}
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-8 rounded-xl border border-slate-200 bg-slate-50 p-5 text-center">
          <p className="text-sm text-slate-600">댓글을 작성하려면 로그인이 필요합니다.</p>

          <Link
            href="/login"
            className="mt-3 inline-block rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            로그인
          </Link>
        </div>
      )}

      {/* 오류 메시지 */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      {/* 댓글 목록 */}
      {loading ? (
        <div className="py-10 text-center text-sm text-slate-500">댓글을 불러오는 중입니다.</div>
      ) : comments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 py-10 text-center text-sm text-slate-400">
          아직 작성된 댓글이 없습니다.
        </div>
      ) : (
        <div className="divide-y divide-slate-200">
          {comments.map((comment) => renderComment(comment))}
        </div>
      )}

      {/* 페이지네이션 */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <button
            type="button"
            disabled={!pagination.hasPreviousPage || loading}
            onClick={() => changePage(pagination.page - 1)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
          >
            이전
          </button>

          {Array.from({ length: pagination.totalPages }, (_, index) => index + 1).map(
            (pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                disabled={loading}
                onClick={() => changePage(pageNumber)}
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
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
          >
            다음
          </button>
        </div>
      )}
    </section>
  );
}
