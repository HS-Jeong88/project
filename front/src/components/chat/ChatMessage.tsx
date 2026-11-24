import ChatSources from "./ChatSources";

import type { ChatMessage as ChatMessageType } from "@/models/chat/chat.types";

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className="max-w-[90%] sm:max-w-[80%]">
        {!isUser && (
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-sm font-bold text-blue-700">
              ✧
            </div>

            <span className="text-xs font-bold text-slate-600">RAG AI 어시스턴트</span>
          </div>
        )}

        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? "rounded-br-md bg-blue-600 text-white"
              : "rounded-bl-md border border-slate-200 bg-white text-slate-800"
          }`}
        >
          <p className="whitespace-pre-wrap break-words text-sm leading-7">{message.content}</p>
        </div>

        {!isUser && message.sources && <ChatSources sources={message.sources} />}

        <p className={`mt-2 text-[10px] text-slate-400 ${isUser ? "text-right" : "text-left"}`}>
          {message.createdAt.toLocaleTimeString("ko-KR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
};

export default ChatMessage;
