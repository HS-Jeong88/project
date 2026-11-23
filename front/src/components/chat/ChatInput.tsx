"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
  isSending: boolean;
}

export default function ChatInput({ onSend, isSending }: ChatInputProps) {
  const [question, setQuestion] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || isSending) {
      return;
    }

    onSend(trimmedQuestion);
    setQuestion("");
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();

      if (!isSending && question.trim()) {
        const trimmedQuestion = question.trim();

        onSend(trimmedQuestion);
        setQuestion("");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-slate-200 bg-white p-4">
      <div className="flex items-end gap-3">
        <textarea
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSending}
          maxLength={2000}
          rows={2}
          placeholder="게시글에 대해 궁금한 내용을 질문해 보세요."
          className="min-h-[52px] flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
        />

        <button
          type="submit"
          disabled={isSending || !question.trim()}
          className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-xl bg-blue-600 text-xl font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          aria-label="질문 전송"
        >
          ↑
        </button>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <p className="text-xs text-slate-400">Enter 전송 · Shift + Enter 줄바꿈</p>

        <p className="text-xs text-slate-400">{question.length}/2000</p>
      </div>
    </form>
  );
}
