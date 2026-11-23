import { apiClient } from "@/lib/api/apiClient";

import type {
  ChatConversation,
  ChatConversationDetailApiResponse,
  ChatConversationListApiResponse,
  ChatMessage,
  DeleteChatConversationApiResponse,
  RagChatApiResponse,
  RagChatInput,
  RagChatResponse,
} from "./chat.types";

// AI 질문 전송
export async function sendRagQuestion(input: RagChatInput): Promise<RagChatResponse> {
  const response = await apiClient.post<RagChatApiResponse>("/rag/chat", input);

  if (!response.success || !response.data) {
    throw new Error("AI 답변을 가져오지 못했습니다.");
  }

  return response.data;
}

// 대화방 목록 조회
export async function getChatConversations(limit = 50, offset = 0): Promise<ChatConversation[]> {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });

  const response = await apiClient.get<ChatConversationListApiResponse>(
    `/rag/conversations?${params.toString()}`,
  );

  if (!response.success || !response.data) {
    throw new Error("대화 목록을 가져오지 못했습니다.");
  }

  return response.data.conversations.map((conversation) => ({
    id: conversation.id,
    title: conversation.title,
    createdAt: new Date(conversation.created_at),
    updatedAt: new Date(conversation.updated_at),
    messageCount: Number(conversation.message_count ?? 0),
  }));
}

// 특정 대화방 상세 조회
export async function getChatConversation(conversationId: string): Promise<{
  conversation: ChatConversation;
  messages: ChatMessage[];
}> {
  const response = await apiClient.get<ChatConversationDetailApiResponse>(
    `/rag/conversations/${conversationId}`,
  );

  if (!response.success || !response.data) {
    throw new Error("대화 내용을 가져오지 못했습니다.");
  }

  const { conversation, messages } = response.data;

  return {
    conversation: {
      id: conversation.id,
      title: conversation.title,
      createdAt: new Date(conversation.created_at),
      updatedAt: new Date(conversation.updated_at),
      messageCount: messages.length,
    },

    messages: messages.map((message) => ({
      id: message.id,
      conversationId: message.conversation_id,
      role: message.role,
      content: message.content,
      sources: message.sources ?? [],
      createdAt: new Date(message.created_at),
    })),
  };
}

// 대화방 삭제
export async function deleteChatConversation(conversationId: string): Promise<string> {
  const response = await apiClient.delete<DeleteChatConversationApiResponse>(
    `/rag/conversations/${conversationId}`,
  );

  if (!response.success || !response.data) {
    throw new Error("대화방을 삭제하지 못했습니다.");
  }

  return response.data.conversationId;
}
