"use client";

import { useEffect, useRef } from "react";

import MainLayout from "@/components/layout/MainLayout";

import ChatInput from "@/components/chat/ChatInput";
import ChatMessage from "@/components/chat/ChatMessage";

import { useAuth } from "@/providers/AuthProvider";
import { useChatViewModel } from "@/viewmodels/chat/useChatViewModel";

const ChatPage = () => {
  const { isAuthenticated, isLoading } = useAuth();

  const {
    messages,
    conversations,
    currentConversationId,
    isSending,
    isLoadingConversations,
    isLoadingConversation,
    error,
    historyError,
    sendMessage,
    startNewConversation,
    selectConversation,
    removeConversation,
  } = useChatViewModel();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isSending]);

  const handleDeleteConversation = async (conversationId: string) => {
    const confirmed = window.confirm("이 대화방과 모든 메시지를 삭제하시겠습니까?");

    if (!confirmed) {
      return;
    }

    await removeConversation(conversationId);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <MainLayout>
      <section>
        <span className="text-xs font-extrabold tracking-widest text-blue-600">AI ASSISTANT</span>

        <h1 className="mt-3 text-3xl font-extrabold text-slate-900">RAG AI 챗봇</h1>

        <p className="mt-3 text-sm text-slate-500">
          게시글과 문서를 검색하고 AI가 답변하는 공간입니다.
        </p>
      </section>

      {!isLoading && isAuthenticated && (
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          {/* 대화 목록 */}
          <aside className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 p-4">
              <h2 className="font-bold text-slate-800">대화 기록</h2>

              <button
                type="button"
                onClick={startNewConversation}
                disabled={isSending || isLoadingConversation}
                className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                + 새 대화
              </button>
            </div>

            <div className="max-h-[600px] space-y-2 overflow-y-auto p-3">
              {isLoadingConversations && conversations.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-400">
                  대화 목록을 불러오는 중입니다.
                </p>
              ) : conversations.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-400">저장된 대화가 없습니다.</p>
              ) : (
                conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`flex items-center gap-2 rounded-xl border p-3 transition ${
                      currentConversationId === conversation.id
                        ? "border-blue-300 bg-blue-50"
                        : "border-transparent hover:bg-slate-50"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => void selectConversation(conversation.id)}
                      disabled={isSending || isLoadingConversation}
                      className="min-w-0 flex-1 text-left disabled:cursor-not-allowed"
                    >
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {conversation.title}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {formatDate(conversation.updatedAt)}
                        {" · "}
                        메시지 {conversation.messageCount}개
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => void handleDeleteConversation(conversation.id)}
                      disabled={isSending || isLoadingConversation}
                      aria-label="대화 삭제"
                      className="shrink-0 rounded-lg px-2 py-2 text-xs text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      삭제
                    </button>
                  </div>
                ))
              )}

              {historyError && (
                <p className="rounded-lg bg-red-50 p-3 text-xs text-red-600">{historyError}</p>
              )}
            </div>
          </aside>

          {/* 채팅 영역 */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
            <header className="flex items-center gap-3 bg-slate-900 px-5 py-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/20 text-2xl text-blue-300">
                ✧
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="font-bold text-white">RAG AI 어시스턴트</h2>

                <p className="mt-1 text-xs text-slate-300">Gemini 기반 게시글 검색 및 답변</p>
              </div>

              <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-300">
                AI
              </span>
            </header>

            <div className="flex h-[600px] flex-col">
              <div className="flex-1 space-y-6 overflow-y-auto p-4 sm:p-6">
                {isLoadingConversation ? (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-sm text-slate-500">대화 내용을 불러오고 있습니다.</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-3xl text-blue-600">
                      ✧
                    </div>

                    <h3 className="mt-5 text-lg font-extrabold text-slate-800">
                      안녕하세요! RAG AI 도우미입니다.
                    </h3>

                    <p className="mt-3 max-w-md text-sm leading-7 text-slate-500">
                      게시글에 관한 질문을 입력해 보세요.
                      <br />
                      관련 게시글을 검색하고 근거를 바탕으로 답변해 드립니다.
                    </p>

                    <div className="mt-6 flex flex-wrap justify-center gap-2">
                      {[
                        "리벨리온이 SK텔레콤에 공급한 서버는 몇 대인가요?",
                        "최근 AI 관련 게시글을 요약해 주세요.",
                      ].map((question) => (
                        <button
                          key={question}
                          type="button"
                          onClick={() => void sendMessage(question)}
                          disabled={isSending}
                          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50"
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((message) => (
                      <ChatMessage key={message.id} message={message} />
                    ))}

                    {isSending && (
                      <div className="flex justify-start">
                        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 animate-bounce rounded-full bg-blue-500" />
                            <span className="h-2 w-2 animate-bounce rounded-full bg-blue-500 [animation-delay:150ms]" />
                            <span className="h-2 w-2 animate-bounce rounded-full bg-blue-500 [animation-delay:300ms]" />

                            <span className="ml-1 text-xs text-slate-500">
                              답변을 생성하고 있습니다.
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {error && (
                <div className="mx-4 mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                  <p className="text-sm font-medium text-red-700">{error}</p>
                </div>
              )}

              <ChatInput
                onSend={(question) => void sendMessage(question)}
                isSending={isSending || isLoadingConversation}
              />
            </div>
          </section>
        </div>
      )}

      {isLoading && (
        <div className="mt-8 flex h-60 items-center justify-center">
          <p className="text-sm text-slate-500">로그인 정보를 확인하고 있습니다.</p>
        </div>
      )}

      {!isLoading && !isAuthenticated && (
        <div className="mt-8 flex h-80 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-3xl">
            🔒
          </div>

          <h3 className="mt-5 text-lg font-extrabold text-slate-800">로그인이 필요합니다.</h3>

          <p className="mt-3 text-sm text-slate-500">AI 챗봇을 이용하려면 먼저 로그인해 주세요.</p>

          <a
            href="/login"
            className="mt-5 rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
          >
            로그인하기
          </a>
        </div>
      )}

      <p className="mt-4 text-center text-xs leading-6 text-slate-400">
        AI 답변은 참고 자료를 기반으로 생성됩니다. 중요한 정보는 원본 게시글을 확인해 주세요.
      </p>
    </MainLayout>
  );
};

export default ChatPage;
