"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  deleteChatConversation,
  getChatConversation,
  getChatConversations,
  sendRagQuestion,
} from "@/models/chat/chat.model";

import type { ChatConversation, ChatMessage } from "@/models/chat/chat.types";

export const useChatViewModel = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);

  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  const [isSending, setIsSending] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const requestLock = useRef(false);
  const conversationLock = useRef(false);
  const messageSequence = useRef(0);

  const createMessageId = useCallback(() => {
    messageSequence.current += 1;

    return `${Date.now()}-${messageSequence.current}`;
  }, []);

  // 대화 목록 조회
  const refreshConversations = useCallback(async () => {
    setIsLoadingConversations(true);
    setHistoryError(null);

    try {
      const result = await getChatConversations();

      setConversations(result);

      return result;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "대화 목록을 가져오는 중 오류가 발생했습니다.";

      setHistoryError(message);

      return null;
    } finally {
      setIsLoadingConversations(false);
    }
  }, []);

  // 기존 대화방 선택
  const selectConversation = useCallback(async (conversationId: string) => {
    if (!conversationId || requestLock.current || conversationLock.current) {
      return;
    }

    conversationLock.current = true;
    setIsLoadingConversation(true);
    setHistoryError(null);
    setError(null);

    try {
      const result = await getChatConversation(conversationId);

      setCurrentConversationId(result.conversation.id);
      setMessages(result.messages);

      setConversations((previous) =>
        previous.map((conversation) =>
          conversation.id === result.conversation.id ? result.conversation : conversation,
        ),
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "대화 내용을 가져오는 중 오류가 발생했습니다.";

      setHistoryError(message);
    } finally {
      conversationLock.current = false;
      setIsLoadingConversation(false);
    }
  }, []);

  // 새 대화 시작
  const startNewConversation = useCallback(() => {
    if (requestLock.current || conversationLock.current) {
      return;
    }

    setCurrentConversationId(null);
    setMessages([]);
    setError(null);
    setHistoryError(null);
  }, []);

  // AI 질문 전송
  const sendMessage = useCallback(
    async (question: string) => {
      const trimmedQuestion = question.trim();

      if (!trimmedQuestion || requestLock.current || conversationLock.current) {
        return;
      }

      requestLock.current = true;
      setIsSending(true);
      setError(null);

      const userMessage: ChatMessage = {
        id: createMessageId(),
        conversationId: currentConversationId ?? undefined,
        role: "user",
        content: trimmedQuestion,
        createdAt: new Date(),
      };

      setMessages((previous) => [...previous, userMessage]);

      try {
        const response = await sendRagQuestion({
          question: trimmedQuestion,
          conversationId: currentConversationId ?? undefined,
        });

        const assistantMessage: ChatMessage = {
          id: createMessageId(),
          conversationId: response.conversationId,
          role: "assistant",
          content: response.answer,
          sources: response.sources ?? [],
          createdAt: new Date(),
        };

        setCurrentConversationId(response.conversationId);

        setMessages((previous) => [...previous, assistantMessage]);

        const updatedConversations = await getChatConversations();

        setConversations(updatedConversations);
        setHistoryError(null);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "AI 답변을 가져오는 중 오류가 발생했습니다.";

        setError(message);
      } finally {
        requestLock.current = false;
        setIsSending(false);
      }
    },
    [createMessageId, currentConversationId],
  );

  // 대화방 삭제
  const removeConversation = useCallback(
    async (conversationId: string) => {
      if (!conversationId || requestLock.current || conversationLock.current) {
        return false;
      }

      conversationLock.current = true;
      setHistoryError(null);

      try {
        await deleteChatConversation(conversationId);

        setConversations((previous) =>
          previous.filter((conversation) => conversation.id !== conversationId),
        );

        if (currentConversationId === conversationId) {
          setCurrentConversationId(null);
          setMessages([]);
          setError(null);
        }

        return true;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "대화방을 삭제하는 중 오류가 발생했습니다.";

        setHistoryError(message);

        return false;
      } finally {
        conversationLock.current = false;
      }
    },
    [currentConversationId],
  );

  // 기존 초기화 기능 유지
  const clearMessages = useCallback(() => {
    startNewConversation();
  }, [startNewConversation]);

  // 최초 대화 목록 조회
  useEffect(() => {
    const loadConversations = async () => {
      await Promise.resolve();
      await refreshConversations();
    };

    void loadConversations();
  }, [refreshConversations]);

  return {
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
    refreshConversations,
    selectConversation,
    removeConversation,
  };
}
