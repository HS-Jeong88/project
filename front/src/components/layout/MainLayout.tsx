import type { ReactNode } from "react";

import Header from "./Header";
import Sidebar from "./Sidebar";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen">
      <Header />

      <div className="flex min-h-screen flex-col pt-[68px] md:block">
        <Sidebar />

        <main className="min-h-[calc(100vh-68px)] w-full p-4 sm:p-6 md:ml-60 md:w-[calc(100%-240px)] md:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
