import Link from "next/link";

const menuItems = [
  {
    name: "홈",
    href: "/",
    icon: "⌂",
  },
  {
    name: "게시글",
    href: "/posts",
    icon: "▤",
  },
  {
    name: "AI 챗봇",
    href: "/chat",
    icon: "✧",
  },
  // {
  //   name: "API 연결 테스트",
  //   href: "/api-test",
  //   icon: "⌘",
  // },
];

const Sidebar = () => {
  return (
    <aside className="w-full border-b border-slate-200 bg-white px-3 py-3 md:fixed md:bottom-0 md:left-0 md:top-17 md:z-40 md:w-60 md:border-r md:border-b-0 md:px-5 md:py-8">
      <div className="mb-5 hidden px-3 text-xs font-extrabold tracking-widest text-slate-400 md:block">
        MENU
      </div>

      <nav className="flex items-center gap-1 md:flex-col md:items-stretch md:gap-2">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg px-2 py-3 text-xs font-semibold text-slate-600 transition hover:bg-blue-50 hover:text-blue-600 md:flex-none md:justify-start md:gap-3 md:px-3 md:text-sm"
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>

      <div className="absolute bottom-6 left-5 right-5 hidden border-t border-slate-200 px-3 pt-5 md:block">
        <p className="text-xs font-bold text-slate-600">RAG BOARD</p>

        <p className="mt-1 text-[11px] text-slate-400">AI Community Platform</p>
      </div>
    </aside>
  );
};

export default Sidebar;
