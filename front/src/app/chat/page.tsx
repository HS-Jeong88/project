import MainLayout from "@/components/layout/MainLayout";

export default function ChatPage() {
  return (
    <MainLayout>
      <section>
        <span className="text-xs font-extrabold tracking-widest text-blue-600">AI ASSISTANT</span>

        <h1 className="mt-3 text-3xl font-extrabold text-slate-900">RAG AI 챗봇</h1>

        <p className="mt-3 text-sm text-slate-500">
          게시글과 문서를 검색하고 AI가 답변하는 공간입니다.
        </p>
      </section>

      <section className="mt-8 flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl text-blue-600">
          ✧
        </div>

        <h2 className="mt-5 text-lg font-extrabold text-slate-800">AI 챗봇 준비 중</h2>

        <p className="mt-3 max-w-md text-sm leading-7 text-slate-500">
          Google Gemini API와 RAG 검색 시스템을 연결한 뒤 이곳에서 질문하고 답변을 받을 수 있도록
          구현할 예정입니다.
        </p>

        <span className="mt-5 rounded-md bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700">
          COMING SOON
        </span>
      </section>
    </MainLayout>
  );
}
