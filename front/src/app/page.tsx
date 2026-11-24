import Link from "next/link";

import MainLayout from "@/components/layout/MainLayout";

const features = [
  {
    title: "게시글 작성",
    description: "새로운 게시글을 작성하고 다른 사용자와 공유할 수 있습니다.",
    href: "/posts",
    icon: "✎",
  },
  {
    title: "게시글 조회",
    description: "등록된 게시글을 확인하고 원하는 내용을 검색할 수 있습니다.",
    href: "/posts",
    icon: "▤",
  },
  {
    title: "서버 연결 확인",
    description: "프론트엔드와 백엔드 API의 연결 상태를 확인할 수 있습니다.",
    href: "/api-test",
    icon: "⌘",
  },
];

const HomePage = () => {
  return (
    <MainLayout>
      <section className="rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-50 px-6 py-10 sm:px-10 sm:py-14">
        <span className="text-xs font-extrabold tracking-widest text-blue-600">
          COMMUNITY PLATFORM
        </span>

        <h1 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl">
          RAG BOARD에
          <br />
          오신 것을 환영합니다.
        </h1>

        <p className="mt-5 text-sm leading-7 text-slate-600 sm:text-base">
          다양한 이야기를 나누고 정보를 공유하는
          <br className="hidden sm:block" />
          커뮤니티 게시판입니다.
        </p>

        <Link
          href="/posts"
          className="mt-8 inline-flex items-center gap-5 rounded-lg bg-blue-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-blue-700"
        >
          게시글 확인하기
          <span className="text-lg">→</span>
        </Link>
      </section>

      <section className="mt-12">
        <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <span className="text-xs font-extrabold tracking-widest text-blue-600">QUICK MENU</span>

            <h2 className="mt-2 text-2xl font-extrabold text-slate-900">주요 메뉴</h2>
          </div>

          <p className="text-xs text-slate-400">원하는 기능을 선택해 보세요.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {features.map((feature) => (
            <Link
              href={feature.href}
              key={feature.title}
              className="group flex min-h-52 flex-col rounded-xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl text-blue-600">
                {feature.icon}
              </div>

              <h3 className="mt-5 text-base font-extrabold text-slate-900">{feature.title}</h3>

              <p className="mt-2 text-xs leading-6 text-slate-500">{feature.description}</p>

              <span className="mt-auto pt-5 text-xs font-bold text-blue-600">바로가기 →</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-6 flex flex-col justify-between gap-5 rounded-xl border border-slate-200 bg-white p-6 sm:flex-row sm:items-center">
        <div>
          <span className="text-xs font-extrabold tracking-widest text-blue-600">
            PROJECT STATUS
          </span>

          <h2 className="mt-2 text-base font-extrabold text-slate-900">
            게시판 서비스 개발 진행 중
          </h2>

          <p className="mt-2 text-xs leading-6 text-slate-500">
            회원 관리, 게시글, 댓글 기능을 순차적으로 구현할 예정입니다.
          </p>
        </div>

        <span className="w-fit rounded-md bg-amber-50 px-3 py-2 text-[10px] font-extrabold tracking-wider text-amber-700">
          DEVELOPMENT
        </span>
      </section>
    </MainLayout>
  );
};

export default HomePage;
