"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type SubmitEvent,
  type KeyboardEvent,
  type ChangeEvent,
} from "react";
import { usePathname } from "next/navigation";

import ChatMessage from "@/components/chat/ChatMessage";

import { useAuth } from "@/providers/AuthProvider";
import { useChatViewModel } from "@/viewmodels/chat/useChatViewModel";

interface FloatingChatbotContentProps {
  isAuthenticated: boolean;
  isLoading: boolean;
}

const FloatingChatbotContent = ({ isAuthenticated, isLoading }: FloatingChatbotContentProps) => {
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
    clearMessages,
    startNewConversation,
    selectConversation,
    removeConversation,
  } = useChatViewModel();

  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && !showHistory) {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    }
  }, [messages, isSending, isOpen, showHistory]);

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || isSending || !isAuthenticated) {
      return;
    }

    setQuestion("");
    void sendMessage(trimmedQuestion);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();

      const trimmedQuestion = question.trim();

      if (!trimmedQuestion || isSending || !isAuthenticated) {
        return;
      }

      setQuestion("");
      void sendMessage(trimmedQuestion);
    }
  };

  const handleNewConversation = () => {
    startNewConversation();
    setShowHistory(false);
  };

  const handleSelectConversation = async (conversationId: string) => {
    await selectConversation(conversationId);
    setShowHistory(false);
  };

  const handleDeleteConversation = async (conversationId: string) => {
    const confirmed = window.confirm("이 대화방과 모든 메시지를 삭제하시겠습니까?");

    if (!confirmed) {
      return;
    }

    await removeConversation(conversationId);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("ko-KR", {
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <div className="fixed bottom-5 right-5 z-100">
      {isOpen && (
        <section
          aria-label="RAG AI 플로팅 챗봇"
          className="mb-4 flex h-[min(650px,calc(100dvh-120px))] w-[calc(100vw-40px)] max-w-105 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        >
          {/* 챗봇 헤더 */}
          <header className="flex shrink-0 items-center gap-3 bg-slate-900 px-4 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-2xl text-blue-300">
              ✧
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-bold text-white">RAG AI 어시스턴트</h2>

              <p className="mt-1 text-xs text-slate-300">게시글 기반 AI 질문 도우미</p>
            </div>

            {isAuthenticated && (
              <button
                type="button"
                onClick={() => setShowHistory((previous) => !previous)}
                className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                  showHistory
                    ? "bg-blue-500 text-white"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                기록
              </button>
            )}

            <Link
              href="/chat"
              title="전체 채팅 페이지"
              className="rounded-lg px-2 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              전체 화면
            </Link>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="챗봇 닫기"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-xl text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              ×
            </button>
          </header>

          {/* 대화 기록 영역 */}
          {showHistory && isAuthenticated ? (
            <div className="flex min-h-0 flex-1 flex-col bg-white">
              <div className="flex items-center justify-between border-b border-slate-200 p-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">대화 기록</h3>

                  <p className="mt-1 text-xs text-slate-400">저장된 대화를 선택할 수 있습니다.</p>
                </div>

                <button
                  type="button"
                  onClick={handleNewConversation}
                  disabled={isSending || isLoadingConversation}
                  className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
                >
                  + 새 대화
                </button>
              </div>

              <div className="flex-1 space-y-2 overflow-y-auto p-3">
                {isLoadingConversations && conversations.length === 0 ? (
                  <p className="py-8 text-center text-xs text-slate-400">
                    대화 목록을 불러오는 중입니다.
                  </p>
                ) : conversations.length === 0 ? (
                  <p className="py-8 text-center text-xs text-slate-400">저장된 대화가 없습니다.</p>
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
                        onClick={() => void handleSelectConversation(conversation.id)}
                        disabled={isSending || isLoadingConversation}
                        className="min-w-0 flex-1 text-left disabled:opacity-50"
                      >
                        <p className="truncate text-xs font-semibold text-slate-800">
                          {conversation.title}
                        </p>

                        <p className="mt-1 text-[10px] text-slate-400">
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
                        className="shrink-0 rounded-lg px-2 py-2 text-[10px] text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
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
            </div>
          ) : (
            <>
              {/* 메시지 영역 */}
              <div className="flex-1 space-y-5 overflow-y-auto bg-slate-50 p-4">
                {isLoading ? (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-sm text-slate-500">로그인 정보를 확인하고 있습니다.</p>
                  </div>
                ) : !isAuthenticated ? (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-2xl">
                      🔒
                    </div>

                    <h3 className="mt-4 text-base font-bold text-slate-800">
                      로그인이 필요합니다.
                    </h3>

                    <p className="mt-2 text-xs leading-6 text-slate-500">
                      AI 챗봇을 이용하려면
                      <br />
                      먼저 로그인해 주세요.
                    </p>

                    <Link
                      href="/login"
                      onClick={() => setIsOpen(false)}
                      className="mt-4 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
                    >
                      로그인하기
                    </Link>
                  </div>
                ) : isLoadingConversation ? (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-sm text-slate-500">대화 내용을 불러오고 있습니다.</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-3xl text-blue-600">
                      ✧
                    </div>

                    <h3 className="mt-4 text-sm font-extrabold text-slate-800">안녕하세요!</h3>

                    <p className="mt-2 text-xs leading-6 text-slate-500">
                      RAG AI 도우미입니다.
                      <br />
                      궁금한 내용을 질문해 보세요.
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        void sendMessage("리벨리온이 SK텔레콤에 공급한 서버는 몇 대인가요?")
                      }
                      disabled={isSending}
                      className="mt-5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left text-xs leading-5 text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50"
                    >
                      리벨리온이 SK텔레콤에 공급한 서버는 몇 대인가요?
                    </button>
                  </div>
                ) : (
                  <>
                    {messages.map((message) => (
                      <ChatMessage key={message.id} message={message} />
                    ))}

                    {isSending && (
                      <div className="flex justify-start">
                        <div className="rounded-xl border border-slate-200 bg-white px-3 py-3">
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 animate-bounce rounded-full bg-blue-500" />
                            <span className="h-2 w-2 animate-bounce rounded-full bg-blue-500 [animation-delay:150ms]" />
                            <span className="h-2 w-2 animate-bounce rounded-full bg-blue-500 [animation-delay:300ms]" />

                            <span className="text-xs text-slate-500">답변 생성 중...</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* 오류 메시지 */}
              {error && isAuthenticated && (
                <div className="shrink-0 border-t border-red-100 bg-red-50 px-4 py-2">
                  <p className="text-xs leading-5 text-red-700">{error}</p>
                </div>
              )}

              {/* 입력 영역 */}
              {isAuthenticated && !isLoading && (
                <form
                  onSubmit={handleSubmit}
                  className="shrink-0 border-t border-slate-200 bg-white p-3"
                >
                  <div className="flex items-end gap-2">
                    <textarea
                      value={question}
                      onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                        setQuestion(event.target.value)
                      }
                      onKeyDown={handleKeyDown}
                      disabled={isSending || isLoadingConversation}
                      rows={2}
                      maxLength={2000}
                      placeholder="궁금한 내용을 입력하세요."
                      className="min-h-11 flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
                    />

                    <button
                      type="submit"
                      disabled={isSending || isLoadingConversation || !question.trim()}
                      aria-label="질문 전송"
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-xl font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      ↑
                    </button>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">
                      Enter 전송 · Shift + Enter 줄바꿈
                    </span>

                    {messages.length > 0 && (
                      <button
                        type="button"
                        onClick={clearMessages}
                        disabled={isSending}
                        className="text-[10px] font-semibold text-slate-400 transition hover:text-red-500 disabled:opacity-40"
                      >
                        새 대화
                      </button>
                    )}
                  </div>
                </form>
              )}
            </>
          )}
        </section>
      )}

      {/* 플로팅 버튼 */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setIsOpen((previous) => !previous)}
          aria-label={isOpen ? "챗봇 닫기" : "AI 챗봇 열기"}
          aria-expanded={isOpen}
          className="relative flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-3xl text-white shadow-xl transition hover:scale-105 hover:bg-blue-700 active:scale-95"
        >
          {isOpen ? "×" : "✧"}

          {!isOpen && messages.length > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-red-500 px-1 text-[10px] font-bold text-white">
              {messages.length > 99 ? "99+" : messages.length}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

const FloatingChatbot = () => {
  const pathname = usePathname();

  const { user, isAuthenticated, isLoading } = useAuth();

  if (pathname === "/chat") {
    return null;
  }

  const userKey = user?.id ?? "guest";

  return (
    <FloatingChatbotContent key={userKey} isAuthenticated={isAuthenticated} isLoading={isLoading} />
  );
};

export default FloatingChatbot;
