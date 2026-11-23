export type ChatRole = "user" | "assistant";

export interface ChatSource {
  postId: string;
  title: string;
  similarity: number;
  excerpt: string;
}

export interface ChatMessage {
  id: string;
  conversationId?: string;
  role: ChatRole;
  content: string;
  sources?: ChatSource[];
  createdAt: Date;
}

export interface RagChatInput {
  question: string;
  conversationId?: string;
}

export interface RagChatResponse {
  conversationId: string;
  answer: string;
  sources: ChatSource[];
}

export interface RagChatApiResponse {
  success: boolean;
  message?: string;
  data: RagChatResponse;
}

// 프론트엔드에서 사용하는 대화방 타입
export interface ChatConversation {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messageCount: number;
}

// 백엔드 대화방 API 응답 타입
export interface ChatConversationApiItem {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count?: number;
}

export interface ChatConversationListApiResponse {
  success: boolean;
  message?: string;
  data: {
    conversations: ChatConversationApiItem[];
  };
}

// 백엔드 메시지 API 응답 타입
export interface ChatMessageApiItem {
  id: string;
  conversation_id: string;
  role: ChatRole;
  content: string;
  sources: ChatSource[];
  created_at: string;
}

export interface ChatConversationDetailApiResponse {
  success: boolean;
  message?: string;
  data: {
    conversation: {
      id: string;
      user_id: string;
      title: string;
      created_at: string;
      updated_at: string;
    };
    messages: ChatMessageApiItem[];
  };
}

export interface DeleteChatConversationApiResponse {
  success: boolean;
  message?: string;
  data: {
    conversationId: string;
  };
}
