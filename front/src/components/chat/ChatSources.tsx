import Link from "next/link";

import type { ChatSource } from "@/models/chat/chat.types";

interface ChatSourcesProps {
  sources: ChatSource[];
}

export default function ChatSources({ sources }: ChatSourcesProps) {
  if (sources.length === 0) {
    return null;
  }

  return (
    <section className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-blue-600">✧</span>

        <h3 className="text-sm font-bold text-slate-800">참고 게시글 ({sources.length})</h3>
      </div>

      <div className="space-y-3">
        {sources.map((source) => (
          <article
            key={source.postId}
            className="rounded-lg border border-slate-100 bg-slate-50 p-3"
          >
            <Link
              href={`/posts/${source.postId}`}
              className="text-sm font-bold leading-6 text-blue-700 hover:text-blue-900 hover:underline"
            >
              {source.title}
            </Link>

            <div className="mt-2 flex items-center gap-2">
              <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
                유사도 {(source.similarity * 100).toFixed(1)}%
              </span>
            </div>

            {source.excerpt && (
              <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-xs leading-6 text-slate-500">
                {source.excerpt}
              </p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
